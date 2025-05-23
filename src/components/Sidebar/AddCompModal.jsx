import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const AddCompModal = ({ compType = 'Room', onClose, onCreate, checkCompExists }) => {
  const [compName, setCompName] = useState('');
  const [compNameAvailability, setCompNameAvailability] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [checkLoading, setCheckLoading] = useState(false);

  useEffect(() => {
    if (!compName.trim()) {
      setCompNameAvailability(null);
      setCheckLoading(false);
      return;
    }
    setCheckLoading(true);
    const timer = setTimeout(async () => {
      const exists = await checkCompExists(compName);
      setCompNameAvailability(exists);
      setCheckLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [compName, checkCompExists]);

  const handleSubmit = () => {
    if (!compName.trim()) return;
    if (isPrivate && !password.trim()) {
      alert("Please enter a password for the private component.");
      return;
    }
    if (compNameAvailability) {
      alert(`${compType} name already exists. Please choose another one.`);
      return;
    }

    onCreate({ compName, isPrivate, password });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-96 border border-gray-700">
        <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
          <h2 className="text-xl font-semibold text-gray-300">Create New {compType}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Component Name Field */}
        <div className="mb-4">
          <input
            type="text"
            placeholder={`${compType} Name`}
            className={`w-full p-3 mb-1 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 ${
              compNameAvailability === true
                ? 'focus:ring-red-500'
                : compNameAvailability === false
                ? 'focus:ring-green-500'
                : 'focus:ring-blue-500'
            }`}
            value={compName}
            onChange={(e) => setCompName(e.target.value)}
          />
          {checkLoading && (
            <p className="text-gray-500 text-xs mt-1">Checking availability...</p>
          )}
          {compNameAvailability === true && (
            <p className="text-red-500 text-xs mt-1">{compType} name already taken.</p>
          )}
          {compNameAvailability === false && compName.trim() !== '' && !checkLoading && (
            <p className="text-green-500 text-xs mt-1">{compType} name available.</p>
          )}
        </div>

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
              placeholder="Password"
              className="w-full p-3 mb-1 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-blue-600 rounded-md text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default AddCompModal;