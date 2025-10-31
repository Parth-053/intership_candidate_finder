import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import saveIcon from "../../../assets/icons/save.png";
import savedIcon from "../../../assets/icons/saved.png";
import shareIcon from "../../../assets/icons/share.png";
import "../../../styles/candidate/common/InternshipCard.css";

const BACKEND_STATIC_URL = 'http://localhost:5000'; // ✅ Backend URL

const InternshipCard = ({
    id, title, company, location, stipend, duration, logo,
    internshipType, isSaved: initialSaved, onSaveToggle,
}) => {
    const [isSaved, setIsSaved] = useState(initialSaved);
    useEffect(() => { setIsSaved(initialSaved); }, [initialSaved]);

    const formatStipend = () => {
        if (!stipend || typeof stipend !== 'object') { return stipend || "Not Disclosed"; }
        if (stipend.min === 0 && stipend.max === 0) return "Unpaid";
        if (stipend.min > 0 && stipend.max > 0 && stipend.min !== stipend.max) { return `${stipend.currency || '₹'} ${stipend.min?.toLocaleString()} - ${stipend.max?.toLocaleString()} ${stipend.interval || '/Month'}`; }
        if (stipend.min > 0 || stipend.max > 0) { const value = stipend.max > 0 ? stipend.max : stipend.min; return `${stipend.currency || '₹'} ${value?.toLocaleString()} ${stipend.interval || '/Month'}`; }
        return "Not Disclosed";
    };

    const handleSaveClick = () => {
        if (typeof onSaveToggle === 'function') { onSaveToggle(id, isSaved); }
        else { console.warn("onSaveToggle prop not provided"); alert("Could not save/unsave."); }
    };

    const handleShareClick = () => {
        const detailPageUrl = `${window.location.origin}/internships/${id}`;
        navigator.clipboard.writeText(detailPageUrl)
            .then(() => alert("🔗 Internship link copied!"))
            .catch(err => console.error('Failed to copy: ', err));
    };

    // ✅ Construct full logo URL pointing to backend
    const logoPath = logo || '/icons/default-logo.png';
    const fullLogoUrl = `${BACKEND_STATIC_URL}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;

    return (
        <div className="internship-card">
            <div className="card-header">
                <img
                    src={fullLogoUrl} // ✅ Use full backend URL
                    alt={`${company} logo`}
                    className="company-logo"
                    onError={(e) => { e.target.src = `${BACKEND_STATIC_URL}/icons/default-logo.png`; }}
                 />
                <div className="internship-info">
                    <h3 className="internship-title">{title || "Internship Title"}</h3>
                    <p className="internship-company">{company || "Company Name"}</p>
                </div>
            </div>
            <div className="internship-details">
                <p className="detail-item"><b>Location:</b> {location || "N/A"}</p>
                <p className="detail-item"><b>Mode:</b> <span style={{ textTransform: 'capitalize' }}>{internshipType?.type || "N/A"}</span></p>
                <p className="detail-item"><b>Stipend:</b> {formatStipend()}</p>
                <p className="detail-item"><b>Duration:</b> {duration || "N/A"}</p>
            </div>
            <div className="card-footer">
                <Link to={`/internships/${id}`} className="apply-button-link">
                    <button className="apply-button">Apply Now</button>
                </Link>
                <div className="action-icons">
                    <button className="icon-btn" onClick={handleSaveClick}>
                        <img src={isSaved ? savedIcon : saveIcon} alt="Save" className={`action-icon ${isSaved ? "saved-active" : ""}`} />
                    </button>
                    <button className="icon-btn" onClick={handleShareClick}>
                        <img src={shareIcon} alt="Share" className="action-icon" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InternshipCard;