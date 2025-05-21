import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import RoomPanel from "../../components/room/panel";
import { RoomContext } from '../../context/RoomContext';
import { AuthContext } from '../../context/UserContext';
import useRoomSockets from '../../sockets/roomSockets'; // Corrected import to use the hook
import roomApi from '../../api/roomApi';

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

  // Master useEffect to initiate the Room Flow based on URL parameter and Auth State
  useEffect(() => {
    if (roomNameParam && (authState.token && authState.user && authState.user._id)) {
      const token = authState.token;
      // console.log("room - emit check room: ", roomNameParam)
      emitCheckRoom(roomNameParam, false, "", token);
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

      // console.log("room - emit join room: ", tempRoom.name)
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
  }

  const changeCurrentRoom = (roomId, roomName, isSearchResult) => {
    // console.log("room - change active? room: ", roomId, ' , ', roomName, ' , ', isSearchResult)
    if (!isSearchResult) {
      setCurrentRoom(roomId);
    } else if (authState.token && authState.user && authState.user._id) {
      const token = authState.token;
      emitCheckRoom(roomName, false, "", token);
    }
  }

  return (
    <div className="flex flex-row h-screen w-full bg-gray-900 text-white overflow-hidden">
      <Sidebar
        activeComp={activeRoomId}
        allComps={allRooms}
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

const RoomLayout3 = () => {
  // --- 1. All useContext and useParams calls at the very top ---
  const { id: roomNameParam } = useParams();
  const { state: roomState, dispatch: roomDispatch, setCurrentRoom, addMessagesToRoom, addRoom } = useContext(RoomContext);
  const { state: authState } = useContext(AuthContext);

  // --- 2. All useState declarations immediately after useContext/useParams ---
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [privateRoomPassword, setPrivateRoomPassword] = useState(''); // <-- THIS IS THE KEY DECLARATION
  const [currentRoomAwaitingPassword, setCurrentRoomAwaitingPassword] = useState(null);

  // --- 3. Custom Hooks (like useRoomSockets) - These can go here, after state, as they use state/dispatch ---
  const { emitCheckRoom, emitJoinRoom, emitInitialMessages } = useRoomSockets(roomDispatch, authState.dispatch);

  // --- 4. Derived state/variables (calculated from context/state) ---
  const allRooms = roomState.rooms;
  const activeRoomId = roomState.currentRoomId;
  const activeRoom = activeRoomId ? allRooms[activeRoomId] : null;
  // console.log(allRooms);

  // --- 5. All useEffect hooks (NOW they can safely use the state variables as dependencies) ---

  // Master useEffect to initiate the Room Flow based on URL parameter and Auth State
  useEffect(() => {
    // console.log("RoomLayout: Master useEffect running...");
    // console.log("  roomNameParam:", roomNameParam);
    // console.log("  authState.token:", authState.token ? "present" : "missing");
    // console.log("  authState.user:", authState.user ? "present" : "missing");

    if (roomNameParam && authState.token && authState.user && authState.user._id) {
      // console.log(`RoomLayout: Authenticated user ready. Initiating room flow for ${roomNameParam}.`);
      const token = authState.token;
      emitCheckRoom(roomNameParam, token);
    } else {
      // console.log("RoomLayout: Waiting for room parameter or full authentication state...");
    }
    // return () => { console.log("RoomLayout: Master useEffect cleanup."); };
  }, [roomNameParam, authState.token, authState.user, emitCheckRoom]);


  // useEffect to set the current room in RoomContext after 'room:searched' updates 'allRooms'
  useEffect(() => {
    // console.log("RoomLayout: Set current room useEffect running...");
    if (roomNameParam && allRooms && authState.user && authState.user._id) {
      const roomEntry = Object.entries(allRooms).find(([id, room]) => room.name === roomNameParam);
      if (roomEntry && roomEntry[0] !== activeRoomId) {
        // console.log(`RoomLayout: Found room ${roomNameParam} in context. Setting current room.`);
        setCurrentRoom(roomEntry[0]);
      }
    }
  }, [roomNameParam, allRooms, activeRoomId, setCurrentRoom, authState.user]);


  // useEffect to trigger room:join and room:messages:initial after currentRoomId is set
  useEffect(() => {
    // console.log("RoomLayout: Join/Messages useEffect running...");
    // console.log("  activeRoomId:", activeRoomId);
    // console.log("  activeRoom:", activeRoom ? "present" : "missing");

    if (activeRoomId && activeRoom && activeRoom._id && authState.user && authState.user._id) {
      // console.log(`RoomLayout: Active room details loaded for ${activeRoom.name}.`);

      const isParticipant = activeRoom.participants && activeRoom.participants[authState.user._id];

      if (activeRoom.isPrivate && !isParticipant) {
        // console.warn(`RoomLayout: Room ${activeRoom.name} is private and user is NOT a participant. Showing password modal.`);
        setCurrentRoomAwaitingPassword(activeRoom);
        setShowPasswordModal(true);
        return; // STOP the chain here until password is handled.
      }

      // console.log(`RoomLayout: Joining room ${activeRoom.name} socket channel.`);
      emitJoinRoom(activeRoom.name, authState.token, privateRoomPassword); // privateRoomPassword is now initialized

      // console.log(`RoomLayout: Fetching initial messages for room ${activeRoom.name}.`);
      emitInitialMessages(activeRoomId, authState.token);

      // Clear password input if join is attempted successfully
      setPrivateRoomPassword('');
      // The modal will be hidden by the password modal effect below if user is now participant
      setCurrentRoomAwaitingPassword(null);

    } else {
      // console.log("RoomLayout: Waiting for active room details or full authentication to proceed with join/messages.");
    }
  }, [activeRoomId, activeRoom, authState.token, authState.user, emitJoinRoom, emitInitialMessages, privateRoomPassword]); // privateRoomPassword added to dependencies

  // Effect to show the password modal based on activeRoom details and user participation
  useEffect(() => {
    if (activeRoom && activeRoom.isPrivate && authState.user?._id) {
      const isParticipant = activeRoom.participants && activeRoom.participants[authState.user._id];

      if (!isParticipant && !showPasswordModal) { // Only set to true if not already true
        // console.log(`RoomLayout: Showing password modal for private room: ${activeRoom.name}`);
        setCurrentRoomAwaitingPassword(activeRoom);
        setShowPasswordModal(true);
      } else if (isParticipant && showPasswordModal) { // Hide if user becomes participant and modal is shown
        // console.log(`RoomLayout: User is now a participant of private room: ${activeRoom.name}. Hiding password modal.`);
        setShowPasswordModal(false);
        setCurrentRoomAwaitingPassword(null);
        setPrivateRoomPassword(''); // Clear password if user is now in room
      }
    } else if (showPasswordModal) { // Hide if room is no longer private or no active room
      setShowPasswordModal(false);
      //  setCurrentRoomAtainingPassword(null);
      setPrivateRoomPassword('');
    }
  }, [activeRoom, authState.user?._id, showPasswordModal]);


  // --- 6. Handler functions ---
  const handlePasswordSubmit = () => {
    if (currentRoomAwaitingPassword && privateRoomPassword) {
      // console.log(`RoomLayout: Submitting password for ${currentRoomAwaitingPassword.name}.`);
      emitJoinRoom(currentRoomAwaitingPassword.name, authState.token, privateRoomPassword);
      // The modal closing and password clearing will be handled by the useEffect above
      // when the room join is successful and isParticipant becomes true.
    } else {
      alert("Please enter a password.");
    }
  };

  // --- 7. Render (JSX) ---
  return (
    <div className="flex flex-row h-screen w-full bg-gray-900 text-white overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar
        activeComp={activeRoomId}
        allComps={allRooms}
        setActiveComp={setCurrentRoom}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        compName="room"
      />

      {/* Right Room Panel */}
      {/* Add flex-grow to the RoomPanel's container or directly to RoomPanel if it's the root element */}
      <div className="flex-grow overflow-hidden"> {/* Use flex-grow here */}
        <RoomPanel
          activeRoom={activeRoom}
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          showPasswordModal={showPasswordModal}
          isCurrentRoomAwaitingPassword={!!currentRoomAwaitingPassword}
          passwordInput={privateRoomPassword}
          setPasswordInput={setPrivateRoomPassword}
          handlePasswordSubmit={handlePasswordSubmit}
          userId={authState.user?._id}
        />
      </div>
    </div>
  );
}

// const RoomLayout2 = () => {
//   const { id: roomNameParam } = useParams();

//   const { state: roomState, dispatch: roomDispatch, setCurrentRoom, addMessagesToRoom, addRoom } = useContext(RoomContext);
//   const { state: authState } = useContext(AuthContext); // authState will contain { user, token, isAuthenticated }

//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   // Access the socket utility functions.
//   // We call roomSockets (which is a hook, as it uses useCallback/useEffect internally)
//   // inside the component to ensure it's properly hooked into the React lifecycle.
//   const { emitCheckRoom, emitJoinRoom, emitInitialMessages } = roomSockets(roomDispatch, authState.dispatch);

//   const allRooms = roomState.rooms;
//   const activeRoomId = roomState.currentRoomId;
//   const activeRoom = activeRoomId ? allRooms[activeRoomId] : null;

//   // --- 1. Master useEffect to initiate the Room Flow based on URL parameter and Auth State ---
//   useEffect(() => {
//     console.log("RoomLayout: Master useEffect running...");
//     console.log("  roomNameParam:", roomNameParam);
//     console.log("  authState.token:", authState.token ? "present" : "missing");
//     console.log("  authState.user:", authState.user ? "present" : "missing");

//     // Only proceed if:
//     // 1. A roomNameParam is present in the URL
//     // 2. We have an authentication token
//     // 3. We have a fully loaded user object (including its _id)
//     if (roomNameParam && authState.token && authState.user && authState.user._id) {
//       console.log(`RoomLayout: Authenticated user ready. Initiating room flow for ${roomNameParam}.`);

//       const token = authState.token; // Use token directly from authState

//       // Trigger the first step in the chain: room:search
//       emitCheckRoom(roomNameParam, token);

//       // The subsequent steps of the chain (room:searched -> room:join -> room:messages:initial)
//       // will be managed by the existing socket listeners in `roomClientSockets.js`
//       // and the other `useEffect` hooks in `RoomLayout` below, which react to `RoomContext` state changes.

//     } else {
//       // If we're waiting for auth or roomNameParam is not present
//       console.log("RoomLayout: Waiting for room parameter or full authentication state...");
//       // You might want to display a loading spinner or a "Please login" message here
//       // if (!authState.token || !authState.user) {
//       //   console.log("User not fully authenticated. Waiting...");
//       // }
//       // if (!roomNameParam) {
//       //   console.log("No room ID in URL. Showing default state.");
//       //   // Optionally clear current room if user navigates from /room/123 to /room
//       //   // setCurrentRoom(null);
//       // }
//     }

//     // Cleanup function: If the component unmounts or dependencies change,
//     // we could potentially do some cleanup, though for this initial flow,
//     // the socket listeners manage the state transitions.
//     return () => {
//       console.log("RoomLayout: Master useEffect cleanup.");
//     };

//   }, [roomNameParam, authState.token, authState.user, emitCheckRoom]); // IMPORTANT: Depend on authState.user


//   // --- 2. useEffect to set the current room in RoomContext after 'room:searched' updates 'allRooms' ---
//   // This effect watches for the room from the URL to appear in the 'allRooms' list.
//   useEffect(() => {
//       console.log("RoomLayout: Set current room useEffect running...");
//       if (roomNameParam && allRooms && authState.user && authState.user._id) {
//           const roomEntry = Object.entries(allRooms).find(([id, room]) => room.name === roomNameParam);
//           // If the room from the URL is found in our context state
//           // and it's not already the current room, set it as current.
//           if (roomEntry && roomEntry[0] !== activeRoomId) {
//                console.log(`RoomLayout: Found room ${roomNameParam} in context. Setting current room.`);
//                setCurrentRoom(roomEntry[0]); // Use the room's _id to set current room
//           }
//       }
//   }, [roomNameParam, allRooms, activeRoomId, setCurrentRoom, authState.user]); // Added authState.user to dependencies


//   // --- 3. useEffect to trigger room:join and room:messages:initial after currentRoomId is set ---
//   useEffect(() => {
//       console.log("RoomLayout: Join/Messages useEffect running...");
//       console.log("  activeRoomId:", activeRoomId);
//       console.log("  activeRoom:", activeRoom ? "present" : "missing");

//       // Only proceed if:
//       // 1. An activeRoomId is set
//       // 2. We have full room details for the active room
//       // 3. We have an authenticated user with an ID
//       if (activeRoomId && activeRoom && activeRoom._id && authState.user && authState.user._id) {
//           console.log(`RoomLayout: Active room details loaded for ${activeRoom.name}.`);

//           // ** IMPORTANT: RoomContext Reducer Update Required **
//           // The `room:searched` and `room:joined` socket listeners (in `roomClientSockets.js`)
//           // MUST dispatch actions that fully update the room object in `RoomContext.state.rooms`
//           // including its `participants` property if available from the backend.
//           // Example:
//           // case 'ADD_ROOM':
//           //   return {
//           //     ...state,
//           //     rooms: {
//           //       ...state.rooms,
//           //       [action.payload.room._id]: action.payload.room // Store the full room object
//           //     }
//           //   };
//           const isParticipant = activeRoom.participants && activeRoom.participants[authState.user._id];

//           // Check for password prompt condition
//           if (activeRoom.isPrivate && !isParticipant) {
//               console.warn(`RoomLayout: Room ${activeRoom.name} is private and user is NOT a participant. Showing password modal.`);
//               setCurrentRoomAwaitingPassword(activeRoom);
//               setShowPasswordModal(true);
//               return; // STOP the chain here until password is handled.
//           }

//           // If room is not private OR user is already a participant (or password was correctly entered):
//           // Emit room:join
//           console.log(`RoomLayout: Joining room ${activeRoom.name} socket channel.`);
//           emitJoinRoom(activeRoom.name, authState.token); // Pass password if it was collected

//           // Emit room:messages:initial
//           console.log(`RoomLayout: Fetching initial messages for room ${activeRoom.name}.`);
//           emitInitialMessages(activeRoomId, authState.token);

//           // Clear password modal state if it was open but no longer needed
//           setShowPasswordModal(false);
//           setCurrentRoomAwaitingPassword(null);

//       } else {
//           console.log("RoomLayout: Waiting for active room details or full authentication to proceed with join/messages.");
//           // if (activeRoomId && !activeRoom) {
//           //   console.log("Active room ID set, but full room details not yet in context.");
//           // }
//       }
//   }, [activeRoomId, activeRoom, authState.token, authState.user, emitJoinRoom, emitInitialMessages]);


//   // Password Modal Management State
//   const [showPasswordModal, setShowPasswordModal] = useState(false);
//   const [privateRoomPassword, setPrivateRoomPassword] = useState('');
//   const [currentRoomAwaitingPassword, setCurrentRoomAwaitingPassword] = useState(null);

//   // Handler for password modal submit
//   const handlePasswordSubmit = () => {
//     if (currentRoomAwaitingPassword && privateRoomPassword) {
//       console.log(`RoomLayout: Submitting password for ${currentRoomAwaitingPassword.name}.`);
//       // When password is submitted, re-trigger the join flow with the password
//       // The `emitJoinRoom` function in roomClientSockets needs to accept the password.
//       // And the backend's `roomService.joinRoom` (via 'room:join' socket) needs to verify it.
//       emitJoinRoom(currentRoomAwaitingPassword.name, authState.token, privateRoomPassword);

//       setShowPasswordModal(false); // Optimistically close modal
//       setPrivateRoomPassword(''); // Clear input
//       // The subsequent 'room:joined' and 'room:messages:initial' steps will follow
//       // if the password is correct and join succeeds.
//     } else {
//       alert("Please enter a password.");
//     }
//   };

//   return (
//     <div className="flex flex-row h-screen w-full bg-gray-900 text-white overflow-hidden">
//       <Sidebar
//         activeComp={activeRoomId}
//         allComps={allRooms}
//         setActiveComp={setCurrentRoom}
//         toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
//         sidebarOpen={sidebarOpen}
//         compName="room"
//       />

//       <RoomPanel
//         activeRoom={activeRoom}
//         sidebarOpen={sidebarOpen}
//         toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
//         showPasswordModal={showPasswordModal}
//         isCurrentRoomAwaitingPassword={!!currentRoomAwaitingPassword}
//         passwordInput={privateRoomPassword}
//         setPasswordInput={setPrivateRoomPassword}
//         handlePasswordSubmit={handlePasswordSubmit}
//         userId={authState.user?._id}
//       />
//     </div>
//   );
// };

// const RoomLayout1 = () => {
//   // Get the room ID (roomName) from the URL parameters
//   const { id: roomNameParam } = useParams(); // Rename 'id' to 'roomNameParam' for clarity

//   // Get state and dispatch functions from contexts
//   const { state: roomState, dispatch: roomDispatch, setCurrentRoom, addMessagesToRoom, addRoom } = useContext(RoomContext); // Get dispatch and action creators
//   const { state: authState } = useContext(AuthContext); // Get auth state for token and user info

//   // Keep sidebarOpen local state as it's just for layout toggling
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   // Access the socket utility functions
//   const { emitCheckRoom, emitJoinRoom, emitInitialMessages } = roomSockets(roomDispatch, authState.dispatch); // Pass dispatches

//   // Data from context
//   const allRooms = roomState.rooms;
//   const activeRoomId = roomState.currentRoomId;
//   // We'll need the full active room object from context state based on activeRoomId
//   const activeRoom = activeRoomId ? allRooms[activeRoomId] : null;

//   // --- useEffect to handle URL parameter change and initiate the socket chain ---
//   useEffect(() => {
//     // This effect runs when the component mounts or roomNameParam changes
//     if (roomNameParam) {
//       console.log(`URL room parameter changed: ${roomNameParam}. Initiating socket chain.`);

//       // Ensure we have a token before emitting. The AuthContext should handle initial token loading.
//       // The authenticate socket event on initial connection should also provide a token.
//       // We might need a state/effect to wait for the initial token if it's not immediately available.

//       const token = authState.token || localStorage.getItem('authToken'); // Try getting from state or localStorage

//       if (!token) {
//          console.error("No authentication token available. Cannot initiate room flow.");
//          // TODO: Handle this - maybe show an error, redirect to login, or wait for initial auth socket event?
//          return;
//       }

//       // 1. Emit room:search socket event
//       // This will trigger the backend to find or create the room
//       emitCheckRoom(roomNameParam, token);

//       // The rest of the chain (room:searched -> room:join -> room:messages:initial)
//       // will be triggered by the socket event listeners you've already set up in roomClientSockets.js
//       // Those listeners dispatch actions (ADD_ROOM, SET_CURRENT_ROOM, ADD_MESSAGES)
//       // which update the RoomContext state.
//       // The RoomPanel component (which consumes RoomContext) will react to these state changes
//       // and display the room details and messages when they become available.

//       // We might need logic here or in the RoomPanel to handle the password prompt
//       // after room:searched is received and the room details are added to context.

//     } else {
//       // Handle case where there's no roomNameParam (e.g., /room route)
//       console.log("No room parameter in URL. Showing a default view.");
//       // TODO: Maybe clear the active room state in context?
//       // setCurrentRoom(null);
//     }

//     // Cleanup function for the effect
//     return () => {
//       console.log("RoomLayout effect cleanup.");
//       // TODO: Decide if any specific cleanup is needed when leaving a room route
//       // (e.g., leaving socket room on backend). This might be handled by component unmount
//       // or navigating away.
//     };

//   }, [roomNameParam, authState.token, emitCheckRoom]); // Re-run effect if roomNameParam or auth token changes

//   // --- useEffect to handle setting the current room in context after it's potentially added ---
//   // This is needed because the 'room:searched' listener adds the room to 'rooms' state,
//   // but doesn't necessarily set it as 'currentRoomId' immediately.
//   // This effect watches the URL param and the list of rooms in context.
//   useEffect(() => {
//       if (roomNameParam && allRooms) {
//           const roomEntry = Object.entries(allRooms).find(([id, room]) => room.name === roomNameParam);
//           if (roomEntry && roomEntry[0] !== activeRoomId) {
//                // If the room from the URL is found in our context state
//                // and it's not already the current room, set it as current.
//                console.log(`Setting current room to ${roomNameParam} (${roomEntry[0]})`);
//                setCurrentRoom(roomEntry[0]); // Use the room's _id to set current room
//           }
//       }
//   }, [roomNameParam, allRooms, activeRoomId, setCurrentRoom]); // Re-run effect if URL param, rooms list, or active ID changes


//   // --- Add another useEffect to trigger join and message fetch after currentRoomId is set ---
//   useEffect(() => {
//       // This effect runs when the activeRoomId changes or the user/token changes
//       // We need to ensure we have an authenticated user and a token before joining/fetching messages
//       if (activeRoomId && authState.token && authState.user?._id) {
//           console.log(`Active room ID set to ${activeRoomId}. Checking room state for join/message fetch.`);

//           const roomDetails = allRooms[activeRoomId];

//           // Ensure room details are loaded in context before proceeding
//           if (roomDetails && roomDetails._id) {
//               // Check if the user is already in the participants list for this room in context state
//               // NOTE: This check assumes your RoomContext state for a room includes participants.
//               // Your initial RoomContext state does NOT currently store participants.
//               // We need to update the RoomContext reducer to store participant data
//               // received from the backend's room object.
//                const isParticipant = roomDetails.participants && roomDetails.participants[authState.user._id]; // Check if user._id is a key in the participants Map/object

//                // Check for password prompt condition
//                if (roomDetails.isPrivate && !isParticipant) {
//                    console.log(`Room ${roomDetails.name} is private and user is not a participant. Showing password modal.`);
//                    // TODO: Trigger showing the password modal here in RoomLayout state
//                    // or in RoomPanel based on props/context. RoomPanel already has password modal logic.
//                    // We need a state variable here or pass a prop to RoomPanel to control its visibility.
//                    // For now, we'll just console log and STOP the chain here until password is handled.
//                    // The RoomPanel's existing password modal logic will need to be integrated.
//                    // The submit handler for the password modal will need to emit a 'room:join' socket event
//                    // with the password included, and the backend join logic needs to verify it.
//                    return; // STOP THE CHAIN until password is handled
//                }


//               // If not private OR is private and user is participant/password handled:
//               // 2. Emit room:join socket event (if not already joined the socket room?)
//               // The backend socket handler for 'room:joined' adds the socket to the room.
//               // We should check if the socket is ALREADY joined if navigating within the app,
//               // but landing from URL means fresh socket, so emit join is correct first step.
//               console.log(`Joining room ${roomDetails.name} socket channel.`);
//               emitJoinRoom(roomDetails.name, authState.token);


//               // The 'room:joined' socket listener should dispatch SET_CURRENT_ROOM (already does)
//               // and potentially UPDATE_USER_ROOMS in AuthContext (TODO in AuthContext reducer).

//               // 3. Emit room:messages:initial after successful join
//               // The 'room:joined' listener is where you might trigger the next step
//               // OR, we can trigger it here based on the activeRoomId changing,
//               // but we need to be sure the socket join is complete.
//               // Triggering it here might be premature if socket.join on backend hasn't finished.
//               // Let's trust the 'room:joined' socket listener to dispatch actions.
//               // The display of messages will then be a reaction to RoomContext state updates.

//               // Let's trigger message fetch *after* the room details are confirmed and password handled,
//               // assuming that successful join is implicit if we reach this point after 'room:searched'
//               // and the password check. The 'room:joined' listener confirms the *backend* socket room join.
//               console.log(`Workspaceing initial messages for room ${roomDetails.name} (${activeRoomId}).`);
//               emitInitialMessages(activeRoomId, authState.token);

//               // The 'room:messages:initial' listener dispatches ADD_MESSAGES, which updates the context.
//               // RoomPanel will react to this.
//           } else {
//               console.log(`Room details for ID ${activeRoomId} not yet loaded in context.`);
//               // This might happen if the context state hasn't been updated by 'room:searched' yet.
//               // The effects will re-run when allRooms state updates.
//           }
//       }
//       // TODO: Add a check here to see if the user is ALREADY in the context state
//       // as a participant of this room. If so, maybe skip the password check.
//       // This requires the RoomContext state to store participant data, which it currently doesn't.
//       // We need to update the ADD_ROOM and SET_ROOMS reducers to include this.


//   }, [activeRoomId, authState.token, authState.user?._id, allRooms, emitJoinRoom, emitInitialMessages]); // Depend on activeRoomId, token, user ID, and allRooms


//   // We need a way to track if the password modal should be shown
//   const [showPasswordModal, setShowPasswordModal] = useState(false);
//   const [privateRoomPassword, setPrivateRoomPassword] = useState('');
//   const [currentRoomAwaitingPassword, setCurrentRoomAwaitingPassword] = useState(null); // To store room object needing password


//    // Effect to show the password modal based on activeRoom details and user participation
//    useEffect(() => {
//         if (activeRoom && activeRoom.isPrivate && authState.user?._id) {
//              // Check if the user is a participant in the activeRoom details from context
//             const isParticipant = activeRoom.participants && activeRoom.participants[authState.user._id];

//             if (!isParticipant) {
//                  // User is NOT a participant in a private room, show modal
//                  console.log(`Showing password modal for private room: ${activeRoom.name}`);
//                  setCurrentRoomAwaitingPassword(activeRoom); // Store the room object
//                  setShowPasswordModal(true);
//             } else {
//                  // User IS a participant, no need for password modal for this room
//                  console.log(`User is already participant of private room: ${activeRoom.name}. No password needed.`);
//                  setShowPasswordModal(false); // Hide if it was somehow open
//                  setCurrentRoomAwaitingPassword(null); // Clear stored room
//             }
//         } else {
//             // Room is not private or no active room selected, hide modal
//             setShowPasswordModal(false);
//             setCurrentRoomAwaitingPassword(null);
//         }

//    }, [activeRoom, authState.user?._id]); // Depend on activeRoom and user ID


//    // Handler for password modal submit
//    const handlePasswordSubmit = () => {
//        if (currentRoomAwaitingPassword && privateRoomPassword) {
//             // TODO: Implement the logic to send the join request WITH the password
//             // This likely needs a NEW socket event like 'room:join-private'
//             // or modify 'room:join' backend to accept password and userId
//             // and verify it if the room is private.
//             console.log(`Attempting to join private room ${currentRoomAwaitingPassword.name} with password.`);

//             // You would emit a socket event here, e.g.:
//             // socket.emit('room:join', { roomName: currentRoomAwaitingPassword.name, password: privateRoomPassword, token: authState.token });
//             // The backend needs to handle this.

//             // For now, just console log and hide modal, the actual join will be triggered by backend confirmation
//             // assuming the 'room:joined' listener handles successful password validation implicitely.
//             // However, the backend join logic needs to be updated to verify the password!

//             // If backend join logic is updated to handle password:
//             // Upon success, the 'room:joined' listener will fire, which sets the active room
//             // and the next effect will fetch messages.
//             // If failure, the backend should emit a 'room:error' or 'room:join-failed' event.

//             // Assuming your backend 'room:join' can handle password if room is private:
//              emitJoinRoom(currentRoomAwaitingPassword.name, authState.token, privateRoomPassword); // Modify emitJoinRoom to accept password

//             setShowPasswordModal(false); // optimistic close
//             setPrivateRoomPassword(''); // clear input
//             // Keep currentRoomAwaitingPassword until 'room:joined' confirms success
//        } else {
//            alert("Please enter password.");
//        }
//    };


//    // Need to modify the emitJoinRoom function in roomClientSockets to accept password
//    // Also need to ensure roomReducer ADD_ROOM and SET_ROOMS store participant data
//    // returned by the backend 'room:searched' and 'room:joined' events.


//   return (
//     <div className="flex flex-row h-screen w-full bg-gray-900 text-white overflow-hidden">
//       {/* Left Sidebar */}
//       <Sidebar
//         activeComp={activeRoomId}
//         allComps={allRooms}
//         setActiveComp={setCurrentRoom}
//         toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
//         sidebarOpen={sidebarOpen}
//         compName="room"
//         // Pass user ID down if needed in Sidebar/CompList for specific logic
//         // userId={authState.user?._id}
//       />

//       {/* Right Room Panel */}
//       {/* Pass the active room object, sidebar state, AND password modal state/handlers */}
//       <RoomPanel
//         activeRoom={activeRoom} // Pass the active room object from context
//         sidebarOpen={sidebarOpen}
//         toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
//         // Pass props related to password modal
//         showPasswordModal={showPasswordModal}
//         isCurrentRoomAwaitingPassword={!!currentRoomAwaitingPassword} // Indicate if modal is for THIS room
//         passwordInput={privateRoomPassword}
//         setPasswordInput={setPrivateRoomPassword}
//         handlePasswordSubmit={handlePasswordSubmit}
//         // Pass user ID down if needed in RoomPanel/MessageList/MessageItem
//         userId={authState.user?._id}
//       />

//       {/* The password modal UI is rendered within RoomPanel based on showPasswordModal prop */}
//       {/* We pass down the state and handlers */}

//     </div>
//   );
// };

export default RoomLayout;