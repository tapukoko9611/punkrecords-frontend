import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import FilePanel from "../../components/file/panel";
import { FileContext } from '../../context/FileContext';
import { AuthContext } from '../../context/UserContext';
import useFileSockets from '../../sockets/fileSockets';
import fileApi from '../../api/fileApi';
import { useNavigate } from 'react-router-dom';

const FileLayout = () => {
  const { id: fileNameParam } = useParams();
  const { state: fileState, dispatch: fileDispatch, setCurrentFile, } = useContext(FileContext);
  const { state: authState } = useContext(AuthContext);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [privateFilePassword, setPrivateFilePassword] = useState('');
  const [currentFileAwaitingPassword, setCurrentFileAwaitingPassword] = useState(null);

  const { emitCheckFile, emitJoinFile, } = useFileSockets(fileDispatch, authState.dispatch);

  const allFiles = fileState.files;
  const activeFileId = fileState.currentFileId;
  const activeFile = activeFileId ? allFiles[activeFileId] : null;
  const tempFile = fileState.tempFile;
  const isTempFileActive = fileState.isTempFileActive;
  const navigate = useNavigate();

  // Master useEffect to initiate the File Flow based on URL parameter and Auth State
  useEffect(() => {
    if (fileNameParam && (authState.token && authState.user && authState.user._id)) {
      const token = authState.token;
      const exists = Object.values(fileState.fileOrder).some(item => item.name === fileNameParam);
      if (!exists || (exists && activeFileId==null)) emitCheckFile(fileNameParam, false, "", token);
    } else { }
  }, [fileNameParam, authState.user, emitCheckFile])

  // useEffect to trigger file:join after reciveing searched and the tempFile is set
  useEffect(() => {
    // if temp file (when file is searched and returned but the join isnt triggered yet) -> triggers join if not private
    if (tempFile && isTempFileActive && authState.user && authState.user._id) {

      const isParticipant = tempFile.participants && tempFile.participants[authState.user._id];

      if (tempFile.isPrivate && !isParticipant) {
        setCurrentFileAwaitingPassword(tempFile);
        setShowPasswordModal(true);
        return
      }

      emitJoinFile(tempFile.name, authState.token, privateFilePassword);

      setPrivateFilePassword('');
      setCurrentFileAwaitingPassword(null);

    }
    // if not tempFile and has activeFile (when joined, and messages are empty) -> i dont think its responislbe for anything
    else if (!(tempFile || isTempFileActive) && (activeFile && activeFile._id) && (authState.user && authState.user._id)) { }
  }, [tempFile, isTempFileActive, emitJoinFile, privateFilePassword]);

  // Effect to show the password modal based on activeFile details and user participation
  useEffect(() => {
    if (tempFile && tempFile.isPrivate && authState.user?._id) {
      const isParticipant = tempFile.participants && tempFile.participants[authState.user._id];

      if (!isParticipant && !showPasswordModal) { // Only set to true if not already true
        setCurrentFileAwaitingPassword(activeFile);
        setShowPasswordModal(true);
      } else if (isParticipant && showPasswordModal) { // Hide if user becomes participant and modal is shown
        setShowPasswordModal(false);
        setCurrentFileAwaitingPassword(null);
        setPrivateFilePassword('');
      }
    } else if (showPasswordModal) { // Hide if file is no longer private or no active file
      setShowPasswordModal(false);
      setPrivateFilePassword('');
    }
  }, [tempFile, authState.user, showPasswordModal]);


  const handlePasswordSubmit = () => {
    if (currentFileAwaitingPassword && privateFilePassword && tempFile && isTempFileActive) {
      if (privateFilePassword === tempFile.password) {
        emitJoinFile(currentFileAwaitingPassword.name, authState.token, privateFilePassword);
        setPrivateFilePassword('');
        setCurrentFileAwaitingPassword(null);
      } else {
        alert("Please enter a valid password");
      }
    } else {
      alert("Please enter a password.");
    }
  };

  const closePasswordModal = () => {
    fileDispatch({ type: 'CLEAR_TEMP_FILE', payload: "" });
    setPrivateFilePassword('');
    setCurrentFileAwaitingPassword(null);
  }

  const checkFileExists = async (text) => {
    return (await fileApi.checkFileName("", text));
  };

  const createCustomFile = (fileName, privacy = false, password = "") => {
    emitCheckFile(fileName, privacy, password, authState.token);
    setTimeout(() => {
      navigate(`/file/${fileName}`, { replace: true });
    }, 1000);
  }

  const changeCurrentFile = (fileId, fileName, isSearchResult) => {
    if (!isSearchResult) {
      setCurrentFile(fileId);
      navigate(`/file/${fileName}`, { replace: true });
      fileDispatch({ type: "MARK_CONTENT_AS_SEEN", payload: fileId });
    } else if (authState.token && authState.user && authState.user._id) {
      const token = authState.token;
      emitCheckFile(fileName, false, "", token);
      setTimeout(() => {
      navigate(`/file/${fileName}`, { replace: true });
    }, 1000);
    }
  }

  return (
    <div className="flex flex-row h-screen w-full bg-gray-900 text-white overflow-hidden">
      <Sidebar
        activeComp={activeFileId}
        allComps={allFiles}
        compOrder={fileState.fileOrder}
        setActiveComp={(fileId, fileName, isSearchResult) => changeCurrentFile(fileId, fileName, isSearchResult)}
        tempComp={tempFile}
        isTempCompActive={isTempFileActive}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        compName="file"
        getSearchResult={checkFileExists}
        createComp={createCustomFile}
      />

      <div className="flex-grow flex flex-col overflow-hidden">
        <FilePanel
          tempCom={tempFile}
          isTempCompActive={isTempFileActive}

          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}

          activeFile={activeFile}
          userId={authState.user?._id}

          showPasswordModal={showPasswordModal}
          isCurrentFileAwaitingPassword={!!currentFileAwaitingPassword}
          passwordInput={privateFilePassword}
          setPasswordInput={setPrivateFilePassword}
          handlePasswordSubmit={handlePasswordSubmit}
          closePasswordModal={closePasswordModal}
        />
      </div>
    </div>
  );
}

export default FileLayout;