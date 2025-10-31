import React from 'react';
import '../../../styles/candidate/internshipdetail/DetailsSection.css';

// Reusable stipend formatting function
const formatStipend = (stipend) => {
    if (!stipend || typeof stipend !== 'object') {
        return stipend || "Not Disclosed";
    }
    if (stipend.min === 0 && stipend.max === 0) return "Unpaid";
    if (stipend.min > 0 && stipend.max > 0 && stipend.min !== stipend.max) {
         return `${stipend.currency || '₹'} ${stipend.min?.toLocaleString()} - ${stipend.max?.toLocaleString()} ${stipend.interval || '/Month'}`;
    }
    if (stipend.min > 0 || stipend.max > 0) {
         const value = stipend.max > 0 ? stipend.max : stipend.min;
         return `${stipend.currency || '₹'} ${value?.toLocaleString()} ${stipend.interval || '/Month'}`;
    }
     return "Not Disclosed";
};

const DetailsSection = ({ internship }) => {
    // Provide default values to prevent errors if internship or its properties are null/undefined
    const {
        companyDescription = "No description available.",
        responsibilities = [],
        requirements = [],
        skillsAndQualifications = [],
        duration = "N/A",
        stipend = {}, // Default to empty object
        workDetails = {}, // Default to empty object
        internshipType = {}, // Default to empty object
        perks = []
    } = internship || {}; // Default to empty object if internship itself is missing

    // Helper function to render lists safely
    const renderList = (items) => {
        if (!Array.isArray(items) || items.length === 0) {
            return <li>Information not provided.</li>;
        }
        return items.map((item, index) => <li key={index}>{item}</li>);
    };

    return (
        <div className="details-section-wrapper">
            <div className="detail-block">
                <h3 className="detail-heading">Details</h3>
                {/* ✅ Use default value */}
                <p className="company-description">{companyDescription}</p>
            </div>

            <div className="detail-block">
                <h3 className="detail-heading">Responsibilities of the Intern</h3>
                {/* ✅ Use helper function */}
                <ul className="detail-list">{renderList(responsibilities)}</ul>
            </div>

            <div className="detail-block">
                <h3 className="detail-heading">Requirements</h3>
                 {/* ✅ Use helper function */}
                <ul className="detail-list">{renderList(requirements)}</ul>
            </div>

            <div className="detail-block">
                <h3 className="detail-heading">Skills and Qualifications</h3>
                 {/* ✅ Use helper function */}
                <ul className="detail-list">{renderList(skillsAndQualifications)}</ul>
            </div>

            <div className="detail-block">
                <h3 className="detail-heading">Additional Information</h3>
                <div className="additional-info-grid">
                    <div className="info-card">
                        <h4>Internship Duration</h4>
                         {/* ✅ Use default value */}
                        <p>{duration}</p>
                    </div>
                    <div className="info-card">
                        <h4>Stipend</h4>
                         {/* ✅ Use formatStipend function */}
                        <p>{formatStipend(stipend)}</p>
                         {/* Removed Min/Max split as formatStipend handles ranges */}
                    </div>
                    <div className="info-card">
                        <h4>Work Detail</h4>
                         {/* ✅ Use optional chaining and defaults */}
                        <p>Working Days: {workDetails?.workingDays || 'N/A'}</p>
                        <p>Schedule: {workDetails?.schedule || 'N/A'}</p>
                    </div>
                    <div className="info-card">
                        <h4>Internship Type/Timing</h4>
                         {/* ✅ Use optional chaining and defaults */}
                        <p>Type: {internshipType?.type || 'N/A'}</p>
                        <p>Timing: {internshipType?.timing || 'N/A'}</p>
                    </div>
                </div>
            </div>

            <div className="detail-block">
                <h3 className="detail-heading">Perks</h3>
                 {/* ✅ Use helper function */}
                <ul className="detail-list">{renderList(perks)}</ul>
            </div>

        </div>
    );
};

export default DetailsSection;