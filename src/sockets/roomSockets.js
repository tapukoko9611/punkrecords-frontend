import { useCallback, useEffect, useContext, useRef } from 'react';
import { SocketContext } from '../context/SocketContext';

// Global flag – it will persist across hook instances.
let roomListenersInitialized = false;

const useRoomSockets6 = (dispatch, authDispatch) => {
  const socket = useContext(SocketContext);

  // Always remove any previous listeners (this ensures you don’t stack them)
  const removeListeners = useCallback(() => {
    if (socket) {
      socket.off('room:searched');
      socket.off('room:joined');
      socket.off('room:messages:initial');
      socket.off('room:message:new');
      socket.off('room:messages:loadedMore');
      socket.off('room:error');
    }
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    if (!roomListenersInitialized) {
      // Remove any stale listeners and attach new ones
      removeListeners();
      socket.on('room:searched', (result) => {
        if (!result.isError) {
        //   console.log("socket - got search/create/get room: ", result.data.room);
          dispatch({ type: 'SET_TEMP_ROOM', payload: { room: result.data.room } });
        } else {
          dispatch({ type: 'ROOM_ERROR', payload: result.message });
        }
      });

      socket.on('room:joined', (result) => {
        if (!result.isError) {
        //   console.log("socket - joined room: ", result.data.room);
          dispatch({ type: 'SWAP_TEMP_ROOM', payload: { room: result.data.room } });
          // Trigger initial messages after joining.
          emitInitialMessages(result.data.room._id, "");
        } else {
          dispatch({ type: 'ROOM_ERROR', payload: result.message });
        }
      });

      socket.on('room:messages:initial', (result) => {
        if (!result.isError) {
        //   console.log("socket - got initial message: ", result.data.messages);
          dispatch({ type: 'ADD_MESSAGES', payload: { 
              roomId: result.data.room._id, 
              messages: result.data.messages, 
              prepend: false } 
          });
        } else {
          dispatch({ type: 'ROOM_ERROR', payload: result.message });
        }
      });

      // Register other event handlers similarly…

      socket.on('room:message:new', (messages) => {
        // console.log("socket - got new message: ", messages[0].roomId, messages);
        dispatch({ type: 'ADD_MESSAGES', payload: { 
            roomId: messages[0].roomId, 
            messages, 
            prepend: false } 
        });
      });

      socket.on('room:messages:loadedMore', (result) => {
        if (!result.isError) {
        //   console.log("socket - loaded more messages room: ", result.data.messages);
          dispatch({ type: 'ADD_MESSAGES', payload: { 
              roomId: result.data.room._id, 
              messages: result.data.messages, 
              prepend: true } 
          });
        } else {
          dispatch({ type: 'ROOM_ERROR', payload: result.message });
        }
      });

      // Global error handler
      socket.on('room:error', (error) => {
        console.error("Room Socket Error:", error.message);
        dispatch({ type: 'ROOM_ERROR', payload: error.message });
      });

      roomListenersInitialized = true;
    }

    return () => {
      // Optionally, you can remove listeners on unmount, but in Strict Mode the component might unmount and remount.
      // If you remove the listeners here, they may be re-added immediately in development.
      // removeListeners();
      // roomListenersInitialized = false;
    };
  }, [socket, dispatch, removeListeners]);

  // The emit functions – using useCallback retains stable references
  const emitCheckRoom = useCallback((roomName, privacy=false, password="", token) => {
    if (socket && socket.connected) {
    //   console.log("socket - emit search/create/get room: ", roomName);
      socket.emit('room:search', { roomName, privacy, password, token });
    } else {
      console.warn("Socket not connected, cannot emit 'room:search'.");
    }
  }, [socket]);

  const emitJoinRoom = useCallback((roomName, token, password = "") => {
    if (socket && socket.connected) {
    //   console.log("socket - emit join room: ", roomName);
      socket.emit('room:join', { roomName, token, password });
    } else {
      console.warn("Socket not connected, cannot emit 'room:join'.");
    }
  }, [socket]);

  const emitInitialMessages = useCallback((roomId, token) => {
    if (socket && socket.connected) {
    //   console.log("socket - emit initial messages room: ", roomId);
      socket.emit('room:messages:initial', { roomId, token });
    } else {
      console.warn("Socket not connected, cannot emit 'room:messages:initial'.");
    }
  }, [socket]);

  const emitSendMessage = useCallback((roomName, text, replyTo, token) => {
    if (socket && socket.connected) {
    //   console.log("socket - send message: ", roomName, text);
      socket.emit('room:message:send', { roomName, text, replyTo, token });
    } else {
      console.warn("Socket not connected, cannot emit 'room:message:send'.");
    }
  }, [socket]);

  const emitLoadMoreMessages = useCallback((roomId, skip, token) => {
    if (socket && socket.connected) {
    //   console.log("socket - emit load more messages room: ", roomId);
      socket.emit('room:messages:loadMore', { roomId, skip, token });
    } else {
      console.warn("Socket not connected, cannot emit 'room:messages:loadMore'.");
    }
  }, [socket]);

  return {
    emitCheckRoom,
    emitJoinRoom,
    emitInitialMessages,
    emitSendMessage,
    emitLoadMoreMessages
  };
};

