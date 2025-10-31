import React from 'react';
import '../../../styles/recruiter/profile/CompanyInfoCard.css';

// ✅ Backend URL
const BACKEND_STATIC_URL = 'http://localhost:5000';
const defaultLogo = `${BACKEND_STATIC_URL}/icons/default-logo.png`; // Default logo

const CompanyInfoCard = ({ data, onEditClick }) => {
    
    // ✅ Logo URL construct karein
    const logoPath = data.companyLogo || '/icons/default-logo.png';
    const fullLogoUrl = logoPath.startsWith('http') 
        ? logoPath 
        : `${BACKEND_STATIC_URL}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;

    return (
        <div className="company-info-card">
            <div className="info-header">
                <img 
                    src={fullLogoUrl} // ✅ Full URL use karein
                    alt={`${data.company || 'Company'} Logo`} 
                    className="company-logo-display" 
                    onError={(e) => { e.target.src = defaultLogo; }} // Fallback
                />
                <h2>{data.company || 'Company Name Not Set'}</h2>
                 <button onClick={onEditClick} className="edit-profile-btn">Edit Profile</button>
            </div>
            <div className="info-body">
                <div className="info-item">
                    <strong>Website:</strong> 
                    {data.website ? (
                         <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} target="_blank" rel="noopener noreferrer">
                            {data.website}
                        </a>
                    ) : 'Not Added'}
                </div>
                 <div className="info-item">
                    <strong>Industry:</strong> {data.industry || 'Not Added'}
                </div>
                 <div className="info-item">
                    <strong>Company Size:</strong> {data.companySize || 'Not Added'}
                </div>
                <div className="info-item locations">
                     <strong>Locations:</strong> 
                     {Array.isArray(data.locations) && data.locations.length > 0 ? (
                        <div className="location-tags">
                            {data.locations.map((loc, index) => (
                                <span key={index} className="location-tag">{loc}</span>
                            ))}
                        </div>
                     ) : (
                         'Not Added'
                     )}
                </div>
                <div className="info-item description">
                    <strong>Description:</strong> 
                    <p>{data.description || 'No description added.'}</p>
                </div>
            </div>
        </div>
    );
};

export default CompanyInfoCard;