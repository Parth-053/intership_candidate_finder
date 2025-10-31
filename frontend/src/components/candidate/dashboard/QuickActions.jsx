import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/candidate/dashboard/QuickActions.css';

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="quick-actions dashboard-section modern">
      <h3 className="section-title">Quick Actions</h3>
      <div className="action-buttons-grid modern">
        <button onClick={() => navigate('/internships')} className="action-btn modern">
          <span className="icon">🔍</span> Search Internships
        </button>
        <button onClick={() => navigate('/profile')} className="action-btn modern">
          <span className="icon">✏️</span> Update Profile
        </button>
        <button onClick={() => navigate('/profile')} className="action-btn modern"> {/* Assuming resume is in profile */}
          <span className="icon">📄</span> Update Resume
        </button>
        <button onClick={() => navigate('/dashboard/saved')} className="action-btn modern">
          <span className="icon">⭐</span> View Saved Jobs
        </button>
      </div>
    </div>
  );
};

export default QuickActions;