// RoomInfoModal.js
import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const RoomInfoModal = ({ room, isCreator, onClose, onUpdatePrivacy }) => {
  // Local state for privacy editing — these default to room settings.
  const [isPrivate, setIsPrivate] = useState(room.isPrivate);
  const [password, setPassword] = useState(room.password || '');

  // Calculate number of participants (assuming room.participants is an object)
  const participantCount = room.participants
    ? Object.keys(room.participants).length
    : 0;

  const handleSave = () => {
    // Pass the new privacy settings to the parent.
    onUpdatePrivacy({ isPrivate, password });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-96 border border-gray-700 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          aria-label="Close room info modal"
        >
          <FiX className="text-xl" />
        </button>

        <h2 className="text-xl font-semibold text-gray-300 mb-4">
          Room Information
        </h2>

        <div className="mb-4">
          <p className="text-gray-400">Room Name:</p>
          <p className="text-white">{room.name}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-400">Participants:</p>
          <p className="text-white">{participantCount}</p>
        </div>

        {/* If user is not the creator, just show info */}
        {!isCreator && (
          <div className="mb-4">
            <p className="text-gray-400">Private:</p>
            <p className="text-white">{room.isPrivate ? 'Yes' : 'No'}</p>
          </div>
        )}

        {/* If the user is the room creator, allow editing privacy */}
        {isCreator && (
          <>
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={() => setIsPrivate(!isPrivate)}
                  className="form-checkbox text-blue-500"
                />
                <span className="ml-2 text-gray-300">Private</span>
              </label>
            </div>
            {isPrivate && (
              <div className="mb-4">
                <input
                  type="password"
                  placeholder="Room Password"
                  className="w-full p-3 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
            <button
              onClick={handleSave}
              className="w-full py-3 bg-blue-600 rounded-md text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RoomInfoModal;
