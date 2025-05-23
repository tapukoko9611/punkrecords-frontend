// import React from 'react';
// import { format } from 'date-fns'; // You'll need to install this: npm install date-fns

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

import React, { useContext } from 'react';
import { format } from 'date-fns';
import { AuthContext } from '../../context/UserContext';
import { FiCornerUpLeft } from 'react-icons/fi';

const MessageItem = ({ 
  message, 
  messages, 
  onSetReply, 
  onScrollToMessage 
}) => {
  const { state: authState } = useContext(AuthContext);
  const currentUser = authState.user;
  const isUser = currentUser?._id === message.fromUser;
  const repliedToMessage = message.replyTo ? messages?.find(msg => msg._id === message.replyTo) : null;

  const handleScrollToReply = (replyId) => {
    if (onScrollToMessage) {
      onScrollToMessage(replyId);
    }
  };

  const messageDateObj = message.createdAt ? new Date(message.createdAt) : new Date();
  const messageTime = format(messageDateObj, 'HH:mm');
  const messageDate = format(messageDateObj, 'dd/MM/yy');

  return (
    <div
      // Clicking on the bubble itself will trigger setting reply (if you want the whole item clickable)
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-3 cursor-pointer`}
      onClick={() => onSetReply && onSetReply(message)}
    >
      {repliedToMessage && (
        <div
          className={`px-3 py-1 mb-2 rounded-md text-sm ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-100'}`}
          onClick={(e) => {
            e.stopPropagation();
            handleScrollToReply(repliedToMessage._id);
          }}
          title={`Replying to: ${repliedToMessage.body}`}
        >
          <span className="italic">
            Replying to: {repliedToMessage.body.substring(0, 30)}
            {repliedToMessage.body.length > 30 ? '...' : ''}
          </span>
        </div>
      )}

      <div
        className={`relative max-w-xs sm:max-w-md px-4 py-2 rounded-lg shadow-md ${
          isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-100 rounded-bl-none'
        }`}
      >
        <p>{message.body}</p>
        {/* Reply Icon Button */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent triggering the parent's onClick
            onSetReply && onSetReply(message);
          }}
          className="absolute bottom-1 right-1 text-gray-300 hover:text-gray-100"
          title="Reply"
        >
          <FiCornerUpLeft />
        </button>
      </div>

      <div className="flex flex-col text-xs text-gray-400 mt-1">
        <span>{messageDate} - {messageTime}</span>
        <span>ID: {message.fromUser}</span>
      </div>
    </div>
  );
};

