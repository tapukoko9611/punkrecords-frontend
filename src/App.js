import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


import './App.css';
import RoomLayout from './modules/room/RoomPage';
import EditorLayout from './modules/editor/EditorPage';
import HomePage from './modules/home/HomePage';
import FileLayout from './modules/file/FilePage';
import CallLayout from './modules/call/CallPage';

function App() {


  return (
    <Router>
      {/* <div className="App" > */}
        <Routes>
          <Route path="/room/" element={<RoomLayout />} />
          <Route path="/editor/" element={<EditorLayout />} />
          <Route path="/file/" element={<FileLayout />} />
          <Route path="/call/" element={<CallLayout />} />
          <Route path="/" element={<HomePage />} exact />
        </Routes>
      {/* </div> */}
    </Router>
  );
}

export default App;
