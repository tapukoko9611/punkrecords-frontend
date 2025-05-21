import React, { useState } from 'react';

const CreateRoomModal = ({ onClose, onCreateRoom }) => {
    const [roomName, setRoomName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');

    const handleCreate = () => {
        if (!roomName.trim()) {
            alert('Please enter a room name.');
            return;
        }
        const roomDetails = {
            roomName: roomName.trim(),
            isPrivate: isPrivate,
            password: isPrivate ? password : '',
        };
        const token = localStorage.getItem('authToken');
        onCreateRoom(roomDetails, token);
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-8 rounded shadow-lg w-96">
                <h2 className="text-xl font-semibold text-gray-300 mb-4">Create New Room</h2>
                <div className="mb-4">
                    <label htmlFor="roomName" className="block text-gray-400 text-sm mb-2">Room Name:</label>
                    <input
                        type="text"
                        id="roomName"
                        className="w-full p-3 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                    />
                </div>
                <div className="mb-4 flex items-center">
                    <input
                        type="checkbox"
                        id="isPrivate"
                        className="mr-2 form-checkbox h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                    />
                    <label htmlFor="isPrivate" className="text-gray-400 text-sm">Private Room</label>
                </div>
                {isPrivate && (
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-400 text-sm mb-2">Password:</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full p-3 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                )}
                <div className="flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-gray-300 hover:text-white bg-gray-700 rounded-md mr-2">Cancel</button>
                    <button onClick={handleCreate} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md">Create</button>
                </div>
            </div>
        </div>
    );
};

export default CreateRoomModal;