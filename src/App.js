import { useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import socketIO from "socket.io-client";


import './App.css';
import Adda from './components/adda';
import Storage from './components/storage';
import Incognito from './components/incognito';
import { AuthContextProvider } from './context/auth-context';
import Home from './components/home';

const socket = socketIO.connect("https://punkrecord-api.onrender.com");

function App() { 

  return (
    <div className="App" >
          <Routes>
            {/* <Route path="/" element={ <Incognito /> } exact /> */}
            {/* <Route path='/' element={ <Home /> } exact /> */}
            {/* <Route path="/" element={ <Adda socket={socket}/> } exact/> */}
            <Route path="ayo/adda/:addaId/" element={ <Adda socket={socket}/> } />
            <Route path="ayo/storage/:storageId/" element={ <Storage socket={socket}/> } />
            <Route path="ayo/ign/:query/" element={ <Incognito /> } />
            <Route path="/" element={ <Storage socket={socket}/> } exact />
          </Routes>
    </div>
  );
}

export default App;
