import React, { createContext, useReducer, useCallback } from 'react';

const initialStateRoom = {
    rooms: {},         // { roomId: { room: <roomData>, seenMessages: [], unseenMessages: [] } }
    roomOrder: {},     // We'll store an object mapping roomId -> {roomName, notifications, order}
    currentRoomId: null,
    tempRoom: null,
    isTempRoomActive: false,
    isLoading: false,
    error: null,
};

const roomReducer = (state, action) => {
    switch (action.type) {
        case 'SET_ROOMS_': {
            const receivedRooms = action.payload;
            const normalizedRooms = {};

            // console.log("room context - setting rooms: ", state.rooms);

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

        case 'SET_ROOMS': {
            const receivedRooms = action.payload;
            const normalizedRooms = {};
            // Build rooms object:
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
            // Initialize roomOrder with each room's name, notifications=0, and order as the current timestamp.
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
            // console.log("room context - set current room: ", action.payload);
            return { ...state, currentRoomId: action.payload, isLoading: false, roomOrder: { ...state.roomOrder, [action.payload]: { ...state.roomOrder[action.payload], notifications: 0 } }, error: null };

        case 'ADD_ROOM': {
            // console.log("room context - add room: ", action.payload.room);
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
                    order: Date.now()  // update the order timestamp, so this room becomes "most recent"
                };
            } else {
                // Fallback if not already present.
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
                        messages: existingRoomEntry?.messages || [],
                        seenMessages: existingRoomEntry?.seenMessages || [],
                        unseenMessages: existingRoomEntry?.unseenMessages || [],
                    }
                },
                roomOrder: updatedOrder,
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

            const roomId = roomData._id;
            const updatedOrder = { ...state.roomOrder };

            if (updatedOrder[roomId]) {
                updatedOrder[roomId] = {
                    ...updatedOrder[roomId],
                    notifications: 0, //updatedOrder[roomId].notifications,
                    order: Date.now()  // update the order timestamp, so this room becomes "most recent"
                };
            } else {
                // Fallback if not already present.
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
            // console.log("room context - swap temp room: ", state.tempRoom);
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
                    order: Date.now()  // update the order timestamp, so this room becomes "most recent"
                };
            } else {
                // Fallback if not already present.
                const roomName = (state.rooms[roomId].room && state.rooms[roomId].room.name) || 'Room';
                updatedOrder[roomId] = {
                    name: roomName,
                    notifications: state.currentRoomId === roomId ? 0 : 1,
                    order: Date.now()
                };
            }

            return {
                ...state,
                // tempRoom: null,
                // isTempRoomActive: false,
                // currentRoomId: roomData._id,
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
            // We'll assume that action.payload contains: { roomId, messages, prepend }
            const { roomId, messages, prepend = false, type = "No" } = action.payload;
            const updatedRooms = { ...state.rooms };
            // console.log(state.rooms[roomId]?.seenMessages.length, state.rooms[roomId]?.unseenMessages.length)

            // Ensure the room exists in state.
            if (!updatedRooms[roomId]) {
                updatedRooms[roomId] = { room: {}, seenMessages: [], unseenMessages: [] };
            }

            const existingSeen = updatedRooms[roomId].seenMessages;
            // Filter out duplicates.
            const newMessages = messages.filter(newMessage =>
                !existingSeen.some(existingMessage => existingMessage._id === newMessage._id)
            );

            if (state.currentRoomId === roomId) {
                if (existingSeen.length === 0 && !prepend) {
                    // Initial load; backend returns messages in descending order – reverse to store ascending.
                    updatedRooms[roomId].seenMessages = [...newMessages].reverse();
                } else if (prepend) {
                    // Load more (older messages): reverse the batch, then prepend.
                    const olderMessagesAsc = [...newMessages].reverse();
                    updatedRooms[roomId].seenMessages = [...olderMessagesAsc, ...existingSeen];
                    updatedRooms[roomId].seenMessages.sort(
                        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                    );
                } else {
                    // Appending new messages.
                    updatedRooms[roomId].seenMessages = [...existingSeen, ...newMessages];
                }
            } else {
                updatedRooms[roomId].unseenMessages = prepend
                    ? [...newMessages, ...updatedRooms[roomId].unseenMessages]
                    : [...updatedRooms[roomId].unseenMessages, ...newMessages];
            }

            // Now update the roomOrder.
            // We also want to increment the notification count by one, but only if messages.length <= 2.
            const updatedOrder = { ...state.roomOrder };

            if (messages.length <= 2) {
                // If an entry already exists, increment its notifications; otherwise create a new one.
                if (updatedOrder[roomId]) {
                    updatedOrder[roomId] = {
                        ...updatedOrder[roomId],
                        notifications: type == "Initial" ? 0 : updatedOrder[roomId].notifications + messages.length,
                        order: Date.now()  // update the order timestamp, so this room becomes "most recent"
                    };
                } else {
                    // Fallback if not already present.
                    const roomName = (updatedRooms[roomId].room && updatedRooms[roomId].room.name) || 'Room';
                    updatedOrder[roomId] = {
                        name: roomName,
                        notifications: type == "Initial" ? 0 : 1,
                        order: Date.now()
                    };
                }
            } else {
                // For larger batches (like initial loads or load-more), we can simply update the order.
                if (updatedOrder[roomId]) {
                    updatedOrder[roomId] = { ...updatedOrder[roomId], order: Date.now() };
                }
            }
            // console.log(state.rooms[roomId]?.seenMessages.length, state.rooms[roomId]?.unseenMessages.length)

            return { ...state, rooms: updatedRooms, roomOrder: updatedOrder };
        }

        case 'ADD_MESSAGES_': {
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

        case 'ADD_MESSAGES__': {
            const { roomId, messages, prepend = false } = action.payload;
            const updatedRooms = { ...state.rooms };

            // Ensure the room entry exists.
            if (!updatedRooms[roomId]) {
                updatedRooms[roomId] = { seenMessages: [], unseenMessages: [] };
            }

            const existingSeen = updatedRooms[roomId].seenMessages;
            const existingUnseen = updatedRooms[roomId].unseenMessages;
            const allExisting = [...existingSeen, ...existingUnseen];

            // Filter out duplicate messages
            const newMessages = messages.filter(newMessage =>
                !allExisting.some(existingMessage => existingMessage._id === newMessage._id)
            );

            if (state.currentRoomId === roomId) {
                // If no messages have been loaded yet and this is not a prepend scenario,
                // we assume this is the initial load. The backend sends messages in descending order,
                // so we reverse them to store in ascending order.
                if (existingSeen.length === 0 && !prepend) {
                    updatedRooms[roomId].seenMessages = [...newMessages].reverse();
                } else {
                    // Otherwise, simply append or prepend the new messages.
                    updatedRooms[roomId].seenMessages = prepend
                        ? [...newMessages, ...existingSeen]
                        : [...existingSeen, ...newMessages];
                }
            } else {
                updatedRooms[roomId].unseenMessages = prepend
                    ? [...newMessages, ...existingUnseen]
                    : [...existingUnseen, ...newMessages];
            }
            return { ...state, rooms: updatedRooms };
        }

        case 'ADD_MESSAGES___': {
            const { roomId, messages, prepend = false } = action.payload;
            const updatedRooms = { ...state.rooms };

            // Ensure room entry exists.
            if (!updatedRooms[roomId]) {
                updatedRooms[roomId] = { seenMessages: [], unseenMessages: [] };
            }

            // Get existing messages.
            const existingSeen = updatedRooms[roomId].seenMessages;

            // Filter out any messages that already exist.
            const newMessages = messages.filter(newMessage =>
                !existingSeen.some(existingMessage => existingMessage._id === newMessage._id)
            );

            if (state.currentRoomId === roomId) {
                if (existingSeen.length === 0 && !prepend) {
                    // Initial load: since backend returns in descending order, reverse them.
                    updatedRooms[roomId].seenMessages = [...newMessages].reverse();
                } else if (prepend) {
                    // Load more: backend returns messages in descending order.
                    // Reverse so that older messages are at the beginning.
                    let olderMessagesAsc = [...newMessages].reverse();
                    // Merge them before existing messages.
                    let mergedMessages = [...olderMessagesAsc, ...existingSeen];
                    // Sort the merged array by creation time to guarantee ascending order.
                    mergedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    updatedRooms[roomId].seenMessages = mergedMessages;
                } else {
                    // For new messages appended (e.g., a message sent by you) assume they are already sorted
                    updatedRooms[roomId].seenMessages = [...existingSeen, ...newMessages];
                }
            } else {
                // If not the current room, update unseen messages as needed.
                updatedRooms[roomId].unseenMessages = prepend
                    ? [...newMessages, ...updatedRooms[roomId].unseenMessages]
                    : [...updatedRooms[roomId].unseenMessages, ...newMessages];
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