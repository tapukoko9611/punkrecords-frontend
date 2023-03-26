import { Route, Routes } from 'react-router-dom';


import './App.css';
import Home1 from "./components/Trail1";
import Home2 from './components/Trail2';
import Home3 from './components/Trail3';
import Home5 from './components/Trail5';



function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/1" element={ <Home1/> } exact/>
        <Route path="/2" element={ <Home2/> } exact/>
        <Route path="/3" element={ <Home3/> } exact/>
        <Route path="/5" element={ <Home5/> } exact/>
      </Routes>
    </div>
  );
}

export default App;
