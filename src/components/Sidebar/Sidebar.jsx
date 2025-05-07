import React, { useState } from 'react';
import SearchBar from './Searchbar';
import CompList from './CompList';
import { FiPlus, FiX, FiHome } from 'react-icons/fi';

const getSearchResult = async (text) => {
  return text;
}

const Sidebar = ({ activeComp, setActiveComp, toggleSidebar, allComps, compName }) => {
  const [searchText, setSearchText] = useState("");
  var [searchResult, setSearchResult] = useState(null);

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <button onClick={toggleSidebar}>
          <FiX className="text-xl text-gray-400 hover:text-white transition" />
        </button>
        {/* <span className="font-bold text-lg">Comps</span> */}
        <button onClick={() => {}}>
          <FiHome className="text-xl text-gray-400 hover:text-white transition" />
        </button>
        <FiPlus className="text-xl text-green-400 hover:text-white cursor-pointer" title="New Comp" />
      </div>

      <SearchBar compName={compName} searchText={searchText} setSearchText={async (text) => {
        setSearchText(text);
        if (text.length === 0) {
          setSearchResult(null);
        }
        else if (!(text in allComps)) {
          var temp = await getSearchResult(text);
          if (temp.length !== 0) {
            setSearchResult(temp);
          } else {
            setSearchResult(null);
          }
        } else if (text in allComps) {
          setSearchResult(null);
        }
      }} />

      < CompList
        activeComp={activeComp}
        setActiveComp={setActiveComp}
        comps={allComps}
        searchText={searchText}
        searchResult={searchResult}
      />
    </div>
  );
};

export default Sidebar;
