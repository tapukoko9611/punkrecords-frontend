import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import MessageItem from './MessageItem';

const MessageList3 = ({ room, onScrollToMessage, onSetReply, userId }) => {
  const containerRef = useRef(null);

  // Sort messages in ascending order (oldest first) for display.
  const sortedMessages = room && room.seenMessages
    ? [...room.seenMessages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    : [];

  useEffect(() => {
    if (sortedMessages.length > 0 && containerRef.current) {
      const lastMessage = sortedMessages[sortedMessages.length - 1];
      // Optionally, if the last message was sent by the current user, scroll to the bottom
      if (lastMessage.fromUser === userId) {
        setTimeout(() => {
          containerRef.current.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }, 200);
      }
    }
  }, [sortedMessages, userId]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-900"
    >
      {sortedMessages.map((msg) => (
        <div id={msg._id} key={msg._id}>
          <MessageItem
            message={msg}
            messages={sortedMessages}
            onSetReply={onSetReply}
            onScrollToMessage={onScrollToMessage}
          />
        </div>
      ))}
    </div>
  );
};

const MessageList = ({ room, onScrollToMessage, onSetReply, userId,onLoadMore }) => {
  const containerRef = useRef(null);
  const [showLoadMore, setShowLoadMore] = useState(false);

  useLayoutEffect(() => {
    // if (containerRef.current) {
    //   // Log for debugging
    //   const { scrollHeight, clientHeight } = containerRef.current;
    //   console.log('scrollHeight:', scrollHeight, 'clientHeight:', clientHeight);
    //   // If the container’s content is taller than its visible area, enable load more.
    //   setShowLoadMore(scrollHeight > clientHeight);
    // }
    setShowLoadMore(room.seenMessages.length>=10)
  }, [room.seenMessages]);

  useEffect(() => {
    if (room && room.seenMessages && room.seenMessages.length > 0 && containerRef.current) {
      const lastMessage = room.seenMessages[room.seenMessages.length - 1];
      if (lastMessage.fromUser === userId) {
        setTimeout(() => {
          containerRef.current.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }, 200);
      }
    }
  }, [room.seenMessages, userId]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-900"
    >

{showLoadMore && (
        <div className="w-full text-center py-2">
          <button 
            onClick={onLoadMore} 
            className="text-blue-500 hover:underline"
          >
            Load More
          </button>
        </div>
      )}

      {room.seenMessages.map((msg) => (
        <div id={msg._id} key={msg._id}>
          <MessageItem
            message={msg}
            messages={room.seenMessages}
            onSetReply={onSetReply}
            onScrollToMessage={onScrollToMessage}
          />
        </div>
      ))}
    </div>
  );
};

const MessageList2 = ({ room, onScrollToMessage, onSetReply }) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-900">
      {room.seenMessages.map((msg) => (
        <div id={msg._id} key={msg._id}>
          <MessageItem
            message={msg}
            messages={room.seenMessages}
            onSetReply={onSetReply}
            onScrollToMessage={onScrollToMessage}
          />
        </div>
      ))}
    </div>
  );
};

const MessageList1 = ({ room }) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-900">
      {room.seenMessages.map((msg) => (
        <MessageItem key={msg._id} message={msg} />
      ))}
    </div>
  );
};

export default MessageList;
