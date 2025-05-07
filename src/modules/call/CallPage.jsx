import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const CallLayout = () => {
    const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const localVideoRef = useRef(null);
  const socket = useRef(null);
  const peerConnections = useRef({});
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    socket.current = io('http://localhost:5000');

    const getLocalMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        console.log('Local media stream obtained:', stream);
      } catch (error) {
        console.error('Error accessing media:', error);
      }
    };

    getLocalMedia();

    socket.current.on('connect', () => {
      console.log('Connected to signaling server:', socket.current.id);
      socket.current.emit('join-call');
      console.log('Emitted join-call');
    });

    socket.current.on('all-users', (users) => {
      console.log('Received all-users:', users);
      setUsersList(users);
    });

    socket.current.on('ice-candidate', (payload) => {
      console.log('Received ICE candidate from:', payload.userId, 'Candidate:', payload.candidate);
      addIceCandidate(payload.userId, payload.candidate);
    });

    socket.current.on('user-disconnected', (userId) => {
      console.log('User disconnected:', userId);
      removeRemoteStream(userId);
    });

    return () => {
      if (localStream) localStream.getTracks().forEach((track) => track.stop());
      if (socket.current) socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (localStream && socket.current) {
      console.log('Local stream is ready, processing user list:', usersList);
      usersList.forEach((userId) => {
        console.log('Processing user (after localStream):', userId, 'My ID:', socket.current.id, 'Connection exists:', !!peerConnections.current[userId]);
        if (userId !== socket.current.id && !peerConnections.current[userId]) {
          console.log('Creating offer (after localStream) for:', userId);
          createOffer(userId);
        }
      });

      socket.current.on('offer', async (payload) => {
        console.log('Received offer (after localStream) from:', payload.userId, 'Offer:', payload.offer);
        if (!peerConnections.current[payload.userId]) {
          console.log('Creating answer (after localStream) for:', payload.userId);
          await createAnswer(payload.userId, payload.offer);
        } else {
          console.log('Peer connection already exists (after localStream) for:', payload.userId);
        }
      });

      // We might still need to re-emit join-call just in case we connected very late
      socket.current.emit('join-call');
    }
  }, [localStream, socket.current, usersList]);

    const createOffer = async (remoteSocketId) => {
        console.log('createOffer initiated for:', remoteSocketId);
        peerConnections.current[remoteSocketId] = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        localStream.getTracks().forEach((track) => {
            peerConnections.current[remoteSocketId].addTrack(track, localStream);
            console.log('Added local track:', track.kind);
        });

        peerConnections.current[remoteSocketId].onicecandidate = (event) => {
            if (event.candidate) {
                console.log('ICE candidate generated:', event.candidate);
                socket.current.emit('ice-candidate', { target: remoteSocketId, candidate: event.candidate });
                console.log('Emitted ICE candidate to:', remoteSocketId);
            }
        };

        peerConnections.current[remoteSocketId].ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                console.log('Remote track received:', event.track.kind, 'Stream ID:', event.streams[0].id);
                setRemoteStreams((prevStreams) => ({ ...prevStreams, [remoteSocketId]: event.streams[0] }));
            }
        };

        try {
            const offer = await peerConnections.current[remoteSocketId].createOffer();
            console.log('Offer created:', offer);
            await peerConnections.current[remoteSocketId].setLocalDescription(offer);
            console.log('Local description set as offer:', offer);
            socket.current.emit('offer', { target: remoteSocketId, offer: offer });
            console.log('Emitted offer to:', remoteSocketId);
        } catch (error) {
            console.error('Error creating or sending offer:', error);
        }
    };

    const createAnswer = async (remoteSocketId, offer) => {
        console.log('createAnswer initiated for:', remoteSocketId, 'Offer:', offer);
        peerConnections.current[remoteSocketId] = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        const bufferedCandidates = [];

        peerConnections.current[remoteSocketId].onicecandidate = (event) => {
            if (event.candidate) {
                console.log('ICE candidate (answerer) generated:', event.candidate);
                socket.current.emit('ice-candidate', { target: remoteSocketId, candidate: event.candidate });
                console.log('Emitted ICE candidate (answerer) to:', remoteSocketId);
            }
        };

        peerConnections.current[remoteSocketId].ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                console.log('Remote track received (answerer):', event.track.kind, 'Stream ID:', event.streams[0].id);
                setRemoteStreams((prevStreams) => ({ ...prevStreams, [remoteSocketId]: event.streams[0] }));
            }
        };

        try {
            await peerConnections.current[remoteSocketId].setRemoteDescription(new RTCSessionDescription(offer));
            console.log('Remote description set (answerer):', offer);

            // Process buffered candidates
            bufferedCandidates.forEach(candidate => {
                try {
                    peerConnections.current[remoteSocketId].addIceCandidate(candidate);
                    console.log('Buffered ICE candidate added (answerer):', candidate);
                } catch (error) {
                    console.error('Error adding buffered ICE candidate (answerer):', error);
                }
            });
            bufferedCandidates.length = 0; // Clear the buffer

            const answer = await peerConnections.current[remoteSocketId].createAnswer();
            console.log('Answer created:', answer);
            await peerConnections.current[remoteSocketId].setLocalDescription(answer);
            console.log('Local description set as answer:', answer);
            socket.current.emit('answer', { target: remoteSocketId, answer: answer });
            console.log('Emitted answer to:', remoteSocketId);
        } catch (error) {
            console.error('Error creating or sending answer:', error);
        }

        socket.current.on('ice-candidate', (payload) => {
            if (payload.userId === remoteSocketId && peerConnections.current[remoteSocketId] && peerConnections.current[remoteSocketId].remoteDescription) {
                try {
                    peerConnections.current[remoteSocketId].addIceCandidate(new RTCIceCandidate(payload.candidate));
                    console.log('ICE candidate received and added (answerer):', payload.candidate);
                } catch (error) {
                    console.error('Error adding received ICE candidate (answerer):', error);
                }
            } else if (payload.userId === remoteSocketId) {
                console.log('ICE candidate received but remote description not set yet (answerer), buffering:', payload.candidate);
                bufferedCandidates.push(new RTCIceCandidate(payload.candidate));
            }
        });
    };

    const setRemoteAnswer = async (remoteSocketId, answer) => {
        console.log('setRemoteAnswer called for:', remoteSocketId, 'Answer:', answer);
        if (peerConnections.current[remoteSocketId]) {
            try {
                await peerConnections.current[remoteSocketId].setRemoteDescription(new RTCSessionDescription(answer));
                console.log('Remote description set (offerer):', answer);
            } catch (error) {
                console.error('Error setting remote description (offerer):', error);
            }
        }
    };

    const addIceCandidate = async (remoteSocketId, candidate) => {
        console.log('addIceCandidate called for:', remoteSocketId, 'Candidate:', candidate);
        if (peerConnections.current[remoteSocketId]) {
            try {
                await peerConnections.current[remoteSocketId].addIceCandidate(new RTCIceCandidate(candidate));
                console.log('ICE candidate added:', candidate);
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
            }
        }
    };

    const removeRemoteStream = (socketId) => {
        console.log('removeRemoteStream called for:', socketId);
        setRemoteStreams((prevStreams) => {
            const newStreams = { ...prevStreams };
            delete newStreams[socketId];
            return newStreams;
        });
        if (peerConnections.current[socketId]) {
            peerConnections.current[socketId].close();
            delete peerConnections.current[socketId];
        }
    };

    const toggleAudio = () => {
        setIsAudioEnabled((prevState) => {
            const enabled = !prevState;
            if (localStream) localStream.getAudioTracks().forEach((track) => (track.enabled = enabled));
            return enabled;
        });
    };

    const toggleVideo = () => {
        setIsVideoEnabled((prevState) => {
            const enabled = !prevState;
            if (localStream) localStream.getVideoTracks().forEach((track) => (track.enabled = enabled));
            return enabled;
        });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-4">WebRTC Call Room</h1>
            <div className="mb-4">
                <video ref={localVideoRef} autoPlay muted className="w-48 h-48 rounded-md shadow-md object-cover" />
                <p className="text-sm text-gray-500 mt-1">Your Video</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {Object.entries(remoteStreams).map(([socketId, stream]) => (
                    <div key={socketId}>
                        <video srcObject={stream} autoPlay className="w-48 h-48 rounded-md shadow-md object-cover" />
                        <p className="text-sm text-gray-500 mt-1">Peer: {socketId}</p>
                    </div>
                ))}
            </div>
            <div className="flex space-x-4">
                <button onClick={toggleAudio} className={`px-4 py-2 rounded-md ${isAudioEnabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{isAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}</button>
                <button onClick={toggleVideo} className={`px-4 py-2 rounded-md ${isVideoEnabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{isVideoEnabled ? 'Hide Video' : 'Show Video'}</button>
            </div>
        </div>
    );
};

export default CallLayout;