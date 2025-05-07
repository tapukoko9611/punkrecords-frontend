import React from 'react';

const CompListItem = ({ compName, active, onClick }) => (
  <div
    className={`p-3 rounded-lg cursor-pointer transition-colors ${
      active ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'
    }`}
    onClick={onClick}
  >
    {compName}
  </div>
);

export default CompListItem;
