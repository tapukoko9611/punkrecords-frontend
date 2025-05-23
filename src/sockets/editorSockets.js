import { useCallback, useEffect, useContext, useRef } from 'react';
import { SocketContext } from '../context/SocketContext';

// Global flag – it will persist across hook instances.
let editorListenersInitialized = false;

const useEditorSockets = (dispatch, authDispatch) => {
    const socket = useContext(SocketContext);

    const removeListeners = useCallback(() => {
        if (socket) {
            socket.off('editor:searched');
            socket.off('editor:joined');
            socket.off('editor:content:got');
            socket.off('editor:content:updated');
            socket.off('editor:metadata:updated');
            socket.off('editor:error');
        }
    }, [socket]);

    useEffect(() => {
        if (!socket) return;
        if (!editorListenersInitialized) {
            removeListeners();
            socket.on('editor:searched', (result) => {
                if (!result.isError) {
                    dispatch({ type: 'SET_TEMP_EDITOR', payload: { editor: result.data.editor } });
                } else {
                    dispatch({ type: 'EDITOR_ERROR', payload: result.message });
                }
            });

            socket.on('editor:joined', (result) => {
                if (!result.isError) {
                    if (result.type != "Initial") dispatch({ type: 'SWAP_TEMP_EDITOR', payload: { editor: result.data.editor } });
                } else {
                    dispatch({ type: 'EDITOR_ERROR', payload: result.message });
                }
            });

            socket.on('editor:content:got', (result) => {
                if (!result.isError) {
                    dispatch({ type: 'SET_UPDATED_EDITOR', payload: { editor: result.data.editor } });
                } else {
                    dispatch({ type: 'EDITOR_ERROR', payload: result.message });
                }
            });

            socket.on('editor:content:updated', (result) => {
                if (!result.isError) {
                    dispatch({ type: 'SET_UPDATED_EDITOR', payload: { editor: result.data.editor } });
                } else {
                    dispatch({ type: 'EDITOR_ERROR', payload: result.message });
                }
            });

            socket.on('editor:metadata:updated', (result) => {
                if (!result.isError) {
                    dispatch({ type: 'SET_UPDATED_EDITOR', payload: { editor: result.data.editor } });
                    alert("editor updated");
                } else {
                    dispatch({ type: 'EDITOR_ERROR', payload: result.message });
                }
            });

            socket.on('editor:error', (error) => {
                console.error("Editor Socket Error:", error.message);
                dispatch({ type: 'EDITOR_ERROR', payload: error.message });
            });

            editorListenersInitialized = true;
        }

        return () => {};
    }, [socket, dispatch, removeListeners]);

    const emitCheckEditor = useCallback((editorName, privacy = false, password = "", token) => {
        if (socket && socket.connected) {
            socket.emit('editor:search', { editorName, privacy, password, token });
        } else {
            console.warn("Socket not connected, cannot emit 'editor:search'.");
        }
    }, [socket]);

    const emitJoinEditor = useCallback((editorName, token, type = "No") => {
        if (socket && socket.connected) {
            socket.emit('editor:join', { editorName, type, token, type });
        } else {
            console.warn("Socket not connected, cannot emit 'editor:join'.");
        }
    }, [socket]);

    const emitEditorGet = useCallback((editorId, token) => {
        if (socket && socket.connected) {
            socket.emit('editor:content:get', { editorId, token });
        } else {
            console.warn("Socket not connected, cannot emit 'editor:messages:initial'.");
        }
    }, [socket]);

    const emitUpdateEditorContent = useCallback((editorName, text, token) => {
        if (socket && socket.connected) {
            socket.emit('editor:content:update', { editorName, text, token });
        } else {
            console.warn("Socket not connected, cannot emit 'editor:message:send'.");
        }
    }, [socket]);

    const emitUpdateEditorMetadata = useCallback((editorName, language="txt", privacy = false, password = "") => {
        if (socket && socket.connected) {
            socket.emit('editor:metadata:update', { editorName, language, privacy, password });
        } else {
            console.warn("Socket not connected, cannot emit 'editor:search'.");
        }
    }, [socket]);

    return {
        emitCheckEditor,
        emitJoinEditor,
        emitEditorGet,
        emitUpdateEditorContent,
        emitUpdateEditorMetadata
    };
};

export default useEditorSockets;