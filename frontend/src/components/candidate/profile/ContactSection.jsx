import React, { useState, useEffect } from 'react'; // Added useEffect
import axios from 'axios'; // Import axios
import '../../../styles/candidate/profile/ProfileCommon.css'; // Assuming common styles

// Base URL for backend API
const API_URL = 'http://localhost:5000/api';

// Removed userId from props, assuming parent fetches data for logged-in user
const ContactSection = ({ data, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    // Initialize formData safely, even if data is null/undefined initially
    const [formData, setFormData] = useState({
        phone: '',
        dob: '',
        gender: ''
    });
    const [isLoading, setIsLoading] = useState(false); // Loading state for save
    const [error, setError] = useState(''); // Error state for save

    // ✅ Effect to update formData when data prop changes (e.g., after initial fetch or update)
    useEffect(() => {
        setFormData({
            phone: data?.phone || '',
            dob: data?.dob || '',
            gender: data?.gender || ''
        });
    }, [data]); // Re-run effect if the data prop changes

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(''); // Clear error on change
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError('');
        try {
            // ✅ Use axios and the correct endpoint (/api/profile/me)
            // Axios defaults should include the Authorization header
            const response = await axios.put(`${API_URL}/profile/me`, {
                // Send only the fields relevant to this section
                phone: formData.phone,
                dob: formData.dob,
                gender: formData.gender
                // Note: Backend merges this with existing data
            });

            if (response.data) { // Check if response has data (optional)
                onUpdate(); // Trigger parent refetch/update
                setIsEditing(false);
            } else {
                 throw new Error("No data returned from server."); // Handle unexpected response
            }
        } catch (error) {
            console.error("Failed to update contact info:", error);
            setError(error.response?.data?.message || "Failed to save changes. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Safely access potentially missing data for display
    const displayData = {
        phone: data?.phone || 'Not Added',
        dob: data?.dob || 'Not Added',
        gender: data?.gender || 'Not Added'
    };

    return (
        <div id="contact-personal-information" className="profile-section">
            <div className="section-header"> {/* Added header for consistency */}
                <h3 className="section-title">Contact & Personal Information</h3>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="btn-edit-section" disabled={isLoading}>Edit</button>
                )}
            </div>

            {/* Display Error Message */}
            {error && <p className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</p>}

            {isEditing ? (
                <div className="edit-form"> {/* Wrap form elements */}
                    <div className="form-group"> {/* Wrap input+label */}
                        <label htmlFor="phone">Phone Number</label>
                        <input
                           id="phone"
                           name="phone" // Add name attribute
                           className="form-input"
                           value={formData.phone}
                           onChange={handleInputChange}
                           placeholder="Phone Number"
                           disabled={isLoading}
                        />
                    </div>
                     <div className="form-group">
                        <label htmlFor="dob">Date of Birth</label>
                        <input
                            id="dob"
                            name="dob" // Add name attribute
                            className="form-input"
                            type="date"
                            value={formData.dob}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="gender">Gender</label>
                        {/* Consider using a select dropdown for Gender */}
                        <input
                            id="gender"
                            name="gender" // Add name attribute
                            className="form-input"
                            value={formData.gender}
                            onChange={handleInputChange}
                            placeholder="Gender"
                            disabled={isLoading}
                        />
                         {/* Example Select Dropdown:
                         <select id="gender" name="gender" className="form-input" value={formData.gender} onChange={handleInputChange} disabled={isLoading}>
                             <option value="">Select Gender</option>
                             <option value="Male">Male</option>
                             <option value="Female">Female</option>
                             <option value="Other">Other</option>
                             <option value="Prefer not to say">Prefer not to say</option>
                         </select>
                         */}
                    </div>
                    <div className="form-actions"> {/* Wrap buttons */}
                        <button onClick={handleSave} className="btn-save" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => { setIsEditing(false); setError(''); }} className="btn-cancel" disabled={isLoading}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div className="display-info"> {/* Wrap display elements */}
                    <div className="info-row"><span>Phone: {displayData.phone}</span></div>
                    <div className="info-row"><span>Date of Birth: {displayData.dob}</span></div>
                    <div className="info-row"><span>Gender: {displayData.gender}</span></div>
                    {/* Edit button moved to header */}
                </div>
            )}
        </div>
    );
};

export default ContactSection;