import React, { useState, useEffect, useContext } from 'react'; // Added hooks
import axios from 'axios'; // Import axios
import { AuthContext } from '../../../context/AuthContext'; // Import AuthContext
import '../../../styles/candidate/internshipdetail/ApplyCard.css';
import saveIcon from '../../../assets/icons/save.png'; // Assuming you have these icons
import savedIcon from '../../../assets/icons/saved.png';
import shareIcon from '../../../assets/icons/share.png'; // Assuming share icon

const ApplyCard = ({
    internship,
    isSaved: initialIsSaved, // ✅ Receive initial saved status
    onSaveToggle,           // ✅ Receive save toggle handler
    onApply,                // ✅ Receive apply handler
    applicationStatus       // ✅ Receive current application status ('Applied', 'Shortlisted' etc. or null)
}) => {
    // Destructure only needed fields, provide defaults
    const { id, stats = {}, applicationDeadline, eligibility = [] } = internship || {};

    const [isSavedVisual, setIsSavedVisual] = useState(initialIsSaved);
    const [isApplying, setIsApplying] = useState(false); // Loading state for apply button
    const { authData } = useContext(AuthContext); // Get user context
    const isCandidate = authData?.user?.role === 'candidate';

    // Sync local visual state with prop
    useEffect(() => {
        setIsSavedVisual(initialIsSaved);
    }, [initialIsSaved]);

    // Calculate days left (same as before)
    const calculateDaysLeft = () => {
        if (!applicationDeadline) return 0;
        const today = new Date();
        const deadline = new Date(applicationDeadline);
        // Set time to end of day for deadline comparison
        deadline.setHours(23, 59, 59, 999);
        today.setHours(0, 0, 0, 0); // Set time to start of day for comparison
        const diffTime = deadline - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 ? diffDays : 0; // Show 0 if deadline passed
    };
    const daysLeft = calculateDaysLeft();

    // Handle Save Click
    const handleSaveClick = () => {
        if (!isCandidate) {
            alert("Please log in as a candidate to save internships.");
            return;
        }
        if (typeof onSaveToggle === 'function') {
            onSaveToggle(id, isSavedVisual); // Call parent handler
            // Optimistically update visual state
            setIsSavedVisual(prev => !prev);
        } else {
            console.warn("onSaveToggle function not provided to ApplyCard");
            alert("Could not save/unsave. Please try again later.");
        }
    };

    // Handle Quick Apply Click
    const handleApplyClick = async () => {
         if (!isCandidate) {
            alert("Please log in as a candidate to apply.");
            return;
        }
        if (applicationStatus) {
            alert(`You have already ${applicationStatus.toLowerCase()} for this internship.`);
            return; // Don't allow applying again if already applied/shortlisted etc.
        }
        if (daysLeft <= 0 && applicationDeadline) {
             alert("The application deadline has passed.");
             return;
        }

        if (typeof onApply === 'function') {
            setIsApplying(true); // Show loading state
            try {
                await onApply(id); // Call parent handler which makes the API call
                // Parent should update applicationStatus prop upon success
            } catch (error) {
                // Error handled in parent, maybe show generic message here?
                // alert("Failed to apply. Please try again.");
            } finally {
                setIsApplying(false); // Hide loading state
            }
        } else {
             console.warn("onApply function not provided to ApplyCard");
             alert("Could not apply. Please try again later.");
        }
    };

    // Handle Share Click (same as before)
    const handleShareClick = () => {
        const detailPageUrl = window.location.href; // Use current page URL
        navigator.clipboard.writeText(detailPageUrl)
            .then(() => alert("🔗 Internship link copied to clipboard!"))
            .catch(err => console.error('Failed to copy link: ', err));
    };

     // Determine Apply Button text and disabled state
     let applyButtonText = 'Quick Apply';
     let applyButtonDisabled = isApplying || (daysLeft <= 0 && applicationDeadline); // Disable if applying or deadline passed

     if (isApplying) {
         applyButtonText = 'Applying...';
     } else if (applicationStatus) {
         applyButtonText = applicationStatus === 'Applied' ? 'Applied' : applicationStatus; // Show status like 'Applied', 'Shortlisted'
         applyButtonDisabled = true; // Disable if already applied/processed
     } else if (daysLeft <= 0 && applicationDeadline) {
         applyButtonText = 'Deadline Passed';
     }


    return (
        <div className="apply-card-container">
            <div className="apply-card-header">
                 {/* ✅ Save Button */}
                <button
                    className={`action-icon save-btn ${isSavedVisual ? 'saved' : ''}`}
                    onClick={handleSaveClick}
                    title={isSavedVisual ? "Unsave Internship" : "Save Internship"}
                    disabled={!isCandidate} // Disable if not a candidate
                >
                    <img src={isSavedVisual ? savedIcon : saveIcon} alt="Save" />
                </button>
                 {/* Calendar Button (Placeholder) */}
                <button className="action-icon" title="Add deadline to calendar (Not implemented)">📅</button>
                 {/* ✅ Share Button */}
                <button className="share-button" onClick={handleShareClick}>
                     <img src={shareIcon} alt="Share" /> Share
                 </button>
            </div>

             {/* ✅ Apply Button */}
            <button
                className="quick-apply-btn"
                onClick={handleApplyClick}
                disabled={applyButtonDisabled || !isCandidate} // Disable if applying, already applied, deadline passed, or not candidate
            >
                {applyButtonText}
            </button>


            <div className="stats-container">
                <div className="stat-item">
                    <span className="stat-icon">👥</span>
                    <div className="stat-info">
                        <p className="stat-label">Applied</p>
                         {/* Use optional chaining and provide default */}
                        <p className="stat-value">{stats?.applied?.toLocaleString() || 0}</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📄</span>
                    <div className="stat-info">
                        <p className="stat-label">Number of Openings</p>
                        <p className="stat-value">{stats?.openings || 'N/A'}</p>
                    </div>
                </div>
                {/* Impressions might not be relevant to show here, commented out */}
                {/* <div className="stat-item">
                    <span className="stat-icon">✨</span>
                    <div className="stat-info">
                        <p className="stat-label">Impressions</p>
                        <p className="stat-value">{stats?.impressions?.toLocaleString() || 0}</p>
                    </div>
                </div> */}
                <div className="stat-item">
                    <span className="stat-icon">🕒</span>
                    <div className="stat-info">
                        <p className="stat-label">Application Deadline</p>
                        <p className="stat-value">{daysLeft > 0 ? `${daysLeft} days left` : (daysLeft === 0 ? "Today" : "Closed")}</p>
                    </div>
                </div>
            </div>

            <div className="eligibility-container">
                <h3 className="eligibility-heading">Eligibility</h3>
                <div className="eligibility-tags">
                     {/* Check if eligibility exists and is an array */}
                    {Array.isArray(eligibility) && eligibility.length > 0 ? (
                        eligibility.map((item, index) => (
                            <span key={index} className="eligibility-tag">{item}</span>
                        ))
                    ) : (
                        <span className="eligibility-tag">Not Specified</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplyCard;