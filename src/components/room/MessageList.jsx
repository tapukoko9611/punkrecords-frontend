import React, { useRef } from 'react';
import MessageItem from './MessageItem';

// const MessageList = ({room}) => {
//   return (
//     <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-900">
//       {room.messages.map((msg) => (
//         <MessageItem key={msg.id} message={msg} />
//       ))}
//     </div>
//   );
// };

const MessageList = ({ room }) => {
  const messageRefs = useRef({});

  const handleReplyClick = (repliedToId) => {
    if (messageRefs.current[repliedToId]) {
      messageRefs.current[repliedToId].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      // Optionally add highlighting effect here
      // For example:
      const element = messageRefs.current[repliedToId];
      element.classList.add('bg-yellow-500'); // Add a highlight class
      setTimeout(() => {
        element.classList.remove('bg-yellow-500'); // Remove after a delay
      }, 1500);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-900">
      {room.messages.map((msg) => (
        <MessageItem
          key={msg.id}
          message={msg}
          messages={room.messages} // Pass the entire messages array
          onReplyClick={handleReplyClick} // Pass the handler function
          ref={el => (messageRefs.current[msg.id] = el)} // Set up refs
        />
      ))}
    </div>
  );
};

export default MessageList;
