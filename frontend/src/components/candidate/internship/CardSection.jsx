import React, { useEffect, useState, useContext } from "react";
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import InternshipCard from "../common/InternshipCard";
import "../../../styles/candidate/internship/CardSection.css";

const API_URL = 'http://localhost:5000/api';

// ✅ Fisher-Yates Shuffle function (Isko hata diya gaya hai)
// const shuffleArray = (array) => { ... }

// ✅ Refined filtering logic (Yeh waise hi rahega)
const filterInternship = (internship, selections) => {
    // ... (filtering logic same as before) ...
    for (const category in selections) {
        const selectedValues = selections[category];
        if (!Array.isArray(selectedValues) || selectedValues.length === 0) continue; 

        let match = false;
        const categoryLower = category.toLowerCase(); 

        let internshipValue;
        switch (categoryLower) {
            case 'category':
                internshipValue = internship.title?.toLowerCase() || '';
                match = selectedValues.some(value => internshipValue.includes(value.toLowerCase()));
                break;
            case 'location':
                internshipValue = internship.location?.toLowerCase() || '';
                match = selectedValues.some(value => internshipValue === value.toLowerCase());
                break;
            case 'company': 
                internshipValue = internship.company?.toLowerCase() || '';
                match = selectedValues.some(value => internshipValue === value.toLowerCase());
                break;
            case 'mode': 
                internshipValue = internship.internshipType?.type?.toLowerCase() || '';
                match = selectedValues.some(value => internshipValue === value.toLowerCase());
                break;
            case 'duration':
                internshipValue = internship.duration?.toLowerCase() || '';
                match = selectedValues.some(value => internshipValue === value.toLowerCase());
                break;
             case 'stipend':
                 const internMin = internship.stipend?.min ?? 0;
                 const internMax = internship.stipend?.max ?? 0;
                 const isUnpaid = internMin === 0 && internMax === 0;

                 match = selectedValues.some(range => {
                     const [rangeMin, rangeMax] = range.split('-').map(Number);
                     if (isUnpaid && rangeMin === 0 && rangeMax > 0) {
                        return true;
                     }
                     if (!isUnpaid && (
                         (internMin >= rangeMin && internMin <= rangeMax) ||
                         (internMax >= rangeMin && internMax <= rangeMax) ||
                         (internMin <= rangeMin && internMax >= rangeMax)
                     )) {
                        return true;
                     }
                     return false;
                 });
                 break;
            default:
                match = true;
        }
        if (!match) {
            return false;
        }
    }
    return true;
};


const CardSection = ({ isSidebarCollapsed, selections, isReady }) => {
    const [allInternships, setAllInternships] = useState([]);
    const [filteredInternships, setFilteredInternships] = useState([]);
    const [savedInternshipIds, setSavedInternshipIds] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { authData } = useContext(AuthContext);

    // Effect for fetching data
    useEffect(() => {
        const fetchData = async () => {
            if (!isReady) return;
            setLoading(true); setError(null);
            const token = authData?.token || localStorage.getItem('authToken'); // Token lein
            
            // ✅ Axios header ko AuthContext ke bajaye yahan set karna better hai
            // taaki public users (bina token) bhi data dekh sakein
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            try {
                // ✅ API call mein headers pass karein
                const internshipsPromise = axios.get(`${API_URL}/internships`, { headers });
                const savedPromise = token ? axios.get(`${API_URL}/candidate/saved-internships`, { headers }) : Promise.resolve({ data: [] });
                
                const [internRes, savedRes] = await Promise.all([internshipsPromise, savedPromise]);
                
                let fetchedInternships = internRes.data || [];
                const savedData = savedRes.data || [];
                
                // ✅ Shuffle ko hata diya gaya hai. Data ab backend se sorted (latest) aayega.
                // fetchedInternships = shuffleArray(fetchedInternships); 
                
                setAllInternships(fetchedInternships);
                setSavedInternshipIds(new Set(savedData.map(item => String(item.id)))); // String IDs
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError(err.response?.data?.message || "Could not load internships.");
                setAllInternships([]); setSavedInternshipIds(new Set());
            } finally { setLoading(false); }
        };
        fetchData();
    }, [isReady, authData.token]);

    // Effect for filtering (yeh waise hi rahega)
    useEffect(() => {
        if (!loading && isReady) {
            const filtered = allInternships.filter(internship => filterInternship(internship, selections));
            setFilteredInternships(filtered);
        } else {
             setFilteredInternships([]);
        }
    }, [allInternships, selections, loading, isReady]);

    // Handle Save/Unsave Toggle
    const handleSaveToggle = async (internshipId, currentIsSaved) => {
        const token = authData?.token || localStorage.getItem('authToken');
        if (!token) { alert("Please log in to save/unsave internships."); return; }
        
        // ID ko string mein convert karein
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

    // Render logic (yeh waise hi rahega)
    if (!isReady) { return <div className="card-section"><p>Initializing filters...</p></div>; }
    if (loading) { return <div className="card-section"><p>Loading internships...</p></div>; }
    if (error) { return <div className="card-section error-message"><p>{error}</p></div>; }

    return (
        <div className="card-section">
            <p className="results-count">{filteredInternships.length} internship(s) found.</p>
            <div className={`internships-grid-container ${isSidebarCollapsed ? "four-columns" : "three-columns"}`}>
                {filteredInternships.length > 0 ? (
                    filteredInternships.map((internship) => (
                        <InternshipCard
                            key={internship.id}
                            {...internship}
                            isSaved={savedInternshipIds.has(String(internship.id))} // String ID se check karein
                            onSaveToggle={handleSaveToggle}
                        />
                    ))
                ) : (
                    Object.keys(selections).length > 0
                        ? <p>No internships found matching your current filters.</p>
                        : <p>No internships currently available.</p>
                )}
            </div>
        </div>
    );
};

export default CardSection;