import React, { useState, useContext } from 'react';
import SearchBar from './Searchbar';
import CompList from './CompList';
import { FiPlus, FiX, FiHome } from 'react-icons/fi'; 
import roomApi from '../../api/roomApi';
import AddCompModal from './AddCompModal';

const getSearchResult1 = async (text) => {
  return (await roomApi.checkRoomName("", text));
};

const Sidebar = ({
  activeComp,
  setActiveComp,
  toggleSidebar,
  allComps,
  compName,
  sidebarOpen,
  getSearchResult,
  tempComp,
  isTempCompActive,
  createComp
}) => {
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className={`
      flex flex-col
      bg-gray-800 border-r border-gray-700
      transition-all duration-300 ease-in-out
      ${sidebarOpen ? 'w-64' : 'w-0 border-r-0'}
      overflow-hidden
    `}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <button onClick={toggleSidebar} aria-label="Close sidebar">
          <FiX className="text-xl text-gray-400 hover:text-white transition" />
        </button>
        <button onClick={() => { /* TODO: navigation to home/dashboard */ }} aria-label="Go to home">
          <FiHome className="text-xl text-gray-400 hover:text-white transition" />
        </button>
        <FiPlus
          className="text-xl text-green-400 hover:text-white cursor-pointer"
          title={`Create New ${compName}`}
          onClick={() => setShowAddModal(true)}
        />
      </div>

      <SearchBar
        compName={compName}
        searchText={searchText}
        setSearchText={async (text) => {
          setSearchText(text);
          if (text.length === 0) {
            setSearchResult(null);
          } else if (allComps && Object.values(allComps).some(comp => comp.room.name === text)) {
            setSearchResult(null);
          } else {
            const result = await getSearchResult(text);
            setSearchResult(result === true ? 1 : 2);
          }
        }}
      />

      <CompList
        activeComp={activeComp}
        setActiveComp={(compId, comp_Name, isSearchResult) => {
          setSearchResult(null);
          setSearchText("");
          setActiveComp(compId, comp_Name, isSearchResult);
        }}
        comps={allComps}
        searchText={searchText}
        searchResult={searchResult}
        compName={compName}
        tempComp={tempComp}
        isTempCompActive={isTempCompActive}
      />

      {showAddModal && (
        <AddCompModal
          compType={compName} // "compName" here represents the type in context (e.g., Room, Editor)
          onClose={() => setShowAddModal(false)}
          onCreate={(newComp) => {
            // console.log("Creating new comp:", newComp);
            createComp(newComp.compName, newComp.isPrivate, newComp.password)
          }}
          checkCompExists={async (text) => {
            return await getSearchResult(text);
          }}
        />
      )}
    </div>
  );
};


const Sidebar2 = ({
  activeComp,
  setActiveComp,
  toggleSidebar,
  allComps,
  compName,
  sidebarOpen,
  tempComp,
  isTempCompActive
}) => {
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  return (
    <div className={`
      flex flex-col
      bg-gray-800 border-r border-gray-700
      transition-all duration-300 ease-in-out
      ${sidebarOpen ? 'w-64' : 'w-0 border-r-0'}
      overflow-hidden
    `}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <button onClick={toggleSidebar} aria-label="Close sidebar">
          <FiX className="text-xl text-gray-400 hover:text-white transition" />
        </button>
        <button onClick={() => { /* TODO: Implement navigation to home/dashboard */ }} aria-label="Go to home">
          <FiHome className="text-xl text-gray-400 hover:text-white transition" />
        </button>
        <FiPlus
          className="text-xl text-green-400 hover:text-white cursor-pointer"
          title={`Create New ${compName}`}
          onClick={() => { /* TODO: Implement logic to open 'Create New' modal/form */ }}
        />
      </div>

      <SearchBar
        compName={compName}
        searchText={searchText}
        setSearchText={async (text) => {
          setSearchText(text);
          if (text.length === 0) {
            setSearchResult(null);
          } else if (allComps && Object.values(allComps).some(comp => comp.room.name === text)) {
            setSearchResult(null);
          } else {
            const result = await getSearchResult1(text);
            setSearchResult(result == true ? 1 : 2);
          }
        }}
      />

      <CompList
        activeComp={activeComp}
        setActiveComp={(compId, comp_Name, isSearchResult) => {
          setSearchResult(null);
          setSearchText("");
          setActiveComp(compId, comp_Name, isSearchResult);
        }}
        comps={allComps}
        searchText={searchText}
        searchResult={searchResult}
        compName={compName}
        tempComp={tempComp}
        isTempCompActive={isTempCompActive}
      />
    </div>
  );
};


const Sidebar1 = ({ activeComp, setActiveComp, toggleSidebar, allComps, compName }) => {
  const [searchText, setSearchText] = useState("");
  var [searchResult, setSearchResult] = useState(null);

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <button onClick={toggleSidebar}>
          <FiX className="text-xl text-gray-400 hover:text-white transition" />
        </button>
        {/* <span className="font-bold text-lg">Comps</span> */}
        <button onClick={() => { }}>
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
          var temp = await getSearchResult1(text);
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