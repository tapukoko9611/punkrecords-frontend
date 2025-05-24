import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import FilePanel from "../../components/file/panel";

var dummyFiles = {
  "file1": {
    createdBy: "user1",
    createdOn: Date.now(),
    isPrivate: false,
    participants: ["user1", "user2", "user3"],
    password: "",
    type: "txt",
    name: "file1.txt",
    downloads: 10,
    size: 10
  },
  "file2": {
    createdBy: "user2",
    createdOn: Date.now(),
    isPrivate: true,
    participants: ["user1", "user2", "user3"],
    password: "file2",
    type: "jpg",
    name: "file2.jpg",
    downloads: 0,
    size: 4
  },
  "file3": {
    createdBy: "user3",
    createdOn: Date.now(),
    isPrivate: false,
    participants: ["user1", "user3"],
    password: "",
    type: "txt",
    name: "",
    downloads: 0,
    size: 0
  },
};

const FileLayout = () => {
  const [activeFile, setActiveFile] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [allFiles, setAllFiles] = useState(dummyFiles);

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white overflow-hidden">
      {/* Left Sidebar */}
      {sidebarOpen && (
        <Sidebar
          activeComp={activeFile}
          setActiveComp={(fileName) => {setActiveFile(fileName)}}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          allComps={allFiles}
          compName="file"
        />
      )}

      {/* Right File Panel */}
      <FilePanel
        activeFile={activeFile}
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        file={(activeFile.length==0)? null: allFiles[activeFile]}
      />
    </div>
  );
};

export default FileLayout;
