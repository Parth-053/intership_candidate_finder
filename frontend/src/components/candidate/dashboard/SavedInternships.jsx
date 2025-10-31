import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import '../../../styles/candidate/dashboard/SavedInternships.css';

// Base URL for your backend API
const API_URL = 'http://localhost:5000/api';

const SavedInternships = () => {
    // State for saved internships, loading, and errors
    const [savedInternships, setSavedInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Hook for navigation

    // Function to fetch saved internships
    const fetchSavedInternships = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            // setError("Please log in to view saved internships."); // Optional
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_URL}/candidate/saved-internships`);
            // Show only a few (e.g., top 2) on the dashboard component
            setSavedInternships(response.data.slice(0, 2));
        } catch (err) {
            console.error("Failed to fetch saved internships:", err);
            setError(err.response?.data?.message || "Failed to load saved internships.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchSavedInternships();
    }, []); // Empty dependency array

    // Function to handle unsaving an internship
    const handleUnsave = async (internshipId) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
             alert("Please log in again.");
             return;
        }
        try {
            // ✅ Call the toggle endpoint - POST request
            await axios.post(`${API_URL}/profile/save/${internshipId}`);
            // ✅ Refetch the list after unsaving to update the UI
            fetchSavedInternships(); // Re-fetch the saved list
            // Or remove locally: setSavedInternships(prev => prev.filter(item => item.id !== internshipId));
        } catch (err) {
            console.error("Failed to unsave internship:", err);
            alert(err.response?.data?.message || "Could not unsave internship.");
        }
    };

    // Function to handle viewing an internship
    const handleView = (internshipId) => {
        navigate(`/internships/${internshipId}`); // Navigate to detail page
    };

    // Render loading state
    if (loading) {
        return <div className="dashboard-section modern">Loading saved internships...</div>;
    }

    // Render error state (optional)
    if (error && savedInternships.length === 0) {
        return <div className="dashboard-section modern error-message">{error}</div>;
    }

    return (
        <div className="saved-internships dashboard-section modern">
            <div className="section-header">
                <h3 className="section-title">Saved Internships</h3>
                 {/* ✅ Use Link component for navigation */}
                <Link to="/candidate/dashboard/saved" className="view-all-link">View All</Link> {/* Adjust '/candidate/dashboard/saved' if needed */}
            </div>
            {savedInternships.length > 0 ? (
                <ul className="saved-list modern">
                    {savedInternships.map((item) => (
                        <li key={item.id} className="saved-item modern">
                            <div className="saved-info">
                                 {/* ✅ Use fetched data */}
                                <h4>{item.title}</h4>
                                <p>{item.company} - {item.location}</p>
                            </div>
                            <div className="saved-actions">
                                 {/* ✅ Added onClick handlers */}
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