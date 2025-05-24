import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-center items-center px-4">

      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-center leading-tight">
        Punk Records
      </h1>

      <div className="absolute bottom-6 left-0 w-full px-4 sm:px-6 md:px-12">
        <div className="flex flex-col sm:flex-row justify-between items-center max-w-5xl mx-auto gap-4">
          <button onClick={() => {
            navigate(`/room/`, { replace: true });
          }} className="w-full sm:w-1/4 px-6 py-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:scale-105 hover:brightness-110 active:scale-95 transition-all duration-200">
            Room
          </button>
          <button onClick={() => {
            navigate(`/file/`, { replace: true });
          }} className="w-full sm:w-1/4 px-6 py-3 rounded-lg bg-gradient-to-br from-green-400 to-lime-500 text-white font-semibold shadow-lg hover:scale-105 hover:brightness-110 active:scale-95 transition-all duration-200">
            File
          </button>
          <button onClick={() => {
            navigate(`/editor/`, { replace: true });
          }} className="w-full sm:w-1/4 px-6 py-3 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 text-white font-semibold shadow-lg hover:scale-105 hover:brightness-110 active:scale-95 transition-all duration-200">
            Editor
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
