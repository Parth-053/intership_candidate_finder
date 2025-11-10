import React, { useState, useEffect, useContext } from 'react'; // ✅ useContext
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext'; // ✅ IMPORT KAREIN
import { Link } from 'react-router-dom';
import '../../../styles/candidate/dashboard/Notifications.css';

const API_URL = 'http://localhost:5000/api';

const timeAgo = (dateString) => {
    // ... (timeAgo function waisa hi rahega) ...
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

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authData } = useContext(AuthContext); // ✅ AuthContext KA ISTEMAAL KAREIN

    useEffect(() => {
        const fetchNotifications = async () => {
            const token = authData?.token; // ✅ TOKEN KO CONTEXT SE LEIN
            if (!token) {
                setLoading(false);
                return;
            }
            
            // ✅ HEADER SET KAREIN
            if (!axios.defaults.headers.common['Authorization']) {
                 axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }

            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${API_URL}/candidate/notifications`);
                setNotifications(response.data.slice(0, 3));
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
                setError(err.response?.data?.message || "Failed to load notifications.");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [authData?.token]); // ✅ DEPENDENCY ADD KAREIN

    if (loading) {
        return <div className="dashboard-section modern">Loading notifications...</div>;
    }

    if (error && notifications.length === 0) {
        return <div className="dashboard-section modern error-message">{error}</div>;
    }

    return (
        <div className="notifications-panel dashboard-section modern">
            <div className="section-header">
                <h3 className="section-title">Notifications</h3>
                <Link to="/candidate/dashboard/notifications" className="view-all-link">View All</Link>
            </div>
            {notifications.length > 0 ? (
                <ul className="notification-list modern">
                    {notifications.map((notif) => (
                        <li key={notif.id} className={`notification-item modern ${!notif.read ? 'unread' : ''}`}>
                            <span className={`status-indicator ${!notif.read ? 'unread' : ''}`}></span>
                            <div className="notif-content">
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