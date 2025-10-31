import React from 'react';
import '../../../styles/candidate/internshipdetail/TabNavigation.css';

const TabNavigation = ({ activeTab, onTabClick }) => {
  const tabs = ['Job Details', 'Dates & Deadlines', 'Reviews', 'FAQs & Discussions'];

  return (
    <div className="tab-navigation-container">
      {tabs.map(tab => (
        <button 
          key={tab}
          className={`tab-button ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onTabClick(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;