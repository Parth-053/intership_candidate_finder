import React from 'react';
import '../../../styles/recruiter/dashboard/DashboardStats.css';

// ✅ Component ab 'stats' prop lega
const DashboardStats = ({ stats }) => {

    // ✅ Stats data ab props se aa raha hai
    const statsData = [
        { label: 'Active Jobs', value: stats.activeJobs },
        { label: 'Total Applicants', value: stats.totalApplicants },
        { label: 'New Applicants', value: stats.newApplicants, note: 'in last 24h' },
        { label: 'Interviews Scheduled', value: stats.interviews },
    ];

    return (
        <div className="recruiter-stats-grid">
            {statsData.map(stat => (
                <div className="stat-card" key={stat.label}>
                    <p className="stat-label">{stat.label}</p>
                    <h3 className="stat-value">{stat.value}</h3>
                    {stat.note && <span className="stat-note">{stat.note}</span>}
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;