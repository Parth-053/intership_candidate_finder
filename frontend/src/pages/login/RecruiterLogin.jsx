import React, { useState, useContext } from 'react'; // Added useContext
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Added axios
import { AuthContext } from '../../context/AuthContext'; // Assuming you have an AuthContext
import './RecruiterLogin.css';

// Base URL for your backend API
const API_URL = 'http://localhost:5000/api';

const RecruiterLogin = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({
        name: '',
        email: '',
        company: '',
        position: '',
        password: '',
        confirmPassword: ''
    });
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
                // ✅ Added role: "recruiter" and recruiter fields
                const response = await axios.post(`${API_URL}/auth/register`, {
                    name: signupData.name,
                    email: signupData.email,
                    company: signupData.company,
                    position: signupData.position,
                    password: signupData.password,
                    role: "recruiter" // Specify the role
                    // Add other optional recruiter fields if needed (logo, description etc.)
                    // companyLogo: signupData.companyLogo,
                    // description: signupData.description,
                    // website: signupData.website,
                    // locations: signupData.locations // Assuming locations is an array
                });
                alert(response.data.message || "Signup successful! Please login.");
                setActiveTab('login'); // Switch to login tab after signup
                // Optionally clear signup form
                setSignupData({ name: '', email: '', company: '', position: '', password: '', confirmPassword: '' });

            } catch (err) {
                console.error("Signup failed:", err);
                setError(err.response?.data?.message || "Signup failed. Please try again.");
            }

        } else { // Login Logic
            try {
                const response = await axios.post(`${API_URL}/auth/login`, {
                    email: loginData.email,
                    password: loginData.password,
                });

                const { token, user } = response.data;

                // ✅ Check if the logged-in user is a recruiter
                if (user && user.role === 'recruiter') {
                    localStorage.setItem('authToken', token); // Save token
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Set default header
                    setAuthData({ token, user }); // Update auth context
                    navigate('/recruiter/dashboard'); // ✅ Redirect to recruiter dashboard
                } else {
                    // If the user is not a recruiter (e.g., candidate)
                    setError('Access denied. Please use the candidate login.');
                     // Optionally clear token if a non-recruiter somehow got one
                    localStorage.removeItem('authToken');
                    delete axios.defaults.headers.common['Authorization'];
                    setAuthData({ token: null, user: null }); // Clear context
                }

            } catch (err) {
                console.error("Login failed:", err);
                setError(err.response?.data?.message || "Login failed. Invalid credentials or server error.");
            }
        }
        setLoading(false); // Stop loading indicator
    };

    return (
        <div className="recruiter-login-body">
            <div className="container">
                 {/* Left Panel */}
                <div className="left-panel">
                    <h1>Find Top Talent</h1>
                    <p>Connect with qualified candidates and streamline your hiring process. Access powerful tools to post jobs, screen applicants, and find the perfect fit for your organization.</p>
                </div>

                {/* Right Panel */}
                <div className="right-panel">
                    <div className="logo">
                         <h2>Career<span>Connect</span></h2>
                         <p>Recruiter Portal</p>
                    </div>

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
                                <label htmlFor="login-email-recruiter">Email</label> {/* Changed ID slightly */}
                                <input type="email" id="login-email-recruiter" name="email" placeholder="Enter your email" value={loginData.email} onChange={handleLoginChange} required disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="login-password-recruiter">Password</label> {/* Changed ID slightly */}
                                <input type="password" id="login-password-recruiter" name="password" placeholder="Enter your password" value={loginData.password} onChange={handleLoginChange} required disabled={loading} />
                            </div>
                            <button type="submit" className="btn" disabled={loading}>
                                 {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                         {/* ... Social login and forgot password links ... */}
                    </div>

                    {/* Sign Up Form */}
                    <div className={`form-container ${activeTab === 'signup' ? 'active' : ''}`}>
                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label htmlFor="signup-name-recruiter">Full Name</label> {/* Changed ID slightly */}
                                <input type="text" id="signup-name-recruiter" name="name" placeholder="Enter your full name" value={signupData.name} onChange={handleSignupChange} required disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signup-email-recruiter">Email</label> {/* Changed ID slightly */}
                                <input type="email" id="signup-email-recruiter" name="email" placeholder="Enter your email" value={signupData.email} onChange={handleSignupChange} required disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signup-company-recruiter">Company</label> {/* Changed ID slightly */}
                                <input type="text" id="signup-company-recruiter" name="company" placeholder="Enter your company name" value={signupData.company} onChange={handleSignupChange} required disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signup-position-recruiter">Position</label> {/* Changed ID slightly */}
                                <input type="text" id="signup-position-recruiter" name="position" placeholder="Enter your position" value={signupData.position} onChange={handleSignupChange} required disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signup-password-recruiter">Password</label> {/* Changed ID slightly */}
                                <input type="password" id="signup-password-recruiter" name="password" placeholder="Create a password" value={signupData.password} onChange={handleSignupChange} required disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signup-confirmPassword-recruiter">Confirm Password</label> {/* Changed ID slightly */}
                                <input type="password" id="signup-confirmPassword-recruiter" name="confirmPassword" placeholder="Confirm your password" value={signupData.confirmPassword} onChange={handleSignupChange} required disabled={loading} />
                            </div>
                            <button type="submit" className="btn" disabled={loading}>
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>
                        {/* ... Social login ... */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterLogin;