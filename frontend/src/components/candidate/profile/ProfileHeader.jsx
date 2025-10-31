import React, { useState, useEffect, useRef } from 'react'; // Added useEffect
import axios from 'axios'; // Import axios
import '../../../styles/candidate/profile/ProfileCommon.css'; // Common styles
import '../../../styles/candidate/profile/ProfileHeader.css'; // Specific styles
import defaultProfilePic from '../../../assets/images/profile.png'; // Default image

// Base URL for backend API
const API_URL = 'http://localhost:5000/api';
// Base URL for backend static files (assuming you serve uploads from '/uploads')
const BACKEND_STATIC_URL = 'http://localhost:5000';

// Removed userId from props
const ProfileHeader = ({ data, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    // Initialize formData safely
    const [formData, setFormData] = useState({ headline: '', location: '' });
    const [profileImageFile, setProfileImageFile] = useState(null); // To store the selected file
    const [isLoading, setIsLoading] = useState(false); // Loading state for save
    const [error, setError] = useState(''); // Error state for save
    const fileInputRef = useRef(null);

    // ✅ Effect to update formData when data prop changes
    useEffect(() => {
        setFormData({
            headline: data?.headline || '',
            location: data?.location || ''
        });
        // Reset file state if data is reloaded (e.g., after save)
        setProfileImageFile(null);
    }, [data]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleImageClick = () => {
        if (isEditing) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProfileImageFile(e.target.files[0]);
            setError(''); // Clear error if user selects a new file
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError('');

        // Use FormData for potential file upload
        const dataToSend = new FormData();
        dataToSend.append('headline', formData.headline);
        dataToSend.append('location', formData.location);
        if (profileImageFile) {
            // 'profilePic' should match the field name expected by multer on the backend
            dataToSend.append('profilePic', profileImageFile);
        }

        try {
            // ✅ Use axios PUT to /api/profile/me
            // Axios automatically sets Content-Type for FormData
            const response = await axios.put(`${API_URL}/profile/me`, dataToSend);

            if (response.data) {
                onUpdate(); // Trigger parent refetch
                setIsEditing(false);
                setProfileImageFile(null); // Clear file state
            } else {
                throw new Error("No data returned from server.");
            }
        } catch (error) {
            console.error("Error updating profile header:", error);
            setError(error.response?.data?.message || "Failed to save changes. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Determine the image URL to display
    let imagePreviewUrl = defaultProfilePic; // Start with default
    if (profileImageFile) {
        imagePreviewUrl = URL.createObjectURL(profileImageFile); // Show preview of selected file
    } else if (data?.profilePic) { // Check if user data has a saved profile picture path
        // ✅ Assume backend saves a relative path like '/uploads/profile_pics/image.jpg'
        // Prepend the backend URL only if the path doesn't already start with http
         imagePreviewUrl = data.profilePic.startsWith('http')
             ? data.profilePic
             : `${BACKEND_STATIC_URL}${data.profilePic.startsWith('/') ? '' : '/'}${data.profilePic}`;
    }

    // Clean up object URL when component unmounts or file changes
    useEffect(() => {
        let objectUrl = null;
        if (profileImageFile) {
            objectUrl = URL.createObjectURL(profileImageFile);
        }
        // Cleanup function
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [profileImageFile]);


    // Safely access name
    const userName = data?.name || "User Name";

    return (
        <div id="profile-header" className="profile-section profile-header">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*" // Accept only images
                disabled={isLoading}
            />
            <img
                src={imagePreviewUrl}
                alt="Profile"
                className={`profile-picture ${isEditing ? 'editable' : ''}`}
                onClick={handleImageClick}
                onError={(e) => { e.target.src = defaultProfilePic; }} // Fallback if image fails to load
            />
            <div className="header-info">
                 {/* Display name (not editable here) */}
                <h1>{userName}</h1>
                {isEditing ? (
                    <>
                        <input
                           type="text"
                           name="headline" // Add name attribute
                           value={formData.headline}
                           onChange={handleInputChange}
                           placeholder="Your Headline (e.g., MERN Developer)"
                           className="form-input"
                           disabled={isLoading}
                        />
                        <input
                           type="text"
                           name="location" // Add name attribute
                           value={formData.location}
                           onChange={handleInputChange}
                           placeholder="Your Location (e.g., Delhi, India)"
                           className="form-input"
                           disabled={isLoading}
                         />
                    </>
                ) : (
                    <>
                        <p>{formData.headline || 'No headline added'}</p> {/* Show from state */}
                        <span>{formData.location || 'No location added'}</span> {/* Show from state */}
                    </>
                )}
            </div>
            {/* Action Buttons */}
            <div className="header-actions"> {/* Added wrapper div */}
                {isEditing ? (
                    <>
                        <button onClick={handleSave} className="btn-save" disabled={isLoading}>
                             {isLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => { setIsEditing(false); setError(''); setProfileImageFile(null); /* Reset form */ setFormData({ headline: data?.headline || '', location: data?.location || '' }); }} className="btn-cancel" disabled={isLoading}>
                             Cancel
                        </button>
                    </>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="btn-edit-header">Edit Header</button>
                )}
            </div>
             {/* Display Error Message */}
             {error && <p className="error-message header-error" style={{color: 'red', width: '100%', textAlign: 'center', marginTop: '10px'}}>{error}</p>}
        </div>
    );
};

export default ProfileHeader;