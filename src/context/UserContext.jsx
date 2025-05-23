import React, { createContext, useReducer, useEffect, useCallback } from 'react';

const initialStateAuth = {
  isAuthenticated: false,
  user: null,
  token: null, 
  isLoading: false,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'SIGNUP_REQUEST':
    case 'REAUTHENTICATE_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      // console.log("reducer - login success")
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
      };
    case 'SIGNUP_SUCCESS':
      // console.log("reducer - signup success")
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
      };
    case 'REAUTHENTICATE_SUCCESS':
      // console.log("reducer - reAuth success")
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'SIGNUP_FAILURE':
    case 'REAUTHENTICATE_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false, user: null, token: null };
    case 'SET_USER': 
      // console.log("reducer - registered user set")
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'SET_IMMIGRANT': 
      // console.log("reducer - guest user set")
      return { ...state, user: action.payload, isAuthenticated: false };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case "LOGS":
      console.log(localStorage.getItem('authToken'));
      console.log(state.token);
      console.log(action.payload.token);
      console.log(state.user._id)
      return state;
    default:
      return state;
  }
};

const AuthContext = createContext({
  state: initialStateAuth,
  dispatch: () => { },
});

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialStateAuth);

  useEffect(() => {
      // console.log("user context - Updating token");
    const token = localStorage.getItem('authToken');
    if (token) {
      dispatch({ type: 'SET_TOKEN', payload: token });
    }
  }, []);

  useEffect(() => {
    if (state.token) {
      // console.log("user context - Saving token");
      localStorage.setItem('authToken', state.token);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [state.token]);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider }