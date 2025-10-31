import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import InternshipMainContent from '../../components/candidate/internshipdetail/InternshipMainContent';
import ApplyCard from '../../components/candidate/internshipdetail/ApplyCard';
import TopNavbar from '../../components/candidate/common/TopNavbar';

import '../../styles/candidate/internshipdetail/InternshipDetailPage.css';

const API_URL = 'http://localhost:5000/api';

const InternshipDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { authData } = useContext(AuthContext);
    const isCandidate = authData?.user?.role === 'candidate';
    const token = authData?.token || localStorage.getItem('authToken');

    const [internship, setInternship] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ useCallback mein daala
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // ✅ Sahi endpoint: /api/internships/:id
            const internshipPromise = axios.get(`${API_URL}/internships/${id}`);
            
            const savedPromise = isCandidate && token
                ? axios.get(`${API_URL}/candidate/saved-internships`)
                : Promise.resolve({ data: [] });
            const applicationsPromise = isCandidate && token
                ? axios.get(`${API_URL}/candidate/my-applications`)
                : Promise.resolve({ data: [] });

            const [internshipRes, savedRes, applicationsRes] = await Promise.all([
                internshipPromise,
                savedPromise,
                applicationsPromise
            ]);

            if (internshipRes.data) {
                setInternship(internshipRes.data);
            } else {
                throw new Error("Internship not found.");
            }

            if (isCandidate) {
                const savedData = savedRes.data || [];
                setIsSaved(savedData.some(item => item.id === parseInt(id, 10)));
                
                const applicationsData = applicationsRes.data || [];
                const currentApplication = applicationsData.find(app => app.internshipId === parseInt(id, 10));
                setApplicationStatus(currentApplication ? currentApplication.status : null);
            } else {
                 setIsSaved(false);
                 setApplicationStatus(null);
            }

        } catch (err) {
            console.error("Failed to fetch internship details:", err);
            setError(err.response?.data?.message || err.message || "Failed to load internship details.");
            setInternship(null);
        } finally {
            setLoading(false);
        }
    }, [id, token, isCandidate]);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id, fetchData]); // ✅ fetchData dependency

    const handleSaveToggle = async (internshipId, currentIsSaved) => {
        if (!isCandidate) {
             alert("Please log in as a candidate to save.");
             return Promise.reject("Not logged in");
        }
        try {
            await axios.post(`${API_URL}/profile/save/${internshipId}`);
            setIsSaved(!currentIsSaved);
            return Promise.resolve();
        } catch (err) {
            console.error("Failed to toggle save state:", err);
            alert(err.response?.data?.message || "Could not update saved status.");
            return Promise.reject(err);
        }
    };

     const handleApply = async (internshipId) => {
         if (!isCandidate) {
             alert("Please log in as a candidate to apply.");
             return Promise.reject("Not logged in");
         }
         try {
             const response = await axios.post(`${API_URL}/candidate/apply`, { internshipId });
             if (response.data && response.data.application) {
                 setApplicationStatus(response.data.application.status || 'Applied');
                 alert(response.data.message || "Applied successfully!");
                 return Promise.resolve();
             } else {
                 throw new Error("Invalid response from server during apply.");
             }
         } catch (err) {
             console.error("Failed to apply:", err);
             alert(err.response?.data?.message || "Could not submit application.");
             return Promise.reject(err);
         }
     };

    if (loading) {
        return (
            <div className="internship-detail-page-loading">
                 <TopNavbar />
                 <div style={{ padding: "50px", textAlign: "center" }}>Loading internship details...</div>
            </div>
        );
    }

     if (error || !internship) {
         return (
             <div className="internship-detail-page-error">
                 <TopNavbar />
                 <div className="back-button-container">
                    <button onClick={() => navigate(-1)} className="back-button">&larr; Back</button>
                 </div>
                 <p style={{ padding: "50px", textAlign: "center", color: "red" }}>
                     {error || "Internship not found."}
                 </p>
             </div>
         );
     }

    return (
        <div className="internship-detail-page">
             <div className="top-navbar-sticky-container">
                 <TopNavbar />
             </div>
             <div className="back-button-container">
                 <button onClick={() => navigate(-1)} className="back-button">
                     &larr; Back
                 </button>
             </div>
            <div className="detail-layout-container">
                <div className="scrollable-content">
                    <InternshipMainContent internship={internship} />
                </div>
                <div className="sticky-sidebar">
                    <ApplyCard
                        internship={internship}
                        isSaved={isSaved}
                        onSaveToggle={handleSaveToggle}
                        onApply={handleApply}
                        applicationStatus={applicationStatus}
                    />
                </div>
            </div>
        </div>
    );
};

export default InternshipDetail;