import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import '../../../styles/candidate/dashboard/ProfileSummary.css';
import profilePic from '../../../assets/images/logo.png'; // Update path

const API_URL = 'http://localhost:5000/api';

const ProfileSummary = () => {
    const [userData, setUserData] = useState(null);
    const [profileCompletion, setProfileCompletion] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authData } = useContext(AuthContext); // ✅ AuthContext KA ISTEMAAL KAREIN

    useEffect(() => {
        const fetchProfile = async () => {
            const token = authData?.token; // ✅ TOKEN KO CONTEXT SE LEIN
            if (!token) {
                 setLoading(false);
                 return;
            }

            // ✅ HEADER SET KAREIN
            if (!axios.defaults.headers.common['Authorization']) {
                 axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }

            if (authData.user && authData.user.role !== 'candidate') {
                setError("Not a candidate profile.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${API_URL}/profile/me`);
                setUserData(response.data);
                calculateCompletion(response.data);
            } catch (err) {
                console.error("Failed to fetch profile summary:", err);
                setError(err.response?.data?.message || "Could not load profile summary.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [authData.user, authData.token]); // ✅ DEPENDENCY MEIN 'token' ADD KAREIN

    const calculateCompletion = (data) => {
        if (!data) {
            setProfileCompletion(0);
            return;
        }
        let score = 0;
        const totalFields = 5; 

        if (data.name) score++;
        if (data.email) score++;
        if (data.headline) score++;
        if (data.location) score++;
        if (data.profile?.resumeUrl) score++;
        if (Array.isArray(data.skills) && data.skills.length > 0) score++; 

        setProfileCompletion(Math.round((score / totalFields) * 100));
    };

    if (loading) {
        return <div className="profile-summary enhanced">Loading profile...</div>;
    }

    if (error) {
         return <div className="profile-summary enhanced error-message">{error}</div>;
    }

    // ✅ YEH BADLAAV "Guest" KI JAGAH NAAM DIKHAYEGA
    const userName = userData?.name || authData.user?.name || "Candidate";
    const headline = userData?.headline || authData.user?.headline || "Add a headline to stand out!";

    return (
        <div className="profile-summary enhanced">
            <img src={profilePic} alt="Profile" className="summary-profile-pic" />
            <div className="summary-info">
                <h2>Welcome back, {userName}!</h2>
                <p>{headline}</p>
                <div className="completion-status">
                    <div className="completion-text">
                        <span>Profile Completion</span>
                        <span>{profileCompletion}%</span>
                    </div>
                    <progress value={profileCompletion} max="100"></progress>
                </div>
            </div>
            {userData && (
                <Link to="/candidate/profile" className="edit-profile-button">
                   ✏️ Edit Profile
                </Link>
            )}
        </div>
    );
};

export default ProfileSummary;