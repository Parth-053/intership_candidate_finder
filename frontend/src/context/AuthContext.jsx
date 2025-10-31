import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api'; // Backend API URL

export const AuthProvider = ({ children }) => {
    const [authData, setAuthDataState] = useState({ token: null, user: null });
    const [loading, setLoading] = useState(true); // App load state

    // ✅ Yeh hook App load hone par token check karega
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Token ko axios defaults mein set karein
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Profile fetch karke token verify karein
            axios.get(`${API_URL}/profile/me`)
                .then(res => {
                    // Token valid hai, user data set karein
                    setAuthDataState({ token, user: res.data });
                    setLoading(false);
                })
                .catch(() => {
                    // Token invalid hai, clear karein
                    localStorage.removeItem('authToken');
                    delete axios.defaults.headers.common['Authorization'];
                    setAuthDataState({ token: null, user: null });
                    setLoading(false);
                });
        } else {
            setLoading(false); // Koi token nahi hai
        }
    }, []); // Sirf ek baar app load hone par chalega

    // Login function
    const setAuthData = ({ token, user }) => {
        localStorage.setItem('authToken', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setAuthDataState({ token, user });
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('authToken');
        delete axios.defaults.headers.common['Authorization'];
        setAuthDataState({ token: null, user: null });
    };

    // Jab tak token verify na ho, app na dikhayein
    if (loading) {
        return <div style={{textAlign: 'center', padding: '50px', fontSize: '1.2em'}}>Loading Application...</div>;
    }

    return (
        <AuthContext.Provider value={{ authData, setAuthData, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};