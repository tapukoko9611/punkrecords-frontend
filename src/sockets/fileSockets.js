import { useCallback, useEffect, useContext, useRef } from 'react';
import { SocketContext } from '../context/SocketContext';

// Global flag – it will persist across hook instances.
let fileListenersInitialized = false;

const useFileSockets = (dispatch, authDispatch) => {
    const socket = useContext(SocketContext);

    const removeListeners = useCallback(() => {
        if (socket) {
            socket.off('file:searched');
            socket.off('file:joined');
            socket.off('file:content:got');
            socket.off('file:content:updated');
            socket.off('file:metadata:updated');
            socket.off('file:error');
        }
    }, [socket]);

    useEffect(() => {
        if (!socket) return;
        if (!fileListenersInitialized) {
            removeListeners();
            socket.on('file:searched', (result) => {
                if (!result.isError) {
                    dispatch({ type: 'SET_TEMP_FILE', payload: { file: result.data.file } });
                } else {
                    dispatch({ type: 'FILE_ERROR', payload: result.message });
                }
            });

            socket.on('file:joined', (result) => {
                if (!result.isError) {
                    if (result.type != "Initial") dispatch({ type: 'SWAP_TEMP_FILE', payload: { file: result.data.file } });
                } else {
                    dispatch({ type: 'FILE_ERROR', payload: result.message });
                }
            });

            socket.on('file:content:got', (result) => {
                if (!result.isError) {
                    dispatch({ type: 'SET_UPDATED_FILE', payload: { file: result.data.file } });
                } else {
                    dispatch({ type: 'FILE_ERROR', payload: result.message });
                }
            });

            socket.on('file:content:updated', (result) => {
                if (!result.isError) {
                    console.log(result.data.file);
                    dispatch({ type: 'SET_UPDATED_FILE', payload: { file: result.data.file } });
                } else {
                    dispatch({ type: 'FILE_ERROR', payload: result.message });
                }
            });

            socket.on('file:metadata:updated', (result) => {
                if (!result.isError) {
                    dispatch({ type: 'SET_UPDATED_FILE', payload: { file: result.data.file } });
                    alert("file updated");
                } else {
                    dispatch({ type: 'FILE_ERROR', payload: result.message });
                }
            });

            socket.on('file:error', (error) => {
                console.error("File Socket Error:", error.message);
                dispatch({ type: 'FILE_ERROR', payload: error.message });
            });

            fileListenersInitialized = true;
        }

        return () => {};
    }, [socket, dispatch, removeListeners]);

    const emitCheckFile = useCallback((fileName, privacy = false, password = "", token) => {
        if (socket && socket.connected) {
            socket.emit('file:search', { fileName, privacy, password, token });
        } else {
            console.warn("Socket not connected, cannot emit 'file:search'.");
        }
    }, [socket]);

    const emitJoinFile = useCallback((fileName, token, type = "No") => {
        if (socket && socket.connected) {
            socket.emit('file:join', { fileName, type, token, type });
        } else {
            console.warn("Socket not connected, cannot emit 'file:join'.");
        }
    }, [socket]);

    const emitFileGet = useCallback((fileId, token) => {
        if (socket && socket.connected) {
            socket.emit('file:content:get', { fileId, token });
        } else {
            console.warn("Socket not connected, cannot emit 'file:messages:initial'.");
        }
    }, [socket]);

    const emitUpdateFileContent = useCallback((fileName, fileUrl, fileSize, fileType, token) => {
        if (socket && socket.connected) {
            socket.emit('file:content:update', { fileName, fileUrl, fileSize, fileType, token });
        } else {
            console.warn("Socket not connected, cannot emit 'file:message:send'.");
        }
    }, [socket]);

    const emitUpdateFileMetadata = useCallback((fileName, privacy = false, password = "") => {
        if (socket && socket.connected) {
            socket.emit('file:metadata:update', { fileName, privacy, password });
        } else {
            console.warn("Socket not connected, cannot emit 'file:search'.");
        }
    }, [socket]);

    return {
        emitCheckFile,
        emitJoinFile,
        emitFileGet,
        emitUpdateFileContent,
        emitUpdateFileMetadata
    };
};

export default useFileSockets;