const useRoomSockets5 = (dispatch, authDispatch) => {
    const socket = useContext(SocketContext);

    // --- Emitting Functions (remain as useCallback with 'socket' as dependency) ---
    const emitCheckRoom = useCallback((roomName, token) => {
        if (socket) {
            console.log("CLIENT EMIT: room:search", roomName);
            socket.emit('room:search', { roomName, token });
        } else {
            console.warn("Socket not connected, cannot emit 'room:search'.");
        }
    }, [socket]);

    const emitJoinRoom = useCallback((roomName, token, password = "") => {
        if (socket) {
            console.log("CLIENT EMIT: room:join", roomName);
            socket.emit('room:join', { roomName, token, password });
        } else {
            console.warn("Socket not connected, cannot emit 'room:join'.");
        }
    }, [socket]);

    const emitInitialMessages = useCallback((roomId, token) => {
        if (socket) {
            console.log("CLIENT EMIT: room:messages:initial", roomId);
            socket.emit('room:messages:initial', { roomId, token });
        } else {
            console.warn("Socket not connected, cannot emit 'room:messages:initial'.");
        }
    }, [socket]);

    const emitSendMessage = useCallback((roomName, text, replyTo, token) => {
        if (socket) {
            console.log("CLIENT EMIT: room:message:send", roomName, text);
            socket.emit('room:message:send', { roomName, text, replyTo, token });
        } else {
            console.warn("Socket not connected, cannot emit 'room:message:send'.");
        }
    }, [socket]);

    const emitLoadMoreMessages = useCallback((roomId, skip, token) => {
        if (socket) {
            console.log("CLIENT EMIT: room:messages:loadMore", roomId, skip);
            socket.emit('room:messages:loadMore', { roomId, skip, token });
        } else {
            console.warn("Socket not connected, cannot emit 'room:messages:loadMore'.");
        }
    }, [socket]);

    // --- Listener Setup and Cleanup (The ONLY place where socket.on and socket.off are called) ---
    useEffect(() => {
        // Condition: Only set up listeners if socket is available and connected
        // (socket.connected will be true after the 'connect' event fires, which the SocketProvider now ensures)
        if (!socket || !socket.connected) {
            console.warn("useRoomSockets useEffect: Socket not connected yet, skipping listener setup.");
            return;
        }

        console.log("useRoomSockets useEffect: Setting up ALL room socket listeners for socket ID:", socket.id);

        // Define ALL event handlers *inside* this useEffect.
        // This ensures they are stable and correctly referenced by `socket.off`.
        const handleRoomSearched = (result) => {
            console.log("CLIENT RECEIVE (from listener): room:searched", result);
            if (!result.isError) {
                dispatch({ type: 'SET_TEMP_ROOM', payload: { room: result.data.room } });
            } else {
                dispatch({ type: 'ROOM_ERROR', payload: result.message });
            }
        };

        const handleRoomJoined = (result) => {
            console.log("CLIENT RECEIVE (from listener): room:joined", result);
            if (!result.isError) {
                dispatch({ type: 'SWAP_TEMP_ROOM', payload: { room: result.data.room } });
                emitInitialMessages(result.data.room._id, ""); // This is fine as emitInitialMessages is a stable useCallback
            } else {
                dispatch({ type: 'ROOM_ERROR', payload: result.message });
            }
        };

        const handleInitialMessages = (result) => {
            console.log("CLIENT RECEIVE (from listener): room:messages:initial", result);
            if (!result.isError) {
                dispatch({ type: 'ADD_MESSAGES', payload: { roomId: result.data.room._id, messages: result.data.messages, prepend: false } });
            } else {
                dispatch({ type: 'ROOM_ERROR', payload: result.message });
            }
        };

        const handleNewMessage = (messages) => {
            console.log("CLIENT RECEIVE (from listener): room:message:new", messages);
            if (messages.length > 0 && messages[0].roomId) {
                dispatch({ type: 'ADD_MESSAGES', payload: { roomId: messages[0].roomId, messages: messages, prepend: false } });
            }
        };

        const handleLoadedMoreMessages = (result) => {
            console.log("CLIENT RECEIVE (from listener): room:messages:loadedMore", result);
            if (!result.isError) {
                dispatch({ type: 'ADD_MESSAGES', payload: { roomId: result.data.room._id, messages: result.data.messages, prepend: true } });
            } else {
                dispatch({ type: 'ROOM_ERROR', payload: result.message });
            }
        };

        const handleRoomError = (error) => {
            console.error("CLIENT RECEIVE (from listener): room:error", error.message);
            dispatch({ type: 'ROOM_ERROR', payload: error.message });
        };

        // Attach listeners
        socket.on('room:searched', handleRoomSearched);
        socket.on('room:joined', handleRoomJoined);
        socket.on('room:messages:initial', handleInitialMessages);
        socket.on('room:message:new', handleNewMessage);
        socket.on('room:messages:loadedMore', handleLoadedMoreMessages);
        socket.on('room:error', handleRoomError);

        // Cleanup function for useEffect
        return () => {
            console.log("useRoomSockets useEffect: Cleaning up ALL room socket listeners for socket ID:", socket.id);
            socket.off('room:searched', handleRoomSearched);
            socket.off('room:joined', handleRoomJoined);
            socket.off('room:messages:initial', handleInitialMessages);
            socket.off('room:message:new', handleNewMessage);
            socket.off('room:messages:loadedMore', handleLoadedMoreMessages);
            socket.off('room:error', handleRoomError);
        };

        // Dependencies:
        // `socket`: This is the primary trigger for re-running the effect.
        // `dispatch`: From useReducer, should be stable.
        // `authDispatch`: From AuthContext, should be stable.
        // `emitInitialMessages`: A useCallback, stable if its dependencies are stable.
    }, [socket, dispatch, authDispatch, emitInitialMessages]);

    return {
        emitCheckRoom,
        emitJoinRoom,
        emitInitialMessages,
        emitSendMessage,
        emitLoadMoreMessages
    };
};

