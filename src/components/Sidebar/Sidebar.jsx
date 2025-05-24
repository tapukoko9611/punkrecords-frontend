import React, { useState, } from 'react';
import SearchBar from './Searchbar';
import CompList from './CompList';
import { FiPlus, FiX, FiHome } from 'react-icons/fi';
import roomApi from '../../api/roomApi';
import AddCompModal from './AddCompModal';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({
  activeComp,
  setActiveComp,
  toggleSidebar,
  allComps,
  compOrder,
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
  const navigate = useNavigate();

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
        <button onClick={() => {
          navigate(`/`, { replace: true });
        }} aria-label="Go to home">
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
          } else if (compOrder && Object.values(compOrder).some(comp => comp.name.toLowerCase() === text.toLowerCase())) {
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
        compOrder={compOrder}
        searchText={searchText}
        searchResult={searchResult}
        compName={compName}
        tempComp={tempComp}
        isTempCompActive={isTempCompActive}
      />

      {showAddModal && (
        <AddCompModal
          compType={compName}
          onClose={() => setShowAddModal(false)}
          onCreate={(newComp) => {
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

export default Sidebar;