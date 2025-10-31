import React from 'react';
import '../../../styles/candidate/internship/AppliedFilter.css'; 

const AppliedFilters = ({ selectedFilters, onRemoveFilter }) => {
  // selectedFilters object ko ek flat array mein convert karein
  const filters = [];
  for (const category in selectedFilters) {
    if (selectedFilters[category].length > 0) {
      selectedFilters[category].forEach(value => {
        filters.push({ category, value });
      });
    }
  }

  // Agar koi filter select nahi hai, to component ko render na karein
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="applied-filters-container">
      {filters.map(({ category, value }) => (
        <div key={`${category}-${value}`} className="filter-pill">
          <span>{value}</span>
          <button 
            className="remove-filter-btn" 
            onClick={() => onRemoveFilter(category, value)}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

export default AppliedFilters;