import React, { useContext } from "react"; // Import useContext
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"; // Import NavLink and useNavigate
import { AuthContext } from "../../../context/AuthContext"; // Adjust path if needed
import "../../../styles/candidate/common/TopNavbar.css";
import logo from "../../../assets/images/logo.png";

const TopNavbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { authData, logout } = useContext(AuthContext); // Get auth state and logout function
    const user = authData?.user; // Easily access user details
    const isCandidate = user?.role === 'candidate';
    // const isRecruiter = user?.role === 'recruiter'; // Uncomment if needed

    // Base menu items visible to everyone
    const baseMenuItems = [
        { name: "Home", link: "/home" },
        { name: "Internships", link: "/internships" },
    ];

    // Candidate specific menu items
    const candidateMenuItems = [
        // ✅ FIXED: Path updated to /candidate/dashboard
        { name: "Dashboard", link: "/candidate/dashboard" },
        // ✅ FIXED: Path updated to /candidate/profile
        { name: "Profile", link: "/candidate/profile" },
    ];

    // Determine which menu items to show
    const menuItems = isCandidate
        ? [...baseMenuItems, ...candidateMenuItems]
        : baseMenuItems; // Only show base items if not a logged-in candidate

    const handleLogout = () => {
        logout(); // Call logout function from context
        navigate('/login'); // Redirect to the main login selection page
    };

    return (
        <nav className="top-navbar">
            <Link to="/home" className="logo-container">
                <img src={logo} alt="Career-Connect Logo" className="logo" />
                <span className="brand-name">Career-Connect</span>
            </Link>
            <div className="menu-container">
                {menuItems.map((item, index) => (
                    // ✅ Use NavLink for automatic 'active' class
                    <NavLink
                        key={index}
                        to={item.link}
                        className={({ isActive }) =>
                            `top-menu-item ${isActive ? "active" : ""}`
                        }
                        // Add 'end' prop so 'Home' isn't active on '/home/...'
                        end={item.link === '/home'}
                    >
                        {item.name}
                    </NavLink>
                ))}
            </div>

            {/* ✅ Conditional Buttons: Login/Signup or Logout */}
            <div className="auth-buttons-container">
                {user ? (
                    // Show User Name and Logout if logged in
                    <>
                         <span className="navbar-username">Hi, {user.name}</span>
                         <button onClick={handleLogout} className="top-navbar-btn logout-btn">Logout</button>
                    </>
                ) : (
                    // Show Login if not logged in
                    <>
                        <Link to="/login" className="top-navbar-btn login-btn">Login</Link>
                        {/* You can add a Sign Up button here if needed */}
                        {/* <Link to="/login/candidate" className="top-navbar-btn signup-btn">Sign Up</Link> */}
                    </>
                )}
            </div>
        </nav>
    );
};

export default TopNavbar;