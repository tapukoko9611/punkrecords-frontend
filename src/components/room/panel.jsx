import React, { useState, useEffect, useRef, useContext } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import CompTopBar from '../TopBar/CompTopBar';
import { RoomContext } from '../../context/RoomContext';
import { AuthContext } from '../../context/UserContext';
import useRoomSockets from '../../sockets/roomSockets';
import { FiPlus, FiX, FiHome } from 'react-icons/fi'; 
import roomApi from '../../api/roomApi';

const RoomPanel = ({
  tempComp,
  isTempCompActive,

  sidebarOpen,
  toggleSidebar,

  activeRoom,
  userId,

  showPasswordModal,
  isCurrentRoomAwaitingPassword,
  passwordInput,
  setPasswordInput,
  handlePasswordSubmit,
  closePasswordModal,
}) => {
  const { state: authState } = useContext(AuthContext);
  const { state: roomState, dispatch: roomDispatch } = useContext(RoomContext);
  const { emitSendMessage } = useRoomSockets(roomDispatch, authState.dispatch);

  const sendMessage = (text, replyTo) => {
    emitSendMessage(activeRoom?.room?.name, text, replyTo, authState.token);
  }

  const updateRoom = async (roomName, isPrivate, password) => {
    const result = await roomApi.updateRoom(roomName, isPrivate, password, authState.token);
    alert(result.isError+" , "+result.message);
  }

  return (
    <div className="flex-1 flex flex-col relative">
      <CompTopBar
        compName="room"
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        comp={activeRoom?.room}
        updateCompMetaData={(compName, isPrivate, password) => updateRoom(compName, isPrivate, password)}
      />

      {!activeRoom && !showPasswordModal && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">No room selected.</div>
      )}

      {isTempCompActive && <div className="flex-1 flex flex-col items-center justify-center text-gray-500">Loading...</div>}


      {activeRoom && !isTempCompActive && (
        <div className={`flex-1 flex flex-col ${showPasswordModal ? 'blur-lg' : ''}`}>
          {!showPasswordModal && (
            <>
              <MessageList room={activeRoom} userId={userId} className="flex-1 overflow-y-auto" />
              <MessageInput room={activeRoom} userId={userId} sendMessage={sendMessage} />
            </>
          )}
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-8 rounded shadow-lg w-80 relative">
            {/* X Button to close the modal */}
            <button
              onClick={() => {
                setPasswordInput('');
                closePasswordModal();
              }}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              aria-label="Close password modal"
            >
              <FiX className="text-xl" />
            </button>

            <h2 className="text-xl font-semibold text-gray-300 mb-4">
              Enter Room Password
            </h2>
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


const RoomPanel2 = ({ activeRoom, toggleSidebar, sidebarOpen, room }) => {
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

  return (
    <div className="flex-1 flex flex-col relative">
      <CompTopBar compName={activeRoom} toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} comp={room} />
      {
        !room && <div className="flex-1 flex flex-col items-center justify-center text-gray-500">No room selected.</div>
      }
      {
        room && <div className={`${showPasswordModal && room.isPrivate && !isPasswordCorrect ? 'blur-lg' : ''} flex-1 flex flex-col`}>
          {(!showPasswordModal || isPasswordCorrect) && (
            <>
              <MessageList room={room} />
              <MessageInput room={room} />
            </>
          )}
        </div>
      }
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

// const RoomPanel1 = ({ activeRoom, toggleSidebar, sidebarOpen, room }) => {
//   return (
//     <div className="flex-1 flex flex-col">
//       <CompTopBar compName={activeRoom} toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} comp={room} />
//       {
//         room && <>
//           <MessageList room={room} />
//           <MessageInput room={room} />
//         </>
//       }
//     </div>
//   );
// };

export default RoomPanel;




// import React, { useState, useEffect, useRef } from 'react';
// import MessageList from './MessageList';
// import MessageInput from './MessageInput';
// import CompTopBar from '../TopBar/CompTopBar';

// const RoomPanel = ({ activeRoom, toggleSidebar, sidebarOpen, room }) => {
//     const [showPasswordModal, setShowPasswordModal] = useState(false);
//     const [passwordInput, setPasswordInput] = useState('');
//     const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
//     const [replyingTo, setReplyingTo] = useState(null);
//     const modalRef = useRef(null);

//     useEffect(() => {
//         if (room && room.isPrivate && !isPasswordCorrect) {
//             setShowPasswordModal(true);
//         } else {
//             setShowPasswordModal(false);
//         }
//     }, [room, isPasswordCorrect]);

//     const handlePasswordSubmit = () => {
//         if (room && room.password === passwordInput) {
//             setIsPasswordCorrect(true);
//             setShowPasswordModal(false);
//         } else {
//             alert('Incorrect password!');
//             setPasswordInput('');
//         }
//     };

//     const handleBackdropClick = (event) => {
//         if (modalRef.current && event.target === modalRef.current) {
//             setShowPasswordModal(false);
//         }
//     };

//     const handleSendMessage = (text, replyToId) => {
//         // Dispatch action to send message via socket
//         console.log('Sending message:', text, 'replying to:', replyToId, 'in room:', room.name);
//         // You'll need to connect this to your socket emit function
//     };

//     const handleReply = (message) => {
//         setReplyingTo(message);
//     };

//     const handleClearReply = () => {
//         setReplyingTo(null);
//     };

//     return (
//         <div className="flex-1 flex flex-col relative">
//             <CompTopBar compName={activeRoom} toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} comp={room} />
//             {!room && <div className="flex-1 flex flex-col items-center justify-center text-gray-500">No room selected.</div>}
//             {room && (
//                 <div className={`${showPasswordModal && room.isPrivate && !isPasswordCorrect ? 'blur-lg' : ''} flex-1 flex flex-col`}>
//                     {(!showPasswordModal || isPasswordCorrect) && (
//                         <>
//                             <MessageList room={room} onReply={handleReply} />
//                             <MessageInput
//                                 room={room}
//                                 onSendMessage={handleSendMessage}
//                                 replyingTo={replyingTo}
//                                 clearReply={handleClearReply}
//                             />
//                         </>
//                     )}
//                 </div>
//             )}
//             {showPasswordModal && room.isPrivate && (
//                 <div
//                     ref={modalRef}
//                     onClick={handleBackdropClick}
//                     className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50"
//                 >
//                     <div className="bg-gray-800 p-8 rounded shadow-lg w-80">
//                         <h2 className="text-xl font-semibold text-gray-300 mb-4">Enter Room Password</h2>
//                         <input
//                             type="password"
//                             className="w-full p-3 mb-4 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             placeholder="Password"
//                             value={passwordInput}
//                             onChange={(e) => setPasswordInput(e.target.value)}
//                         />
//                         <button
//                             className="w-full py-3 bg-blue-600 rounded-md text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             onClick={handlePasswordSubmit}
//                         >
//                             Enter
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default RoomPanel;