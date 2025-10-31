import React, { useState, useEffect, useCallback, useContext } from 'react'; // Added useContext
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios'; // Import axios
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext
import TopNavbar from '../../components/candidate/common/TopNavbar';
import ProfileSidebar from '../../components/candidate/profile/ProfileSidebar';
import ProfileHeader from '../../components/candidate/profile/ProfileHeader';
import ResumeSection from '../../components/candidate/profile/ResumeSection';
import ContactSection from '../../components/candidate/profile/ContactSection';
import EducationSection from '../../components/candidate/profile/EducationSection';
import WorkExperience from '../../components/candidate/profile/WorkExperience';
import SkillsSection from '../../components/candidate/profile/SkillsSection';
import SocialLinksSection from '../../components/candidate/profile/SocialLinksSection';
import Footer from '../../components/candidate/common/Footer'; // Import Footer
import '../../styles/candidate/profile/ProfilePage.css';
import '../../styles/candidate/profile/ProfileCommon.css'; // Import common styles

// Base URL for backend API
const API_URL = 'http://localhost:5000/api';

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authData } = useContext(AuthContext); // Get auth state
    const navigate = useNavigate();

    // ✅ Renamed function for clarity, uses /api/profile/me
    const fetchProfileData = useCallback(async () => {
        // No need to fetch if not logged in
        const token = authData?.token || localStorage.getItem('authToken');
        if (!token) {
             setError("Please log in to view your profile.");
             setLoading(false);
             // Optionally redirect to login after a delay
             // setTimeout(() => navigate('/login/candidate'), 2000);
             return;
        }

        // Ensure axios default header is set (might be redundant if already set on login)
        if (!axios.defaults.headers.common['Authorization']) {
             axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }


        setLoading(true); // Set loading true before fetch
        setError(null); // Clear previous errors
        try {
            // ✅ Use axios GET to /api/profile/me
            const response = await axios.get(`${API_URL}/profile/me`);
            if (response.data) {
                // Ensure the fetched data is for a candidate
                 if (response.data.role === 'candidate') {
                    setProfileData(response.data);
                 } else {
                     setError("Access denied. This profile page is for candidates only.");
                     setProfileData(null); // Clear any previous data
                     // Optionally redirect
                     // navigate('/some-other-page');
                 }
            } else {
                 throw new Error("Received empty profile data from server.");
            }
        } catch (err) {
            console.error("Error fetching profile data:", err);
            setError(err.response?.data?.message || "Could not load profile data. Please try logging in again.");
            if (err.response?.status === 401 || err.response?.status === 403) {
                 // Handle unauthorized access potentially by logging out or redirecting
                 // logout(); // Assuming logout is available from context
                 // navigate('/login/candidate');
            }
        } finally {
            setLoading(false);
        }
    // Dependency on token ensures refetch if user logs in/out
    }, [authData?.token, navigate]); // Removed userId, added authData.token and navigate


    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]); // Fetch data on mount and when fetchProfileData changes (due to token change)

    if (loading) {
         // Consistent Loading UI
        return (
             <div className="profile-page loading">
                  <div className="top-navbar-sticky-container"><TopNavbar /></div>
                  <div style={{ padding: "50px", textAlign: "center" }}>Loading Profile...</div>
                  {/* Optional: Add Footer during loading */}
             </div>
        );
    }

    if (error || !profileData) {
        // Consistent Error UI
        return (
             <div className="profile-page error">
                 <div className="top-navbar-sticky-container"><TopNavbar /></div>
                 <p style={{ padding: "50px", textAlign: "center", color: "red" }}>
                     {error || "Could not load profile data."}
                 </p>
                  {/* Optional: Add Footer during error */}
             </div>
        );
    }


    // Render profile sections only if data is loaded successfully
    return (
        <div className="profile-page">
            <div className="top-navbar-sticky-container">
                <TopNavbar />
            </div>
            <div className="profile-container">
                <div className="profile-sidebar-wrapper">
                    <ProfileSidebar />
                </div>
                <div className="profile-main-content">
                    {/* ✅ Pass profileData and onUpdate. Removed userId. */}
                    {/* Note: Passing specific parts of profileData might be slightly cleaner */}
                    <ProfileHeader data={profileData} onUpdate={fetchProfileData} />
                    <ResumeSection data={profileData} onUpdate={fetchProfileData} />
                    <ContactSection data={profileData} onUpdate={fetchProfileData} />
                    <EducationSection data={profileData} onUpdate={fetchProfileData} />
                    <WorkExperience data={profileData} onUpdate={fetchProfileData} />
                    <SkillsSection data={profileData} onUpdate={fetchProfileData} />
                    <SocialLinksSection data={profileData} onUpdate={fetchProfileData} />
                </div>
            </div>
             <Footer /> {/* Add Footer at the bottom */}
        </div>
    );
};

export default Profile;