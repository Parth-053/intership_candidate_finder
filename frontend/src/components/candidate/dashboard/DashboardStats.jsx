import React from 'react';
import '../../../styles/candidate/dashboard/DashboardStats.css';

// Yeh component ab props se data lega
const DashboardStats = ({ statsData, loading }) => {
    
    // Static Profile Views
    const profileViews = 12; 

    const stats = [
        { label: 'Applications', value: statsData.applications, icon: '📄' },
        { label: 'Saved', value: statsData.saved, icon: '⭐' },
        { label: 'Profile Views', value: profileViews, icon: '👁️' },
        { label: 'Interviews/Shortlisted', value: statsData.shortlisted, icon: '📅' },
    ];
    
    let content;
    if (loading) {
        content = <p>Loading stats...</p>;
    } else {
        content = stats.map((stat) => (
            <div className="stat-card" key={stat.label}>
                <div className="stat-icon-wrapper">
                    <span className="stat-icon">{stat.icon}</span>
                </div>
                <div className="stat-info">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                </div>
            </div>
        ));
    }

    return (
        <div className="dashboard-stats modern">
            {content}
        </div>
    );
};

export default DashboardStats;