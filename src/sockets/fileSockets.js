import { socket } from '../App';

import { useCallback, useEffect } from 'react';

const fileSockets = (dispatch) => {
    const emitCheckFile = useCallback((fileName, token) => {
        socket.emit('file:check', { fileName, token });
    }, []);

    const onFileChecked = useCallback(() => {
        socket.on('file:checked', (result) => {
            if (!result.isError) {
                dispatch({ type: 'ADD_FILE', payload: { file: result.data.file } });
            } else {
                dispatch({ type: 'FILE_ERROR', payload: result.message });
            }
        });
    }, [dispatch]);

    const emitJoinFile = useCallback((fileName, token) => {
        socket.emit('file:join', { fileName, token });
    }, []);

    const onFileJoined = useCallback(() => {
        socket.on('file:joined', (result) => {
            if (!result.isError) {
                dispatch({ type: 'SET_CURRENT_FILE', payload: result.data.file._id });
            } else {
                dispatch({ type: 'FILE_ERROR', payload: result.message });
            }
        });
    }, [dispatch]);

    const onFileUpdated = useCallback(() => {
        socket.on('file:updated', (data) => {
            dispatch({ type: 'UPDATE_FILE', payload: { fileId: data.fileId, updates: data.updates } });
        });
    }, [dispatch]);

    const onFileDeleted = useCallback(() => {
        socket.on('file:deleted', (data) => {
            dispatch({ type: 'REMOVE_FILE', payload: data.fileId });
        });
    }, [dispatch]);

    const setupFileSockets = useCallback(() => {
        onFileChecked();
        onFileJoined();
        onFileUpdated();
        onFileDeleted();
    }, [onFileChecked, onFileJoined, onFileUpdated, onFileDeleted]);

    useEffect(() => {
        setupFileSockets();
        return () => {
            socket.off('file:checked');
            socket.off('file:joined');
            socket.off('file:updated');
            socket.off('file:deleted');
        };
    }, [setupFileSockets]);

    return { emitCheckFile, emitJoinFile };
};

export default fileSockets;