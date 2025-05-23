import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import EditorPanel from "../../components/editor/panel";

var dummyEditors = {
  "editor1": {
    createdBy: "user1",
    createdOn: Date.now(),
    isPrivate: false,
    participants: ["user1", "user2", "user3"],
    password: "",
    language: "txt",
    text: "abc\ncsadf\nsdf\nasdf\nsdfgasd",
  },
  "editor2": {
    createdBy: "user2",
    createdOn: Date.now(),
    isPrivate: true,
    participants: ["user1", "user2", "user3"],
    password: "editor2",
    language: "txt",
    text: "def\nsadfilusyadfasdfkuasl erlaskhdfvl kashldfas kljhfljksahf lsakjhfl iashf",
  },
  "editor3": {
    createdBy: "user3",
    createdOn: Date.now(),
    isPrivate: false,
    participants: ["user1", "user3"],
    password: "",
    language: "txt",
    text: "ghi",
  },
};

const EditorLayout = () => {
  const [activeEditor, setActiveEditor] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [allEditors, setAllEditors] = useState(dummyEditors);

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white overflow-hidden">
      {/* Left Sidebar */}
      {sidebarOpen && (
        <Sidebar
          activeComp={activeEditor}
          setActiveComp={(editorName) => { console.log(editorName); return setActiveEditor(editorName) }}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          allComps={allEditors}
          compName="editor"
        />
      )}

      {/* Right Editor Panel */}
      <EditorPanel
        activeEditor={activeEditor}
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        editor={(activeEditor.length == 0) ? null : allEditors[activeEditor]}
      />
    </div>
  );
};

export default EditorLayout;