const useRoomSockets4 = (dispatch, authDispatch) => {
    const socket = useContext(SocketContext);

    // --- Emitting Functions ---
    // These are fine as they were, they just need the 'socket' in their dependency array.
    const emitCheckRoom = useCallback((roomName, token) => {
        if (socket) {
            console.log("CLIENT EMIT: room:search", roomName);
            socket.emit('room:search', { roomName, token });
        } else {
            console.warn("Socket not connected, cannot emit 'room:search'.");
        }
    }, [socket]);

    const emitJoinRoom = useCallback((roomName, token, password = "") => {
        if (socket) {
            console.log("CLIENT EMIT: room:join", roomName);
            socket.emit('room:join', { roomName, token, password });
        } else {
            console.warn("Socket not connected, cannot emit 'room:join'.");
        }
    }, [socket]);

    const emitInitialMessages = useCallback((roomId, token) => {
        if (socket) {
            console.log("CLIENT EMIT: room:messages:initial", roomId);
            socket.emit('room:messages:initial', { roomId, token });
        } else {
            console.warn("Socket not connected, cannot emit 'room:messages:initial'.");
        }
    }, [socket]);

    const emitSendMessage = useCallback((roomName, text, replyTo, token) => {
        if (socket) {
            console.log("CLIENT EMIT: room:message:send", roomName, text);
            socket.emit('room:message:send', { roomName, text, replyTo, token });
        } else {
            console.warn("Socket not connected, cannot emit 'room:message:send'.");
        }
    }, [socket]);

    const emitLoadMoreMessages = useCallback((roomId, skip, token) => {
        if (socket) {
            console.log("CLIENT EMIT: room:messages:loadMore", roomId, skip);
            socket.emit('room:messages:loadMore', { roomId, skip, token });
        } else {
            console.warn("Socket not connected, cannot emit 'room:messages:loadMore'.");
        }
    }, [socket]);

    // --- Listener Setup and Cleanup ---
    // This is the CRITICAL part.
    useEffect(() => {
        if (!socket) {
            console.warn("useRoomSockets: Socket is null, listeners not set up.");
            return; // Don't proceed if socket isn't available yet
        }

        console.log("useRoomSockets: Setting up ALL room socket listeners for socket ID:", socket.id);

        // Define event handlers directly inside useEffect or as stable Callbacks.
        // By defining them here, they will be recreated *only* when the useEffect re-runs
        // (i.e., when a dependency changes, ideally just 'socket' or dispatch if it were unstable).
        // This ensures the `off` method gets the correct function reference.

        const handleRoomSearched = (result) => {
            console.log("CLIENT RECEIVE: room:searched", result);
            if (!result.isError) {
                dispatch({ type: 'SET_TEMP_ROOM', payload: { room: result.data.room } });
            } else {
                dispatch({ type: 'ROOM_ERROR', payload: result.message });
            }
        };

        const handleRoomJoined = (result) => {
            console.log("CLIENT RECEIVE: room:joined", result);
            if (!result.isError) {
                dispatch({ type: 'SWAP_TEMP_ROOM', payload: { room: result.data.room } });
                // Calling an emit function here is fine because emitInitialMessages is a useCallback
                // and its dependency (socket) is stable within this useEffect's scope.
                emitInitialMessages(result.data.room._id, "");
            } else {
                dispatch({ type: 'ROOM_ERROR', payload: result.message });
            }
        };

        const handleInitialMessages = (result) => {
            console.log("CLIENT RECEIVE: room:messages:initial", result);
            if (!result.isError) {
                dispatch({ type: 'ADD_MESSAGES', payload: { roomId: result.data.room._id, messages: result.data.messages, prepend: false } });
            } else {
                dispatch({ type: 'ROOM_ERROR', payload: result.message });
            }
        };

        const handleNewMessage = (messages) => {
            console.log("CLIENT RECEIVE: room:message:new", messages);
            if (messages.length > 0 && messages[0].roomId) {
                dispatch({ type: 'ADD_MESSAGES', payload: { roomId: messages[0].roomId, messages: messages, prepend: false } });
            }
        };

        const handleLoadedMoreMessages = (result) => {
            console.log("CLIENT RECEIVE: room:messages:loadedMore", result);
            if (!result.isError) {
                dispatch({ type: 'ADD_MESSAGES', payload: { roomId: result.data.room._id, messages: result.data.messages, prepend: true } });
            } else {
                dispatch({ type: 'ROOM_ERROR', payload: result.message });
            }
        };

        const handleRoomError = (error) => {
            console.error("CLIENT RECEIVE: room:error", error.message);
            dispatch({ type: 'ROOM_ERROR', payload: error.message });
        };


        // Attach listeners
        socket.on('room:searched', handleRoomSearched);
        socket.on('room:joined', handleRoomJoined);
        socket.on('room:messages:initial', handleInitialMessages);
        socket.on('room:message:new', handleNewMessage);
        socket.on('room:messages:loadedMore', handleLoadedMoreMessages);
        socket.on('room:error', handleRoomError);


        // Define the cleanup function. This runs when the component unmounts
        // OR when any dependency in the array below changes (causing a re-run of the effect).
        return () => {
            console.log("useRoomSockets: Cleaning up ALL room socket listeners for socket ID:", socket.id);
            socket.off('room:searched', handleRoomSearched);
            socket.off('room:joined', handleRoomJoined);
            socket.off('room:messages:initial', handleInitialMessages);
            socket.off('room:message:new', handleNewMessage);
            socket.off('room:messages:loadedMore', handleLoadedMoreMessages);
            socket.off('room:error', handleRoomError);
        };

        // Dependencies:
        // - `socket`: If the socket instance changes, re-attach listeners to the new socket.
        // - `dispatch`: `useReducer`'s dispatch is guaranteed to be stable.
        // - `authDispatch`: (from AuthContext) This *should* also be stable if it's `useReducer`'s dispatch.
        // - `emitInitialMessages`: This is a useCallback and needs to be stable. It is stable if its dependency (socket) is stable.
        // All other handler functions are defined *inside* this useEffect, so they don't need to be dependencies themselves.
    }, [socket, dispatch, authDispatch, emitInitialMessages]);

    return {
        emitCheckRoom,
        emitJoinRoom,
        emitInitialMessages,
        emitSendMessage,
        emitLoadMoreMessages
    };
};

