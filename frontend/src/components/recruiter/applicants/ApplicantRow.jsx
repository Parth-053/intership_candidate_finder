import React from 'react';
import '../../../styles/recruiter/applicants/ApplicantRow.css';
// import defaultPic from '../../../assets/images/default-profile.png';

const ApplicantRow = ({ applicant, onViewProfile, onShortlist, onReject }) => {
    
    // ✅ Backend se aaye applicant object se data extract karein
    const { 
        id: applicationId, // Yeh application ki ID hai
        candidateId,
        candidateDetails, // Is object mein name, email, profile hai
        internshipTitle, // Dashboard route se yeh key aati hai
        appliedJob, // Original code yeh use kar raha tha (fallback)
        appliedOn, // Dashboard route se yeh key aati hai
        appliedDate, // Original code yeh use kar raha tha (fallback)
        status
    } = applicant;
    
    // ✅ Data keys ko normalize karein
    const name = candidateDetails?.name || applicant.name || 'Unknown Candidate';
    const jobTitle = internshipTitle || appliedJob || 'N/A';
    const date = appliedOn ? new Date(appliedOn).toLocaleDateString('en-GB') : (appliedDate || 'N/A');
    
    // Button states
    const isShortlisted = status === 'Shortlisted';
    const isRejected = status === 'Rejected';
    
    const handleViewClick = () => {
        onViewProfile(candidateId, candidateDetails); // ✅ candidateId ya poora details object pass karein
    };
    
    const handleShortlistClick = () => {
        onShortlist(applicationId); // ✅ application ID pass karein
    };

    const handleRejectClick = () => {
        onReject(applicationId); // ✅ application ID pass karein
    };

    return (
        <tr className="applicant-row">
            <td>
                <div className="applicant-name-pic">
                    {/* <img src={candidateDetails?.profilePic || defaultPic} alt={name} /> */}
                    <span>{name}</span>
                </div>
            </td>
            <td>{jobTitle}</td>
            <td>{date}</td>
            <td>
                <span className={`status-tag status-${status?.toLowerCase().replace(' ', '-') || 'new'}`}>
                    {status || 'New'}
                </span>
            </td>
            <td>
                <div className="applicant-actions">
                    <button onClick={handleViewClick} className="action-btn view-profile">View Profile</button>
                    <button 
                        onClick={handleShortlistClick} 
                        className="action-btn shortlist" 
                        disabled={isShortlisted}
                    >
                        {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                    </button>
                    <button 
                        onClick={handleRejectClick} 
                        className="action-btn reject" 
                        disabled={isRejected}
                    >
                        {isRejected ? 'Rejected' : 'Reject'}
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default ApplicantRow;