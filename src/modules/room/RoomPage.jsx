import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import RoomPanel from "../../components/room/panel";

var dummyRooms = {
  "room1": {
    createdBy: "user1",
    createdOn: Date.now(),
    isPrivate: false,
    participants: ["user1", "user2", "user3"],
    password: "",
    messages: [{
      id: "1",
      roomName: "room1",
      fromUser: "user1",
      time: Date.now(),
      text: "hello bro",
      replyTo: "",
    },
    {
      id: "2",
      roomName: "room1",
      fromUser: "user2",
      time: Date.now(),
      text: "hey",
      replyTo: "",
    },
    {
      id: "3",
      roomName: "room1",
      fromUser: "user3",
      time: Date.now(),
      text: "yo",
      replyTo: "1",
    },
    {
      id: "4",
      roomName: "room1",
      fromUser: "user1",
      time: Date.now(),
      text: "ossu",
      replyTo: "3",
    },]
  },
  "room2": {
    createdBy: "user2",
    createdOn: Date.now(),
    isPrivate: true,
    participants: ["user1", "user2", "user3"],
    password: "room2",
    messages: [{
      id: "1",
      roomName: "room2",
      fromUser: "user2",
      time: Date.now(),
      text: "d",
      replyTo: "",
    },
    {
      id: "2",
      roomName: "room2",
      fromUser: "user1",
      time: Date.now(),
      text: "o",
      replyTo: "",
    },
    {
      id: "3",
      roomName: "room2",
      fromUser: "user3",
      time: Date.now(),
      text: "c",
      replyTo: "2",
    },
    {
      id: "4",
      roomName: "room2",
      fromUser: "user1",
      time: Date.now(),
      text: "k",
      replyTo: "3",
    },]
  },
  "room3": {
    createdBy: "user3",
    createdOn: Date.now(),
    isPrivate: false,
    participants: ["user1", "user3"],
    password: "",
    messages: [{
      id: "1",
      roomName: "room3",
      fromUser: "user1",
      time: Date.now(),
      text: "o",
      replyTo: "",
    },
    {
      id: "2",
      roomName: "room3",
      fromUser: "user3",
      time: Date.now(),
      text: "f",
      replyTo: "",
    },
    {
      id: "3",
      roomName: "room3",
      fromUser: "user3",
      time: Date.now(),
      text: "f",
      replyTo: "2",
    },]
  },
};

const RoomLayout = () => {
  const [activeRoom, setActiveRoom] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [allRooms, setAllRooms] = useState(dummyRooms);

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white overflow-hidden">
      {/* Left Sidebar */}
      {sidebarOpen && (
        <Sidebar
          activeComp={activeRoom}
          setActiveComp={(roomName) => {setActiveRoom(roomName)}}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          allComps={allRooms}
          compName="room"
        />
      )}

      {/* Right Room Panel */}
      <RoomPanel
        activeRoom={activeRoom}
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        room={(activeRoom.length==0)? null: allRooms[activeRoom]}
      />
    </div>
  );
};

export default RoomLayout;
