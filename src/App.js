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
import useRoomSockets6 from './sockets/roomSockets';
import { EditorContext } from './context/EditorContext';
import useEditorSockets from './sockets/editorSockets';
import { FileContext } from './context/FileContext';
import useFileSockets from './sockets/fileSockets';
import { CallContext } from './context/CallContext';
import useCallSockets from './sockets/callSockets';


function App() {
  const { state, dispatch } = useContext(AuthContext);
  const { state: roomState, dispatch: roomDispatch } = useContext(RoomContext);
  const { state: editorState, dispatch: editorDispatch } = useContext(EditorContext);
  const { state: fileState, dispatch: fileDispatch } = useContext(FileContext);
  const { state: callState, dispatch: callDispatch } = useContext(CallContext);

  const { emitJoinRoom } = useRoomSockets6(roomDispatch, dispatch);
  const { emitJoinEditor } = useEditorSockets(editorDispatch, dispatch);
  const { emitJoinFile } = useFileSockets(fileDispatch, dispatch);
  const { emitJoinCall } = useCallSockets(callDispatch, dispatch);

  const socket = useContext(SocketContext);

  useEffect(() => {
    // Listen for 'authenticated' event (response to initial 'authenticate')
    if (socket) {
      socket.on("connected", async () => {
        if (!state.token || !state.user) {
          socket.emit('authenticate', { token: localStorage.getItem('authToken') || null });
        }
      })

      socket.on('authenticated', async (data) => {
        if (data && data.token) {
          dispatch({ type: 'SET_TOKEN', payload: data.token });
          var { isError, message, data, token } = await authApi.getUser(data.token);
          if (!isError) {
            var { user, rooms, editors, files, calls } = data;

            if (user.type == "Immigrant") {
              dispatch({ type: "SET_IMMIGRANT", payload: user })
            }
            else {
              dispatch({ type: "SET_USER", payload: user });
            }

            roomDispatch({ type: "SET_ROOMS", payload: rooms });
            editorDispatch({ type: "SET_EDITORS", payload: editors });
            fileDispatch({type: "SET_FILES", payload: files});
            callDispatch({type: "SET_CALLS", payload: calls});

            for (const key in rooms) {
              if (rooms.hasOwnProperty(key)) {
                emitJoinRoom(rooms[key].name, data.token, "Initial");
              }
            }
            for (const key in editors) {
              if (editors.hasOwnProperty(key)) {
                emitJoinEditor(editors[key].name, data.token, "Initial");
              }
            }
            for (const key in files) {
              if (files.hasOwnProperty(key)) {
                emitJoinFile(files[key].name, data.token, "Initial");
              }
            }
            for(const key in calls) {
              if(calls.hasOwnProperty(key)) {
                emitJoinCall(calls[key].name, data.token, "Initial");
              }
            }

          }
        }
      });

      // Listen for 're-authenticated' event (response to re-authenticate after login)
      socket.on('re-authenticated', async (data) => {
        if (data && data.token) {
          dispatch({ type: 'SET_TOKEN', payload: data.token });
          var { isError, message, data, token } = await authApi.getUser(data.token);
          if (!isError) {
            var { user, rooms, editors, files, calls } = data;

            if (user.type == "IMMIGRANT") dispatch({ type: "SET_IMMIGRANT", payload: user })
            else dispatch({ type: "SET_USER", payload: user });

            roomDispatch({ type: "SET_ROOMS", payload: rooms });
            editorDispatch({ type: "SET_EDITORS", payload: editors });
            fileDispatch({type: "SET_FILES", payload: files});
            callDispatch({type: "SET_CALLS", payload: calls});

            for (const key in rooms) {
              if (rooms.hasOwnProperty(key)) {
                emitJoinRoom(rooms[key].name, data.token, "Initial");
              }
            }
            for (const key in editors) {
              if (editors.hasOwnProperty(key)) {
                emitJoinEditor(editors[key].name, data.token, "Initial");
              }
            }
            for (const key in files) {
              if (files.hasOwnProperty(key)) {
                emitJoinFile(files[key].name, data.token, "Initial");
              }
            }
            for(const key in calls) {
              if(calls.hasOwnProperty(key)) {
                emitJoinCall(calls[key].name, data.token, "Initial");
              }
            }

          }
        }
      });

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

export default App;
