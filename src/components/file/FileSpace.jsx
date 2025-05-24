import React from 'react';
import { FiFile } from "react-icons/fi";

const FileSpace = ({ file, updateFileCont }) => {
  const { name, fileUrl, fileSize, fileType, downloads } = file || {};

  const handleActionButtonClick = async () => {
    if (!fileUrl) {
      const cloudName = 'doz9vxvqz';
      const uploadPreset = 'punkrecords';

      // Open the Cloudinary widget
      window.cloudinary.openUploadWidget(
        {
          cloudName,
          uploadPreset,
          sources: ['local', 'url'],
          multiple: false,
          cropping: false,
          resourceType: 'auto',
          maxFileSize: 10000000,
        },
        (error, result) => {
          if (!error && result && result.event === 'success') {
            const uploadInfo = result.info;
            console.log('Upload successful: ', uploadInfo);
            const uploadedFileDetails = {
              name: uploadInfo.original_filename,
              fileUrl: uploadInfo.secure_url,
              fileSize: uploadInfo.bytes,
              fileType: uploadInfo.format,
              downloads: 0,
            };
            console.log(uploadedFileDetails);
            updateFileCont(uploadedFileDetails.fileUrl, uploadedFileDetails.fileSize, uploadedFileDetails.fileType);
          } else if (error) {
            console.error('Upload error: ', error);
          }
        }
      );
    } else {
      window.open(fileUrl, '_blank');
      const downloadUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/');

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="flex flex-col justify-center items-center w-full h-full bg-gray-900 text-white space-y-6 p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 bg-gray-600 rounded-full flex justify-center items-center mb-4">
            <FiFile className="text-xl text-gray-400 hover:text-white transition w-20 h-20 object-cover" />
          </div>
          {fileUrl && (
            <h3 className="text-lg font-semibold text-center">{name + "." + fileType}</h3>
          )}
          {!fileUrl && (
            <h3 className="text-lg font-semibold text-center">...</h3>
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleActionButtonClick}
            className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none"
          >
            {fileUrl ? 'Download' : 'Upload'}
          </button>
        </div>

        <div className="flex justify-between w-full mt-6">
          <div className="flex flex-col items-center w-1/2">
            <span className="text-2xl font-semibold">{fileSize? (Math.round((fileSize / 100000) * 100) / 100) + " MB": 'N/A'}</span>
            <span className="text-xs">Size</span>
          </div>

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
