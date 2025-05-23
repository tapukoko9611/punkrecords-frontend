import React from 'react';

const CompListItem = ({ compName, active, onClick, isTempCompActive, notifications }) => {
  return <div
    className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${(compName == isTempCompActive || (!isTempCompActive && active)) ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'
      }`}
    onClick={onClick}
  >
    <span>{compName}</span>
    {
      notifications>0 && <span className="bg-red-500 text-white rounded-full px-2 text-xs">{notifications}</span>
    }
  </div>
};

export default CompListItem;
