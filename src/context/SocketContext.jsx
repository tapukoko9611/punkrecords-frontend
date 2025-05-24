// SocketContext.js (modified)
import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const backendURL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(backendURL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [backendURL]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
