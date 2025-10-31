import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import "../../../styles/candidate/home/TopCompanies.css";

const API_URL = 'http://localhost:5000/api';
const BACKEND_STATIC_URL = 'http://localhost:5000';

const TopCompanies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCompanies = async () => {
            setLoading(true); setError(null);
            try {
                // ✅ FIXED: Path /api/data/companies
                const response = await axios.get(`${API_URL}/data/companies`);
                setCompanies((response.data || []).slice(0, 10));
            } catch (err) {
                console.error("Failed to load companies:", err);
                setError("Could not load companies.");
                setCompanies([]);
            } finally { setLoading(false); }
        };
        fetchCompanies();
    }, []);

    return (
        <div className="top-companies">
            <div className="top-companies-header">
                <h2>Top Companies Hiring</h2>
                <Link to="/companies" className="view-all-btn"> View All </Link>
            </div>
            <div className="companies-grid">
                {loading ? ( <p>Loading companies...</p> )
                : error ? ( <p className="error-message" style={{color: 'red'}}>{error}</p> )
                : companies.length > 0 ? (
                    companies.map((company, index) => {
                        const logoPath = company.logo || '/icons/default-logo.png';
                        const fullLogoUrl = `${BACKEND_STATIC_URL}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
                        return (
                            <div key={company.name || index} className="company-card">
                                <img
                                    src={fullLogoUrl}
                                    alt={`${company.name} logo`}
                                    onError={(e) => { e.target.src = `${BACKEND_STATIC_URL}/icons/default-logo.png`; }}
                                />
                                <p>{company.name}</p>
                            </div>
                        );
                    })
                ) : ( <p>No companies found.</p> )}
            </div>
        </div>
    );
};

export default TopCompanies;