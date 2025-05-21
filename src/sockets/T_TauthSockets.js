// src/hooks/useAuthSockets.js
import { useEffect, useContext, useCallback } from 'react';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/UserContext';
import { RoomContext } from '../context/RoomContext'; // For roomDispatch if needed

import authApi from '../api/userApi'; // Adjust path

const useAuthSockets = () => {
    const socket = useContext(SocketContext); // Will be null initially, then the connected socket
    const { state: authState, dispatch: authDispatch } = useContext(AuthContext);
    const { dispatch: roomDispatch } = useContext(RoomContext); // If you need to dispatch to room context

    useEffect(() => {
        // Only proceed if the socket is not null and is connected
        if (!socket || !socket.connected) {
            console.warn("useAuthSockets: Socket not connected yet, skipping listener setup.");
            return;
        }

        console.log("useAuthSockets: Setting up auth socket listeners for socket ID:", socket.id);

        // 3. On "connected", client emits an "authenticate"
        const handleConnected = () => {
            console.log("useAuthSockets: Socket 'connected' event received. Emitting 'authenticate'.");
            socket.emit('authenticate', { token: localStorage.getItem('authToken') || null });
        };

        // 4. Socket server "authenticate"s and fires "Authenticated" to client along with new token
        // 5. Client receives token, stores it.
        const handleAuthenticated = async (data) => {
            console.log("useAuthSockets: Received 'authenticated' event:", data);
            if (data && data.token) {
                authDispatch({ type: 'SET_TOKEN', payload: data.token });
                const { isError, message, data: userData } = await authApi.getUser(data.token); 
                if (!isError) {
                    const { user, rooms } = userData;
                    if (user.type === "Immigrant") { // Ensure case matches your enum/string
                        authDispatch({ type: "SET_IMMIGRANT", payload: user });
                    } else {
                        authDispatch({ type: "SET_USER", payload: user });
                        roomDispatch({ type: "SET_ROOMS", payload: rooms });
                    }
                } else {
                    console.error("useAuthSockets: Error getting user after authentication:", message);
                }
            }
        };

        const handleReAuthenticated = async (data) => {
            console.log("useAuthSockets: Received 're-authenticated' event:", data);
            if (data && data.token) {
                authDispatch({ type: 'SET_TOKEN', payload: data.token });
                const { isError, message, data: userData } = await authApi.getUser(data.token); 
                if (!isError) {
                    const { user, rooms } = userData;
                    if (user.type === "IMMIGRANT") { // Ensure case matches
                        authDispatch({ type: "SET_IMMIGRANT", payload: user });
                    } else {
                        authDispatch({ type: "SET_USER", payload: user });
                        roomDispatch({ type: "SET_ROOMS", payload: rooms });
                    }
                } else {
                    console.error("useAuthSockets: Error getting user after re-authentication:", message);
                }
            }
        };

        // Attach listeners
        // The 'connected' listener is crucial for your flow.
        // It triggers the initial 'authenticate' emit.
        socket.on('connected', handleConnected); 
        socket.on('authenticated', handleAuthenticated);
        socket.on('re-authenticated', handleReAuthenticated);

        // Cleanup function for this useEffect
        return () => {
            console.log("useAuthSockets: Cleaning up auth socket listeners for socket ID:", socket.id);
            socket.off('connected', handleConnected); // IMPORTANT: Cleanup the 'connected' listener
            socket.off('authenticated', handleAuthenticated);
            socket.off('re-authenticated', handleReAuthenticated);
        };

    // Dependencies:
    // `socket`: Re-run when the socket object becomes available (from null to connected socket) or changes.
    // `authDispatch`, `roomDispatch`: Stable dispatch functions.
    // `authState.token`: If token changes, this hook might re-run and handle re-authentication flow if needed,
    //                   but the primary 'authenticate' is triggered by 'connected'.
    }, [socket, authDispatch, roomDispatch, authState.token]); // Keep authState.token for completeness, though 'connected' is primary trigger

    // No return value needed for useAuthSockets
};

const useAuthSockets1 = () => {
    const socket = useContext(SocketContext);
    const { state: authState, dispatch: authDispatch } = useContext(AuthContext);
    const { dispatch: roomDispatch } = useContext(RoomContext); // If you need to dispatch to room context

    // Define handlers inside useEffect, or as stable Callbacks if needed outside
    // For these, defining inside useEffect is cleaner for listener management.

    useEffect(() => {
        // Only set up listeners if socket is connected
        if (!socket || !socket.connected) {
            console.warn("useAuthSockets: Socket not connected, skipping auth listener setup.");
            return;
        }

        console.log("useAuthSockets: Setting up auth socket listeners for socket ID:", socket.id);

        const handleConnected = () => {
            // console.log("useAuthSockets: Socket connected, checking for authentication.");
            if (!authState.token || !authState.user) {
                // console.log("useAuthSockets: Emitting authenticate request.");
                socket.emit('authenticate', { token: localStorage.getItem('authToken') || null });
            }
        };

        const handleAuthenticated = async (data) => {
            console.log("useAuthSockets: Received 'authenticated' event:", data);
            if (data && data.token) {
                authDispatch({ type: 'SET_TOKEN', payload: data.token });
                const { isError, message, data: userData } = await authApi.getUser(data.token); // Use the new token from 'authenticated' event
                if (!isError) {
                    const { user, rooms } = userData;
                    if (user.type === "Immigrant") {
                        authDispatch({ type: "SET_IMMIGRANT", payload: user });
                    } else {
                        authDispatch({ type: "SET_USER", payload: user });
                        roomDispatch({ type: "SET_ROOMS", payload: rooms });
                    }
                } else {
                    console.error("useAuthSockets: Error getting user after authentication:", message);
                }
            }
        };

        const handleReAuthenticated = async (data) => {
            console.log("useAuthSockets: Received 're-authenticated' event:", data);
            if (data && data.token) {
                authDispatch({ type: 'SET_TOKEN', payload: data.token });
                const { isError, message, data: userData } = await authApi.getUser(data.token); // Use the new token
                if (!isError) {
                    const { user, rooms } = userData;
                    if (user.type === "IMMIGRANT") {
                        authDispatch({ type: "SET_IMMIGRANT", payload: user });
                    } else {
                        authDispatch({ type: "SET_USER", payload: user });
                        roomDispatch({ type: "SET_ROOMS", payload: rooms });
                    }
                } else {
                    console.error("useAuthSockets: Error getting user after re-authentication:", message);
                }
            }
        };

        // Attach listeners
        socket.on('connected', handleConnected);
        socket.on('authenticated', handleAuthenticated);
        socket.on('re-authenticated', handleReAuthenticated);

        // Cleanup function
        return () => {
            console.log("useAuthSockets: Cleaning up auth socket listeners for socket ID:", socket.id);
            socket.off('connected', handleConnected);
            socket.off('authenticated', handleAuthenticated);
            socket.off('re-authenticated', handleReAuthenticated);
        };

    // Dependencies:
    // `socket`: Important for re-running when socket object changes (which it now won't do unnecessarily)
    // `authState.token`: If token changes, we might need to re-evaluate connection/auth state.
    // `authDispatch`, `roomDispatch`: stable dispatch functions.
    }, [socket, authState.token, authDispatch, roomDispatch]);

    // No return value needed, as this hook only manages side effects
};

export default useAuthSockets;