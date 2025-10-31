import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import axios
import { AuthContext } from '../../../context/AuthContext'; // Import AuthContext
import '../../../styles/candidate/dashboard/ProfileSummary.css';
import profilePic from '../../../assets/images/logo.png'; // Update path

// Base URL for your backend API
const API_URL = 'http://localhost:5000/api';

const ProfileSummary = () => {
    // State for user data, loading, error, and completion
    const [userData, setUserData] = useState(null);
    const [profileCompletion, setProfileCompletion] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authData } = useContext(AuthContext); // Get auth data from context

    useEffect(() => {
        const fetchProfile = async () => {
            // Check if user is logged in (token exists)
            const token = localStorage.getItem('authToken'); // Or get from context
            if (!token) {
                 // Don't show an error, maybe just show generic welcome?
                 // setError("Please log in to view your profile summary.");
                 setLoading(false);
                 return;
            }

            // Ensure user role is candidate if context has user data
            if (authData.user && authData.user.role !== 'candidate') {
                setError("Not a candidate profile.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                // ✅ Fetch profile data from the backend
                const response = await axios.get(`${API_URL}/profile/me`);
                setUserData(response.data);

                // ✅ Calculate profile completion percentage (basic example)
                calculateCompletion(response.data);

            } catch (err) {
                console.error("Failed to fetch profile summary:", err);
                setError(err.response?.data?.message || "Could not load profile summary.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
        // Re-fetch if authData.user changes (e.g., after profile update elsewhere)
    }, [authData.user]);

    // Function to calculate profile completion (customize as needed)
    const calculateCompletion = (data) => {
        if (!data) {
            setProfileCompletion(0);
            return;
        }
        let score = 0;
        const totalFields = 5; // name, email, headline, location, resumeUrl, skills(presence)

        if (data.name) score++;
        if (data.email) score++; // Email should always be there from signup
        if (data.headline) score++;
        if (data.location) score++;
        if (data.profile?.resumeUrl) score++;
        if (Array.isArray(data.skills) && data.skills.length > 0) score++; // Count skills array presence

        setProfileCompletion(Math.round((score / totalFields) * 100));
    };


    // Display Loading or Error State
    if (loading) {
        return <div className="profile-summary enhanced">Loading profile...</div>;
    }

    if (error) {
         return <div className="profile-summary enhanced error-message">{error}</div>;
    }

    // Default values if user isn't logged in or data fetch failed partially
    const userName = userData?.name || "Guest";
    const headline = userData?.headline || "Add a headline to stand out!";

    return (
        <div className="profile-summary enhanced">
            <img src={profilePic} alt="Profile" className="summary-profile-pic" />
            <div className="summary-info">
                {/* ✅ Use fetched user data */}
                <h2>Welcome back, {userName}!</h2>
                <p>{headline}</p>
                <div className="completion-status">
                    <div className="completion-text">
                        <span>Profile Completion</span>
                        {/* ✅ Use calculated completion */}
                        <span>{profileCompletion}%</span>
                    </div>
                    {/* ✅ Use calculated completion */}
                    <progress value={profileCompletion} max="100"></progress>
                </div>
            </div>
            {/* Show Edit Profile only if logged in */}
            {userData && (
                <Link to="/candidate/profile" className="edit-profile-button"> {/* Changed path */}
                   ✏️ Edit Profile
                </Link>
            )}
        </div>
    );
};

export default ProfileSummary;