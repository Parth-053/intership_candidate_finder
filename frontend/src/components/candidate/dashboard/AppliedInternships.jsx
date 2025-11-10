import React from 'react';
import { Link } from 'react-router-dom';
import '../../../styles/candidate/dashboard/AppliedInternships.css';

// Yeh component ab props se data lega
const AppliedInternships = ({ applications, loading }) => {

    // useEffect aur data fetching logic hata diya gaya hai

    const getStatusClass = (status) => {
        const statusLower = status?.toLowerCase().replace(' ', '-') || 'unknown';
        return `status-${statusLower}`;
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        try {
            return new Date(isoString).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
            });
        } catch (e) { return 'Invalid Date'; }
    };

    if (loading) {
        return <div className="dashboard-section modern">Loading applications...</div>;
    }

    // Sirf pehli 4 applications dikhayein
    const recentApplications = applications.slice(0, 4);

    return (
        <div className="applied-internships dashboard-section modern">
            <div className="section-header">
                <h3 className="section-title">Recent Applications</h3>
                <Link to="/candidate/dashboard/applications" className="view-all-link">View All</Link>
            </div>
            {recentApplications.length > 0 ? (
                <ul className="application-list modern">
                    {recentApplications.map((app) => (
                        <li key={app.id} className="application-item modern">
                            <div className="app-main-info">
                                <h4>{app.internshipTitle || 'N/A'}</h4>
                                <p>{app.companyName || 'N/A'} • Applied on {formatDate(app.appliedOn)}</p>
                            </div>
                            <div className={`app-status-badge ${getStatusClass(app.status)}`}>
                                <span className="status-dot"></span> {app.status || 'N/A'}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="empty-state">You haven't applied for any internships yet.</p>
            )}
        </div>
    );
};

export default AppliedInternships;