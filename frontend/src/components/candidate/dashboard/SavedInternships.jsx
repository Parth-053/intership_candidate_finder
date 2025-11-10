import React, { useContext } from 'react'; // useEffect, useState, useCallback hataye
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../../../styles/candidate/dashboard/SavedInternships.css';

const API_URL = 'http://localhost:5000/api';

// Yeh component ab props se data lega
const SavedInternships = ({ savedInternships, loading }) => {
    
    // Data fetching logic (useEffect, fetchSavedInternships) hata diya gaya hai
    
    const { authData } = useContext(AuthContext);
    const navigate = useNavigate();
    const token = authData?.token;

    const handleUnsave = async (internshipId) => {
        if (!token) {
             alert("Please log in again.");
             return;
        }
        try {
            await axios.post(`${API_URL}/profile/save/${internshipId}`);
            // TODO: Yahan par parent component (Dashboard.jsx) ko data refetch karne ke liye trigger karna behtar hoga
            // Abhi ke liye, yeh page reload karega
            window.location.reload(); 
        } catch (err) {
            console.error("Failed to unsave internship:", err);
            alert(err.response?.data?.message || "Could not unsave internship.");
        }
    };

    const handleView = (internshipId) => {
        navigate(`/internships/${internshipId}`);
    };

    if (loading) {
        return <div className="dashboard-section modern">Loading saved internships...</div>;
    }

    // Sirf pehli 2 saved internships dikhayein
    const recentSaved = savedInternships.slice(0, 2);

    return (
        <div className="saved-internships dashboard-section modern">
            <div className="section-header">
                <h3 className="section-title">Saved Internships</h3>
                <Link to="/candidate/dashboard/saved" className="view-all-link">View All</Link>
            </div>
            {recentSaved.length > 0 ? (
                <ul className="saved-list modern">
                    {recentSaved.map((item) => (
                        <li key={item.id} className="saved-item modern">
                            <div className="saved-info">
                                <h4>{item.title}</h4>
                                <p>{item.company} - {item.location}</p>
                            </div>
                            <div className="saved-actions">
                                <button onClick={() => handleView(item.id)} className="view-btn">View</button>
                                <button onClick={() => handleUnsave(item.id)} className="remove-btn">Unsave</button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="empty-state">You haven't saved any internships yet.</p>
            )}
        </div>
    );
};

export default SavedInternships;