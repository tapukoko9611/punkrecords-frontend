import { Route, Routes } from 'react-router-dom';
import { useState } from 'react';


import './App.css';
import Home1 from "./components/Trail1";
import Home2 from './components/Trail2';
import Home3 from './components/Trail3';
import Home4 from './components/Trail4';
import AuthContext from './actions/auth_context';



function App() {

  const [ auth, setAuth ] = useState({ status: false, user: null });
  const login = (status, user) => {
    setAuth(prevState => ({
      status: !prevState.status,
      user: prevState.user? "": user
    }));
  }

  return (
    <div className="App">
      <AuthContext.Provider value={{ status: auth, login: login }}>
        <Routes>
          <Route path="/1" element={ <Home1/> } exact/>
          <Route path="/2" element={ <Home2/> } exact/>
          <Route path="/3" element={ <Home3/> } exact/>
          <Route path="/4" element={ <Home4/> } exact/>
        </Routes>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
