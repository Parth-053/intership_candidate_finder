import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import TopNavbar from '../../components/candidate/common/TopNavbar';
import '../../styles/candidate/MyApplicationsPage.css'; 
import '../../styles/candidate/dashboard/Notifications.css';

const API_URL = 'http://localhost:5000/api';

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

    // Data fetch karne wala useEffect waisa hi rahega
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
                // Yeh ab 'read' status database se laayega
                const response = await axios.get(`${API_URL}/candidate/notifications`);
                setNotifications(response.data || []);
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
                setError(err.response?.data?.message || "Failed to load notifications.");
            } finally {
                setLoading(false);
            }
        };
        
        if (authData.token) { // Token milne ke baad hi fetch karein
           fetchNotifications();
        }
    }, [authData?.token]);

    // ✅ Notification click ko handle karne wala naya function
    const handleNotificationClick = async (notifId) => {
        
        // Check karein ki notification pehle se read toh nahi hai
        const currentNotif = notifications.find(n => n.id === notifId);
        if (currentNotif.read) {
            console.log("Already read");
            return; // Agar pehle se read hai toh kuch na karein
        }
        
        // 1. UI ko turant update karein (Optimistic Update)
        setNotifications(prevNotifs => 
            prevNotifs.map(notif => 
                notif.id === notifId ? { ...notif, read: true } : notif
            )
        );

        // 2. Backend API ko call karein
        try {
            await axios.patch(`${API_URL}/candidate/notifications/${notifId}/read`);
            // Success! Kuch karne ki zaroorat nahi kyunki UI pehle hi update ho chuka hai.
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
            // 3. Agar API call fail ho, toh UI ko wapas purani state mein le aayein (Rollback)
            alert("Error updating notification status. Please try again.");
            setNotifications(prevNotifs => 
                prevNotifs.map(notif => 
                    notif.id === notifId ? { ...notif, read: false } : notif
                )
            );
        }
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
                                        onClick={() => handleNotificationClick(notif.id)} // ✅ Updated handler call
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
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;