import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';


import './index.css';
import App from './App';
import { AuthContextProvider } from './context/auth-context';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter >
    <AuthContextProvider>
      {/* <React.StrictMode> */}
        <App />
      {/* </React.StrictMode> */}
    </AuthContextProvider>
    </BrowserRouter>
);


// react-router-dom
// styled-components
