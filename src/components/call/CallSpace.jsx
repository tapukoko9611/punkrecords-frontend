// CallSpace.js
import React, { useEffect, useState, useContext, useRef } from "react";
import { SocketContext } from "../../context/SocketContext";
import { CallContext } from "../../context/CallContext";
import { useWebRTC } from "../../hooks/useWebRTC";

export const CallSpace = ({ call }) => {
  const callContainerRef = useRef(null);
  const socket = useContext(SocketContext);
  const { state: callState } = useContext(CallContext);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // key: senderSocketId, value: MediaStream

  // Callback to update remoteStreams when a new remote stream is received.
  const handleRemoteStream = (socketId, stream) => {
    setRemoteStreams((prev) => ({ ...prev, [socketId]: stream }));
  };
  

  // Initialize local stream.
  useEffect(() => {
    const getLocalMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
      } catch (error) {
        console.error("Error accessing local media", error);
      }
    };
    getLocalMedia();
  }, []);

  // Initialize our WebRTC hook once localStream is ready.
  const { callNewPeer, closeAllConnections } = useWebRTC({
    callId: call?.call?._id, // assuming call object structure matches backend response
    localStream,
    socket,
    onRemoteStream: handleRemoteStream,
  });

  // When a new user joins the call, the signaling server emits "user:joined:call".
  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = ({ userId, socketId }) => {
      // Don't initiate connection with self.
      if (socketId === socket.id) return;
      // Initiate connection by sending an offer.
      callNewPeer(socketId);
    };

    socket.on("user:joined:call", handleUserJoined);
    return () => {
      socket.off("user:joined:call", handleUserJoined);
    };
  }, [socket, callNewPeer]);

  // Optionally: Clean up on component unmount (close all peer connections)
  useEffect(() => {
    return () => {
      closeAllConnections();
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [closeAllConnections, localStream]);

  return (
    <div ref={callContainerRef} style={{ display: "flex", flexWrap: "wrap" }}>
      {/* Local Video */}
      {localStream && (
        <video
          autoPlay
          muted
          playsInline
          style={{ width: "200px", height: "150px", margin: "5px" }}
          ref={(video) => {
            if (video) video.srcObject = localStream;
          }}
        />
      )}
      {/* Remote Videos */}
      {Object.keys(remoteStreams).map((socketId) => (
        <video
          key={socketId}
          autoPlay
          playsInline
          style={{ width: "200px", height: "150px", margin: "5px" }}
          ref={(video) => {
            if (video) video.srcObject = remoteStreams[socketId];
          }}
        />
      ))}
    </div>
  );
};
