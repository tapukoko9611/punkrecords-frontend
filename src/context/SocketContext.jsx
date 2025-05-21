// src/contexts/SocketContext.js
import React, { createContext, useState, useEffect, useContext, } from 'react';
import { io } from 'socket.io-client';

import { AuthContext } from './UserContext'; // Assuming AuthContext provides user/token

export const SocketContext3 = createContext(null);

export const SocketProvider3 = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        console.log("SocketProvider: Initializing socket connection to http://localhost:5000/");
        // 1. As soon as client socket is created, it connects to socket server
        const newSocket = io('http://localhost:5000/'); // Connect immediately

        // 2. On connection established, socket server emits "connected" to the client
        // (The client will listen for 'connected' in useAuthSockets)

        // Basic socket lifecycle logging (optional, but good for debugging)
        newSocket.on('connect', () => {
            console.log('SocketProvider: Socket CONNECTED, ID:', newSocket.id);
            setSocket(newSocket); // Set the socket state only when it's truly connected
        });

        newSocket.on('disconnect', (reason) => {
            console.log('SocketProvider: Socket DISCONNECTED, Reason:', reason);
            setSocket(null); // Clear the socket state on disconnect
        });

        newSocket.on('connect_error', (error) => {
            console.error('SocketProvider: Connection ERROR:', error.message);
            setSocket(null); // Clear on error
        });

        // Cleanup function: Disconnect the socket when the provider unmounts
        return () => {
            console.log("SocketProvider: Cleaning up and disconnecting socket.");
            newSocket.off('connect'); // Remove all listeners for 'connect'
            newSocket.off('disconnect'); // Remove all listeners for 'disconnect'
            newSocket.off('connect_error'); // Remove all listeners for 'connect_error'
            if (newSocket.connected) {
                newSocket.disconnect();
            }
            setSocket(null);
        };
    }, []); // Empty dependency array: runs once on mount, sets up the socket

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const SocketContext2 = createContext(null);

export const SocketProvider2 = ({ children }) => {
    const { state: authState } = useContext(AuthContext); // Get token from AuthContext
    const authToken = authState.token; // The token to use for socket connection

    // This state will hold the socket instance ONLY when it's confirmed connected
    const [connectedSocket, setConnectedSocket] = useState(null);

    useEffect(() => {
        // If there's an existing connected socket and the token disappears, disconnect it.
        // Or if you only want to connect when a token is available.
        if (!authToken && connectedSocket) {
            console.log("SocketProvider: Auth token missing, disconnecting existing socket.");
            connectedSocket.disconnect();
            setConnectedSocket(null);
            return; // Stop here if no token
        }

        // If there's no auth token and no connected socket, don't try to connect
        if (!authToken && !connectedSocket) {
            console.log("SocketProvider: No auth token and no existing socket. Waiting for token to connect.");
            return;
        }

        // Only create a new socket if there's no existing one OR if the authToken has changed
        // This ensures a new socket is only created when necessary.
        if (connectedSocket && authToken && connectedSocket.io.opts.query.token === authToken) {
            console.log("SocketProvider: Socket already connected with current token. No re-initialization needed.");
            return;
        }

        // If we reach here, we either don't have a connected socket or the token has changed.
        // Disconnect any old socket before creating a new one.
        if (connectedSocket) {
            console.log("SocketProvider: Token changed or socket not connected, disconnecting old socket.");
            connectedSocket.disconnect();
            setConnectedSocket(null); // Clear state while connecting new one
        }

        console.log("SocketProvider: Attempting to connect new socket with token:", authToken ? 'present' : 'none');

        const newSocket = io('http://localhost:5000/', {
            query: { token: authToken || '' }, // Always send a token (empty string if null)
            transports: ['websocket', 'polling'], // Prioritize websocket, fallback to polling
            reconnection: true, // Enable auto-reconnection
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Event listeners for the socket's lifecycle
        const handleConnect = () => {
            console.log('SocketProvider: Socket CONNECTED, ID:', newSocket.id);
            // ONLY set the socket state when it's fully connected and has an ID
            setConnectedSocket(newSocket);
        };

        const handleDisconnect = (reason) => {
            console.log('SocketProvider: Socket DISCONNECTED, Reason:', reason);
            setConnectedSocket(null); // Clear the socket state on disconnect
        };

        const handleConnectError = (error) => {
            console.error('SocketProvider: Connection ERROR:', error.message);
            setConnectedSocket(null); // Clear on error
        };

        newSocket.on('connected', handleConnect);
        newSocket.on('disconnect', handleDisconnect);
        newSocket.on('connect_error', handleConnectError);

        // Cleanup function for this useEffect
        return () => {
            console.log("SocketProvider: Cleaning up pending/old socket connection.");
            newSocket.off('connect', handleConnect);
            newSocket.off('disconnect', handleDisconnect);
            newSocket.off('connect_error', handleConnectError);
            if (newSocket.connected) {
                newSocket.disconnect(); // Ensure actual disconnect
            }
            // setConnectedSocket(null); // This is handled by handleDisconnect or previous disconnect
        };

        // Dependency array: Re-run this effect when authToken changes.
        // `connectedSocket` is excluded because we manage its state internally based on `authToken` changes
        // and socket events, not as a direct dependency for re-running the effect.
    }, [authToken]);

    // Provide the socket ONLY when it's confirmed connected
    return (
        <SocketContext.Provider value={connectedSocket}>
            {children}
        </SocketContext.Provider>
    );
};

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io('http://localhost:5000/'); // Connect to your backend
        setSocket(newSocket);

        return () => {
            newSocket.disconnect(); // Clean up on unmount
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};