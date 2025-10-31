import React from 'react';
import '../../../styles/candidate/home/SearchBar.css'; 

// ✅ Component ab apna state manage nahi karta. Yeh props se values leta hai.
const SearchBar = ({ query, setQuery, onSearch }) => {

  // ❌ Internal state hata diya gaya hai.

  const handleSearchClick = () => {
    onSearch(); // Koi argument pass karne ki zaroorat nahi
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(); // Koi argument pass karne ki zaroorat nahi
    }
  };

  return (
    <div className="search-bar-wrapper">
      <input
        type="text"
        className="search-input"
        placeholder="Search by category, company, location..."
        // ✅ Value aur onChange ab props se control hote hain
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className="search-button" onClick={handleSearchClick}>
        Search
      </button>
    </div>
  );
};

export default SearchBar;