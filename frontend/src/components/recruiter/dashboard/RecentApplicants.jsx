import React from 'react';
import { Link } from 'react-router-dom'; // ✅ Link import karein
import '../../../styles/recruiter/dashboard/RecentApplicants.css';

// ✅ Component ab 'applicants' prop lega (Dashboard.jsx se)
const RecentApplicants = ({ applicants }) => {
    
    const getStatusClass = (status) => {
        return `status-${status?.toLowerCase().replace(' ', '-') || 'new'}`;
    };
    
    return (
        <div className="dashboard-section">
            <h3 className="section-title">Recent Applicants</h3>
            <ul className="applicant-list">
                {/* ✅ 'applicants' prop se map karein */}
                {Array.isArray(applicants) && applicants.length > 0 ? (
                    // Dashboard par sirf 5 dikhayein
                    applicants.slice(0, 5).map((app) => ( 
                        <li key={app.id} className="applicant-item">
                            <div className="applicant-info">
                                {/* ✅ Backend keys use karein */}
                                <h4>{app.candidateDetails?.name || 'Unknown Candidate'}</h4>
                                <p>Applied for: {app.internshipTitle || 'N/A'}</p>
                            </div>
                            <span className={`status-badge ${getStatusClass(app.status)}`}>
                                {app.status || 'New'}
                            </span>
                            {/* ✅ Us job ke applicants page par link karein */}
                            <Link to={`/recruiter/applicants?jobId=${app.internshipId}`} className="manage-link">View</Link>
                        </li>
                    ))
                ) : (
                    <p style={{padding: '10px 0'}}>No recent applicants found.</p>
                )}
            </ul>
        </div>
    );
};
export default RecentApplicants;