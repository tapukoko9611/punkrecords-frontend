import { socket } from '../App';

import { useCallback, useEffect } from 'react';

const editorSockets = (dispatch) => {
    const emitCheckEditor = useCallback((editorName, token) => {
        socket.emit('editor:check', { editorName, token });
    }, []);

    const onEditorChecked = useCallback(() => {
        socket.on('editor:checked', (result) => {
            if (!result.isError) {
                dispatch({ type: 'ADD_EDITOR', payload: { editor: result.data.editor } });
            } else {
                dispatch({ type: 'EDITOR_ERROR', payload: result.message });
            }
        });
    }, [dispatch]);

    const emitJoinEditor = useCallback((editorName, token) => {
        socket.emit('editor:join', { editorName, token });
    }, []);

    const onEditorJoined = useCallback(() => {
        socket.on('editor:joined', (result) => {
            if (!result.isError) {
                dispatch({ type: 'SET_CURRENT_EDITOR', payload: result.data.editor._id });
            } else {
                dispatch({ type: 'EDITOR_ERROR', payload: result.message });
            }
        });
    }, [dispatch]);

    const onEditorContentChange = useCallback(() => {
        socket.on('editor:content-change', (data) => {
            dispatch({ type: 'INCREMENT_NEW_EDITS', payload: data.editorId });
        });
    }, [dispatch]);

    const setupEditorSockets = useCallback(() => {
        onEditorChecked();
        onEditorJoined();
        onEditorContentChange();
    }, [onEditorChecked, onEditorJoined, onEditorContentChange]);

    useEffect(() => {
        setupEditorSockets();
        return () => {
            socket.off('editor:checked');
            socket.off('editor:joined');
            socket.off('editor:content-change');
        };
    }, [setupEditorSockets]);

    return { emitCheckEditor, emitJoinEditor };
};

export default editorSockets;