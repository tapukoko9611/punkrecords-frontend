import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiSend } from 'react-icons/fi';

const MessageInput = ({ room, userId, sendMessage, replyMessage, cancelReply, onScrollToReply }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height so we can recalc based on content
      textarea.style.height = 'auto';
      if (input.trim() === '') {
        // If empty, constrain to one line (adjust height as needed)
        textarea.style.height = '40px';
      } else {
        // Grow height to match content (up to a max height; beyond that, vertical scrolling will occur)
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }
  }, [input]);

  const handleKeyDown = (e) => {
    // On plain Enter, prevent newline and send message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter will create a newline (default behavior)
  };

  const handleSend = () => {
    if (input.trim() === '') return;
    sendMessage(input, replyMessage ? replyMessage._id : null);
    setInput('');
    if (replyMessage) cancelReply();
  };

  return (
    <div className="flex flex-col p-4 bg-gray-800 border-t border-gray-700">
      {replyMessage && (
        <div
          onClick={() => onScrollToReply && onScrollToReply(replyMessage._id)}
          className="flex items-center justify-between bg-gray-700 p-2 rounded-md mb-2 cursor-pointer"
        >
          <div className="flex flex-col">
            <span className="text-sm text-gray-300">Replying to:</span>
            <span className="text-sm text-white line-clamp-1">
              {replyMessage.body}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              cancelReply();
            }}
            className="text-gray-400 hover:text-white"
          >
            <FiX className="text-xl" />
          </button>
        </div>
      )}
      <div className="flex items-center">
        <textarea
          ref={textareaRef}
          rows="1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 p-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          style={{
            maxHeight: '150px',
            overflowY: input.trim() ? 'auto' : 'hidden' // Hide scrollbar when empty
          }}
        />
        <button
          onClick={handleSend}
          className="ml-3 p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition"
        >
          <FiSend className="text-white text-xl" />
        </button>
      </div>
    </div>
  );
};

const MessageInput2 = ({ room, userId, sendMessage, replyMessage, cancelReply, onScrollToReply }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;
    // Send the message along with reply information, if any
    sendMessage(input, replyMessage ? replyMessage._id : null);
    setInput('');
    if (replyMessage) cancelReply();
  };

  return (
    <div className="flex flex-col p-4 bg-gray-800 border-t border-gray-700">
      {replyMessage && (
        <div
          onClick={() => onScrollToReply && onScrollToReply(replyMessage._id)}
          className="flex items-center justify-between bg-gray-700 p-2 rounded-md mb-2 cursor-pointer"
        >
          <div className="flex flex-col">
            <span className="text-sm text-gray-300">Replying to:</span>
            <span className="text-sm text-white line-clamp-1">
              {replyMessage.body}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              cancelReply();
            }}
            className="text-gray-400 hover:text-white"
          >
            <FiX className="text-xl" />
          </button>
        </div>
      )}
      <div className="flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="ml-3 p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition"
        >
          <FiSend className="text-white text-xl" />
        </button>
      </div>
    </div>
  );
};

const MessageInput1 = ({ room, userId, sendMessage }) => {
  const [input, setInput] = useState('');
  var replyTo = null;

  const handleSend = () => {
    if (input.trim() === '') return;
    sendMessage(input, replyTo);
    setInput('');
  };

  return (
    <div className="flex items-center p-4 bg-gray-800 border-t border-gray-700">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 p-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSend}
        className="ml-3 p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition"
      >
        <FiSend className="text-white text-xl" />
      </button>
    </div>
  );
};

export default MessageInput;