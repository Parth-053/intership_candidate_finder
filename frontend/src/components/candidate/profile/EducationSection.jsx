import React, { useState, useEffect } from 'react'; // Added useEffect
import axios from 'axios'; // Import axios
import '../../../styles/candidate/profile/ProfileCommon.css'; // Assuming common styles
import '../../../styles/candidate/profile/EducationSection.css'; // Specific styles

// Base URL for backend API
const API_URL = 'http://localhost:5000/api';

// Removed userId from props
const EducationSection = ({ data, onUpdate }) => {
    const [educationList, setEducationList] = useState([]);
    const [editIndex, setEditIndex] = useState(-1); // -1: view, -2: add new, >=0: edit existing
    const [formData, setFormData] = useState({ degree: '', college: '', grade: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(''); // Error state

    // ✅ Effect to update local list when parent data changes
    useEffect(() => {
        // Ensure data.education is an array, default to empty array if not
        setEducationList(Array.isArray(data?.education) ? data.education : []);
    }, [data]); // Dependency on the data prop

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(''); // Clear error on input change
    };

    const handleAddNew = () => {
        setFormData({ degree: '', college: '', grade: '' });
        setEditIndex(-2);
        setError('');
    };

    const handleEdit = (index) => {
        // Check bounds to prevent errors
        if (index >= 0 && index < educationList.length) {
            setFormData(educationList[index]);
            setEditIndex(index);
            setError('');
        }
    };

    const handleCancel = () => {
        setEditIndex(-1);
        setError('');
        setFormData({ degree: '', college: '', grade: '' }); // Clear form
    };

    // Save changes from the form (Add or Edit) and trigger backend save
    const handleFormSave = () => {
        let newList;
        if (editIndex === -2) { // Adding new
            newList = [...educationList, formData];
        } else { // Editing existing
            newList = educationList.map((item, index) => index === editIndex ? formData : item);
        }
        setEducationList(newList); // Update local state immediately
        setEditIndex(-1); // Go back to display mode
        handleSaveAll(newList); // ✅ Trigger backend save immediately
    };

    // Delete an entry and trigger backend save
    const handleDelete = (indexToDelete) => {
        if (window.confirm("Are you sure you want to delete this education record?")) {
            const newList = educationList.filter((_, index) => index !== indexToDelete);
            setEducationList(newList); // Update local state immediately
            handleSaveAll(newList); // ✅ Trigger backend save immediately
        }
    };

    // Send the entire updated list to the backend
    const handleSaveAll = async (listToSave = educationList) => {
        setIsSaving(true);
        setError('');
        try {
            // ✅ Use axios and correct endpoint, send { education: [...] } in body
            const response = await axios.put(`${API_URL}/profile/me`, {
                education: listToSave // Send the whole updated array under the 'education' key
            });

            if (response.data) {
                onUpdate(); // Trigger parent refetch/update
                // alert("Education updated successfully!"); // Optional: Consider less intrusive feedback
            } else {
                 throw new Error("No data returned from server.");
            }
        } catch (error) {
            console.error("Failed to update education:", error);
            setError(error.response?.data?.message || "An error occurred while saving.");
            // Optionally revert local state change if save fails
            // setEducationList(data?.education || []); // Revert to original data
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div id="education" className="profile-section">
            <div className="section-header">
                <h3 className="section-title">Education</h3>
                {/* Show Add button only when not editing */}
                {editIndex === -1 && (
                    <button onClick={handleAddNew} className="btn-add" disabled={isSaving}>Add New</button>
                )}
            </div>

             {/* Display Error Message */}
             {error && <p className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</p>}


            {/* Form for Adding/Editing - Render only when editIndex is not -1 */}
            {editIndex !== -1 && (
                 <div className="edit-form education-form">
                     <h4>{editIndex === -2 ? 'Add New Education' : 'Edit Education'}</h4>
                     <div className="form-group"> {/* Added form groups */}
                         <label htmlFor="degree">Degree</label>
                         <input id="degree" className="form-input" name="degree" value={formData.degree} onChange={handleInputChange} placeholder="Degree (e.g., B.Tech)" disabled={isSaving}/>
                     </div>
                      <div className="form-group">
                          <label htmlFor="college">College/University</label>
                         <input id="college" className="form-input" name="college" value={formData.college} onChange={handleInputChange} placeholder="College/University" disabled={isSaving}/>
                     </div>
                      <div className="form-group">
                          <label htmlFor="grade">Grade/CGPA</label>
                         <input id="grade" className="form-input" name="grade" value={formData.grade} onChange={handleInputChange} placeholder="Grade/CGPA" disabled={isSaving}/>
                     </div>
                     <div className="form-actions">
                         <button onClick={handleFormSave} className="btn-save" disabled={isSaving}>
                             {/* No separate save-all button needed here now */}
                             {isSaving ? 'Saving...' : (editIndex === -2 ? 'Add Education' : 'Update Education')}
                         </button>
                         <button onClick={handleCancel} className="btn-cancel" disabled={isSaving}>Cancel</button>
                     </div>
                 </div>
            )}

            {/* List of Education Records - Render only when not editing */}
            {editIndex === -1 && (
                <div className="list-container">
                    {educationList.length > 0 ? (
                        educationList.map((edu, index) => (
                            <div className="list-item" key={index}>
                                {/* Ensure properties exist before displaying */}
                                <h4>{edu?.degree || 'N/A'}</h4>
                                <p>{edu?.college || 'N/A'}</p>
                                <span>Grade: {edu?.grade || 'N/A'}</span>
                                <div className="action-buttons item-actions">
                                    <button onClick={() => handleEdit(index)} className="btn-edit" disabled={isSaving}>Edit</button>
                                    <button onClick={() => handleDelete(index)} className="btn-delete" disabled={isSaving}>Delete</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="empty-state">No education details added yet.</p>
                    )}
                     {/* Removed the separate "Save Education Section" button */}
                </div>
            )}
        </div>
    );
};

export default EducationSection;