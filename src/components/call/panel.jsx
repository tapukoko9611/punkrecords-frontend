import React, { useState, useEffect, useRef, useContext } from 'react';
import CompTopBar from '../TopBar/CompTopBar';
import { CallContext } from '../../context/CallContext';
import { AuthContext } from '../../context/UserContext';
import useCallSockets from '../../sockets/callSockets';
import { FiPlus, FiX, FiHome } from 'react-icons/fi';
import callApi from '../../api/callApi';
import { CallSpace } from './CallSpace';

const CallPanel = ({
  tempComp,
  isTempCompActive,

  sidebarOpen,
  toggleSidebar,

  activeCall,
  userId,

  showPasswordModal,
  isCurrentCallAwaitingPassword,
  passwordInput,
  setPasswordInput,
  handlePasswordSubmit,
  closePasswordModal,
}) => {
  const { state: authState } = useContext(AuthContext);
  const { state: callState, dispatch: callDispatch } = useContext(CallContext);
  const { emitUpdateCallMetadata } = useCallSockets(callDispatch, authState.dispatch);

  const updateCallMeta = async (callName, isPrivate, password) => {
    emitUpdateCallMetadata(activeCall?.call?.name, isPrivate, password);
  }

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      <CompTopBar
        compName="call"
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        comp={activeCall?.call}
        updateCompMetaData={(compName, isPrivate, password) => updateCallMeta(compName, isPrivate, password)}
      />

      {!activeCall && !showPasswordModal && !isTempCompActive && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">No call selected.</div>
      )}

      {isTempCompActive && <div className="flex-1 flex flex-col items-center justify-center text-gray-500">Loading...</div>}


      {activeCall && (
        <div className="flex flex-col flex-1">
          <CallSpace call={activeCall?.call}/>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-8 rounded shadow-lg w-80 relative">
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
              Enter Call Password
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

export default CallPanel;