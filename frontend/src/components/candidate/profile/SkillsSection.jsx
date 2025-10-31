import React, { useState, useEffect } from 'react'; // Added useEffect
import axios from 'axios'; // Import axios
import '../../../styles/candidate/profile/ProfileCommon.css'; // Common styles
import '../../../styles/candidate/profile/SkillsSection.css'; // Specific styles

// Base URL for backend API
const API_URL = 'http://localhost:5000/api';

// Simple function to assign a color based on skill name hash (optional)
const getColorForSkill = (skillName) => {
    let hash = 0;
    for (let i = 0; i < skillName.length; i++) {
        hash = skillName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['blue', 'green', 'orange', 'purple', 'red', 'teal', 'pink', 'grey']; // Add more if needed
    const index = Math.abs(hash % colors.length);
    return colors[index];
};

// Removed userId from props
const SkillsSection = ({ data, onUpdate }) => {
    const [skills, setSkills] = useState([]); // Initialize as empty array
    const [newSkill, setNewSkill] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    // ✅ Effect to update local skills when parent data changes
    useEffect(() => {
        // Ensure data.skills is an array, default to empty
        setSkills(Array.isArray(data?.skills) ? data.skills : []);
    }, [data]); // Dependency on data prop

    // Send the entire updated list to the backend
    const handleSaveSkills = async (updatedSkillsList) => {
        setIsSaving(true);
        setError('');
        try {
            // ✅ Use axios PUT with the updated skills array
            const response = await axios.put(`${API_URL}/profile/me`, {
                skills: updatedSkillsList // Send the whole array under the 'skills' key
            });

            if (response.data) {
                onUpdate(); // Trigger parent refetch
                // No alert needed, UI updates implicitly
            } else {
                 throw new Error("No data returned from server.");
            }
        } catch (error) {
            console.error("Failed to update skills:", error);
            setError(error.response?.data?.message || "An error occurred while saving skills.");
            // Optionally revert local state if save fails
            setSkills(Array.isArray(data?.skills) ? data.skills : []); // Revert to original
        } finally {
            setIsSaving(false);
        }
    };

    // Add a new skill locally and trigger save
    const handleAddSkill = () => {
        const trimmedSkill = newSkill.trim();
        if (trimmedSkill && !skills.find(s => s.name.toLowerCase() === trimmedSkill.toLowerCase())) {
            const skillToAdd = { name: trimmedSkill, color: getColorForSkill(trimmedSkill) }; // Assign a color
            const updatedSkills = [...skills, skillToAdd];
            setSkills(updatedSkills); // Update local state immediately
            setNewSkill(''); // Clear input
            handleSaveSkills(updatedSkills); // ✅ Trigger backend save
        } else if (!trimmedSkill) {
            setError("Skill name cannot be empty.");
        } else {
            setError(`Skill "${trimmedSkill}" already exists.`);
        }
    };

     // ✅ Remove a skill locally and trigger save
     const handleRemoveSkill = (skillNameToRemove) => {
         const updatedSkills = skills.filter(skill => skill.name !== skillNameToRemove);
         setSkills(updatedSkills); // Update local state immediately
         handleSaveSkills(updatedSkills); // ✅ Trigger backend save
     };

     // Handle Enter key press in input
     const handleKeyPress = (e) => {
         if (e.key === 'Enter') {
             handleAddSkill();
         }
     };

    return (
        <div id="skills" className="profile-section">
            <div className="section-header">
                <h3 className="section-title">Skills</h3>
                {/* Add button is part of the input section now */}
            </div>

            {/* Display Error Message */}
             {error && <p className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</p>}

            <div className="add-skill-container">
                <input
                    className="form-input"
                    value={newSkill}
                    onChange={(e) => { setNewSkill(e.target.value); setError(''); }} // Clear error on change
                    onKeyPress={handleKeyPress} // Add skill on Enter
                    placeholder="Add a new skill (e.g., React)"
                    disabled={isSaving}
                />
                <button onClick={handleAddSkill} className="btn-add" disabled={isSaving || !newSkill.trim()}>
                    {isSaving ? 'Adding...' : 'Add'}
                </button>
            </div>

            <div className="skills-tags">
                {skills.length > 0 ? (
                    skills.map(skill => (
                        <span key={skill.name} className={`skill-tag ${skill.color || 'grey'}`}> {/* Added default color */}
                            {skill.name}
                             {/* ✅ Add remove button */}
                            <button
                                className="remove-skill-btn"
                                onClick={() => handleRemoveSkill(skill.name)}
                                title={`Remove ${skill.name}`}
                                disabled={isSaving}
                            >
                                &times; {/* Simple 'x' icon */}
                            </button>
                        </span>
                    ))
                ) : (
                    <p className="empty-state">No skills added yet.</p>
                )}
            </div>
             {/* No separate save button needed */}
        </div>
    );
};

export default SkillsSection;