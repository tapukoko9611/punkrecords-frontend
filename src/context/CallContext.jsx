import React, { createContext, useReducer, useCallback } from 'react';

const initialStateCall = {
    calls: {},         // { callId: { call: <callData>, seenMessages: [], unseenMessages: [] } }
    callOrder: {},     // map callId -> {callName, notifications, order}
    currentCallId: null,
    tempCall: null,
    isTempCallActive: false,
    isLoading: false,
    error: null,
};

const callReducer = (state, action) => {
    switch (action.type) {

        case 'SET_CALLS': {
            const receivedCalls = action.payload;
            const normalizedCalls = {};
            for (const callId in receivedCalls) {
                if (receivedCalls.hasOwnProperty(callId)) {
                    const callDetails = receivedCalls[callId];
                    normalizedCalls[callId] = {
                        call: callDetails,
                    };
                }
            }
            
            const callOrder = {};
            for (const callId in normalizedCalls) {
                if (normalizedCalls.hasOwnProperty(callId)) {
                    const callName = normalizedCalls[callId].call.name;
                    callOrder[callId] = {
                        name: callName,
                        notifications: 0,
                        order: Date.now()
                    };
                }
            }
            return { ...state, calls: normalizedCalls, callOrder, isLoading: false, error: null };
        }

        case 'SET_CURRENT_CALL':
            return { ...state, currentCallId: action.payload, isLoading: false, callOrder: { ...state.callOrder, [action.payload]: { ...state.callOrder[action.payload], notifications: 0 } }, error: null };

        case 'ADD_CALL': {
            
            const callData = action.payload.call;

            if (!callData || !callData._id) {
                console.error("ADD_CALL: Invalid call data in payload", action.payload.call);
                return state;
            }

            const updatedOrder = { ...state.callOrder };
            const callId = callData._id;

            if (updatedOrder[callId]) {
                updatedOrder[callId] = {
                    ...updatedOrder[callId],
                    notifications: updatedOrder[callId].notifications,
                    order: Date.now()
                };
            } else {
                
                const callName = (state.calls[callId].call && state.calls[callId].call.name) || 'Call';
                updatedOrder[callId] = {
                    name: callName,
                    notifications: 0,
                    order: Date.now()
                };
            }



            return {
                ...state,
                calls: {
                    ...state.calls,
                    [callData._id]: {
                        call: callData,
                    }
                },
                callOrder: updatedOrder,
                error: null,
            };
        }

        case 'SET_TEMP_CALL': {
            
            const callData = action.payload.call;

            if (!callData || !callData._id) {
                console.error("ADD_CALL: Invalid call data in payload", action.payload.call);
                return state;
            }

            return {
                ...state,
                tempCall: callData,
                isTempCallActive: true,
                error: null,
            };
        }

        case 'CLEAR_TEMP_CALL': {

            return {
                ...state,
                tempCall: null,
                isTempCallActive: false,
                error: null,
            };
        }

        case 'SWAP_TEMP_CALL': {
            
            const callData = state.tempCall;

            if (!callData || !callData._id) {
                console.error("ADD_CALL: Invalid call data in payload", state.tempCall);
                return state;
            }

            const callId = callData._id;
            const updatedOrder = { ...state.callOrder };

            if (updatedOrder[callId]) {
                updatedOrder[callId] = {
                    ...updatedOrder[callId],
                    notifications: 0,
                    order: Date.now() 
                };
            } else {
                
                const callName = callData.name;
                updatedOrder[callId] = {
                    name: callName,
                    notifications: 0,
                    order: Date.now()
                };
            }



            return {
                ...state,
                tempCall: null,
                isTempCallActive: false,
                currentCallId: callData._id,
                calls: {
                    ...state.calls,
                    [callData._id]: {
                        call: callData,
                    }
                },
                callOrder: updatedOrder,
                error: null,
            };
        }

        case 'SET_UPDATED_CALL': {
            
            const callData = action.payload.call;

            if (!callData || !callData._id) {
                console.error("SET_UPDATED_CALL: Invalid call data in payload", state.tempCall);
                return state;
            }

            const callId = callData._id;
            const updatedOrder = { ...state.callOrder };

            if (updatedOrder[callId]) {
                updatedOrder[callId] = {
                    ...updatedOrder[callId],
                    notifications: state.currentCallId === callId ? 0 : updatedOrder[callId].notifications + 1,
                    order: Date.now()
                };
            } else {
                const callName = (state.calls[callId].call && state.calls[callId].call.name) || 'Call';
                updatedOrder[callId] = {
                    name: callName,
                    notifications: state.currentCallId === callId ? 0 : 1,
                    order: Date.now()
                };
            }

            return {
                ...state,
                calls: {
                    ...state.calls,
                    [callData._id]: {
                        call: callData,
                    }
                },
                callOrder: updatedOrder,
                error: null,
            };
        }

        case 'MARK_CONTENT_AS_SEEN': {
            
            const callIdToMark = action.payload;
            if (!state.calls[callIdToMark]) return state;
            return { ...state, callOrder: { ...state.callOrder, [callIdToMark]: { ...state.callOrder[callIdToMark], notifications: 0 } } };
        }

        case 'CALL_ERROR':
            return { ...state, isLoading: false, error: action.payload };

        case 'CALL_LOADING':
            return { ...state, isLoading: true, error: null };

        default:
            return state;
    }
};

const CallContext = createContext({
    state: initialStateCall,
    dispatch: () => { },
    setCurrentCall: () => { },
    markContentAsSeen: () => { },
    setCalls: () => { },
    addCall: () => { },
});

const CallProvider = ({ children }) => {
    const [state, dispatch] = useReducer(callReducer, initialStateCall);

    const setCurrentCall = useCallback((callId) => {
        dispatch({ type: 'SET_CURRENT_CALL', payload: callId });
    }, [dispatch]);

    const markContentAsSeen = useCallback((callId) => {
        dispatch({ type: 'MARK_CONTENT_AS_SEEN', payload: callId });
    }, [dispatch]);

    const setCalls = useCallback((calls) => {
        dispatch({ type: 'SET_CALLS', payload: calls });
    }, [dispatch]);

    const addCall = useCallback((call) => {
        dispatch({ type: 'ADD_CALL', payload: { call } });
    }, [dispatch]);

    return (
        <CallContext.Provider value={{ state, dispatch, setCurrentCall, markContentAsSeen, setCalls, addCall }}>
            {children}
        </CallContext.Provider>
    );
};

export { CallContext, CallProvider };