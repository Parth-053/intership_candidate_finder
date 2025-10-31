import React, { useContext } from 'react'; // ✅ Import useContext
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext'; // ✅ Import AuthContext (adjust path if needed)
import '../../../styles/candidate/profile/ProfileSidebar.css';

const ProfileSidebar = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext); // ✅ Get logout function from context

    const navItems = [
        { name: "Profile Header", icon: "👤", targetId: "profile-header" }, // ✅ Added targetId
        { name: "Resume/CV", icon: "📄", targetId: "resume-cv" },
        { name: "Contact & Personal Information", icon: "📞", targetId: "contact-personal-information" },
        { name: "Education", icon: "🎓", targetId: "education" },
        { name: "Work Experience", icon: "💼", targetId: "work-experience" },
        { name: "Skills", icon: "🚀", targetId: "skills" },
        { name: "Social & Professional Links", icon: "🔗", targetId: "social-professional-links" }
    ];

    const handleLinkClick = (e, targetId) => {
        e.preventDefault();
        const targetElement = document.getElementById(targetId);
        // Try finding navbar by a more specific class or ID if possible
        const navbar = document.querySelector('.top-navbar-sticky-container') || document.querySelector('.top-navbar');

        if (targetElement) {
            const navbarHeight = navbar ? navbar.offsetHeight : 0; // Default to 0 if navbar not found
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            // Adjust offset (e.g., 20px) as needed for spacing below the navbar
            const scrollToPosition = targetPosition - navbarHeight - 20;

            window.scrollTo({
                top: scrollToPosition,
                behavior: 'smooth'
            });
        } else {
            console.warn(`Target element with ID "${targetId}" not found.`);
        }
    };

    const handleLogout = () => {
        logout(); // ✅ Call logout function from context
        navigate('/login'); // Redirect to login selection page
    };

    return (
        <nav className="profile-sidebar">
            <ul>
                {navItems.map((item, index) => {
                    // Use pre-defined targetId or generate one
                    const targetId = item.targetId || item.name.toLowerCase().replace(/ & /g, '-').replace(/[ /]/g, '-');
                    return (
                        <li key={index}>
                            {/* Use button or div for accessibility if href is only for scroll */}
                            <button // Changed to button for semantic correctness
                                className="sidebar-nav-button" // Add a class for styling
                                onClick={(e) => handleLinkClick(e, targetId)}
                            >
                                <span className="icon">{item.icon}</span> {item.name}
                            </button>
                        </li>
                    );
                })}
            </ul>
            <div className="logout-section">
                <button onClick={handleLogout} className="logout-btn">
                    <span className="icon">🚪</span> Logout
                </button>
            </div>
        </nav>
    );
};

export default ProfileSidebar;