import React from 'react';

const SearchBar = ({searchText, setSearchText, compName}) => {
  var searchShow = `Search ${compName}s...`;

  return (
    <div className="px-4 py-2">
      <input
        type="text"
        placeholder={searchShow}
        className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchText}
        onChange={async (event) => {if(searchText!==event.target.value) await setSearchText(event.target.value)}}
      />
    </div>
  )
};

export default SearchBar;
