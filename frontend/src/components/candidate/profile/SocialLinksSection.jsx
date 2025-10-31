import React, { useState, useEffect } from 'react'; // Added useEffect
import axios from 'axios'; // Import axios
import '../../../styles/candidate/profile/ProfileCommon.css'; // Common styles
// Assuming specific styles exist:
// import '../../../styles/candidate/profile/SocialLinksSection.css';

// Base URL for backend API
const API_URL = 'http://localhost:5000/api';

// Helper function to ensure URL starts with http:// or https://
const ensureAbsoluteUrl = (url) => {
    if (!url || url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `https://${url}`; // Default to https
};

// Removed userId from props
const SocialLinksSection = ({ data, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    // Initialize formData safely
    const [formData, setFormData] = useState({ linkedin: '', github: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // ✅ Effect to update formData when data prop changes
    useEffect(() => {
        setFormData({
            linkedin: data?.linkedin || '',
            github: data?.github || ''
        });
    }, [data]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError('');
        try {
            // ✅ Use axios PUT to /api/profile/me
            const response = await axios.put(`${API_URL}/profile/me`, {
                // Send only the fields relevant to this section
                linkedin: formData.linkedin,
                github: formData.github
                // Backend merges this with existing profile data
            });

            if (response.data) {
                onUpdate(); // Trigger parent refetch
                setIsEditing(false);
            } else {
                 throw new Error("No data returned from server.");
            }
        } catch (error) {
            console.error("Failed to update social links:", error);
            setError(error.response?.data?.message || "Failed to save links. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Prepare display data safely
    const displayData = {
        linkedin: data?.linkedin || '',
        github: data?.github || ''
    };
    const linkedinUrl = ensureAbsoluteUrl(displayData.linkedin);
    const githubUrl = ensureAbsoluteUrl(displayData.github);

    return (
        // ✅ Updated ID to match sidebar link
        <div id="social-professional-links" className="profile-section">
            <div className="section-header">
                <h3 className="section-title">Social & Professional Links</h3>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="btn-edit-section" disabled={isLoading}>Edit Links</button>
                )}
            </div>

            {/* Display Error Message */}
            {error && <p className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</p>}


            {isEditing ? (
                <div className="edit-form">
                    <div className="form-group">
                        <label htmlFor="linkedin">LinkedIn URL</label>
                        <input
                            id="linkedin"
                            name="linkedin" // Add name
                            className="form-input"
                            value={formData.linkedin}
                            onChange={handleInputChange}
                            placeholder="https://linkedin.com/in/yourprofile"
                            disabled={isLoading}
                        />
                    </div>
                     <div className="form-group">
                         <label htmlFor="github">GitHub URL</label>
                        <input
                            id="github"
                            name="github" // Add name
                            className="form-input"
                            value={formData.github}
                            onChange={handleInputChange}
                            placeholder="https://github.com/yourusername"
                            disabled={isLoading}
                        />
                    </div>
                    {/* Add more inputs for other links if needed */}
                    <div className="form-actions">
                        <button onClick={handleSave} className="btn-save" disabled={isLoading}>
                             {isLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => { setIsEditing(false); setError(''); /* Reset form */ setFormData({ linkedin: data?.linkedin || '', github: data?.github || '' }); }} className="btn-cancel" disabled={isLoading}>
                             Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="display-info">
                    <div className="info-row">
                        <span>LinkedIn: </span>
                        {linkedinUrl ? (
                            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">{displayData.linkedin}</a>
                        ) : (
                            <span>Not Added</span>
                        )}
                    </div>
                    <div className="info-row">
                        <span>GitHub: </span>
                        {githubUrl ? (
                            <a href={githubUrl} target="_blank" rel="noopener noreferrer">{displayData.github}</a>
                        ) : (
                            <span>Not Added</span>
                        )}
                    </div>
                    {/* Display other links here */}
                     {/* Edit button moved to header */}
                </div>
            )}
        </div>
    );
};

export default SocialLinksSection;