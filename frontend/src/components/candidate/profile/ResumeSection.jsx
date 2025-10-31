import React, { useState, useRef, useEffect } from 'react'; // Added hooks
import axios from 'axios'; // Import axios
import '../../../styles/candidate/profile/ProfileCommon.css'; // Common styles
import '../../../styles/candidate/profile/ResumeSection.css'; // Specific styles

// Base URL for backend API
const API_URL = 'http://localhost:5000/api';
// Base URL for backend static files (assuming resumes are served from '/uploads/resumes')
const BACKEND_STATIC_URL = 'http://localhost:5000';

// Removed userId from props
const ResumeSection = ({ data, onUpdate }) => {
    const [resumeFile, setResumeFile] = useState(null); // To store the selected file
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    // ✅ Effect to reset file state if parent data reloads
    useEffect(() => {
        setResumeFile(null); // Clear selected file if component re-renders with new data
    }, [data]);

    // Trigger hidden file input
    const handleUploadClick = () => {
        fileInputRef.current.click();
        setError(''); // Clear previous errors
    };

    // Store selected file
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            // Optional: Add file type/size validation here
            setResumeFile(e.target.files[0]);
            setError(''); // Clear error on new selection
        }
    };

    // Upload the selected file
    const handleSaveResume = async () => {
        if (!resumeFile) {
            setError("Please select a resume file first.");
            return;
        }

        setIsUploading(true);
        setError('');

        const dataToSend = new FormData();
        // 'resume' should match the field name expected by multer on the backend
        dataToSend.append('resume', resumeFile);

        try {
            // ✅ Use axios PUT to /api/profile/me with FormData
            const response = await axios.put(`${API_URL}/profile/me`, dataToSend);

            if (response.data) {
                onUpdate(); // Trigger parent refetch
                setResumeFile(null); // Clear file state
                alert("Resume updated successfully!"); // Provide feedback
            } else {
                 throw new Error("No data returned from server.");
            }
        } catch (error) {
            console.error("Error uploading resume:", error);
            setError(error.response?.data?.message || "Failed to upload resume. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    // Construct download URL safely
    const currentResumePath = data?.profile?.resumeUrl; // Get path from profile object
    let downloadUrl = null;
    let resumeFileName = "No resume uploaded";

    if (currentResumePath) {
        // Extract filename from path (e.g., "/uploads/resumes/my_cv.pdf" -> "my_cv.pdf")
        resumeFileName = currentResumePath.split('/').pop() || currentResumePath;
        // Construct full URL for download
        downloadUrl = currentResumePath.startsWith('http')
            ? currentResumePath
            : `${BACKEND_STATIC_URL}${currentResumePath.startsWith('/') ? '' : '/'}${currentResumePath}`;
    }

    return (
        // ✅ Updated ID to match sidebar link
        <div id="resume-cv" className="profile-section">
            <div className="section-header">
                <h3 className="section-title">Resume/CV</h3>
                {/* Hide upload button if already uploading */}
                {!isUploading && (
                    <button onClick={handleUploadClick} className="btn-upload">
                        {currentResumePath ? 'Replace Resume' : 'Upload Resume'}
                    </button>
                )}
            </div>

             {/* Hidden File Input */}
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx" // Specify accepted file types
             />

             {/* Display Error Message */}
             {error && <p className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</p>}

             {/* Section to show selected file and save button */}
             {resumeFile && (
                 <div className="selected-file-info info-row">
                     <span>Selected: {resumeFile.name}</span>
                     <button onClick={handleSaveResume} className="btn-save" disabled={isUploading}>
                         {isUploading ? 'Uploading...' : 'Save New Resume'}
                     </button>
                 </div>
             )}

            {/* Section to show current resume and download button */}
            <div className="info-row">
                <span>Current Resume: {resumeFileName}</span>
                <div className="action-buttons">
                    {downloadUrl ? (
                        <a href={downloadUrl} download={resumeFileName} className="btn-download" target="_blank" rel="noopener noreferrer">Download</a>
                    ) : (
                        <button className="btn-download" disabled>Download</button> // Disable if no resume
                    )}
                     {/* Edit button might not be needed if upload replaces */}
                    {/* <button className="btn-icon" onClick={handleUploadClick} title="Replace Resume">✏️</button> */}
                </div>
            </div>

            {/* Display Email (Non-editable) */}
            <div className="info-row email-row">
                <span>Email: {data?.email || 'N/A'} (Non-editable)</span>
                {/* No edit button needed for non-editable field */}
            </div>
        </div>
    );
};

export default ResumeSection;