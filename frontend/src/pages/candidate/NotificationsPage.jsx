import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import TopNavbar from '../../components/candidate/common/TopNavbar';
// Path ko correct kiya (assuming common styles)
import '../../styles/candidate/MyApplicationsPage.css'; 
import '../../styles/candidate/dashboard/Notifications.css';

const API_URL = 'http://localhost:5000/api';

// Simple relative time function
const timeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authData } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            const token = authData?.token || localStorage.getItem('authToken');
            if (!token) {
                setError("Please log in to view notifications.");
                setLoading(false);
                return;
            }
             if (!axios.defaults.headers.common['Authorization']) {
                 axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${API_URL}/candidate/notifications`);
                setNotifications(response.data || []);
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
                setError(err.response?.data?.message || "Failed to load notifications.");
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [authData?.token]);

    const handleNotificationClick = (notifId) => {
        console.log("Marking notification as read:", notifId);
        // TODO: Add API call to mark notification as read
    };

    return (
        <div className="my-applications-page">
            <TopNavbar />
            <div className="page-content-container">
                <div className="page-header">
                    <button onClick={() => navigate(-1)} className="back-button">
                        &larr; Back
                    </button>
                    <h1>Notifications</h1>
                </div>

                {loading && <p className="loading-text">Loading notifications...</p>}
                {error && <p className="error-message">{error}</p>}

                {!loading && !error && (
                    <div className="notifications-panel full-page-list">
                        {notifications.length > 0 ? (
                            <ul className="notification-list modern">
                                {notifications.map((notif) => (
                                    <li 
                                        key={notif.id} 
                                        className={`notification-item modern ${!notif.read ? 'unread' : ''}`}
                                        onClick={() => handleNotificationClick(notif.id)}
                                    >
                                        <span className={`status-indicator ${!notif.read ? 'unread' : ''}`}></span>
                                        <div className="notif-content">
                                            <p className="notif-text">{notif.message}</p>
                                            <span className="notif-time">{timeAgo(notif.date)}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-state">No notifications found.</p>
                        ) 
                    } {/* ✅ FIXED: Extra ')' bracket removed from here */}
                </div>
            )} {/* <-- Closing parenthesis moved here */}
        </div>
    </div>
    );
};

export default NotificationsPage;