import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from 'axios';
import TopNavbar from "../../components/candidate/common/TopNavbar";
import SearchBar from "../../components/candidate/home/SearchBar";
import Sidebar from "../../components/candidate/internship/Sidebar";
import AppliedFilters from "../../components/candidate/internship/AppliedFilter";
import CardSection from "../../components/candidate/internship/CardSection";
import "../../styles/candidate/internship/InternshipPage.css";

// Base URL for backend API
const API_URL = 'http://localhost:5000/api';

const Internship = () => {
    const [selections, setSelections] = useState({});
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [allCategories, setAllCategories] = useState([]);
    const [allCompanies, setAllCompanies] = useState([]);
    const [allLocations, setAllLocations] = useState([]);

    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();

    // ✅ FIXED: Sahi API endpoints use karein (Aapka bataya gaya code)
    useEffect(() => {
        const fetchFilterOptions = async () => {
             setError(null);
             setIsReady(false);
            try {
                // ✅ '/internships' ki jagah '/data/locations' ko call karein
                const [catRes, compRes, locRes] = await Promise.all([
                    axios.get(`${API_URL}/data/categories`),
                    axios.get(`${API_URL}/data/companies`),
                    axios.get(`${API_URL}/data/locations`) // <-- YEH CHANGE HUA HAI
                ]);

                const categoryTitles = Array.isArray(catRes.data) ? catRes.data.map(cat => cat.title).sort() : [];
                setAllCategories(categoryTitles);

                const companyNames = Array.isArray(compRes.data) ? compRes.data.map(comp => comp.name).sort() : [];
                setAllCompanies(companyNames);

                // ✅ Ab humein internships data se locations extract nahi karni
                const locations = Array.isArray(locRes.data) ? locRes.data.sort() : [];
                setAllLocations(locations);

                setIsReady(true);
            } catch (err) {
                console.error("Failed to load filter options:", err);
                setError("Could not load filter options. Please try refreshing the page.");
                setAllCategories([]); setAllCompanies([]); setAllLocations([]);
            }
        };
        fetchFilterOptions();
    }, []); // Yeh dependency array sahi hai (sirf ek baar run hoga)

    // ... (baaki sabhi functions: handleSearch, handleFilterChange, removeFilter) ...

    const handleSearch = useCallback((queryToSearch = searchQuery) => {
        if (!isReady) return;
        const lowerCaseQuery = queryToSearch.toLowerCase().trim();
         const newSelections = {};
        if (lowerCaseQuery.includes('remote') || lowerCaseQuery.includes('online') || lowerCaseQuery.includes('wfh')) { newSelections.Mode = ['Remote']; }
        else if (lowerCaseQuery.includes('office') || lowerCaseQuery.includes('in-office') || lowerCaseQuery.includes('onsite') || lowerCaseQuery.includes('offline')) { newSelections.Mode = ['On-site', 'Hybrid']; }
        const keywords = lowerCaseQuery.replace(/\b(remote|online|wfh|office|in-office|onsite|offline|part-time|full-time)\b/g, '').replace(/\b(\d+\.?\d*)\s*months?\b/g, '').split(/\s+/).filter(term => term.length > 2 && !['from', 'in', 'at', 'and', 'internship', 'for', 'with'].includes(term));
        if (keywords.length > 0) {
            const findMatches = (options, currentKeywords) => options.filter(option => currentKeywords.some(keyword => option.toLowerCase().includes(keyword)));
            if (allCategories.length > 0) { const found = findMatches(allCategories, keywords); if (found.length > 0) newSelections.Category = found; }
            if (allCompanies.length > 0) { const found = findMatches(allCompanies, keywords); if (found.length > 0) newSelections.Company = found; }
            if (allLocations.length > 0) { const found = findMatches(allLocations, keywords); if (found.length > 0) newSelections.Location = found; }
        }
         if (JSON.stringify(newSelections) !== JSON.stringify(selections)) {
            setSelections(newSelections);
         } else if (!lowerCaseQuery && Object.keys(selections).length > 0) {
             setSelections({});
         }
    }, [searchQuery, allCategories, allCompanies, allLocations, isReady, selections]);

    useEffect(() => {
        const queryFromUrl = searchParams.get('q');
        if (queryFromUrl && isReady) {
            setSearchQuery(queryFromUrl);
            handleSearch(queryFromUrl);
        }
    }, [searchParams, isReady, handleSearch]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
             setSelections(prevSelections => {
                 if (Object.keys(prevSelections).length > 0) { return {}; }
                 return prevSelections;
             });
        }
    }, [searchQuery]);

    const handleFilterChange = (filterName, option) => {
        setSelections(prev => {
            const currentSelections = prev[filterName] || [];
            let newSelectionsForCategory;
            if (currentSelections.includes(option)) {
                newSelectionsForCategory = currentSelections.filter(item => item !== option);
            } else {
                newSelectionsForCategory = [...currentSelections, option];
            }
            if (newSelectionsForCategory.length === 0) {
                 const { [filterName]: _, ...rest } = prev;
                 return rest;
            } else {
                 return { ...prev, [filterName]: newSelectionsForCategory };
            }
        });
    };

    const removeFilter = (category, value) => {
        setSelections(prev => {
            const updatedCategory = (prev[category] || []).filter(item => item !== value);
            let newSelections;
            if (updatedCategory.length === 0) {
                const { [category]: _, ...rest } = prev;
                newSelections = rest;
            } else {
                newSelections = { ...prev, [category]: updatedCategory };
            }
            if (Object.keys(newSelections).length === 0) {
                 setSearchQuery('');
            }
            return newSelections;
        });
    };

    return (
        <div className="internship-page">
            <div className="top-navbar-sticky-container">
                <TopNavbar />
            </div>
            <div className="internship-layout-container">
                <div className="left-panel">
                    <Sidebar
                        selections={selections}
                        onFilterChange={handleFilterChange}
                        onToggle={setIsSidebarCollapsed}
                        categories={allCategories}
                        companies={allCompanies}
                        locations={allLocations}
                    />
                </div>
                <div className="right-panel">
                    <div className="search-bar-container">
                        <SearchBar
                            query={searchQuery}
                            setQuery={setSearchQuery}
                            onSearch={() => handleSearch(searchQuery)} // Pass query
                        />
                        <AppliedFilters
                            selectedFilters={selections}
                            onRemoveFilter={removeFilter}
                        />
                    </div>
                    <div className="content-area">
                        <h2>Available Internships</h2>
                         {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}
                        <CardSection
                            isSidebarCollapsed={isSidebarCollapsed}
                            selections={selections}
                            isReady={isReady}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Internship;