import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import { Link } from 'react-router-dom'; // Import Link
import '../../../styles/candidate/dashboard/Notifications.css';

// Base URL for your backend API
const API_URL = 'http://localhost:5000/api';

// Simple relative time function (replace with a library like date-fns if preferred)
const timeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000; // years
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000; // months
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400; // days
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600; // hours
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60; // minutes
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};


const Notifications = () => {
    // State for notifications, loading status, and errors
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                // setError("Please log in to view notifications."); // Optional: show error if not logged in
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                // ✅ Fetch notifications from the backend
                const response = await axios.get(`${API_URL}/candidate/notifications`);
                // Assume backend returns an array like [{ id, message, read, date }, ...]
                // Show only the latest few (e.g., top 3) on the dashboard
                setNotifications(response.data.slice(0, 3));
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
                setError(err.response?.data?.message || "Failed to load notifications.");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []); // Run once on mount

    // Render loading state
    if (loading) {
        return <div className="dashboard-section modern">Loading notifications...</div>;
    }

    // Render error state (optional, could just show empty)
    if (error && notifications.length === 0) { // Show error only if there are no notifications to display
        return <div className="dashboard-section modern error-message">{error}</div>;
    }

    return (
        <div className="notifications-panel dashboard-section modern">
            <div className="section-header">
                <h3 className="section-title">Notifications</h3>
                 {/* ✅ Use Link component for navigation */}
                <Link to="/candidate/dashboard/notifications" className="view-all-link">View All</Link> {/* Adjust '/candidate/dashboard/notifications' if you have a dedicated page */}
            </div>
            {notifications.length > 0 ? (
                <ul className="notification-list modern">
                    {notifications.map((notif) => (
                        <li key={notif.id} className={`notification-item modern ${!notif.read ? 'unread' : ''}`}>
                            {/* ✅ Use 'read' status from backend */}
                            <span className={`status-indicator ${!notif.read ? 'unread' : ''}`}></span>
                            <div className="notif-content">
                                {/* ✅ Use 'message' and 'date' from backend */}
                                <p className="notif-text">{notif.message}</p>
                                <span className="notif-time">{timeAgo(notif.date)}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="empty-state">No new notifications.</p>
            )}
        </div>
    );
};

export default Notifications;