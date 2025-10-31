import React from 'react';
import '../../../styles/recruiter/applicants/ApplicantProfileModal.css'; // Iske liye CSS neeche hai

// Backend ka static URL (jahaan resumes/images hongi)
const BACKEND_STATIC_URL = 'http://localhost:5000';

const ApplicantProfileModal = ({ candidate, onClose }) => {
    
    // Resume URL construct karein
    const resumePath = candidate?.profile?.resumeUrl;
    const resumeUrl = resumePath 
        ? `${BACKEND_STATIC_URL}${resumePath.startsWith('/') ? '' : '/'}${resumePath}` 
        : null;

    // Helper function lists render karne ke liye
    const renderList = (items, keyPrefix, renderItem) => {
        if (!Array.isArray(items) || items.length === 0) {
            return <li>Not provided.</li>;
        }
        return items.map((item, index) => (
            <li key={`${keyPrefix}-${index}`}>{renderItem(item)}</li>
        ));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{candidate?.name || 'Applicant Profile'}</h3>
                    <button onClick={onClose} className="btn-close">&times;</button>
                </div>
                <div className="modal-body">
                    {/* Contact Info */}
                    <div className="profile-modal-section">
                        <h4>Contact Information</h4>
                        <p><strong>Email:</strong> {candidate?.email || 'N/A'}</p>
                        <p><strong>Phone:</strong> {candidate?.phone || 'Not provided'}</p>
                        <p><strong>Location:</strong> {candidate?.location || 'Not provided'}</p>
                    </div>

                    {/* Resume */}
                    <div className="profile-modal-section">
                        <h4>Resume/CV</h4>
                        {resumeUrl ? (
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="resume-link">
                                View / Download Resume
                            </a>
                        ) : (
                            <p>No resume provided.</p>
                        )}
                    </div>

                    {/* Skills */}
                    <div className="profile-modal-section">
                        <h4>Skills</h4>
                        <div className="skills-tags">
                            {Array.isArray(candidate?.skills) && candidate.skills.length > 0 ? (
                                candidate.skills.map(skill => (
                                    <span key={skill.name} className={`skill-tag ${skill.color || 'grey'}`}>
                                        {skill.name}
                                    </span>
                                ))
                            ) : (
                                <p>No skills listed.</p>
                            )}
                        </div>
                    </div>

                    {/* Education */}
                    <div className="profile-modal-section">
                        <h4>Education</h4>
                        <ul className="profile-list">
                            {renderList(candidate?.education, 'edu', edu => (
                                <>
                                    <strong>{edu.degree}</strong>
                                    <span>{edu.college} ({edu.grade})</span>
                                </>
                            ))}
                        </ul>
                    </div>

                    {/* Work Experience */}
                    <div className="profile-modal-section">
                        <h4>Work Experience</h4>
                        <ul className="profile-list">
                            {renderList(candidate?.workExperience, 'work', exp => (
                                <>
                                    <strong>{exp.jobTitle}</strong>
                                    <span>{exp.company}</span>
                                    <p className="item-description">{exp.jobDescription}</p>
                                </>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicantProfileModal;