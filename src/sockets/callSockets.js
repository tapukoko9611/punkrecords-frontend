import { socket } from '../App';

import { useCallback, useEffect } from 'react';

const callSockets = (dispatch) => {
    const emitCheckCall = useCallback((callName, token) => {
        socket.emit('call:check', { callName, token });
    }, []);

    const onCallChecked = useCallback(() => {
        socket.on('call:checked', (result) => {
            if (!result.isError) {
                dispatch({ type: 'ADD_CALL', payload: { call: result.data.call } });
            } else {
                dispatch({ type: 'CALL_ERROR', payload: result.message });
            }
        });
    }, [dispatch]);

    const emitJoinCall = useCallback((callName, token) => {
        socket.emit('call:join', { callName, token });
    }, []);

    const onCallJoined = useCallback(() => {
        socket.on('call:joined', (result) => {
            if (!result.isError) {
                dispatch({ type: 'SET_CURRENT_CALL', payload: result.data.call._id });
            } else {
                dispatch({ type: 'CALL_ERROR', payload: result.message });
            }
        });
    }, [dispatch]);

    const onUserJoinedCall = useCallback(() => {
        socket.on('user:joined', (data) => {
            dispatch({ type: 'INCREMENT_NEW_UPDATES', payload: data.callId }); // callId is included in data
            dispatch({ type: 'ADD_PARTICIPANT', payload: { callId: data.callId, userId: data.userId, participantInfo: data.participantInfo } }); // Include participantInfo
        });
    }, [dispatch]);

    const onUserLeftCall = useCallback(() => {
        socket.on('user:left', (data) => {
            dispatch({ type: 'INCREMENT_NEW_UPDATES', payload: data.callId });
            dispatch({ type: 'REMOVE_PARTICIPANT', payload: { callId: data.callId, userId: data.userId } });
        });
    }, [dispatch]);

    const setupCallSockets = useCallback(() => {
        onCallChecked();
        onCallJoined();
        onUserJoinedCall();
        onUserLeftCall();
    }, [onCallChecked, onCallJoined, onUserJoinedCall, onUserLeftCall]);

    useEffect(() => {
        setupCallSockets();
        return () => {
            socket.off('call:checked');
            socket.off('call:joined');
            socket.off('user:joined');
            socket.off('user:left');
        };
    }, [setupCallSockets]);

    return { emitCheckCall, emitJoinCall };
};

export default callSockets;