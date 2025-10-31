import React, { useState } from 'react';
import HeaderSection from './HeaderSection';
import TabNavigation from './TabNavigation';
import DetailsSection from './DetailsSection';
import '../../../styles/candidate/internshipdetail/InternshipMainContent.css';

const InternshipMainContent = ({ internship }) => {
  const [activeTab, setActiveTab] = useState('Job Details');

  return (
    <div className="main-content-container">
      <HeaderSection internship={internship} />
      <div className="tab-and-details-container">
        <TabNavigation activeTab={activeTab} onTabClick={setActiveTab} />
        
        {/* Abhi sirf 'Job Details' tab ka content dikhega */}
        {activeTab === 'Job Details' && <DetailsSection internship={internship} />}
        {/* Aap yahan baaki tabs ke liye bhi components add kar sakte hain */}
        {activeTab === 'Dates & Deadlines' && <div>Dates & Deadlines Content Here</div>}
        {activeTab === 'Reviews' && <div>Reviews Content Here</div>}
        {activeTab === 'FAQs & Discussions' && <div>FAQs Content Here</div>}
      </div>
    </div>
  );
};

export default InternshipMainContent;