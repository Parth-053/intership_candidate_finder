import React, { useEffect, useState, useContext } from "react";
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext'; // Path check karein
import InternshipCard from "../common/InternshipCard";
import "../../../styles/candidate/home/LatestInternships.css";
import { Link } from "react-router-dom";

const API_URL = 'http://localhost:5000/api';

const LatestInternships = () => {
    const [internships, setInternships] = useState([]);
    const [savedInternshipIds, setSavedInternshipIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authData } = useContext(AuthContext); // ✅ Auth data
    const token = authData?.token || localStorage.getItem('authToken'); // ✅ Token lein

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            // ✅ Token ko header mein set karein (AuthContext ke load hone ka wait karein)
            if (token && !axios.defaults.headers.common['Authorization']) {
                 axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }

            try {
                // ✅ Sahi endpoint /api/internships
                const internshipsPromise = axios.get(`${API_URL}/internships`);
                const savedPromise = token
                    ? axios.get(`${API_URL}/candidate/saved-internships`)
                    : Promise.resolve({ data: [] });

                const [internRes, savedRes] = await Promise.all([internshipsPromise, savedPromise]);

                const allInternships = internRes.data || [];
                const savedData = savedRes.data || [];

                const savedIds = new Set(savedData.map(item => item.id));
                setSavedInternshipIds(savedIds);

                setInternships(allInternships.slice(0, 12)); // ✅ 12 internships dikhayein
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
    }, [token]); // ✅ token par depend karein

    const handleSaveToggle = async (internshipId, currentIsSaved) => {
        // ... (save logic same rahega) ...
        if (!token) {
             alert("Please log in to save/unsave internships.");
             return;
        }
        try {
            await axios.post(`${API_URL}/profile/save/${internshipId}`);
            setSavedInternshipIds(prevIds => {
                const newIds = new Set(prevIds);
                if (currentIsSaved) { newIds.delete(internshipId); }
                else { newIds.add(internshipId); }
                return newIds;
            });
        } catch (err) {
            console.error("Failed to toggle save state:", err);
            alert(err.response?.data?.message || "Could not update saved status.");
        }
    };


    if (loading) { return <div className="latest-internships" style={{ padding: "20px" }}>Loading latest internships...</div>; }
    if (error) { return <div className="latest-internships error-message" style={{ padding: "20px", color: 'red' }}>{error}</div>; } // ✅ Error red mein

    return (
        <div className="latest-internships">
            <div className="section-header">
                <h2 className="section-title">Latest Internships</h2>
                <Link to="/internships" className="view-all-link">View All</Link>
            </div>
            <div className="internships-grid large-grid"> {/* Grid class update karein agar 12 ke liye alag style hai */}
                {internships.length > 0 ? (
                    internships.map((internship) => {
                        const isSaved = savedInternshipIds.has(internship.id);
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