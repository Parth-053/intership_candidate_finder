import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios'; // Import axios
import { AuthContext } from '../../../context/AuthContext'; // Adjust path if needed
import { Link } from 'react-router-dom'; // Import Link for 'View All'
import '../../../styles/candidate/dashboard/AppliedInternships.css';

// Base URL for your backend API
const API_URL = 'http://localhost:5000/api';

const AppliedInternships = () => {
    // State for applications, loading status, and errors
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authData } = useContext(AuthContext); // Access auth data if needed later

    useEffect(() => {
        const fetchApplications = async () => {
            // Check if user is logged in (token exists) before fetching
            const token = localStorage.getItem('authToken'); // Or get from context
            if (!token) {
                setError("Please log in to view applications.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                // ✅ Fetch data from the backend endpoint
                const response = await axios.get(`${API_URL}/candidate/my-applications`);
                // Assuming backend returns an array of applications
                // Show only the most recent ones (e.g., top 4) on the dashboard
                setApplications(response.data.slice(0, 4));
            } catch (err) {
                console.error("Failed to fetch applications:", err);
                setError(err.response?.data?.message || "Failed to load applications. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []); // Empty dependency array ensures this runs only once on mount

    const getStatusClass = (status) => {
        // Simple mapping for common statuses
        const statusLower = status?.toLowerCase().replace(' ', '-') || 'unknown';
        return `status-${statusLower}`;
        // You might need more specific CSS classes like status-applied, status-shortlisted, status-rejected
    };

    // Helper to format date (optional)
    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        try {
            return new Date(isoString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };


    // Render loading state
    if (loading) {
        return <div className="dashboard-section modern">Loading applications...</div>;
    }

    // Render error state
    if (error) {
        return <div className="dashboard-section modern error-message">{error}</div>;
    }

    return (
        <div className="applied-internships dashboard-section modern">
            <div className="section-header">
                <h3 className="section-title">Recent Applications</h3>
                {/* ✅ Use Link component for navigation */}
                <Link to="/candidate/dashboard/applications" className="view-all-link">View All</Link> {/* Adjust '/candidate/dashboard/applications' if you have a dedicated page */}
            </div>
            {applications.length > 0 ? (
                <ul className="application-list modern">
                    {applications.map((app) => (
                        <li key={app.id} className="application-item modern">
                            <div className="app-main-info">
                                {/* ✅ Use data from backend response */}
                                <h4>{app.internshipTitle || 'N/A'}</h4>
                                <p>{app.companyName || 'N/A'} • Applied on {formatDate(app.appliedOn)}</p>
                            </div>
                            <div className={`app-status-badge ${getStatusClass(app.status)}`}>
                                <span className="status-dot"></span> {app.status || 'N/A'}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="empty-state">You haven't applied for any internships yet.</p>
            )}
        </div>
    );
};

export default AppliedInternships;