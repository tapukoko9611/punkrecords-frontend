import CompListItem from './CompListItem';

const CompList = ({
  comps,
  compOrder,
  activeComp,
  setActiveComp,
  searchText,
  searchResult,
  tempComp,
}) => {
  const orderedComps = Object.entries(compOrder)
    .filter(([compId, orderData]) =>
      orderData.name.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort(([, aData], [, bData]) => bData.order - aData.order);

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
          notifications={data.notifications} 
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

export default CompList;
