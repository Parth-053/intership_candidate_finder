import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Path check karein
import TopNavbar from '../../components/candidate/common/TopNavbar'; // Path check karein
import '../../../src/styles/candidate/dashboard/AppliedInternships.css'; // Existing CSS reuse karein
import '../../../src/styles/candidate/MyApplicationsPage.css'; // Is page ke liye new CSS file

const API_URL = 'http://localhost:5000/api';

const MyApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authData } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApplications = async () => {
            const token = authData?.token || localStorage.getItem('authToken');
            if (!token) {
                setError("Please log in to view applications.");
                setLoading(false);
                return;
            }
            if (!axios.defaults.headers.common['Authorization']) {
                 axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }

            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${API_URL}/candidate/my-applications`);
                // ✅ Poori list display karein (slice nahi karein)
                setApplications(response.data || []);
            } catch (err) {
                console.error("Failed to fetch applications:", err);
                setError(err.response?.data?.message || "Failed to load applications.");
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [authData?.token]);

    const getStatusClass = (status) => {
        const statusLower = status?.toLowerCase().replace(' ', '-') || 'unknown';
        return `status-${statusLower}`;
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
        });
    };

    return (
        <div className="my-applications-page">
            <TopNavbar />
            <div className="page-content-container"> {/* Naya container styling ke liye */}
                <div className="page-header">
                    <button onClick={() => navigate(-1)} className="back-button">
                        &larr; Back
                    </button>
                    <h1>My Applications</h1>
                </div>

                {loading && <p className="loading-text">Loading applications...</p>}
                {error && <p className="error-message">{error}</p>}

                {!loading && !error && (
                    applications.length > 0 ? (
                        <ul className="application-list modern full-page-list"> {/* Full page list ke liye class */}
                            {applications.map((app) => (
                                <li key={app.id} className="application-item modern">
                                    <div className="app-main-info">
                                        <h4>{app.internshipTitle || 'N/A'}</h4>
                                        <p>{app.companyName || 'N/A'} • Applied on {formatDate(app.appliedOn)}</p>
                                    </div>
                                    <div className={`app-status-badge ${getStatusClass(app.status)}`}>
                                        <span className="status-dot"></span> {app.status || 'N/A'}
                                    </div>
                                    {/* Internship detail page par link */}
                                    <Link to={`/internships/${app.internshipId}`} className="view-details-link">
                                        View Details
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-state">You haven't applied for any internships yet.</p>
                    )
                )}
            </div>
        </div>
    );
};

export default MyApplicationsPage;