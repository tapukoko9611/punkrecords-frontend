import { useCallback, useEffect, useContext, useRef } from 'react';
import { SocketContext } from '../context/SocketContext';

// Global flag – it will persist across hook instances.
let callListenersInitialized = false;

const useCallSockets = (dispatch, authDispatch) => {
    const socket = useContext(SocketContext);

    const removeListeners = useCallback(() => {
        if (socket) {
            socket.off('call:searched');
            socket.off('call:joined');
            socket.off('call:content:got');
            socket.off('call:content:updated');
            socket.off('call:metadata:updated');
            socket.off('call:error');
        }
    }, [socket]);

    useEffect(() => {
        if (!socket) return;
        if (!callListenersInitialized) {
            removeListeners();
            socket.on('call:searched', (result) => {
                if (!result.isError) {
                    dispatch({ type: 'SET_TEMP_CALL', payload: { call: result.data.call } });
                } else {
                    dispatch({ type: 'CALL_ERROR', payload: result.message });
                }
            });

            socket.on('call:joined', (result) => {
                if (!result.isError) {
                    if (result.type != "Initial") dispatch({ type: 'SWAP_TEMP_CALL', payload: { call: result.data.call } });
                } else {
                    dispatch({ type: 'CALL_ERROR', payload: result.message });
                }
            });

            socket.on('call:content:got', (result) => {
                if (!result.isError) {
                    dispatch({ type: 'SET_UPDATED_CALL', payload: { call: result.data.call } });
                } else {
                    dispatch({ type: 'CALL_ERROR', payload: result.message });
                }
            });

            socket.on('call:content:updated', (result) => {
                if (!result.isError) {
                    dispatch({ type: 'SET_UPDATED_CALL', payload: { call: result.data.call } });
                } else {
                    dispatch({ type: 'CALL_ERROR', payload: result.message });
                }
            });

            socket.on('call:metadata:updated', (result) => {
                if (!result.isError) {
                    dispatch({ type: 'SET_UPDATED_CALL', payload: { call: result.data.call } });
                    alert("call updated");
                } else {
                    dispatch({ type: 'CALL_ERROR', payload: result.message });
                }
            });

            socket.on('call:error', (error) => {
                console.error("Call Socket Error:", error.message);
                dispatch({ type: 'CALL_ERROR', payload: error.message });
            });

            callListenersInitialized = true;
        }

        return () => {};
    }, [socket, dispatch, removeListeners]);

    const emitCheckCall = useCallback((callName, privacy = false, password = "", token) => {
        if (socket && socket.connected) {
            socket.emit('call:search', { callName, privacy, password, token });
        } else {
            console.warn("Socket not connected, cannot emit 'call:search'.");
        }
    }, [socket]);

    const emitJoinCall = useCallback((callName, token, type = "No") => {
        if (socket && socket.connected) {
            socket.emit('call:join', { callName, type, token, type });
        } else {
            console.warn("Socket not connected, cannot emit 'call:join'.");
        }
    }, [socket]);

    const emitCallGet = useCallback((callId, token) => {
        if (socket && socket.connected) {
            socket.emit('call:content:get', { callId, token });
        } else {
            console.warn("Socket not connected, cannot emit 'call:messages:initial'.");
        }
    }, [socket]);

    const emitUpdateCallContent = useCallback((callName, text, token) => {
        if (socket && socket.connected) {
            socket.emit('call:content:update', { callName, text, token });
        } else {
            console.warn("Socket not connected, cannot emit 'call:message:send'.");
        }
    }, [socket]);

    const emitUpdateCallMetadata = useCallback((callName, privacy = false, password = "") => {
        if (socket && socket.connected) {
            socket.emit('call:metadata:update', { callName, privacy, password });
        } else {
            console.warn("Socket not connected, cannot emit 'call:search'.");
        }
    }, [socket]);

    return {
        emitCheckCall,
        emitJoinCall,
        emitCallGet,
        emitUpdateCallContent,
        emitUpdateCallMetadata
    };
};

export default useCallSockets;