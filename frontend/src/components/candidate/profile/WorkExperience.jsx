import React, { useState, useEffect } from 'react'; // Added useEffect
import axios from 'axios'; // Import axios
import '../../../styles/candidate/profile/ProfileCommon.css'; // Common styles
// Assuming specific styles exist:
import '../../../styles/candidate/profile/WorkExperience.css';

// Base URL for backend API
const API_URL = 'http://localhost:5000/api';

// Removed userId from props
const WorkExperience = ({ data, onUpdate }) => {
    // ✅ State to hold the list of work experience records
    const [workExperienceList, setWorkExperienceList] = useState([]);
    // ✅ State to manage editing (-1: view, -2: add new, >=0: edit existing)
    const [editIndex, setEditIndex] = useState(-1);
    // ✅ State for form data (add/edit)
    const [formData, setFormData] = useState({ jobTitle: '', company: '', jobDescription: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    // ✅ Effect to update local list when parent data changes
    useEffect(() => {
        // Ensure data.workExperience is an array, default to empty
        setWorkExperienceList(Array.isArray(data?.workExperience) ? data.workExperience : []);
    }, [data]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleAddNew = () => {
        setFormData({ jobTitle: '', company: '', jobDescription: '' }); // Clear form
        setEditIndex(-2); // Special index for adding
        setError('');
    };

    const handleEdit = (index) => {
        if (index >= 0 && index < workExperienceList.length) {
            setFormData(workExperienceList[index]); // Load data into form
            setEditIndex(index);
            setError('');
        }
    };

    const handleCancel = () => {
        setEditIndex(-1); // Back to view mode
        setError('');
        setFormData({ jobTitle: '', company: '', jobDescription: '' }); // Clear form
    };

    // Save changes from form (Add/Edit) locally and trigger backend save
    const handleFormSave = () => {
        // Basic validation (optional)
        if (!formData.jobTitle || !formData.company) {
            setError("Job Title and Company Name are required.");
            return;
        }

        let newList;
        if (editIndex === -2) { // Adding new
            newList = [...workExperienceList, formData];
        } else { // Editing existing
            newList = workExperienceList.map((item, index) => index === editIndex ? formData : item);
        }
        setWorkExperienceList(newList); // Update local state
        setEditIndex(-1); // Back to view mode
        handleSaveAll(newList); // ✅ Trigger backend save
    };

    // Delete an entry and trigger backend save
    const handleDelete = (indexToDelete) => {
        if (window.confirm("Are you sure you want to delete this work experience?")) {
            const newList = workExperienceList.filter((_, index) => index !== indexToDelete);
            setWorkExperienceList(newList); // Update local state
            handleSaveAll(newList); // ✅ Trigger backend save
        }
    };

    // Send the entire updated list to the backend
    const handleSaveAll = async (listToSave = workExperienceList) => {
        setIsSaving(true);
        setError('');
        try {
            // ✅ Use axios PUT with the updated workExperience array
            const response = await axios.put(`${API_URL}/profile/me`, {
                workExperience: listToSave // Send the whole array
            });

            if (response.data) {
                onUpdate(); // Trigger parent refetch
            } else {
                 throw new Error("No data returned from server.");
            }
        } catch (error) {
            console.error("Failed to update work experience:", error);
            setError(error.response?.data?.message || "An error occurred while saving.");
            // Optionally revert local state
            setWorkExperienceList(Array.isArray(data?.workExperience) ? data.workExperience : []);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        // ✅ Updated ID to match sidebar link
        <div id="work-experience" className="profile-section">
            <div className="section-header">
                <h3 className="section-title">Work Experience</h3>
                {editIndex === -1 && ( // Show Add button only in view mode
                    <button onClick={handleAddNew} className="btn-add" disabled={isSaving}>Add New</button>
                )}
            </div>

             {/* Display Error Message */}
             {error && <p className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</p>}

            {/* Form for Adding/Editing */}
            {editIndex !== -1 && (
                <div className="edit-form work-experience-form">
                     <h4>{editIndex === -2 ? 'Add New Experience' : 'Edit Experience'}</h4>
                      <div className="form-group">
                          <label htmlFor="jobTitle">Job Title</label>
                         <input id="jobTitle" className="form-input" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} placeholder="Job Title" disabled={isSaving}/>
                     </div>
                      <div className="form-group">
                          <label htmlFor="company">Company Name</label>
                         <input id="company" className="form-input" name="company" value={formData.company} onChange={handleInputChange} placeholder="Company Name" disabled={isSaving}/>
                     </div>
                      <div className="form-group">
                          <label htmlFor="jobDescription">Job Description</label>
                         <textarea id="jobDescription" className="form-input" name="jobDescription" value={formData.jobDescription} onChange={handleInputChange} placeholder="Describe your role and responsibilities..." disabled={isSaving}></textarea>
                     </div>
                     {/* Add fields for start/end dates if needed */}
                     <div className="form-actions">
                         <button onClick={handleFormSave} className="btn-save" disabled={isSaving}>
                              {isSaving ? 'Saving...' : (editIndex === -2 ? 'Add Experience' : 'Update Experience')}
                         </button>
                         <button onClick={handleCancel} className="btn-cancel" disabled={isSaving}>Cancel</button>
                     </div>
                 </div>
            )}

            {/* List of Work Experiences */}
            {editIndex === -1 && ( // Show list only in view mode
                <div className="list-container">
                    {workExperienceList.length > 0 ? (
                        workExperienceList.map((exp, index) => (
                            <div className="list-item" key={index}>
                                 {/* Safely access properties */}
                                <h4>{exp?.jobTitle || 'N/A'}</h4>
                                <p>{exp?.company || 'N/A'}</p>
                                <p className="item-description">{exp?.jobDescription || ''}</p>
                                {/* Display dates here if you add them */}
                                <div className="action-buttons item-actions">
                                    <button onClick={() => handleEdit(index)} className="btn-edit" disabled={isSaving}>Edit</button>
                                    <button onClick={() => handleDelete(index)} className="btn-delete" disabled={isSaving}>Delete</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="empty-state">No work experience added yet.</p>
                    )}
                     {/* Removed separate Save All button */}
                </div>
            )}
        </div>
    );
};

export default WorkExperience;