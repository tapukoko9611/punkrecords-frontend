import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import EditorPanel from "../../components/editor/panel";
import { EditorContext } from '../../context/EditorContext';
import { AuthContext } from '../../context/UserContext';
import useEditorSockets from '../../sockets/editorSockets';
import editorApi from '../../api/editorApi';
import { useNavigate } from 'react-router-dom';

const EditorLayout = () => {
  const { id: editorNameParam } = useParams();
  const { state: editorState, dispatch: editorDispatch, setCurrentEditor, } = useContext(EditorContext);
  const { state: authState } = useContext(AuthContext);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [privateEditorPassword, setPrivateEditorPassword] = useState('');
  const [currentEditorAwaitingPassword, setCurrentEditorAwaitingPassword] = useState(null);

  const { emitCheckEditor, emitJoinEditor, } = useEditorSockets(editorDispatch, authState.dispatch);

  const allEditors = editorState.editors;
  const activeEditorId = editorState.currentEditorId;
  const activeEditor = activeEditorId ? allEditors[activeEditorId] : null;
  const tempEditor = editorState.tempEditor;
  const isTempEditorActive = editorState.isTempEditorActive;
  const navigate = useNavigate();

  // Master useEffect to initiate the Editor Flow based on URL parameter and Auth State
  useEffect(() => {
    if (editorNameParam && (authState.token && authState.user && authState.user._id)) {
      const token = authState.token;
      const exists = Object.values(editorState.editorOrder).some(item => item.name === editorNameParam);
      if (!exists || (exists && activeEditorId==null)) emitCheckEditor(editorNameParam, false, "", token);
    } else { }
  }, [editorNameParam, authState.user, emitCheckEditor])

  // useEffect to trigger editor:join after reciveing searched and the tempEditor is set
  useEffect(() => {
    // if temp editor (when editor is searched and returned but the join isnt triggered yet) -> triggers join if not private
    if (tempEditor && isTempEditorActive && authState.user && authState.user._id) {

      const isParticipant = tempEditor.participants && tempEditor.participants[authState.user._id];

      if (tempEditor.isPrivate && !isParticipant) {
        setCurrentEditorAwaitingPassword(tempEditor);
        setShowPasswordModal(true);
        return
      }

      emitJoinEditor(tempEditor.name, authState.token, privateEditorPassword);

      setPrivateEditorPassword('');
      setCurrentEditorAwaitingPassword(null);

    }
    // if not tempEditor and has activeEditor (when joined, and messages are empty) -> i dont think its responislbe for anything
    else if (!(tempEditor || isTempEditorActive) && (activeEditor && activeEditor._id) && (authState.user && authState.user._id)) { }
  }, [tempEditor, isTempEditorActive, emitJoinEditor, privateEditorPassword]);

  // Effect to show the password modal based on activeEditor details and user participation
  useEffect(() => {
    if (tempEditor && tempEditor.isPrivate && authState.user?._id) {
      const isParticipant = tempEditor.participants && tempEditor.participants[authState.user._id];

      if (!isParticipant && !showPasswordModal) { // Only set to true if not already true
        setCurrentEditorAwaitingPassword(activeEditor);
        setShowPasswordModal(true);
      } else if (isParticipant && showPasswordModal) { // Hide if user becomes participant and modal is shown
        setShowPasswordModal(false);
        setCurrentEditorAwaitingPassword(null);
        setPrivateEditorPassword('');
      }
    } else if (showPasswordModal) { // Hide if editor is no longer private or no active editor
      setShowPasswordModal(false);
      setPrivateEditorPassword('');
    }
  }, [tempEditor, authState.user, showPasswordModal]);


  const handlePasswordSubmit = () => {
    if (currentEditorAwaitingPassword && privateEditorPassword && tempEditor && isTempEditorActive) {
      if (privateEditorPassword === tempEditor.password) {
        emitJoinEditor(currentEditorAwaitingPassword.name, authState.token, privateEditorPassword);
        setPrivateEditorPassword('');
        setCurrentEditorAwaitingPassword(null);
      } else {
        alert("Please enter a valid password");
      }
    } else {
      alert("Please enter a password.");
    }
  };

  const closePasswordModal = () => {
    editorDispatch({ type: 'CLEAR_TEMP_EDITOR', payload: "" });
    setPrivateEditorPassword('');
    setCurrentEditorAwaitingPassword(null);
  }

  const checkEditorExists = async (text) => {
    return (await editorApi.checkEditorName("", text));
  };

  const createCustomEditor = (editorName, privacy = false, password = "") => {
    emitCheckEditor(editorName, privacy, password, authState.token);
    setTimeout(() => {
      navigate(`/editor/${editorName}`, { replace: true });
    }, 1000);
  }

  const changeCurrentEditor = (editorId, editorName, isSearchResult) => {
    if (!isSearchResult) {
      setCurrentEditor(editorId);
      navigate(`/editor/${editorName}`, { replace: true });
      editorDispatch({ type: "MARK_CONTENT_AS_SEEN", payload: editorId });
    } else if (authState.token && authState.user && authState.user._id) {
      const token = authState.token;
      emitCheckEditor(editorName, false, "", token);
      setTimeout(() => {
      navigate(`/editor/${editorName}`, { replace: true });
    }, 1000);
    }
  }

  return (
    <div className="flex flex-row h-screen w-full bg-gray-900 text-white overflow-hidden">
      <Sidebar
        activeComp={activeEditorId}
        allComps={allEditors}
        compOrder={editorState.editorOrder}
        setActiveComp={(editorId, editorName, isSearchResult) => changeCurrentEditor(editorId, editorName, isSearchResult)}
        tempComp={tempEditor}
        isTempCompActive={isTempEditorActive}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        compName="editor"
        getSearchResult={checkEditorExists}
        createComp={createCustomEditor}
      />

      <div className="flex-grow flex flex-col overflow-hidden">
        <EditorPanel
          tempCom={tempEditor}
          isTempCompActive={isTempEditorActive}

          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}

          activeEditor={activeEditor}
          userId={authState.user?._id}

          showPasswordModal={showPasswordModal}
          isCurrentEditorAwaitingPassword={!!currentEditorAwaitingPassword}
          passwordInput={privateEditorPassword}
          setPasswordInput={setPrivateEditorPassword}
          handlePasswordSubmit={handlePasswordSubmit}
          closePasswordModal={closePasswordModal}
        />
      </div>
    </div>
  );
}

export default EditorLayout;