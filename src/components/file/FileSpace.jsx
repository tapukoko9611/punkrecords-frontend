import React from 'react';
import { FiFile } from "react-icons/fi";

const FileSpace = ({ file }) => {
  // Destructure the file object
  const { name, size, downloads } = file || {};

  const handleActionButtonClick = () => {
    if (!name) {
      // Handle Upload action
      console.log('Uploading file...');
    } else {
      // Handle Download action
      console.log('Downloading file...');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      {/* Full Screen File Layout */}
      <div className="flex flex-col justify-center items-center w-full h-full bg-gray-900 text-white space-y-6 p-8">
        {/* File Icon Section */}
        <div className="flex flex-col items-center space-y-4">
          {/* File Icon */}
          <div className="w-32 h-32 bg-gray-600 rounded-full flex justify-center items-center mb-4">
            {/* <img
              src="https://via.placeholder.com/100" 
              alt="File Icon" 
              className="w-20 h-20 object-cover"
            /> */}
            <FiFile className="text-xl text-gray-400 hover:text-white transition w-20 h-20 object-cover" />
          </div>
          {/* File Name */}
          {name && (
            <h3 className="text-lg font-semibold text-center">{name}</h3>
          )}
          {!name && (
            <h3 className="text-lg font-semibold text-center">...</h3>
          )}
        </div>

        {/* Action Button Section */}
        <div className="flex justify-center">
          <button
            onClick={handleActionButtonClick}
            className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none"
          >
            {name ? 'Download' : 'Upload'}
          </button>
        </div>

        {/* File Details Section (Size & Downloads) */}
        <div className="flex justify-between w-full mt-6">
          {/* File Size */}
          <div className="flex flex-col items-center w-1/2">
            <span className="text-2xl font-semibold">{size || 'N/A'}</span>
            <span className="text-xs">Size</span>
          </div>

          {/* File Downloads */}
          <div className="flex flex-col items-center w-1/2">
            <span className="text-2xl font-semibold">{downloads || 'N/A'}</span>
            <span className="text-xs">Downloads</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileSpace;
