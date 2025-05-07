import React, { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import CompTopBar from '../TopBar/CompTopBar';

const RoomPanel = ({ activeRoom, toggleSidebar, sidebarOpen, room }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (room && room.isPrivate && !isPasswordCorrect) {
      setShowPasswordModal(true);
    } else {
      setShowPasswordModal(false);
    }
  }, [room, isPasswordCorrect]);

  const handlePasswordSubmit = () => {
    if (room && room.password === passwordInput) {
      setIsPasswordCorrect(true);
      setShowPasswordModal(false);
    } else {
      alert('Incorrect password!');
      setPasswordInput('');
    }
  };

  const handleBackdropClick = (event) => {
    if (modalRef.current && event.target === modalRef.current) {
      setShowPasswordModal(false);
    }
  };

  if (!room) {
    return <div className="flex-1 flex flex-col items-center justify-center text-gray-500">No room selected.</div>;
  }

  return (
    <div className="flex-1 flex flex-col relative">
      <CompTopBar compName={activeRoom} toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} comp={room} />
      <div className={`${showPasswordModal && room.isPrivate && !isPasswordCorrect ? 'blur-lg' : ''} flex-1 flex flex-col`}>
        {(!showPasswordModal || isPasswordCorrect) && (
          <>
            <MessageList room={room} />
            <MessageInput room={room} />
          </>
        )}
      </div>
      {showPasswordModal && room.isPrivate && (
        <div
          ref={modalRef}
          onClick={handleBackdropClick}
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
          <div className="bg-gray-800 p-8 rounded shadow-lg w-80">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">Enter Room Password</h2>
            <input
              type="password"
              className="w-full p-3 mb-4 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            <button
              className="w-full py-3 bg-blue-600 rounded-md text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={handlePasswordSubmit}
            >
              Enter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const RoomPanel1 = ({ activeRoom, toggleSidebar, sidebarOpen, room }) => {
  return (
    <div className="flex-1 flex flex-col">
      <CompTopBar compName={activeRoom} toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} comp={room} />
      {
        room && <>
          <MessageList room={room} />
          <MessageInput room={room} />
        </>
      }
    </div>
  );
};

export default RoomPanel;
