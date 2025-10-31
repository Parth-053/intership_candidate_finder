import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../styles/candidate/dashboard/DashboardStats.css';

// Base URL for your backend API
const API_URL = 'http://localhost:5000/api';

const DashboardStats = () => {
    // Initial state with placeholders, including static Profile Views
    const [stats, setStats] = useState([
        { label: 'Applications', value: 0, icon: '📄' },
        { label: 'Saved', value: 0, icon: '⭐' },
        { label: 'Profile Views', value: 12, icon: '👁️' }, // Static for now
        { label: 'Interviews/Shortlisted', value: 0, icon: '📅' }, // Changed label slightly
    ]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                 // Don't set error, just show 0s if not logged in maybe? Or handle in parent
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Fetch applications and saved internships in parallel
                const [applicationsRes, savedRes] = await Promise.all([
                    axios.get(`${API_URL}/candidate/my-applications`),
                    axios.get(`${API_URL}/candidate/saved-internships`)
                ]);

                const applicationsData = applicationsRes.data || [];
                const savedData = savedRes.data || [];

                // Calculate counts
                const applicationCount = applicationsData.length;
                const savedCount = savedData.length;

                // Derive interview/shortlisted count (adjust statuses as needed)
                const interviewStatuses = ['shortlisted', 'interview scheduled', 'hired']; // Example statuses
                const interviewCount = applicationsData.filter(app =>
                    interviewStatuses.includes(app.status?.toLowerCase())
                ).length;

                // Update the state
                setStats([
                    { label: 'Applications', value: applicationCount, icon: '📄' },
                    { label: 'Saved', value: savedCount, icon: '⭐' },
                    { label: 'Profile Views', value: 12, icon: '👁️' }, // Keep static
                    { label: 'Interviews/Shortlisted', value: interviewCount, icon: '📅' },
                ]);

            } catch (err) {
                console.error("Failed to fetch dashboard stats:", err);
                setError("Could not load stats.");
                // Keep default 0 values in case of error
                 setStats([
                    { label: 'Applications', value: 0, icon: '📄' },
                    { label: 'Saved', value: 0, icon: '⭐' },
                    { label: 'Profile Views', value: 'N/A', icon: '👁️' },
                    { label: 'Interviews/Shortlisted', value: 0, icon: '📅' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []); // Run once on mount

    // Decide what to render based on loading/error state
    let content;
    if (loading) {
        content = <p>Loading stats...</p>;
    } else if (error) {
        content = <p className="error-message">{error}</p>;
    } else {
        content = stats.map((stat) => (
            <div className="stat-card" key={stat.label}>
                <div className="stat-icon-wrapper">
                    <span className="stat-icon">{stat.icon}</span>
                </div>
                <div className="stat-info">
                    {/* Display 'N/A' if value couldn't be loaded, otherwise the value */}
                    <div className="stat-value">{stat.value === 'N/A' ? 'N/A' : stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                </div>
            </div>
        ));
    }

    return (
        <div className="dashboard-stats modern">
            {content}
        </div>
    );
};

export default DashboardStats;