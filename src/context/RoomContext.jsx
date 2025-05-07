// src/context/RoomContext.js
import { createContext, useReducer } from 'react';

export const RoomContext = createContext();

const initialState = {
  rooms: {},
  error: null,
};

const userReducer = (state, action) => {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, rooms: {}, error: null };
    case 'INIT_ROOMS':
        return {
            ...state,
            rooms: {
              ...state.rooms,
              ...action.rooms.reduce((acc, key) => ({ ...acc, ...(state.rooms[key] ? {} : { [key]: {} }) }), {}),
            },
          };
    case 'SET_ROOM':
      return { ...state, rooms: {...rooms, [action.roomName]: action.room} };
    case 'SET_MESSAGES': 
      return { ...state, rooms: {...rooms, [action.roomName]: {
        ...state.rooms[action.roomName],
        [action.messages]: [
            ...state.rooms[action.roomName].messages,
            action.message
        ]
      }}}
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const RoomProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  return (
    <RoomContext.Provider value={{ state, dispatch }}>
      {children}
    </RoomContext.Provider>
  );
};
