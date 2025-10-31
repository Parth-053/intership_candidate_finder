import React, { useState, useContext } from 'react'; // Added useContext
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Added axios
import { AuthContext } from '../../context/AuthContext'; // Assuming you have an AuthContext
import './CandidateLogin.css';

// Base URL for your backend API
const API_URL = 'http://localhost:5000/api';

const CandidateLogin = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false); // Added loading state
    const [error, setError] = useState(''); // Unified error state
    const { setAuthData } = useContext(AuthContext); // Get context function
    const navigate = useNavigate();

    const handleLoginChange = (e) => {
        setLoginData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError(''); // Clear error on change
    };

    const handleSignupChange = (e) => {
        setSignupData(prev => ({ ...prev, [e.target.name]: e.target.value }));
         setError(''); // Clear error on change
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (activeTab === 'signup') {
            if (signupData.password !== signupData.confirmPassword) {
                setError("Passwords do not match!");
                setLoading(false);
                return;
            }
            try {
                // ✅ Added role: "candidate"
                const response = await axios.post(`${API_URL}/auth/register`, {
                    name: signupData.name,
                    email: signupData.email,
                    password: signupData.password,
                    role: "candidate" // Specify the role
                });
                alert(response.data.message || "Signup successful! Please login.");
                setActiveTab('login'); // Switch to login tab after signup
                // Optionally clear signup form
                setSignupData({ name: '', email: '', password: '', confirmPassword: '' });

            } catch (err) {
                console.error("Signup failed:", err);
                setError(err.response?.data?.message || "Signup failed. Please try again.");
            }

        } else { // Login Logic
            try {
                const response = await axios.post(`${API_URL}/auth/login`, {
                    email: loginData.email,
                    password: loginData.password, // Sending plain text password
                });

                const { token, user } = response.data;

                // ✅ Check if the logged-in user is a candidate
                if (user && user.role === 'candidate') {
                    localStorage.setItem('authToken', token); // Save token
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Set default header
                    setAuthData({ token, user }); // Update auth context
                    navigate('/candidate/dashboard'); // ✅ Redirect to candidate dashboard (Update path if needed)
                } else {
                    // If the user is not a candidate (e.g., recruiter)
                    setError('Access denied. Please use the recruiter login.');
                }

            } catch (err) {
                console.error("Login failed:", err);
                setError(err.response?.data?.message || "Login failed. Invalid credentials or server error.");
            }
        }
        setLoading(false); // Stop loading indicator
    };

    return (
        <div className="candidate-login-body">
            <div className="container">
                {/* Left Panel */}
                <div className="left-panel">{/* ... Your existing left panel content ... */}</div>

                {/* Right Panel */}
                <div className="right-panel">
                    <div className="logo">{/* ... Logo content ... */}</div>
                    <div className="tabs">
                        <div className={`tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => { setActiveTab('login'); setError(''); }}>Login</div>
                        <div className={`tab ${activeTab === 'signup' ? 'active' : ''}`} onClick={() => { setActiveTab('signup'); setError(''); }}>Sign Up</div>
                    </div>

                     {/* Display Error Message */}
                     {error && <p className="error-message" style={{color: 'red', textAlign: 'center', marginBottom: '10px'}}>{error}</p>}

                    {/* Login Form */}
                    <div className={`form-container ${activeTab === 'login' ? 'active' : ''}`}>
                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label htmlFor="login-email">Email</label>
                                <input type="email" id="login-email" name="email" placeholder="Enter your email" value={loginData.email} onChange={handleLoginChange} required disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="login-password">Password</label>
                                <input type="password" id="login-password" name="password" placeholder="Enter your password" value={loginData.password} onChange={handleLoginChange} required disabled={loading} />
                            </div>
                            <button type="submit" className="btn" disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                        {/* ... Social login etc. ... */}
                    </div>

                    {/* Sign Up Form */}
                    <div className={`form-container ${activeTab === 'signup' ? 'active' : ''}`}>
                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label htmlFor="signup-name">Full Name</label>
                                <input type="text" id="signup-name" name="name" placeholder="Enter your full name" value={signupData.name} onChange={handleSignupChange} required disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signup-email">Email</label>
                                <input type="email" id="signup-email" name="email" placeholder="Enter your email" value={signupData.email} onChange={handleSignupChange} required disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signup-password">Password</label>
                                <input type="password" id="signup-password" name="password" placeholder="Create a password" value={signupData.password} onChange={handleSignupChange} required disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signup-confirmPassword">Confirm Password</label>
                                <input type="password" id="signup-confirmPassword" name="confirmPassword" placeholder="Confirm your password" value={signupData.confirmPassword} onChange={handleSignupChange} required disabled={loading} />
                            </div>
                            <button type="submit" className="btn" disabled={loading}>
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>
                        {/* ... Social login etc. ... */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateLogin;

