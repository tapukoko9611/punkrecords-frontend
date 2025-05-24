// useWebRTC.js
import { useRef, useEffect, useCallback } from "react";

export const useWebRTC = ({ callId, localStream, socket, onRemoteStream }) => {
    // Keep a reference of all peer connections: { socketId: RTCPeerConnection }
    const peersRef = useRef({});

    // Create a new RTCPeerConnection and attach event listeners.
    const createPeerConnection = useCallback(
        (remoteSocketId) => {
            const configuration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
            const peerConnection = new RTCPeerConnection(configuration);

            // When an ICE candidate is available, send it to remote peer.
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("webrtc:candidate", {
                        callId,
                        candidate: event.candidate,
                    });
                }
            };

            // When remote media tracks arrive, invoke our callback.
            peerConnection.ontrack = (event) => {
                // event.streams[0] is the remote stream.
                if (onRemoteStream && event.streams && event.streams[0]) {
                    onRemoteStream(remoteSocketId, event.streams[0]);
                }
            };

            return peerConnection;
        },
        [callId, socket, onRemoteStream]
    );

    // When receiving a remote offer:
    useEffect(() => {
        if (!socket || !localStream) return;

        const handleOffer = async ({ sdp, senderSocketId }) => {
            // If we already have a peer connection with sender, ignore.
            if (peersRef.current[senderSocketId]) return;
            const pc = createPeerConnection(senderSocketId);
            peersRef.current[senderSocketId] = pc;

            // Add local tracks
            localStream.getTracks().forEach((track) => {
                pc.addTrack(track, localStream);
            });

            try {
                await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                // Send back the answer directly to the sender.
                socket.emit("webrtc:answer", {
                    callId,
                    sdp: answer,
                    targetSocketId: senderSocketId,
                });
            } catch (error) {
                console.error("Error handling offer: ", error);
            }
        };

        const handleAnswer = async ({ sdp, senderSocketId }) => {
            const pc = peersRef.current[senderSocketId];
            if (pc) {
                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                } catch (error) {
                    console.error("Error setting remote description from answer: ", error);
                }
            }
        };

        const handleCandidate = async ({ candidate, senderSocketId }) => {
            const pc = peersRef.current[senderSocketId];
            if (pc) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (error) {
                    console.error("Error adding received ice candidate", error);
                }
            }
        };

        socket.on("webrtc:offer", (data) => {
            console.log("Received offer:", data);
            handleOffer(data);
        });
        socket.on("webrtc:answer", (data) => {
            console.log("Received answer:", data);
            handleAnswer(data);
        });
        socket.on("webrtc:candidate", (data) => {
            console.log("Received candidate:", data);
            handleCandidate(data);
        });

        // Cleanup on unmount.
        return () => {
            socket.off("webrtc:offer", handleOffer);
            socket.off("webrtc:answer", handleAnswer);
            socket.off("webrtc:candidate", handleCandidate);
        };
    }, [socket, localStream, createPeerConnection, callId]);

    // Function to initiate connection (create offer) for a new peer.
    const callNewPeer = useCallback(
        async (remoteSocketId) => {
            if (peersRef.current[remoteSocketId]) return; // already exists.
            const pc = createPeerConnection(remoteSocketId);
            peersRef.current[remoteSocketId] = pc;
            // Add local stream tracks.
            localStream.getTracks().forEach((track) => {
                pc.addTrack(track, localStream);
            });
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                // Send the offer to the remote peer (we broadcast, so remote peers pick up the offer).
                socket.emit("webrtc:offer", { callId, sdp: offer });
                console.log("Sent offer", { callId, sdp: offer });
            } catch (error) {
                console.error("Error creating offer: ", error);
            }
        },
        [callId, createPeerConnection, localStream, socket]
    );

    // Optionally, a cleanup function when leaving the call.
    const closeAllConnections = useCallback(() => {
        Object.values(peersRef.current).forEach((pc) => {
            pc.close();
        });
        peersRef.current = {};
    }, []);

    return { peersRef, callNewPeer, closeAllConnections };
};
