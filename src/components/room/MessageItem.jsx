import React from 'react';
import { format } from 'date-fns'; // You'll need to install this: npm install date-fns

// const MessageItem = ({ message }) => {
//   const user = {
//     id: "user1"
//   }
//   const isUser = message.fromUser === user.id;

//   return (
//     <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
//       <div
//         className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg shadow 
//           ${isUser 
//             ? 'bg-blue-600 text-white rounded-br-none' 
//             : 'bg-gray-700 text-gray-100 rounded-bl-none'}`
//         }
//       >
//         {message.text}
//       </div>
//     </div>
//   );
// };

const MessageItem = ({ message, messages, onReplyClick }) => {
  const user = {
    id: "user1" // Assuming the current user's ID is hardcoded for now
  };
  const isUser = message.fromUser === user.id;
  const repliedToMessage = message.replyTo ? messages.find(msg => msg.id === message.replyTo) : null;

  const handleReplyClick = () => {
    if (repliedToMessage && onReplyClick) {
      onReplyClick(repliedToMessage.id);
    }
  };

  const messageTime = format(new Date(message.time), 'HH:mm'); // Format time
  const messageDate = format(new Date(message.time), 'dd/MM/yy'); // Format date

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-2`}>
      {repliedToMessage && (
        <div
          className={`px-3 py-1 mb-1 rounded-md text-sm cursor-pointer ${
            isUser ? 'bg-blue-400 text-white' : 'bg-gray-600 text-gray-300'
          }`}
          onClick={handleReplyClick}
        >
          Replying to: <span className="italic">{repliedToMessage.text.substring(0, 20)}{repliedToMessage.text.length > 20 ? '...' : ''}</span>
        </div>
      )}
      <div className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg shadow ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-700 text-gray-100 rounded-bl-none'
        }`}
      >
        {message.text}
      </div>
      <div className={`text-xs ${isUser ? 'text-right' : 'text-left'} mt-1 text-gray-400`}>
        {messageDate} - {messageTime}
      </div>
    </div>
  );
};

export default MessageItem;
