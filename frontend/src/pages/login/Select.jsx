import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Select.css';
// Make sure you have a logo image at this path or update the path
import logo from '../../assets/images/logo.png'; 

const Select = () => {
    const navigate = useNavigate();

    const handleLogin = (userType) => {
        if (userType === 'candidate') {
            navigate('/login/candidate');
        } else if (userType === 'recruiter') {
            navigate('/login/recruiter');
        }
    };

    return (
        <div className="select-page-body">
            <div className="select-container">
                <div className="select-header">
                    <img src={logo} alt="Career Connect Logo" className="select-logo" />
                    <h1>Welcome to CareerConnect</h1>
                    <p>Connect talent with opportunity</p>
                </div>
                <div className="select-content">
                    <div className="login-options">
                        <div className="option-card" onClick={() => handleLogin('candidate')}>
                            <div className="card-content">
                                <div className="icon">👤</div>
                                <h2>I am a Candidate</h2>
                                <p>Looking for your next career opportunity? Browse jobs, apply, and track your applications.</p>
                                <button className="btn">Continue as Candidate</button>
                            </div>
                        </div>
                        <div className="option-card" onClick={() => handleLogin('recruiter')}>
                            <div className="card-content">
                                <div className="icon">💼</div>
                                <h2>I am a Recruiter</h2>
                                <p>Find the perfect talent for your organization. Post jobs and manage candidates.</p>
                                <button className="btn">Continue as Recruiter</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Select;