const useRoomSockets3 = (dispatch, authDispatch) => { // authDispatch is likely AuthContext.dispatch, which is stable
    const socket = useContext(SocketContext);

    // Emitting functions (stable if socket is stable)
    const emitCheckRoom = useCallback((roomName, token) => {
        if (socket) {
            console.log("socket - emit search/create/get room: ", roomName);
            socket.emit('room:search', { roomName, token });
        } else {
            console.warn("Socket not connected, cannot emit 'room:search'.");
        }
    }, [socket]); // Dependency: socket

    const emitJoinRoom = useCallback((roomName, token, password = "") => {
        if (socket) {
            console.log("socket - emit join room: ", roomName);
            socket.emit('room:join', { roomName, token, password });
        } else {
            console.warn("Socket not connected, cannot emit 'room:join'.");
        }
    }, [socket]); // Dependency: socket

    const emitInitialMessages = useCallback((roomId, token) => {
        if (socket) {
            console.log("socket - emit initial messages room: ", roomId);
            socket.emit('room:messages:initial', { roomId, token });
        } else {
            console.warn("Socket not connected, cannot emit 'room:messages:initial'.");
        }
    }, [socket]); // Dependency: socket

    const emitSendMessage = useCallback((roomName, text, replyTo, token) => {
        if (socket) {
            console.log("socket - send message: ", roomName, " , ", text);
            socket.emit('room:message:send', { roomName, text, replyTo, token });
        } else {
            console.warn("Socket not connected, cannot emit 'room:message:send'.");
        }
    }, [socket]); // Dependency: socket

    const emitLoadMoreMessages = useCallback((roomId, skip, token) => {
        if (socket) {
            console.log("socket - emit load more messages room: ", roomId);
            socket.emit('room:messages:loadMore', { roomId, skip, token });
        } else {
            console.warn("Socket not connected, cannot emit 'room:messages:loadMore'.");
        }
    }, [socket]); // Dependency: socket

    // Listener setup using a single useEffect
    useEffect(() => {
        if (!socket) {
            console.warn("Socket not connected, skipping listener setup.");
            return;
        }

        // Define the handler functions *inside* useEffect
        // They capture the current `dispatch` and `emitInitialMessages` directly.
        const handleRoomSearched = (result) => {
            if (!result.isError) {
                console.log("socket - received room:searched: ", result.data.room);
                dispatch({ type: 'SET_TEMP_ROOM', payload: { room: result.data.room } });
            } else {
                dispatch({ type: 'ROOM_ERROR', payload: result.message });
            }
        };

        const handleRoomJoined = (result) => {
            if (!result.isError) {
                console.log("socket - received room:joined: ", result.data.room);
                dispatch({ type: 'SWAP_TEMP_ROOM', payload: { room: result.data.room } });
                emitInitialMessages(result.data.room._id, ""); // This is safe because emitInitialMessages is a stable useCallback
            } else {
                dispatch({ type: 'ROOM_ERROR', payload: result.message });
            }
        };

        const handleInitialMessages = (result) => {
            if (!result.isError) {
                console.log("socket - received initial message: ", result.data.messages);
                dispatch({ type: 'ADD_MESSAGES', payload: { roomId: result.data.room._id, messages: result.data.messages, prepend: false } });
            } else {
                dispatch({ type: 'ROOM_ERROR', payload: result.message });
            }
        };

        const handleNewMessage = (messages) => {
            console.log("socket - received new message: ", messages[0]?.roomId, " , ", messages);
            if (messages.length > 0 && messages[0].roomId) {
                dispatch({ type: 'ADD_MESSAGES', payload: { roomId: messages[0].roomId, messages: messages, prepend: false } });
            }
        };

        const handleLoadedMoreMessages = (result) => {
            if (!result.isError) {
                console.log("socket - received loaded more messages: ", result.data.messages);
                dispatch({ type: 'ADD_MESSAGES', payload: { roomId: result.data.room._id, messages: result.data.messages, prepend: true } });
            } else {
                dispatch({ type: 'ROOM_ERROR', payload: result.message });
            }
        };

        const handleRoomError = (error) => {
            console.error("Room Socket Error:", error.message);
            dispatch({ type: 'ROOM_ERROR', payload: error.message });
        };


        // Attach listeners
        socket.on('room:searched', handleRoomSearched);
        socket.on('room:joined', handleRoomJoined);
        socket.on('room:messages:initial', handleInitialMessages);
        socket.on('room:message:new', handleNewMessage);
        socket.on('room:messages:loadedMore', handleLoadedMoreMessages);
        socket.on('room:error', handleRoomError);

        // Cleanup function for useEffect
        return () => {
            console.log("Cleaning up room socket listeners for socket:", socket.id);
            socket.off('room:searched', handleRoomSearched);
            socket.off('room:joined', handleRoomJoined);
            socket.off('room:messages:initial', handleInitialMessages);
            socket.off('room:message:new', handleNewMessage);
            socket.off('room:messages:loadedMore', handleLoadedMoreMessages);
            socket.off('room:error', handleRoomError);
        };
    }, [socket, dispatch, authDispatch, emitInitialMessages]); // Dependencies for useEffect.
    // dispatch and authDispatch from useReducer are stable.
    // emitInitialMessages is a useCallback, stable if its dependency (socket) is stable.

    return {
        emitCheckRoom,
        emitJoinRoom,
        emitInitialMessages,
        emitSendMessage,
        emitLoadMoreMessages
    };
};

