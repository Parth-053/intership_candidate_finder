import React, { useContext } from 'react'; // ✅ useContext
import { NavLink, useNavigate } from 'react-router-dom'; // ✅ useNavigate
import { AuthContext } from '../../../context/AuthContext'; // ✅ AuthContext (path check karein)
import '../../../styles/recruiter/common/TopNavbar.css';
// import logo from '../../../assets/images/logo.png'; 

const BACKEND_STATIC_URL = 'http://localhost:5000'; // ✅ Backend URL

const TopNavbar = () => {
  const { authData, logout } = useContext(AuthContext); // ✅ Auth state aur logout
  const navigate = useNavigate(); // ✅ Navigate hook

  const menuItems = [
    { name: "Dashboard", link: "/recruiter/dashboard" },
    { name: "Job Postings", link: "/recruiter/postings" },
    { name: "Applicants", link: "/recruiter/applicants" }, // Yeh sabhi recent applicants dikhayega
    { name: "Company Profile", link: "/recruiter/profile" },
  ];

  // ✅ Logout handler
  const handleLogout = () => {
    logout(); // Context se token/user clear karein
    navigate('/login/recruiter'); // Recruiter login par redirect
  };

  return (
    <nav className="recruiter-top-navbar">
      <NavLink to="/recruiter/dashboard" className="logo-container">
        {/* Logo URL ko backend se construct karein agar user logged in hai */}
        {/* {authData?.user?.companyLogo ? (
            <img 
                src={`${BACKEND_STATIC_URL}${authData.user.companyLogo}`} 
                alt="Logo" 
                className="logo" 
                onError={(e) => e.target.style.display = 'none'} // Hide if logo fails
            />
        ) : (
            <span className="brand-name">CareerConnect</span>
        )} */}
        <span className="brand-name">CareerConnect</span>
      </NavLink>
      <div className="menu-container">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.link}
            className={({ isActive }) => isActive ? "top-menu-item active" : "top-menu-item"}
            end={item.link === "/recruiter/dashboard"} // Dashboard ke liye exact match
          >
            {item.name}
          </NavLink>
        ))}
      </div>
      
      {/* ✅ Auth Buttons */}
      <div className="auth-buttons-container">
        {authData?.user ? (
          <>
            <span className="navbar-username">Hi, {authData.user.name}</span>
            <button onClick={handleLogout} className="top-navbar-btn logout-btn">Logout</button>
          </>
        ) : (
          <NavLink to="/login" className="top-navbar-btn login-btn">Login</NavLink>
        )}
      </div>
    </nav>
  );
};

export default TopNavbar;