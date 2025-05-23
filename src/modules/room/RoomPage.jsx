import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import RoomPanel from "../../components/room/panel";
import { RoomContext } from '../../context/RoomContext';
import { AuthContext } from '../../context/UserContext';
import useRoomSockets from '../../sockets/roomSockets';
import roomApi from '../../api/roomApi';
import { useNavigate } from 'react-router-dom';

const RoomLayout = () => {
  const { id: roomNameParam } = useParams();
  const { state: roomState, dispatch: roomDispatch, setCurrentRoom, addMessagesToRoom, addRoom } = useContext(RoomContext);
  const { state: authState } = useContext(AuthContext);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [privateRoomPassword, setPrivateRoomPassword] = useState('');
  const [currentRoomAwaitingPassword, setCurrentRoomAwaitingPassword] = useState(null);

  const { emitCheckRoom, emitJoinRoom, emitInitialMessages } = useRoomSockets(roomDispatch, authState.dispatch);

  const allRooms = roomState.rooms;
  const activeRoomId = roomState.currentRoomId;
  const activeRoom = activeRoomId ? allRooms[activeRoomId] : null;
  const tempRoom = roomState.tempRoom;
  const isTempRoomActive = roomState.isTempRoomActive;
  const navigate = useNavigate();

  // Master useEffect to initiate the Room Flow based on URL parameter and Auth State
  useEffect(() => {
    if (roomNameParam && (authState.token && authState.user && authState.user._id)) {
      const token = authState.token;
      const exists = Object.values(roomState.roomOrder).some(item => item.name === roomNameParam);
      if (!exists || (exists && activeRoomId==null)) emitCheckRoom(roomNameParam, false, "", token);
    } else { }
  }, [roomNameParam, authState.user, emitCheckRoom])

  // useEffect to trigger room:join after reciveing searched and the tempRoom is set
  useEffect(() => {
    // if temp room (when room is searched and returned but the join isnt triggered yet) -> triggers join if not private
    if (tempRoom && isTempRoomActive && authState.user && authState.user._id) {

      const isParticipant = tempRoom.participants && tempRoom.participants[authState.user._id];

      if (tempRoom.isPrivate && !isParticipant) {
        setCurrentRoomAwaitingPassword(tempRoom);
        setShowPasswordModal(true);
        return
      }

      emitJoinRoom(tempRoom.name, authState.token, privateRoomPassword);

      setPrivateRoomPassword('');
      setCurrentRoomAwaitingPassword(null);

    }
    // if not tempRoom and has activeRoom (when joined, and messages are empty) -> i dont think its responislbe for anything
    else if (!(tempRoom || isTempRoomActive) && (activeRoom && activeRoom._id) && (authState.user && authState.user._id)) { }
  }, [tempRoom, isTempRoomActive, emitJoinRoom, privateRoomPassword]);

  // Effect to show the password modal based on activeRoom details and user participation
  useEffect(() => {
    if (tempRoom && tempRoom.isPrivate && authState.user?._id) {
      const isParticipant = tempRoom.participants && tempRoom.participants[authState.user._id];

      if (!isParticipant && !showPasswordModal) { // Only set to true if not already true
        setCurrentRoomAwaitingPassword(activeRoom);
        setShowPasswordModal(true);
      } else if (isParticipant && showPasswordModal) { // Hide if user becomes participant and modal is shown
        setShowPasswordModal(false);
        setCurrentRoomAwaitingPassword(null);
        setPrivateRoomPassword('');
      }
    } else if (showPasswordModal) { // Hide if room is no longer private or no active room
      setShowPasswordModal(false);
      setPrivateRoomPassword('');
    }
  }, [tempRoom, authState.user, showPasswordModal]);


  const handlePasswordSubmit = () => {
    if (currentRoomAwaitingPassword && privateRoomPassword && tempRoom && isTempRoomActive) {
      if (privateRoomPassword === tempRoom.password) {
        emitJoinRoom(currentRoomAwaitingPassword.name, authState.token, privateRoomPassword);
        setPrivateRoomPassword('');
        setCurrentRoomAwaitingPassword(null);
      } else {
        alert("Please enter a valid password");
      }
    } else {
      alert("Please enter a password.");
    }
  };

  const closePasswordModal = () => {
    roomDispatch({ type: 'CLEAR_TEMP_ROOM', payload: "" });
    setPrivateRoomPassword('');
    setCurrentRoomAwaitingPassword(null);
  }

  const checkRoomExists = async (text) => {
    return (await roomApi.checkRoomName("", text));
  };

  const createCustomRoom = (roomName, privacy = false, password = "") => {
    emitCheckRoom(roomName, privacy, password, authState.token);
    setTimeout(() => {
      navigate(`/room/${roomName}`, { replace: true });
    }, 1000);
  }

  const changeCurrentRoom = (roomId, roomName, isSearchResult) => {
    if (!isSearchResult) {
      setCurrentRoom(roomId);
      navigate(`/room/${roomName}`, { replace: true });
      roomDispatch({ type: "MARK_MESSAGES_AS_SEEN", payload: roomId });
    } else if (authState.token && authState.user && authState.user._id) {
      const token = authState.token;
      emitCheckRoom(roomName, false, "", token);
      setTimeout(() => {
      navigate(`/room/${roomName}`, { replace: true });
    }, 1000);
    }
  }

  return (
    <div className="flex flex-row h-screen w-full bg-gray-900 text-white overflow-hidden">
      <Sidebar
        activeComp={activeRoomId}
        allComps={allRooms}
        compOrder={roomState.roomOrder}
        setActiveComp={(roomId, roomName, isSearchResult) => changeCurrentRoom(roomId, roomName, isSearchResult)}
        tempComp={tempRoom}
        isTempCompActive={isTempRoomActive}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        compName="room"
        getSearchResult={checkRoomExists}
        createComp={createCustomRoom}
      />

      <div className="flex-grow flex flex-col overflow-hidden">
        <RoomPanel
          tempCom={tempRoom}
          isTempCompActive={isTempRoomActive}

          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}

          activeRoom={activeRoom}
          userId={authState.user?._id}

          showPasswordModal={showPasswordModal}
          isCurrentRoomAwaitingPassword={!!currentRoomAwaitingPassword}
          passwordInput={privateRoomPassword}
          setPasswordInput={setPrivateRoomPassword}
          handlePasswordSubmit={handlePasswordSubmit}
          closePasswordModal={closePasswordModal}
        />
      </div>
    </div>
  );
}

export default RoomLayout;