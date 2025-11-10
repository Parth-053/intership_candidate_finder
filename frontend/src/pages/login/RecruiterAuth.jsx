import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, sendEmailVerification } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import axios from 'axios'; // ✅ Axios (aapke backend ke liye)
import './AuthForm.css';

const API_URL = 'http://localhost:5000/api';

const RecruiterAuth = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', position: '', password: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // --- LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setInfo('');
    try {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        setLoading(false);
        navigate('/recruiter/dashboard');
    } catch (err) {
        setLoading(false);
        setError(err.message.replace('Firebase: ', ''));
    }
  };

  // --- SIGNUP ---
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setInfo('');
    try {
        // Step 1: Firebase Auth mein user banayein
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // ✅ Step 2: Apne OOP Backend ko call karein
        await axios.post(`${API_URL}/auth/register`, {
            uid: user.uid,
            name: formData.name,
            email: user.email,
            role: "recruiter",
            company: formData.company,
            position: formData.position
        });

        // Step 3: Email verification bhejein
        await sendEmailVerification(user);
        
        setLoading(false);
        setInfo("Signup successful! Please check your email to verify.");
        setIsLoginView(true);

    } catch (err) {
        setLoading(false);
        setError(err.message.replace('Firebase: ', ''));
    }
  };

  return (
    <div className="auth-body recruiter-auth">
      <div className="container">
        <div className="left-panel">
          <h1>Find Top Talent</h1>
          <p>Connect with qualified candidates and streamline your hiring process.</p>
        </div>
        <div className="right-panel">
          <div className="logo"><h2>Career<span>Connect</span></h2><p>Recruiter Portal</p></div>
          <div className="tabs">
            <div className={`tab ${isLoginView ? 'active' : ''}`} onClick={() => setIsLoginView(true)}>Login</div>
            <div className={`tab ${!isLoginView ? 'active' : ''}`} onClick={() => setIsLoginView(false)}>Sign Up</div>
          </div>
          {error && <div className="auth-alert error">{error}</div>}
          {info && <div className="auth-alert info">{info}</div>}
          {isLoginView ? (
            <form onSubmit={handleLogin} className="form-container active">
              <div className="form-group"><label>Email</label><input type="email" name="email" onChange={handleChange} required /></div>
              <div className="form-group"><label>Password</label><input type="password" name="password" onChange={handleChange} required /></div>
              <button type="submit" className="btn" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="form-container active">
              <div className="form-group"><label>Full Name</label><input type="text" name="name" onChange={handleChange} required /></div>
              <div className="form-group"><label>Email</label><input type="email" name="email" onChange={handleChange} required /></div>
              <div className="form-group"><label>Company</label><input type="text" name="company" onChange={handleChange} required /></div>
              <div className="form-group"><label>Position</label><input type="text" name="position" onChange={handleChange} required /></div>
              <div className="form-group"><label>Password</label><input type="password" name="password" onChange={handleChange} required /></div>
              <button type="submit" className="btn" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterAuth;