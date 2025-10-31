import React from 'react';
import '../../../styles/candidate/internshipdetail/HeaderSection.css';

// Base URL for backend static files
const BACKEND_STATIC_URL = 'http://localhost:5000';

// Helper to format date safely
const formatDate = (dateString) => { /* ... (no changes needed) ... */
    if (!dateString) return 'N/A';
    try { return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch (e) { console.error("Error formatting date:", e); return 'Invalid Date'; }
};

const HeaderSection = ({ internship }) => {
    const { title = "Internship Title", company = "Company Name", logo, updatedOn } = internship || {};

    const formattedDate = formatDate(updatedOn);
    // ✅ Construct full logo URL pointing to backend
    const logoPath = logo || '/icons/default-logo.png';
    const fullLogoUrl = `${BACKEND_STATIC_URL}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;

    return (
        <div className="header-section-container">
            <div className="header-logo">
                 {/* ✅ Use fullLogoUrl */}
                <img
                    src={fullLogoUrl}
                    alt={`${company} logo`}
                    onError={(e) => { e.target.src = `${BACKEND_STATIC_URL}/icons/default-logo.png`; }} // Fallback
                 />
            </div>
            <div className="header-info">
                <h1 className="header-title">{title}</h1>
                <p className="header-company">{company}</p>
                <p className="header-update-date">Updated On: {formattedDate}</p>
            </div>
        </div>
    );
};

export default HeaderSection;