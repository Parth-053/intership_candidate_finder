import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import TopNavbar from '../../components/candidate/common/TopNavbar';
import Footer from '../../components/candidate/common/Footer';
import InternshipMainContent from '../../components/candidate/internshipdetail/InternshipMainContent';
import ApplyCard from '../../components/candidate/internshipdetail/ApplyCard';
import '../../styles/candidate/internshipdetail/InternshipDetailPage.css';

const API_URL = 'http://localhost:5000/api';

const InternshipDetail = () => {
    const { id: internshipId } = useParams(); // Yeh hamesha ek string hota hai
    const [internship, setInternship] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [savedInternshipIds, setSavedInternshipIds] = useState(new Set());
    const [applicationStatus, setApplicationStatus] = useState(null);
    
    const { authData } = useContext(AuthContext);
    const navigate = useNavigate();
    const token = authData?.token;
    const isCandidate = authData?.user?.role === 'candidate';

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Fetch internship details
            const internshipRes = await axios.get(`${API_URL}/internships/${internshipId}`);
            setInternship(internshipRes.data);

            // 2. Agar candidate logged in hai, toh saved jobs aur application status fetch karein
            if (token && isCandidate) {
                // Profile (saved jobs)
                const profileRes = await axios.get(`${API_URL}/profile/me`);
                // ✅ FIX: IDs ko hamesha string bana kar set karein
                const savedIds = new Set((profileRes.data.savedInternships || []).map(id => String(id)));
                setSavedInternshipIds(savedIds);

                // Application status
                const appsRes = await axios.get(`${API_URL}/candidate/my-applications`);
                
                // ✅ FIX: Dono IDs ko string bana kar compare karein
                const existingApp = appsRes.data.find(app => String(app.internshipId) === String(internshipId));
                
                if (existingApp) {
                    setApplicationStatus(existingApp.status);
                } else {
                    setApplicationStatus(null);
                }
            }
        } catch (err) {
            console.error("Error fetching internship data:", err);
            setError(err.response?.data?.message || "Failed to load internship details.");
        } finally {
            setLoading(false);
        }
    }, [internshipId, token, isCandidate]); // internshipId dependency sahi hai

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveToggle = async () => {
        if (!token || !isCandidate) {
            navigate('/login/candidate');
            return;
        }
        try {
            const res = await axios.post(`${API_URL}/profile/save/${internshipId}`);
            // ✅ FIX: IDs ko hamesha string bana kar set karein
            setSavedInternshipIds(new Set(res.data.savedInternships.map(id => String(id))));
        } catch (err) {
            alert("Could not update saved status.");
        }
    };

    const handleApply = async () => {
        if (!token || !isCandidate) {
            navigate('/login/candidate');
            return;
        }
        try {
            const res = await axios.post(`${API_URL}/candidate/apply`, { internshipId });
            setApplicationStatus(res.data.application.status || 'Applied');
            alert(res.data.message);
        } catch (err) {
            alert(err.response?.data?.message || "Application failed.");
        }
    };
    
    if (loading) {
        return <div className="internship-detail-page"><TopNavbar /><div className="page-content"><p>Loading Internship...</p></div></div>;
    }

    if (error || !internship) {
        return <div className="internship-detail-page"><TopNavbar /><div className="page-content"><p className="error-message">{error || "Internship data not found."}</p></div></div>;
    }

    return (
        <div className="internship-detail-page">
            <TopNavbar />
            <div className="page-content">
                <div className="detail-layout">
                    <InternshipMainContent internship={internship} />
                    <ApplyCard 
                        internship={internship}
                        // --- YEH HAI MUKHYA FIX ---
                        // internship._id ko internship.id se badal diya hai
                        isSaved={savedInternshipIds.has(internship.id.toString())} 
                        onSaveToggle={handleSaveToggle}
                        onApply={handleApply}
                        applicationStatus={applicationStatus}
                    />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default InternshipDetail;