import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import socketIO from "socket.io-client";


import './App.css';
import Adda from './components/adda';
import Storage from './components/storage';
import Incognito from './components/incognito';
import { AuthContextProvider } from './context/auth-context';

const socket = socketIO.connect("http://localhost:5000");

function App() { 

  return (
    <div className="App" >
      <AuthContextProvider> 
        <Routes>
          <Route path="/ayo/adda/:addaId" element={ <Adda socket={socket}/> } />
          <Route path="/ayo/storage/:storageId" element={ <Storage socket={socket}/> } />
          <Route path="/ayo/ign/:query" element={ <Incognito /> } />
        </Routes>
      </AuthContextProvider>
    </div>
  );
}

export default App;
