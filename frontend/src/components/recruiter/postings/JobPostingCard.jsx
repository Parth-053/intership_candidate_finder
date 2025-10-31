import React from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ useNavigate
import '../../../styles/recruiter/postings/JobPostingCard.css';

const JobPostingCard = ({ job, onEdit, onViewApplicants, onCloseToggle }) => {
    const navigate = useNavigate(); // ✅ useNavigate hook
    
    const handleViewClick = () => {
        // onViewApplicants(job.id); // Parent function call karein
        // Ya seedha navigate karein
         navigate(`/recruiter/applicants?jobId=${job.id}`);
    };
    
    const handleEditClick = () => {
        onEdit(job.id); // Pass job ID to parent
    };

    const handleCloseToggle = () => {
        onCloseToggle(job.id, job.status); // Pass ID and current status
    };

    return (
        <div className="job-posting-card">
            <div className="job-card-header">
                <h3>{job.title}</h3>
                <span className={`status-badge ${job.status === 'Active' ? 'status-active' : 'status-closed'}`}>
                    {job.status}
                </span>
            </div>
            <p className="job-card-info">Location: {job.location} | Duration: {job.duration}</p>
            {/* ✅ 'stats' object se 'applied' key use karein */}
            <p className="job-card-stats">Applicants: {job.stats?.applied || 0}</p>
            <div className="job-card-actions">
                <button onClick={handleViewClick} className="action-btn view-applicants">View Applicants</button>
                <button onClick={handleEditClick} className="action-btn edit-job">Edit</button>
                <button onClick={handleCloseToggle} className="action-btn close-job">
                    {job.status === 'Active' ? 'Close Job' : 'Reopen Job'}
                </button>
            </div>
        </div>
    );
};

export default JobPostingCard;