const useRoomSockets2 = (dispatch, authDispatch) => {
    const socket = useContext(SocketContext);

    // Emits (unchanged)
    const emitCheckRoom = useCallback((roomName, token) => {
        if (socket) {
            console.log("socket - emit search/create/get room:", roomName);
            socket.emit('room:search', { roomName, token });
        }
    }, [socket]);

    const emitJoinRoom = useCallback((roomName, token, password = "") => {
        if (socket) {
            console.log("socket - emit join room:", roomName);
            socket.emit('room:join', { roomName, token, password });
        }
    }, [socket]);

    const emitInitialMessages = useCallback((roomId, token) => {
        if (socket) {
            console.log("socket - emit initial messages room:", roomId);
            socket.emit('room:messages:initial', { roomId, token });
        }
    }, [socket]);

    const emitSendMessage = useCallback((roomName, text, replyTo, token) => {
        if (socket) {
            console.log("socket - send message:", roomName, text);
            socket.emit('room:message:send', { roomName, text, replyTo, token });
        }
    }, [socket]);

    const emitLoadMoreMessages = useCallback((roomId, skip, token) => {
        if (socket) {
            console.log("socket - emit load more messages room:", roomId);
            socket.emit('room:messages:loadMore', { roomId, skip, token });
        }
    }, [socket]);

    // Handlers (STABLE)
    const handleRoomSearched = useCallback((result) => {
        if (!result.isError) {
            console.log("socket - got search/create/get room:", result.data.room);
            dispatch({ type: 'SET_TEMP_ROOM', payload: { room: result.data.room } });
        } else {
            dispatch({ type: 'ROOM_ERROR', payload: result.message });
        }
    }, [dispatch]);

    const handleRoomJoined = useCallback((result) => {
        if (!result.isError) {
            console.log("socket - joined room:", result.data.room);
            dispatch({ type: 'SWAP_TEMP_ROOM', payload: { room: result.data.room } });
            emitInitialMessages(result.data.room._id, "");
        } else {
            dispatch({ type: 'ROOM_ERROR', payload: result.message });
        }
    }, [dispatch, emitInitialMessages]);

    const handleInitialMessages = useCallback((result) => {
        if (!result.isError) {
            console.log("socket - got initial messages:", result.data.messages);
            dispatch({
                type: 'ADD_MESSAGES',
                payload: { roomId: result.data.room._id, messages: result.data.messages, prepend: false }
            });
        } else {
            dispatch({ type: 'ROOM_ERROR', payload: result.message });
        }
    }, [dispatch]);

    const handleNewMessage = useCallback((messages) => {
        if (messages.length) {
            console.log("socket - got new message:", messages[0].roomId, messages);
            dispatch({
                type: 'ADD_MESSAGES',
                payload: { roomId: messages[0].roomId, messages, prepend: false }
            });
        }
    }, [dispatch]);

    const handleLoadedMoreMessages = useCallback((result) => {
        if (!result.isError) {
            console.log("socket - loaded more messages:", result.data.messages);
            dispatch({
                type: 'ADD_MESSAGES',
                payload: { roomId: result.data.room._id, messages: result.data.messages, prepend: true }
            });
        } else {
            dispatch({ type: 'ROOM_ERROR', payload: result.message });
        }
    }, [dispatch]);

    const handleRoomError = useCallback((error) => {
        console.error("Room Socket Error:", error.message);
        dispatch({ type: 'ROOM_ERROR', payload: error.message });
    }, [dispatch]);

    // Attach Listeners with Cleanup
    useEffect(() => {
        if (!socket) return;

        socket.on('room:searched', handleRoomSearched);
        return () => socket.off('room:searched', handleRoomSearched);
    }, [socket, handleRoomSearched]);

    useEffect(() => {
        if (!socket) return;

        socket.on('room:joined', handleRoomJoined);
        return () => socket.off('room:joined', handleRoomJoined);
    }, [socket, handleRoomJoined]);

    useEffect(() => {
        if (!socket) return;

        socket.on('room:messages:initial', handleInitialMessages);
        return () => socket.off('room:messages:initial', handleInitialMessages);
    }, [socket, handleInitialMessages]);

    useEffect(() => {
        if (!socket) return;

        socket.on('room:message:new', handleNewMessage);
        return () => socket.off('room:message:new', handleNewMessage);
    }, [socket, handleNewMessage]);

    useEffect(() => {
        if (!socket) return;

        socket.on('room:messages:loadedMore', handleLoadedMoreMessages);
        return () => socket.off('room:messages:loadedMore', handleLoadedMoreMessages);
    }, [socket, handleLoadedMoreMessages]);

    useEffect(() => {
        if (!socket) return;

        socket.on('room:error', handleRoomError);
        return () => socket.off('room:error', handleRoomError);
    }, [socket, handleRoomError]);

    return {
        emitCheckRoom,
        emitJoinRoom,
        emitInitialMessages,
        emitSendMessage,
        emitLoadMoreMessages
    };
};

