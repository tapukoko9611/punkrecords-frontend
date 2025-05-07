// src/context/UserContext.js
import { createContext, useReducer } from 'react';

export const UserContext = createContext();

const initialState = {
  user: null,
  userToken: null,
  loading: false,
  error: null,
};

const userReducer = (state, action) => {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_USER':
      return { ...state, user: action.user, userToken: action.userToken, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, userToken: null };
    default:
      return state;
  }
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};
