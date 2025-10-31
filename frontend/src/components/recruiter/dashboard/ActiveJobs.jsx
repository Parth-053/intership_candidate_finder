import React from 'react';
import { Link } from 'react-router-dom';
import '../../../styles/recruiter/dashboard/RecentApplicants.css'; // Common styles

// ✅ 'jobs' prop lega (Dashboard.jsx se)
const ActiveJobs = ({ jobs }) => {

    // Sirf active jobs dikhayein (limit to 5 for dashboard)
    const activeJobs = jobs.filter(job => job.status === 'Active').slice(0, 5);

    return (
        <div className="dashboard-section">
            <h3 className="section-title">Active Job Postings</h3>
            <ul className="applicant-list">
                {activeJobs.length > 0 ? (
                    activeJobs.map((job) => (
                        <li key={job.id} className="applicant-item">
                            <div className="applicant-info">
                                <h4>{job.title}</h4>
                                {/* ✅ Backend 'stats' object se applied count lein */}
                                <p>{job.stats?.applied || 0} Applicants</p>
                            </div>
                            {/* ✅ Link ko specific job ke applicants page par set karein */}
                            <Link to={`/recruiter/applicants?jobId=${job.id}`} className="manage-link">Manage</Link>
                        </li>
                    ))
                ) : (
                    <p style={{padding: '10px 0'}}>No active jobs found.</p>
                )}
            </ul>
        </div>
    );
};

export default ActiveJobs;