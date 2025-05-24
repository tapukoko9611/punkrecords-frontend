import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import CallPanel from "../../components/call/panel";
import { CallContext } from '../../context/CallContext';
import { AuthContext } from '../../context/UserContext';
import useCallSockets from '../../sockets/callSockets';
import callApi from '../../api/callApi';
import { useNavigate } from 'react-router-dom';

const CallLayout = () => {
  const { id: callNameParam } = useParams();
  const { state: callState, dispatch: callDispatch, setCurrentCall, } = useContext(CallContext);
  const { state: authState } = useContext(AuthContext);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [privateCallPassword, setPrivateCallPassword] = useState('');
  const [currentCallAwaitingPassword, setCurrentCallAwaitingPassword] = useState(null);

  const { emitCheckCall, emitJoinCall, } = useCallSockets(callDispatch, authState.dispatch);

  const allCalls = callState.calls;
  const activeCallId = callState.currentCallId;
  const activeCall = activeCallId ? allCalls[activeCallId] : null;
  const tempCall = callState.tempCall;
  const isTempCallActive = callState.isTempCallActive;
  const navigate = useNavigate();

  // Master useEffect to initiate the Call Flow based on URL parameter and Auth State
  useEffect(() => {
    if (callNameParam && (authState.token && authState.user && authState.user._id)) {
      const token = authState.token;
      const exists = Object.values(callState.callOrder).some(item => item.name === callNameParam);
      if (!exists || (exists && activeCallId==null)) emitCheckCall(callNameParam, false, "", token);
    } else { }
  }, [callNameParam, authState.user, emitCheckCall])

  // useEffect to trigger call:join after reciveing searched and the tempCall is set
  useEffect(() => {
    // if temp call (when call is searched and returned but the join isnt triggered yet) -> triggers join if not private
    if (tempCall && isTempCallActive && authState.user && authState.user._id) {

      const isParticipant = tempCall.participants && tempCall.participants[authState.user._id];

      if (tempCall.isPrivate && !isParticipant) {
        setCurrentCallAwaitingPassword(tempCall);
        setShowPasswordModal(true);
        return
      }

      emitJoinCall(tempCall.name, authState.token, privateCallPassword);

      setPrivateCallPassword('');
      setCurrentCallAwaitingPassword(null);

    }
    // if not tempCall and has activeCall (when joined, and messages are empty) -> i dont think its responislbe for anything
    else if (!(tempCall || isTempCallActive) && (activeCall && activeCall._id) && (authState.user && authState.user._id)) { }
  }, [tempCall, isTempCallActive, emitJoinCall, privateCallPassword]);

  // Effect to show the password modal based on activeCall details and user participation
  useEffect(() => {
    if (tempCall && tempCall.isPrivate && authState.user?._id) {
      const isParticipant = tempCall.participants && tempCall.participants[authState.user._id];

      if (!isParticipant && !showPasswordModal) { // Only set to true if not already true
        setCurrentCallAwaitingPassword(activeCall);
        setShowPasswordModal(true);
      } else if (isParticipant && showPasswordModal) { // Hide if user becomes participant and modal is shown
        setShowPasswordModal(false);
        setCurrentCallAwaitingPassword(null);
        setPrivateCallPassword('');
      }
    } else if (showPasswordModal) { // Hide if call is no longer private or no active call
      setShowPasswordModal(false);
      setPrivateCallPassword('');
    }
  }, [tempCall, authState.user, showPasswordModal]);


  const handlePasswordSubmit = () => {
    if (currentCallAwaitingPassword && privateCallPassword && tempCall && isTempCallActive) {
      if (privateCallPassword === tempCall.password) {
        emitJoinCall(currentCallAwaitingPassword.name, authState.token, privateCallPassword);
        setPrivateCallPassword('');
        setCurrentCallAwaitingPassword(null);
      } else {
        alert("Please enter a valid password");
      }
    } else {
      alert("Please enter a password.");
    }
  };

  const closePasswordModal = () => {
    callDispatch({ type: 'CLEAR_TEMP_CALL', payload: "" });
    setPrivateCallPassword('');
    setCurrentCallAwaitingPassword(null);
  }

  const checkCallExists = async (text) => {
    return (await callApi.checkCallName("", text));
  };

  const createCustomCall = (callName, privacy = false, password = "") => {
    emitCheckCall(callName, privacy, password, authState.token);
    setTimeout(() => {
      navigate(`/call/${callName}`, { replace: true });
    }, 1000);
  }

  const changeCurrentCall = (callId, callName, isSearchResult) => {
    if (!isSearchResult) {
      setCurrentCall(callId);
      navigate(`/call/${callName}`, { replace: true });
      callDispatch({ type: "MARK_CONTENT_AS_SEEN", payload: callId });
    } else if (authState.token && authState.user && authState.user._id) {
      const token = authState.token;
      emitCheckCall(callName, false, "", token);
      setTimeout(() => {
      navigate(`/call/${callName}`, { replace: true });
    }, 1000);
    }
  }

  return (
    <div className="flex flex-row h-screen w-full bg-gray-900 text-white overflow-hidden">
      <Sidebar
        activeComp={activeCallId}
        allComps={allCalls}
        compOrder={callState.callOrder}
        setActiveComp={(callId, callName, isSearchResult) => changeCurrentCall(callId, callName, isSearchResult)}
        tempComp={tempCall}
        isTempCompActive={isTempCallActive}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        compName="call"
        getSearchResult={checkCallExists}
        createComp={createCustomCall}
      />

      <div className="flex-grow flex flex-col overflow-hidden">
        <CallPanel
          tempCom={tempCall}
          isTempCompActive={isTempCallActive}

          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}

          activeCall={activeCall}
          userId={authState.user?._id}

          showPasswordModal={showPasswordModal}
          isCurrentCallAwaitingPassword={!!currentCallAwaitingPassword}
          passwordInput={privateCallPassword}
          setPasswordInput={setPrivateCallPassword}
          handlePasswordSubmit={handlePasswordSubmit}
          closePasswordModal={closePasswordModal}
        />
      </div>
    </div>
  );
}

export default CallLayout;