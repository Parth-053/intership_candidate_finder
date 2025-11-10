import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
// 'db', 'doc', 'getDoc' ko hata diya gaya hai, kyunki backend call use hogi
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

// Backend API URL (Aapke Node.js server ka)
const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
    const [authData, setAuthData] = useState({ token: null, user: null, loading: true });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User logged in hai
                const token = await user.getIdToken();
                
                // Step 1: Token ko Axios ke global header mein set karein
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                try {
                    // Step 2: Client-side DB call ki jagah, backend ko call karein
                    // Yeh /api/profile/me route auth.mw.js se user ka data (role ke saath) laayega
                    const response = await axios.get(`${API_URL}/profile/me`);
                    
                    setAuthData({
                        token: token,
                        user: response.data, // Pura user object backend se
                        loading: false
                    });

                } catch (error) {
                    // Agar profile fetch fail ho (kisi bhi reason se)
                    console.error("Failed to fetch user profile from backend", error);
                    auth.signOut(); // User ko logout kar dein
                    delete axios.defaults.headers.common['Authorization'];
                    setAuthData({ token: null, user: null, loading: false });
                }

            } else {
                // User logged out hai
                delete axios.defaults.headers.common['Authorization'];
                setAuthData({ token: null, user: null, loading: false });
            }
        });
        return () => unsubscribe();
    }, []);

    const logout = () => {
        return auth.signOut(); // Firebase se sign out
    };

    const value = { authData, logout };

    return (
        <AuthContext.Provider value={value}>
            {!authData.loading && children}
        </AuthContext.Provider>
    );
};