import React from 'react';
import CompListItem from './CompListItem';

const CompList = ({
  comps,
  activeComp,
  setActiveComp,
  searchText,
  searchResult,
  tempComp,
  isTempCompActive,
  compName
}) => (
  <div className="flex-1 overflow-y-auto px-2">

    {(searchResult == 1 || searchResult == 2) && (
      <div className='mt-1 pt-4 border-b border-gray-700 '>
        <h4 className="text-xs text-gray-500 px-3 ">----Misc----</h4>
        <CompListItem
          key={searchText}
          compName={searchText + (searchResult == 1 ? " (join)" : " (create)")}
          active={false}
          onClick={() => setActiveComp(null, searchText, true)}
          isTempCompActive={tempComp}
        />
      </div>
    )}

    {Object.entries(comps)
      .filter(([roomId, room]) => {
        return room.room && room.room.name && room.room.name.toLowerCase().includes(searchText.toLowerCase());
      })
      .map(([roomId, room]) => (
        <CompListItem
          key={roomId}
          compName={room.room.name}
          active={roomId === activeComp}
          onClick={() => setActiveComp(roomId, room.room.name, false)}
          isTempCompActive={tempComp}
        />
      ))}

    {Object.keys(comps).length === 0 && searchText.length === 0 && (
      <div className="text-center text-gray-500 mt-4">No rooms joined yet.</div>
    )}
  </div>
);

const CompList2 = ({ comps, activeComp, setActiveComp, searchText, searchResult }) => (
  <div className="flex-1 overflow-y-auto px-2">
    {Object.entries(comps).map(([roomId, room]) => {
      if (room.roomName.includes(searchText)) { // Filter by roomName
        return <CompListItem
          key={roomId}
          compName={room.roomName} // Display roomName
          active={roomId === activeComp}
          onClick={() => setActiveComp(roomId)}
        />;
      } else {
        return <></>;
      }
    })}
    {
      searchResult && <div className='flex-1 overflow-y-auto px-2'>
        <br />
        <h4>Other results -----</h4>
        <CompListItem
          key={searchResult}
          compName={searchResult}
          active={false}
          onClick={() => { /* Implement logic to join/create searched room */ }}
        />
      </div>
    }
  </div>
);

const CompList1 = ({ comps, activeComp, setActiveComp, searchText, searchResult }) => (
  <div className="flex-1 overflow-y-auto px-2">
    {Object.entries(comps).map(([key, value]) => {
      if (key.includes(searchText)) {
        return <CompListItem
          key={key}
          compName={key}
          active={key === activeComp}
          onClick={() => setActiveComp(key)}
        />;
      } else {
        return <></>;
      }
    })}
    {
      searchResult && <div className='flex-1 overflow-y-auto px-2'>
        <br />
        <h4>Other results -----</h4>
        <CompListItem
          key={searchResult}
          compName={searchResult}
          active={false}
          onClick={() => { }}
        />
      </div>
    }
  </div>
);

export default CompList;
