import React, { useState } from 'react';
import { FiSend } from 'react-icons/fi';

const MessageInput = () => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;
    console.log('Send:', input);
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
