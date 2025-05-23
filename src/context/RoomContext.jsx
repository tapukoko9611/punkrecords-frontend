import React, { createContext, useReducer, useCallback } from 'react';

const initialStateRoom = {
    rooms: {},         // { roomId: { room: <roomData>, seenMessages: [], unseenMessages: [] } }
    roomOrder: {},     // map roomId -> {roomName, notifications, order}
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
            for (const roomId in receivedRooms) {
                if (receivedRooms.hasOwnProperty(roomId)) {
                    const roomDetails = receivedRooms[roomId];
                    normalizedRooms[roomId] = {
                        room: roomDetails,
                        seenMessages: [],
                        unseenMessages: []
                    };
                }
            }
            
            const roomOrder = {};
            for (const roomId in normalizedRooms) {
                if (normalizedRooms.hasOwnProperty(roomId)) {
                    const roomName = normalizedRooms[roomId].room.name;
                    roomOrder[roomId] = {
                        name: roomName,
                        notifications: 0,
                        order: Date.now()
                    };
                }
            }
            return { ...state, rooms: normalizedRooms, roomOrder, isLoading: false, error: null };
        }

        case 'SET_CURRENT_ROOM':
            return { ...state, currentRoomId: action.payload, isLoading: false, roomOrder: { ...state.roomOrder, [action.payload]: { ...state.roomOrder[action.payload], notifications: 0 } }, error: null };

        case 'ADD_ROOM': {
            
            const roomData = action.payload.room;

            if (!roomData || !roomData._id) {
                console.error("ADD_ROOM: Invalid room data in payload", action.payload.room);
                return state;
            }

            const existingRoomEntry = state.rooms[roomData._id];

            const updatedOrder = { ...state.roomOrder };
            const roomId = roomData._id;

            if (updatedOrder[roomId]) {
                updatedOrder[roomId] = {
                    ...updatedOrder[roomId],
                    notifications: updatedOrder[roomId].notifications,
                    order: Date.now()
                };
            } else {
                
                const roomName = (state.rooms[roomId].room && state.rooms[roomId].room.name) || 'Room';
                updatedOrder[roomId] = {
                    name: roomName,
                    notifications: 0,
                    order: Date.now()
                };
            }



            return {
                ...state,
                rooms: {
                    ...state.rooms,
                    [roomData._id]: {
                        room: roomData,
                        seenMessages: existingRoomEntry?.seenMessages || [],
                        unseenMessages: existingRoomEntry?.unseenMessages || [],
                    }
                },
                roomOrder: updatedOrder,
                error: null,
            };
        }

        case 'SET_TEMP_ROOM': {
            
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
            
            const roomData = state.tempRoom;

            if (!roomData || !roomData._id) {
                console.error("ADD_ROOM: Invalid room data in payload", state.tempRoom);
                return state;
            }

            const existingRoomEntry = state.rooms[roomData._id];

            const roomId = roomData._id;
            const updatedOrder = { ...state.roomOrder };

            if (updatedOrder[roomId]) {
                updatedOrder[roomId] = {
                    ...updatedOrder[roomId],
                    notifications: 0,
                    order: Date.now() 
                };
            } else {
                
                const roomName = roomData.name;
                updatedOrder[roomId] = {
                    name: roomName,
                    notifications: 0,
                    order: Date.now()
                };
            }



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
                roomOrder: updatedOrder,
                error: null,
            };
        }

        case 'SET_UPDATED_ROOM': {
            
            const roomData = action.payload.room;

            if (!roomData || !roomData._id) {
                console.error("SET_UPDATED_ROOM: Invalid room data in payload", state.tempRoom);
                return state;
            }

            const existingRoomEntry = state.rooms[roomData._id];

            const roomId = roomData._id;
            const updatedOrder = { ...state.roomOrder };

            if (updatedOrder[roomId]) {
                updatedOrder[roomId] = {
                    ...updatedOrder[roomId],
                    notifications: state.currentRoomId === roomId ? 0 : updatedOrder[roomId].notifications + 1,
                    order: Date.now()
                };
            } else {
                
                const roomName = (state.rooms[roomId].room && state.rooms[roomId].room.name) || 'Room';
                updatedOrder[roomId] = {
                    name: roomName,
                    notifications: state.currentRoomId === roomId ? 0 : 1,
                    order: Date.now()
                };
            }

            return {
                ...state,
                rooms: {
                    ...state.rooms,
                    [roomData._id]: {
                        room: roomData,
                        seenMessages: existingRoomEntry?.seenMessages || [],
                        unseenMessages: existingRoomEntry?.unseenMessages || [],
                    }
                },
                roomOrder: updatedOrder,
                error: null,
            };
        }

        case 'ADD_MESSAGES': {
            const { roomId, messages, prepend = false, type = "No" } = action.payload;
            const updatedRooms = { ...state.rooms };
            
            if (!updatedRooms[roomId]) {
                updatedRooms[roomId] = { room: {}, seenMessages: [], unseenMessages: [] };
            }

            const existingSeen = updatedRooms[roomId].seenMessages;
            const newMessages = messages.filter(newMessage =>
                !existingSeen.some(existingMessage => existingMessage._id === newMessage._id)
            );

            if (state.currentRoomId === roomId) {
                if (existingSeen.length === 0 && !prepend) {
                    updatedRooms[roomId].seenMessages = [...newMessages].reverse();
                } else if (prepend) {
                    const olderMessagesAsc = [...newMessages].reverse();
                    updatedRooms[roomId].seenMessages = [...olderMessagesAsc, ...existingSeen];
                    updatedRooms[roomId].seenMessages.sort(
                        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                    );
                } else {
                    updatedRooms[roomId].seenMessages = [...existingSeen, ...newMessages];
                }
            } else {
                updatedRooms[roomId].unseenMessages = prepend
                    ? [...newMessages, ...updatedRooms[roomId].unseenMessages]
                    : [...updatedRooms[roomId].unseenMessages, ...newMessages];
            }

            const updatedOrder = { ...state.roomOrder };

            if (messages.length <= 2) {
                if (updatedOrder[roomId]) {
                    updatedOrder[roomId] = {
                        ...updatedOrder[roomId],
                        notifications: type == "Initial" ? 0 : updatedOrder[roomId].notifications + messages.length,
                        order: Date.now() 
                    };
                } else {
                    
                    const roomName = (updatedRooms[roomId].room && updatedRooms[roomId].room.name) || 'Room';
                    updatedOrder[roomId] = {
                        name: roomName,
                        notifications: type == "Initial" ? 0 : 1,
                        order: Date.now()
                    };
                }
            } else {
                if (updatedOrder[roomId]) {
                    updatedOrder[roomId] = { ...updatedOrder[roomId], order: Date.now() };
                }
            }

            return { ...state, rooms: updatedRooms, roomOrder: updatedOrder };
        }

        case 'MARK_MESSAGES_AS_SEEN': {
            
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

            return { ...state, rooms: { ...state.rooms, [roomIdToMark]: updatedRoom }, roomOrder: { ...state.roomOrder, [roomIdToMark]: { ...state.roomOrder[roomIdToMark], notifications: 0 } } };
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