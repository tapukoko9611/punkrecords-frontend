import React, { useRef } from 'react';
import MessageItem from './MessageItem';

const MessageList = ({room}) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-900">
      {room.seenMessages.map((msg) => (
        <MessageItem key={msg._id} message={msg} />
      ))}
    </div>
  );
};

export default MessageList;