const MessageItem3 = ({ message, messages, onReplyClick }) => {
  const { state: authState } = useContext(AuthContext);
  const currentUser = authState.user;
  const isUser = currentUser?._id === message.fromUser;
  const repliedToMessage = message.replyTo ? messages?.find(msg => msg._id === message.replyTo) : null;

  const handleReplyClick = () => {
    if (repliedToMessage && onReplyClick) {
      onReplyClick(repliedToMessage._id);
    }
  };

  const messageDateObj = message.createdAt ? new Date(message.createdAt) : new Date();
  const messageTime = format(messageDateObj, 'HH:mm');
  const messageDate = format(messageDateObj, 'dd/MM/yy');

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-3`}>
      {repliedToMessage && (
        <div
          className={`px-3 py-1 mb-2 rounded-md text-sm cursor-pointer ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-100'}`}
          onClick={handleReplyClick}
          title={`Replying to: ${repliedToMessage.body}`}
        >
          <span className="italic">
            Replying to: {repliedToMessage.body.substring(0, 30)}
            {repliedToMessage.body.length > 30 ? '...' : ''}
          </span>
        </div>
      )}

      <div
        className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg shadow-md ${
          isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-100 rounded-bl-none'
        }`}
      >
        <p>{message.body}</p>
      </div>

      <div className="flex flex-col text-xs text-gray-400 mt-1">
        <span>{messageDate} - {messageTime}</span>
        <span>ID: {message.fromUser}</span>
      </div>
    </div>
  );
};

const MessageItem2 = ({ message, messages, onReplyClick }) => {
  // Use useContext to get the user state from AuthContext
  const { state: authState } = useContext(AuthContext);
  const currentUser = authState.user; // Get the current user object

  // Determine if the message is from the current user
  // Use optional chaining (?._id) in case currentUser is null initially
  const isUser = currentUser?._id === message.fromUser;

  // Find the message being replied to from the list of all messages
  // Use optional chaining (?.) in case messages array is not provided or empty
  const repliedToMessage = message.replyTo ?
    messages?.find(msg => msg._id === message.replyTo) // Assuming message.replyTo is the _id string
    : null;

  // Handle click on reply text (if onReplyClick prop is provided)
  const handleReplyClick = () => {
    if (repliedToMessage && onReplyClick) {
      onReplyClick(repliedToMessage._id); // Pass the ID of the replied-to message
    }
  };

  // Format date and time
  // Add checks to ensure message.time is a valid date source
  const messageDateObj = message.createdAt ? new Date(message.createdAt) : new Date(); // Fallback to now if time is missing/invalid
  const messageTime = format(messageDateObj, 'HH:mm');
  const messageDate = format(messageDateObj, 'dd/MM/yy');

  return (
    // Main container for the message item, uses flexbox and aligns based on isUser
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-2`}>

      {/* Display reply preview if message replies to another message */}
      {repliedToMessage && (
        // Clickable div for replying to the parent message
        <div
          className={`px-3 py-1 mb-1 rounded-md text-sm cursor-pointer ${isUser ? 'bg-blue-400 text-white' : 'bg-gray-600 text-gray-300' // Styling based on who sent the original message
            }`}
          onClick={handleReplyClick}
          title={`Replying to: ${repliedToMessage.body}`} // Add tooltip
        >
          Replying to: <span className="italic">{repliedToMessage.text?.substring(0, 30)}{repliedToMessage.text?.length > 30 ? '...' : ''}</span> {/* Display truncated reply text */}
        </div>
      )}

      {/* Message bubble */}
      <div className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg shadow ${isUser
          ? 'bg-blue-600 text-white rounded-br-none' // Style for current user's message
          : 'bg-gray-700 text-gray-100 rounded-bl-none' // Style for other users' messages
        }`}
      >
        {message.body} {/* Display message text */}
      </div>

      {/* Message timestamp */}
      <div className={`text-xs ${isUser ? 'text-right' : 'text-left'} mt-1 text-gray-400`}>
        {/* Display formatted date and time */}
        {messageDate} - {messageTime}
      </div>
      {/* TODO: Add message status indicator (sending, sent, delivered, read) */}
      {/* {isUser && <span className="text-xs text-gray-500 ml-1">Sent</span>} */}
    </div>
  );
};

const MessageItem1 = ({ message, messages, onReplyClick }) => {
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
          className={`px-3 py-1 mb-1 rounded-md text-sm cursor-pointer ${isUser ? 'bg-blue-400 text-white' : 'bg-gray-600 text-gray-300'
            }`}
          onClick={handleReplyClick}
        >
          Replying to: <span className="italic">{repliedToMessage.text.substring(0, 20)}{repliedToMessage.text.length > 20 ? '...' : ''}</span>
        </div>
      )}
      <div className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg shadow ${isUser
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



// import { format } from 'date-fns';
// import React, { useState } from 'react';
// import { FiCornerUpLeft } from 'react-icons/fi';

// const MessageItem = ({ message, messages, onReply }) => {
//     const [isHovering, setIsHovering] = useState(false);
//     const user = {
//         id: "user1" // Assuming the current user's ID is hardcoded for now
//     };
//     const isUser = message.fromUser === user.id;
//     const repliedToMessage = message.replyTo ? messages.find(msg => msg.id === message.replyTo) : null;

//     const handleReplyClick = () => {
//         if (onReply) {
//             onReply(message); // Call the onReply prop with the message
//         }
//     };

//     const messageTime = format(new Date(message.time), 'HH:mm'); // Format time
//     const messageDate = format(new Date(message.time), 'dd/MM/yy'); // Format date

//     return (
//         <div
//             className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-2 relative`}
//             onMouseEnter={() => setIsHovering(true)}
//             onMouseLeave={() => setIsHovering(false)}
//         >
//             {repliedToMessage && (
//                 <div
//                     className={`px-3 py-1 mb-1 rounded-md text-sm cursor-pointer ${
//                         isUser ? 'bg-blue-400 text-white' : 'bg-gray-600 text-gray-300'
//                     }`}
//                     onClick={() => onReply(repliedToMessage)} // Allow clicking on replied-to message to also trigger reply
//                 >
//                     Replying to: <span className="italic">{repliedToMessage.text.substring(0, 20)}{repliedToMessage.text.length > 20 ? '...' : ''}</span>
//                 </div>
//             )}
//             <div
//                 className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg shadow ${
//                     isUser
//                         ? 'bg-blue-600 text-white rounded-br-none'
//                         : 'bg-gray-700 text-gray-100 rounded-bl-none'
//                 } ${isHovering ? 'cursor-pointer' : ''}`}
//                 onClick={handleReplyClick} // Call handleReplyClick on message click
//                 title={isHovering ? 'Click to reply' : ''}
//             >
//                 {message.text}
//                 {isHovering && (
//                     <FiCornerUpLeft className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400" />
//                 )}
//             </div>
//             <div className={`text-xs ${isUser ? 'text-right' : 'text-left'} mt-1 text-gray-400`}>
//                 {messageDate} - {messageTime}
//             </div>
//         </div>
//     );
// };

// export default MessageItem;