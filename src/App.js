import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React, { createContext, useState, useEffect, useContext, } from 'react';


import './App.css';
import RoomLayout from './modules/room/RoomPage';
import EditorLayout from './modules/editor/EditorPage';
import HomePage from './modules/home/HomePage';
import FileLayout from './modules/file/FilePage';
import CallLayout from './modules/call/CallPage';

import { AuthContext } from "./context/UserContext";
import { SocketContext } from "./context/SocketContext";
import authApi from "./api/userApi";
import { RoomContext } from './context/RoomContext';


import useAuthSockets from './sockets/T_TauthSockets';
import useRoomSockets6 from './sockets/roomSockets';
function App2() {
  // Use the new hook for auth-related socket logic
  useAuthSockets();

  return (
    <Router>
      <Routes>
        <Route path="/room/:id?" element={<RoomLayout />} />
        <Route path="/editor/:id?" element={<EditorLayout />} />
        <Route path="/file/:id?" element={<FileLayout />} />
        <Route path="/call/:id?" element={<CallLayout />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}


function App() {
  const { state, dispatch } = useContext(AuthContext);
  const { state: roomState, dispatch: roomDispatch } = useContext(RoomContext);
  const { emitCheckRoom, emitJoinRoom, emitInitialMessages } = useRoomSockets6(roomDispatch, dispatch);
  const socket = useContext(SocketContext);

  useEffect(() => {
    // Listen for 'authenticated' event (response to initial 'authenticate')
    if (socket) {
      socket.on("connected", async () => {
        if (!state.token || !state.user) {
          // console.log("socket - Asking for authenticate");
          socket.emit('authenticate', { token: localStorage.getItem('authToken') || null });
        }
      })

      socket.on('authenticated', async (data) => {
        if (data && data.token) {
          // console.log("socket - Authenticated: ", data.token)
          dispatch({ type: 'SET_TOKEN', payload: data.token });
          // console.log("socket - calling getUserAPI");
          var { isError, message, data, token } = await authApi.getUser(data.token);
          if (!isError) {
            // console.log("socket - got userDetails: ", data.user?._id);
            var { user, rooms, editors, files, calls } = data;
            if (user.type == "Immigrant") {
              dispatch({ type: "SET_IMMIGRANT", payload: user })
              roomDispatch({ type: "SET_ROOMS", payload: rooms });
            }
            else {
              // console.log("socket - setting user after authentication");
              dispatch({ type: "SET_USER", payload: user });
              roomDispatch({ type: "SET_ROOMS", payload: rooms });
            }

            for (const key in rooms) {
              if (rooms.hasOwnProperty(key)) {
              emitJoinRoom(rooms[key].name, data.token, "Initial");
              }
            }

            // dispatch({ type: "LOGS", payload: { user, token } })
          }
        }
      });

      // Listen for 're-authenticated' event (response to re-authenticate after login)
      socket.on('re-authenticated', async (data) => {
        if (data && data.token) {
          // console.log("socket - Re authenticated: ", data.token)
          dispatch({ type: 'SET_TOKEN', payload: data.token });
          // console.log("socket - calling getUserAPI");
          var { isError, message, data, token } = await authApi.getUser(data.token);
          if (!isError) {
            // console.log("socket - got userDetails: ", data.user?._id);
            var { user, rooms, editors, files, calls } = data;
            if (user.type == "IMMIGRANT") dispatch({ type: "SET_IMMIGRANT", payload: user })
            else {
              // console.log("socket - setting user after Re authentication");
              dispatch({ type: "SET_USER", payload: user });
              roomDispatch({ type: "SET_ROOMS", payload: rooms });
            }
            for (const key in rooms) {
              if (rooms.hasOwnProperty(key)) {
                console.log("sending");
              emitJoinRoom(rooms[key].name, data.token, "Initial");
              }
            }
          }
        }
      });

      // Clean up event listeners on unmount
      return () => {
        if (socket) {
          socket.off('authenticated');
          socket.off('re-authenticated');
        }
      };
    }
  }, [dispatch, state.token, socket]);


  return (
    <Router>
      {/* <div className="App" > */}
      <Routes>
        <Route path="/room/:id?" element={<RoomLayout />} /> {/* Optional :id */}
        <Route path="/editor/:id?" element={<EditorLayout />} /> {/* Optional :id */}
        <Route path="/file/:id?" element={<FileLayout />} /> {/* Optional :id */}
        <Route path="/call/:id?" element={<CallLayout />} /> {/* Optional :id */}
        <Route path="/" element={<HomePage />} /> {/* Your default landing page */}
      </Routes>
      {/* </div> */}
    </Router>
  );
}

export default App;
