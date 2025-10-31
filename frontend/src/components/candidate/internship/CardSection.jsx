import React, { useEffect, useState, useContext } from "react";
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import InternshipCard from "../common/InternshipCard";
import "../../../styles/candidate/internship/CardSection.css";

const API_URL = 'http://localhost:5000/api';

// Fisher-Yates Shuffle
const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

// ✅ Refined filtering logic
const filterInternship = (internship, selections) => {
    for (const category in selections) {
        const selectedValues = selections[category];
        if (!Array.isArray(selectedValues) || selectedValues.length === 0) continue; // Skip if empty or invalid

        let match = false;
        const categoryLower = category.toLowerCase(); // Use lower case for switch

        let internshipValue;
        switch (categoryLower) {
            case 'category':
                internshipValue = internship.title?.toLowerCase() || '';
                // Check if the internship title contains *any* of the selected category keywords
                match = selectedValues.some(value => internshipValue.includes(value.toLowerCase()));
                break;
            case 'location':
                internshipValue = internship.location?.toLowerCase() || '';
                // Check if the internship location exactly matches *any* of the selected locations
                match = selectedValues.some(value => internshipValue === value.toLowerCase());
                break;
            case 'company': // Use singular 'Company' key
                internshipValue = internship.company?.toLowerCase() || '';
                 // Check if the internship company exactly matches *any* of the selected companies
                match = selectedValues.some(value => internshipValue === value.toLowerCase());
                break;
            case 'mode': // Use 'Mode' key (matches Sidebar config)
                internshipValue = internship.internshipType?.type?.toLowerCase() || '';
                 // Check if the internship mode matches *any* of the selected modes
                match = selectedValues.some(value => internshipValue === value.toLowerCase());
                break;
            case 'duration':
                internshipValue = internship.duration?.toLowerCase() || '';
                // Check if the internship duration exactly matches *any* of the selected durations
                match = selectedValues.some(value => internshipValue === value.toLowerCase());
                break;
             case 'stipend':
                 const internMin = internship.stipend?.min ?? 0; // Use nullish coalescing for 0
                 const internMax = internship.stipend?.max ?? 0;

                 // Determine if the internship is unpaid
                 const isUnpaid = internMin === 0 && internMax === 0;

                 match = selectedValues.some(range => {
                     const [rangeMin, rangeMax] = range.split('-').map(Number);

                     // Handle "Unpaid" match specifically
                     if (isUnpaid && rangeMin === 0 && rangeMax > 0) { // Assuming "0-..." ranges include unpaid
                        return true;
                     }
                     // If internship is paid, check for range overlap
                     // Check if internship's MIN stipend falls within the selected range OR
                     // Check if internship's MAX stipend falls within the selected range OR
                     // Check if selected range is fully contained within internship's range
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
             // Add case for 'Timing' if needed
             // case 'timing':
             //    internshipValue = internship.internshipType?.timing?.toLowerCase() || '';
             //    match = selectedValues.some(value => internshipValue === value.toLowerCase());
             //    break;
            default:
                // Don't filter out based on unrecognized filter categories
                match = true;
        }

        // If it doesn't match for this category, the internship is excluded
        if (!match) {
            return false;
        }
    }
    // If the internship passes checks for all active filter categories, include it
    return true;
};


const CardSection = ({ isSidebarCollapsed, selections, isReady }) => {
    const [allInternships, setAllInternships] = useState([]);
    const [filteredInternships, setFilteredInternships] = useState([]);
    const [savedInternshipIds, setSavedInternshipIds] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { authData } = useContext(AuthContext);

    // Effect for fetching data (no changes needed here)
    useEffect(() => {
        const fetchData = async () => {
            if (!isReady) return;
            setLoading(true); setError(null);
            const token = localStorage.getItem('authToken');
            try {
                const internshipsPromise = axios.get(`${API_URL}/internships`);
                const savedPromise = token ? axios.get(`${API_URL}/candidate/saved-internships`) : Promise.resolve({ data: [] });
                const [internRes, savedRes] = await Promise.all([internshipsPromise, savedPromise]);
                let fetchedInternships = internRes.data || [];
                const savedData = savedRes.data || [];
                fetchedInternships = shuffleArray(fetchedInternships); // Shuffle
                setAllInternships(fetchedInternships);
                setSavedInternshipIds(new Set(savedData.map(item => item.id)));
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError(err.response?.data?.message || "Could not load internships.");
                setAllInternships([]); setSavedInternshipIds(new Set());
            } finally { setLoading(false); }
        };
        fetchData();
    }, [isReady, authData.token]);

    // Effect for filtering (no changes needed here)
    useEffect(() => {
        if (!loading && isReady) { // Apply filters only when not loading and options are ready
            const filtered = allInternships.filter(internship => filterInternship(internship, selections));
            setFilteredInternships(filtered);
        } else {
             setFilteredInternships([]);
        }
    }, [allInternships, selections, loading, isReady]); // Added loading/isReady dependency

    // Handle Save/Unsave Toggle (no changes needed here)
    const handleSaveToggle = async (internshipId, currentIsSaved) => {
        const token = localStorage.getItem('authToken');
        if (!token) { alert("Please log in to save/unsave internships."); return; }
        try {
            await axios.post(`${API_URL}/profile/save/${internshipId}`);
            setSavedInternshipIds(prevIds => {
                const newIds = new Set(prevIds);
                if (currentIsSaved) { newIds.delete(internshipId); } else { newIds.add(internshipId); }
                return newIds;
            });
        } catch (err) {
            console.error("Failed to toggle save state:", err);
            alert(err.response?.data?.message || "Could not update saved status.");
        }
    };

    // Render logic (no major changes needed here)
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
                            isSaved={savedInternshipIds.has(internship.id)}
                            onSaveToggle={handleSaveToggle}
                        />
                    ))
                ) : (
                    // Show different message based on whether filters are applied
                    Object.keys(selections).length > 0
                        ? <p>No internships found matching your current filters.</p>
                        : <p>No internships currently available.</p>
                )}
            </div>
        </div>
    );
};

export default CardSection;