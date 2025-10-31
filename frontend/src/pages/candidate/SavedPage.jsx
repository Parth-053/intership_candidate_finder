import React, { useState, useEffect, useContext , useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import TopNavbar from '../../components/candidate/common/TopNavbar';
// Footer removed per your request
import InternshipCard from '../../components/candidate/common/InternshipCard';
import '../../styles/candidate/SavedPage.css';

const API_URL = 'http://localhost:5000/api';

const SavedPage = () => {
    const [savedInternships, setSavedInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authData } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchSaved = useCallback(async () => {
        const token = authData?.token || localStorage.getItem('authToken');
        if (!token) {
            setError("Please log in to view saved internships.");
            setLoading(false);
            return;
        }
        if (!axios.defaults.headers.common['Authorization']) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(true); setError(null);
        try {
            const response = await axios.get(`${API_URL}/candidate/saved-internships`);
            setSavedInternships(response.data || []);
        } catch (err) {
            console.error("Error fetching saved internships:", err);
            setError(err.response?.data?.message || "Could not load saved internships.");
            setSavedInternships([]);
        } finally { setLoading(false); }
    }, [authData?.token]);

    useEffect(() => {
        fetchSaved();
    }, [fetchSaved]);

    const handleSaveToggle = async (internshipId, currentIsSaved) => {
        if (!currentIsSaved) return Promise.reject("Cannot save from this page.");
        const token = localStorage.getItem('authToken');
        if (!token) { alert("Please log in again."); return Promise.reject("Not logged in"); }
        try {
            await axios.post(`${API_URL}/profile/save/${internshipId}`);
            // ✅ Instead of refetching, just remove the item locally for a faster UI update
            setSavedInternships(prev => prev.filter(item => item.id !== internshipId));
            return Promise.resolve();
        } catch (err) {
            console.error("Failed to unsave internship:", err);
            alert(err.response?.data?.message || "Could not unsave internship.");
            return Promise.reject(err);
        }
    };

    return (
        <div className="saved-page">
            <div className="top-navbar-sticky-container">
                 <TopNavbar />
            </div>
            <div className="saved-content-container">
                <div className="back-button-area">
                    {/* ✅ FIXED: Updated path to /candidate/dashboard */}
                    <button onClick={() => navigate('/candidate/dashboard')} className="back-btn">
                        &larr; Back to Dashboard
                    </button>
                </div>
                <h2>Saved Internships</h2>
                {loading && <p>Loading saved internships...</p>}
                {!loading && error && <p className="error-message" style={{color: 'red'}}>{error}</p>}
                {!loading && !error && savedInternships.length === 0 && (
                    <p className="no-saved-message">You haven't saved any internships yet.</p>
                )}
                {!loading && !error && savedInternships.length > 0 && (
                    <div className="saved-grid-container">
                        {savedInternships.map(internship => (
                            <InternshipCard
                                key={internship.id}
                                {...internship}
                                isSaved={true}
                                onSaveToggle={handleSaveToggle}
                            />
                        ))}
                    </div>
                )}
            </div>
             {/* Footer Removed */}
        </div>
    );
};

export default SavedPage;