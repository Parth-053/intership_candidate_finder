import React, { useContext } from 'react'; // Import useContext
import { NavLink, useNavigate } from 'react-router-dom'; // Import useNavigate
import { AuthContext } from '../../../context/AuthContext'; // Import AuthContext
import '../../../styles/candidate/dashboard/Sidebar.css';
import profilePic from '../../../assets/images/profile.png'; // Update path

const Sidebar = () => {
    const { authData, logout } = useContext(AuthContext); // Get user data and logout function
    const navigate = useNavigate(); // Hook for navigation

    // Get user details from context, provide defaults if not logged in
    const userName = authData?.user?.name || "Candidate";
    const userEmail = authData?.user?.email || "";

    // Adjust links based on role (optional, but good practice if sidebar is reused)
    // Make sure these paths match your App.js routes
    const dashboardLink = authData?.user?.role === 'candidate' ? '/candidate/dashboard' : '/';
    const applicationsLink = authData?.user?.role === 'candidate' ? '/candidate/dashboard/applications' : '/';
    const savedLink = authData?.user?.role === 'candidate' ? '/candidate/dashboard/saved' : '/';
    const profileLink = authData?.user?.role === 'candidate' ? '/candidate/profile' : '/'; // Path might differ slightly depending on where you handle profile edits
    const notificationsLink = authData?.user?.role === 'candidate' ? '/candidate/dashboard/notifications' : '/';

    const menuItems = [
        { name: 'Dashboard', icon: '📊', link: dashboardLink },
        { name: 'My Applications', icon: '📄', link: applicationsLink },
        { name: 'Saved Internships', icon: '⭐', link: savedLink },
        { name: 'Edit Profile', icon: '✏️', link: profileLink },
        { name: 'Notifications', icon: '🔔', link: notificationsLink },
    ];

    const handleLogout = () => {
        logout(); // Call logout function from context
        navigate('/login/candidate'); // Redirect to candidate login page
    };

    return (
        <div className="dashboard-sidebar">
            <div className="sidebar-profile-section">
                <img src={profilePic} alt="Profile" className="sidebar-profile-pic" />
                 {/* ✅ Display dynamic user data */}
                <h4 className="sidebar-user-name">{userName}</h4>
                {userEmail && <p className="sidebar-user-email">{userEmail}</p>} {/* Only show email if available */}
            </div>
            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                // Ensure NavLink refreshes correctly if needed, maybe using 'end' prop for dashboard link
                                to={item.link}
                                className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
                                // Add 'end' prop if '/dashboard' should only be active for exact match
                                end={item.link === dashboardLink}
                            >
                                <span className="icon">{item.icon}</span>
                                <span className="link-text">{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="sidebar-logout">
                 {/* ✅ Added onClick handler */}
                <button onClick={handleLogout} className="logout-btn">
                     <span className="icon">🚪</span> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;