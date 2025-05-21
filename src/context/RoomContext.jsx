import React, { createContext, useReducer, useCallback } from 'react';

const initialStateRoom = {
    rooms: {}, // { [roomId]: { ...roomDetails, seenMessages: [], unseenMessages: [] } }
    currentRoomId: null,
    tempRoom: null,
    isTempRoomActive: false,
    isLoading: false,
    error: null,
};

const roomReducer = (state, action) => {
    switch (action.type) {
        case 'SET_ROOMS': {
            const receivedRooms = action.payload;
            const normalizedRooms = {};

            console.log("room context - setting rooms: ", state.rooms);

            for (const roomId in receivedRooms) {
                if (receivedRooms.hasOwnProperty(roomId)) {
                    const roomDetails = receivedRooms[roomId];
                    normalizedRooms[roomId] = {
                        room: roomDetails,
                        messages: [],
                        seenMessages: [],
                        unseenMessages: []
                    };
                }
            }
            return { ...state, rooms: normalizedRooms, isLoading: false, error: null };
        }

        case 'SET_CURRENT_ROOM':
            // console.log("room context - set current room: ", action.payload);
            return { ...state, currentRoomId: action.payload, isLoading: false, error: null };

        case 'ADD_ROOM': {
            // console.log("room context - add room: ", action.payload.room);
            const roomData = action.payload.room;

            if (!roomData || !roomData._id) {
                console.error("ADD_ROOM: Invalid room data in payload", action.payload.room);
                return state;
            }

            const existingRoomEntry = state.rooms[roomData._id];

            return {
                ...state,
                rooms: {
                    ...state.rooms,
                    [roomData._id]: {
                        room: roomData,
                        messages: existingRoomEntry?.messages || [],
                        seenMessages: existingRoomEntry?.seenMessages || [],
                        unseenMessages: existingRoomEntry?.unseenMessages || [],
                    }
                },
                error: null,
            };
        }

        case 'SET_TEMP_ROOM': {
            // console.log("room context - set temp room: ", action.payload.room);
            const roomData = action.payload.room;

            if (!roomData || !roomData._id) {
                console.error("ADD_ROOM: Invalid room data in payload", action.payload.room);
                return state;
            }

            const existingRoomEntry = state.rooms[roomData._id];

            return {
                ...state,
                tempRoom: roomData,
                isTempRoomActive: true,
                error: null,
            };
        }

        case 'CLEAR_TEMP_ROOM': {

            return {
                ...state,
                tempRoom: null,
                isTempRoomActive: false,
                error: null,
            };
        }

        case 'SWAP_TEMP_ROOM': {
            // console.log("room context - swap temp room: ", state.tempRoom);
            const roomData = state.tempRoom;

            if (!roomData || !roomData._id) {
                console.error("ADD_ROOM: Invalid room data in payload", state.tempRoom);
                return state;
            }

            const existingRoomEntry = state.rooms[roomData._id];

            return {
                ...state,
                tempRoom: null,
                isTempRoomActive: false,
                currentRoomId: roomData._id,
                rooms: {
                    ...state.rooms,
                    [roomData._id]: {
                        room: roomData,
                        seenMessages: existingRoomEntry?.seenMessages || [],
                        unseenMessages: existingRoomEntry?.unseenMessages || [],
                    }
                },
                error: null,
            };
        }

        case 'ADD_MESSAGES': {
            // console.log("room context - add messages: ", action.payload.roomId, " ", action.payload.messages);
            const { roomId, messages, prepend = false } = action.payload;
            const updatedRooms = { ...state.rooms };

            if (!updatedRooms[roomId]) {
                updatedRooms[roomId] = { seenMessages: prepend ? messages : [], unseenMessages: prepend ? [] : messages };
            }
            else {
                const existingSeen = updatedRooms[roomId].seenMessages;
                const existingUnseen = updatedRooms[roomId].unseenMessages;
                const allExisting = [...existingSeen, ...existingUnseen];


                const newMessages = messages.filter(newMessage =>
                    !allExisting.some(existingMessage => existingMessage._id === newMessage._id)
                );
                if (state.currentRoomId === roomId) {
                    updatedRooms[roomId] = {
                        ...updatedRooms[roomId],
                        seenMessages: prepend
                            ? [...newMessages, ...updatedRooms[roomId].seenMessages]
                            : [...updatedRooms[roomId].seenMessages, ...newMessages],
                    };
                } else {
                    updatedRooms[roomId] = {
                        ...updatedRooms[roomId],
                        unseenMessages: prepend
                            ? [...newMessages, ...updatedRooms[roomId].unseenMessages]
                            : [...updatedRooms[roomId].unseenMessages, ...newMessages],
                    };
                }
            }

            return { ...state, rooms: updatedRooms };
        }

        case 'MARK_MESSAGES_AS_SEEN': {
            // console.log("room context - mark seen messages: ", action.payload);
            const roomIdToMark = action.payload;
            if (!state.rooms[roomIdToMark]) return state;

            const updatedRoom = {
                ...state.rooms[roomIdToMark],
                seenMessages: [
                    ...state.rooms[roomIdToMark].seenMessages,
                    ...state.rooms[roomIdToMark].unseenMessages,
                ],
                unseenMessages: [],
            };

            return { ...state, rooms: { ...state.rooms, [roomIdToMark]: updatedRoom } };
        }

        case 'ROOM_ERROR':
            return { ...state, isLoading: false, error: action.payload };

        case 'ROOM_LOADING':
            return { ...state, isLoading: true, error: null };

        default:
            return state;
    }
};

const RoomContext = createContext({
    state: initialStateRoom,
    dispatch: () => { },
    setCurrentRoom: () => { },
    addMessagesToRoom: () => { },
    markMessagesAsSeen: () => { },
    setRooms: () => { },
    addRoom: () => { },
});

const RoomProvider = ({ children }) => {
    const [state, dispatch] = useReducer(roomReducer, initialStateRoom);

    const setCurrentRoom = useCallback((roomId) => {
        dispatch({ type: 'SET_CURRENT_ROOM', payload: roomId });
    }, [dispatch]);

    const addMessagesToRoom = useCallback((roomId, messages, prepend) => {
        dispatch({ type: 'ADD_MESSAGES', payload: { roomId, messages, prepend } });
    }, [dispatch]);

    const markMessagesAsSeen = useCallback((roomId) => {
        dispatch({ type: 'MARK_MESSAGES_AS_SEEN', payload: roomId });
    }, [dispatch]);

    const setRooms = useCallback((rooms) => {
        dispatch({ type: 'SET_ROOMS', payload: rooms });
    }, [dispatch]);

    const addRoom = useCallback((room) => {
        dispatch({ type: 'ADD_ROOM', payload: { room } });
    }, [dispatch]);

    return (
        <RoomContext.Provider value={{ state, dispatch, setCurrentRoom, addMessagesToRoom, markMessagesAsSeen, setRooms, addRoom }}>
            {children}
        </RoomContext.Provider>
    );
};

export { RoomContext, RoomProvider };