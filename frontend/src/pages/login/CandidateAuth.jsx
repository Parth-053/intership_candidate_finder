import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, sendEmailVerification } from '../../firebase'; // Naya import
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import axios from 'axios'; // ✅ Axios (aapke backend ke liye)
import './AuthForm.css'; // (CSS file neeche hai)

const API_URL = 'http://localhost:5000/api';

const CandidateAuth = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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
        // Step 1: Firebase se login karein
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        // Step 2: AuthContext baaki kaam (token set karna, redirect) kar dega
        setLoading(false);
        navigate('/candidate/dashboard');
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

        // ✅ Step 2: Apne OOP Backend ko call karein (data Firestore mein save karne ke liye)
        await axios.post(`${API_URL}/auth/register`, {
            uid: user.uid,
            name: formData.name,
            email: user.email,
            role: "candidate"
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
    <div className="auth-body candidate-auth"> 
      <div className="container">
        <div className="left-panel">
          <h1>Find Your Dream Job</h1>
          <p>Connect with top employers and discover opportunities.</p>
        </div>
        <div className="right-panel">
          <div className="logo"><h2>Career<span>Connect</span></h2><p>Candidate Portal</p></div>
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
              <div className="form-group"><label>Password</label><input type="password" name="password" onChange={handleChange} required /></div>
              <button type="submit" className="btn" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateAuth;