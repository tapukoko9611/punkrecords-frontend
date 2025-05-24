// src/contexts/call/CallContext.js
import React, { createContext, useReducer, useContext, useCallback } from 'react';


const initialStateCall = {
    calls: {},
    currentCallId: null,
    isLoading: false,
    error: null,
};

const callReducer = (state, action) => {
    switch (action.type) {
        case 'SET_CALLS':
            return { ...state, calls: action.payload, isLoading: false, error: null };
        case 'SET_CURRENT_CALL':
            return { ...state, currentCallId: action.payload, isLoading: false, error: null };
        case 'ADD_CALL':
            return {
                ...state,
                calls: {
                    ...state.calls,
                    [action.payload.call._id]: {
                        ...action.payload.call,
                        newUpdates: 0,
                        participants: {}, // To store individual participant info (streams, etc.)
                    },
                },
                isLoading: false,
                error: null,
            };
        case 'INCREMENT_NEW_UPDATES':
            if (!state.calls[action.payload]) return state;
            return {
                ...state,
                calls: {
                    ...state.calls,
                    [action.payload]: {
                        ...state.calls[action.payload],
                        newUpdates: (state.calls[action.payload]?.newUpdates || 0) + 1,
                    },
                },
            };
        case 'RESET_NEW_UPDATES':
            if (!state.calls[action.payload]) return state;
            return {
                ...state,
                calls: {
                    ...state.calls,
                    [action.payload]: {
                        ...state.calls[action.payload],
                        newUpdates: 0,
                    },
                },
            };
        case 'ADD_PARTICIPANT':
            if (!state.calls[action.payload.callId]) return state;
            return {
                ...state,
                calls: {
                    ...state.calls,
                    [action.payload.callId]: {
                        ...state.calls[action.payload.callId],
                        participants: {
                            ...state.calls[action.payload.callId].participants,
                            [action.payload.userId]: action.payload.participantInfo,
                        },
                    },
                },
            };
        case 'REMOVE_PARTICIPANT':
            if (!state.calls[action.payload.callId] || !state.calls[action.payload.callId].participants[action.payload.userId]) return state;
            const { [action.payload.userId]: removedParticipant, ...restParticipants } = state.calls[action.payload.callId].participants;
            return {
                ...state,
                calls: {
                    ...state.calls,
                    [action.payload.callId]: {
                        ...state.calls[action.payload.callId],
                        participants: restParticipants,
                    },
                },
            };
        case 'CALL_LOADING':
            return { ...state, isLoading: true, error: null };
        case 'CALL_ERROR':
            return { ...state, isLoading: false, error: action.payload };
        default:
            return state;
    }
};

const CallContext = createContext({
    state: initialStateCall,
    dispatch: () => { },
});

const CallProvider = ({ children }) => {
    const [state, dispatch] = useReducer(callReducer, initialStateCall);

    const setCurrentCall = useCallback((callId) => {
        dispatch({ type: 'SET_CURRENT_CALL', payload: callId });
    }, []);

    const incrementNewUpdates = useCallback((callId) => {
        dispatch({ type: 'INCREMENT_NEW_UPDATES', payload: callId });
    }, []);

    const resetNewUpdates = useCallback((callId) => {
        dispatch({ type: 'RESET_NEW_UPDATES', payload: callId });
    }, []);

    const setCalls = useCallback((calls) => {
        dispatch({ type: 'SET_CALLS', payload: calls });
    }, []);

    const addCall = useCallback((call) => {
        dispatch({ type: 'ADD_CALL', payload: { call } });
    }, []);

    const addParticipant = useCallback((callId, userId, participantInfo) => {
        dispatch({ type: 'ADD_PARTICIPANT', payload: { callId, userId, participantInfo } });
    }, []);

    const removeParticipant = useCallback((callId, userId) => {
        dispatch({ type: 'REMOVE_PARTICIPANT', payload: { callId, userId } });
    }, []);

    return (
        <CallContext.Provider value={{ state, dispatch, setCurrentCall, incrementNewUpdates, resetNewUpdates, setCalls, addCall, addParticipant, removeParticipant }}>
            {children}
        </CallContext.Provider>
    );
};

export { CallContext, CallProvider };