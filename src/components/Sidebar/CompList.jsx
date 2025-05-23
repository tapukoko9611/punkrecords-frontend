import React, { useEffect } from 'react';
import CompListItem from './CompListItem';

const CompList = ({
  comps,       // from context: an object mapping roomId -> roomData
  compOrder,   // from context: an object mapping roomId -> { roomName, notifications, order }
  activeComp,
  setActiveComp,
  searchText,
  searchResult,
  tempComp,
}) => {
  // Convert the compOrder object into an array of [roomId, orderData]
  const orderedComps = Object.entries(compOrder)
    .filter(([compId, orderData]) =>
      orderData.name.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort(([, aData], [, bData]) => bData.order - aData.order); // descending by order

  return (
    <div className="flex-1 overflow-y-auto px-2">
      {(searchResult === 1 || searchResult === 2) && (
        <div className="mt-1 pt-4 border-b border-gray-700">
          <h4 className="text-xs text-gray-500 px-3">----Misc----</h4>
          <CompListItem
            key={searchText}
            compName={searchText + (searchResult === 1 ? " (join)" : " (create)")}
            active={false}
            onClick={() => setActiveComp(null, searchText, true)}
            isTempCompActive={tempComp}
          />
        </div>
      )}

      {orderedComps.map(([compId, data]) => (
        <CompListItem
          key={compId}
          compName={data.name}
          active={compId === activeComp}
          onClick={() => setActiveComp(compId, data.name, false)}
          notifications={data.notifications}  // Pass the notifications count
        />
      ))}

      {Object.keys(comps).length === 0 && searchText.length === 0 && (
        <div className="text-center text-gray-500 mt-4">
          None joined.
        </div>
      )}
    </div>
  );
};




const CompList4 = ({
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
      .filter(([compId, comp]) => {
        return comp.room && comp.room.name && comp.room.name.toLowerCase().includes(searchText.toLowerCase());
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



const CompListRoom = ({
  rooms,      // from context: an object mapping roomId → roomData
  roomOrder,  // from context: an array of room IDs (ordered with the most updated at the front)
  activeComp,
  setActiveComp,
  searchText
}) => {
  // Filter based on search text:
  const filteredRoomIds = roomOrder.filter(roomId => {
    const roomData = rooms[roomId];
    return roomData?.room?.name.toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <div className="flex-1 overflow-y-auto px-2">
      {filteredRoomIds.map(roomId => (
        <CompListItem
          key={roomId}
          compName={rooms[roomId].room.name}
          active={roomId === activeComp}
          onClick={() => setActiveComp(roomId, rooms[roomId].room.name, false)}
        />
      ))}
      {Object.keys(rooms).length === 0 && searchText.length === 0 && (
        <div className="text-center text-gray-500 mt-4">No rooms joined yet.</div>
      )}
    </div>
  );
};

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