const useRoomSockets = (dispatch, authDispatch) => {
    const socket = useContext(SocketContext);
  const hasListeners = useRef(false);

    const emitCheckRoom = useCallback((roomName, token) => {
        if (socket) {
            console.log("socket - emit search/create/get room: ", roomName)
            socket.emit('room:search', { roomName, token });
        } else {
            console.warn("Socket not connected, cannot emit 'room:search'.");
        }
    }, [socket]);

    const onRoomSearched = useCallback(() => {
        if (socket) {
            socket.on('room:searched', (result) => {
                if (!result.isError) {
                    console.log("socket - got search/create/get room: ", result.data.room)
                    dispatch({ type: 'SET_TEMP_ROOM', payload: { room: result.data.room } });
                } else {
                    dispatch({ type: 'ROOM_ERROR', payload: result.message });
                }
            });
        }
    }, [socket, dispatch]);

    const emitJoinRoom = useCallback((roomName, token, password = "") => {
        if (socket) {
            console.log("socket - emit join room: ", roomName)
            socket.emit('room:join', { roomName, token, password });
        } else {
            console.warn("Socket not connected, cannot emit 'room:join'.");
        }
    }, [socket]);

    const onRoomJoined = useCallback(() => {
        if (socket) {
            socket.on('room:joined', (result) => {
                if (!result.isError) {
                    console.log("socket - joined room: ", result.data.room)
                    dispatch({ type: 'SWAP_TEMP_ROOM', payload: { room: result.data.room } });
                    emitInitialMessages(result.data.room._id, "");
                } else {
                    dispatch({ type: 'ROOM_ERROR', payload: result.message });
                }
            });
        }
    }, [socket, dispatch, authDispatch]);

    const emitInitialMessages = useCallback((roomId, token) => {
        if (socket) {
            console.log("socket - emit inital messages room: ", roomId)
            socket.emit('room:messages:initial', { roomId, token });
        } else {
            console.warn("Socket not connected, cannot emit 'room:messages:initial'.");
        }
    }, [socket]);

    const onInitialMessages = useCallback(() => {
        if (socket) {
            socket.on('room:messages:initial', (result) => {
                if (!result.isError) {
                    console.log("socket - got initial message: ", result.data.messages)
                    dispatch({ type: 'ADD_MESSAGES', payload: { roomId: result.data.room._id, messages: result.data.messages, prepend: false } });
                } else {
                    dispatch({ type: 'ROOM_ERROR', payload: result.message });
                }
            });
        }
    }, [socket, dispatch]);

    const emitSendMessage = useCallback((roomName, text, replyTo, token) => {
        if (socket) {
            console.log("socket - send message: ", roomName, " , ", text);
            socket.emit('room:message:send', { roomName, text, replyTo, token });
        } else {
            console.warn("Socket not connected, cannot emit 'room:message:send'.");
        }
    }, [socket]);

    const onNewMessage = useCallback(() => {
        if (socket) {
            socket.on('room:message:new', (messages) => {
                console.log("socket - got new message: ", messages[0].roomId, " , ", messages);
                dispatch({ type: 'ADD_MESSAGES', payload: { roomId: messages[0].roomId, messages: messages, prepend: false } });
            });
        }
    }, [socket, dispatch]);

    const emitLoadMoreMessages = useCallback((roomId, skip, token) => {
        if (socket) {
            console.log("socket - emit load more messages room: ", roomId)
            socket.emit('room:messages:loadMore', { roomId, skip, token });
        } else {
            console.warn("Socket not connected, cannot emit 'room:messages:loadMore'.");
        }
    }, [socket]);

    const onLoadedMoreMessages = useCallback(() => {
        if (socket) {
            socket.on('room:messages:loadedMore', (result) => {
                if (!result.isError) {
                    console.log("socket - loaded more messages room: ", result.data.messages)
                    dispatch({ type: 'ADD_MESSAGES', payload: { roomId: result.data.room._id, messages: result.data.messages, prepend: true } });
                } else {
                    dispatch({ type: 'ROOM_ERROR', payload: result.message });
                }
            });
        }
    }, [socket, dispatch]);

    const setupRoomSocketListeners = useCallback(() => {
        onRoomSearched();
        onRoomJoined();
        onInitialMessages();
        onNewMessage();
        onLoadedMoreMessages();

        if (socket) {
            socket.on('room:error', (error) => {
                console.error("Room Socket Error:", error.message);
                dispatch({ type: 'ROOM_ERROR', payload: error.message });
            });
        }
    }, [socket, onRoomSearched, onRoomJoined, onInitialMessages, onNewMessage, onLoadedMoreMessages, dispatch]);

    useEffect(() => {
        if (socket && !hasListeners.current) {
      setupRoomSocketListeners();
      hasListeners.current = true;
    }

        return () => {
            if (socket) {
                socket.off('room:searched');
                socket.off('room:joined');
                socket.off('room:messages:initial');
                socket.off('room:message:new');
                socket.off('room:messages:loadedMore');
                socket.off('room:error');
            }
        };
    }, [socket, setupRoomSocketListeners]);

    return {
        emitCheckRoom,
        emitJoinRoom,
        emitInitialMessages,
        emitSendMessage,
        emitLoadMoreMessages
    };
};

export default useRoomSockets6;