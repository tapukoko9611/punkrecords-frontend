import React from 'react';
import CompListItem from './CompListItem';

const CompList = ({ comps, activeComp, setActiveComp, searchText, searchResult }) => (
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
