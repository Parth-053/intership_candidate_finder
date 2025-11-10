import React, { useEffect, useState, useContext } from "react";
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import InternshipCard from "../common/InternshipCard";
import "../../../styles/candidate/home/LatestInternships.css";
import { Link } from "react-router-dom";

const API_URL = 'http://localhost:5000/api';

const LatestInternships = () => {
    const [internships, setInternships] = useState([]);
    const [savedInternshipIds, setSavedInternshipIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authData } = useContext(AuthContext); 
    const token = authData?.token; // Token context se lein

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            try {
                // API pehle se hi sorted data degi (latest pehle)
                const internshipsPromise = axios.get(`${API_URL}/internships`, { headers });
                const savedPromise = token
                    ? axios.get(`${API_URL}/candidate/saved-internships`, { headers })
                    : Promise.resolve({ data: [] });

                const [internRes, savedRes] = await Promise.all([internshipsPromise, savedPromise]);

                const allInternships = internRes.data || [];
                const savedData = savedRes.data || [];

                const savedIds = new Set(savedData.map(item => String(item.id)));
                setSavedInternshipIds(savedIds);
                
                // ✅ FIX: Frontend par sorting ki zaroorat nahi, seedha slice karein
                setInternships(allInternships.slice(0, 12)); 
            } catch (err) {
                console.error("Failed to load data:", err);
                setError(err.response?.data?.message || "Could not load internships.");
                setInternships([]);
                setSavedInternshipIds(new Set());
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]); 

    const handleSaveToggle = async (internshipId, currentIsSaved) => {
        if (!token) {
             alert("Please log in to save/unsave internships.");
             return;
        }
        
        const idString = String(internshipId);

        try {
            await axios.post(`${API_URL}/profile/save/${idString}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSavedInternshipIds(prevIds => {
                const newIds = new Set(prevIds);
                if (currentIsSaved) { newIds.delete(idString); }
                else { newIds.add(idString); }
                return newIds;
            });
        } catch (err) {
            console.error("Failed to toggle save state:", err);
            alert(err.response?.data?.message || "Could not update saved status.");
        }
    };


    if (loading) { return <div className="latest-internships" style={{ padding: "20px" }}>Loading latest internships...</div>; }
    if (error) { return <div className="latest-internships error-message" style={{ padding: "20px", color: 'red' }}>{error}</div>; } 

    return (
        <div className="latest-internships">
            <div className="section-header">
                <h2 className="section-title">Latest Internships</h2>
                <Link to="/internships" className="view-all-link">View All</Link>
            </div>
            <div className="internships-grid large-grid"> 
                {internships.length > 0 ? (
                    internships.map((internship) => {
                        const isSaved = savedInternshipIds.has(String(internship.id));
                        return (
                            <InternshipCard
                                key={internship.id}
                                {...internship}
                                isSaved={isSaved}
                                onSaveToggle={handleSaveToggle}
                            />
                        );
                    })
                ) : (
                    <p>No internships found at the moment.</p>
                )}
            </div>
        </div>
    );
};

export default LatestInternships;