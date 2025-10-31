import React, { useState, useEffect } from 'react';
import axios from 'axios'; // ✅ axios
import '../../../styles/recruiter/postings/EditJobModal.css';

const API_URL = 'http://localhost:5000/api'; // ✅ API URL

const EditJobModal = ({ jobId, onSaveSuccess, onClose }) => {
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null); // ✅ Error state

    useEffect(() => {
        const fetchJobData = async () => {
            setLoading(true);
            setError(null);
            try {
                // ✅ Sahi endpoint (/api/internships/:id) use karein
                const response = await axios.get(`${API_URL}/internships/${jobId}`);
                const data = response.data;
                if (data) {
                    setFormData({
                        title: data.title || '',
                        location: data.location || '',
                        stipendMin: data.stipend?.min || 0,
                        stipendMax: data.stipend?.max || 0,
                        duration: parseInt(data.duration) || 0,
                        mode: data.internshipType?.type || 'Remote',
                        responsibilities: (data.responsibilities || []).join('\n')
                    });
                } else { throw new Error("Job data not found."); }
            } catch (err) {
                console.error("Failed to fetch job data:", err);
                setError(err.response?.data?.message || "Failed to load job details.");
            } finally { setLoading(false); }
        };
        fetchJobData();
    }, [jobId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const mappedMode = formData.mode === 'Work From Home' ? 'Remote' : formData.mode;

        const updatedJobData = {
            title: formData.title,
            location: formData.location,
            duration: `${formData.duration} months`,
            stipend: {
                min: parseInt(formData.stipendMin),
                max: parseInt(formData.stipendMax)
            },
            internshipType: { type: mappedMode },
            responsibilities: formData.responsibilities.split('\n').filter(line => line.trim() !== ''),
        };

        try {
            // ✅ Sahi endpoint (/api/internships/:id) aur PUT method use karein
            const response = await axios.put(`${API_URL}/internships/${jobId}`, updatedJobData);
            alert(response.data.message || "Changes saved!");
            onSaveSuccess(); 
            onClose(); 
        } catch (err) {
            console.error("Failed to update job:", err);
            setError(err.response?.data?.message || "Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) { return <div className="modal-overlay"><div className="modal-content"><p>Loading job details...</p></div></div>; }
    if (error) {
         return (
             <div className="modal-overlay" onClick={onClose}>
                 <div className="modal-content" onClick={e => e.stopPropagation()}>
                     <p className="error-message" style={{color: 'red', padding: '20px'}}>{error}</p>
                     <button type="button" onClick={onClose} className="btn-cancel">Close</button>
                 </div>
             </div>
         );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Internship</h2>
                    <button onClick={onClose} className="btn-close">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}
                    
                    <div className="form-group">
                        <label htmlFor="title">Internship Title *</label>
                        <input id="title" name="title" type="text" value={formData.title} onChange={handleInputChange} required disabled={isSaving}/>
                    </div>
                     <div className="modal-form-grid">
                        <div className="form-group">
                            <label htmlFor="location">Location *</label>
                            <input id="location" name="location" type="text" value={formData.location} onChange={handleInputChange} required disabled={isSaving}/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="mode">Work Mode *</label>
                            <select id="mode" name="mode" value={formData.mode} onChange={handleInputChange} disabled={isSaving}>
                                <option value="Remote">Remote (Work From Home)</option>
                                <option value="On-site">On-site (In-office)</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-form-grid">
                        <div className="form-group">
                            <label htmlFor="stipendMin">Stipend (Min) *</label>
                            <input id="stipendMin" name="stipendMin" type="number" value={formData.stipendMin} onChange={handleInputChange} required disabled={isSaving}/>
                        </div>
                         <div className="form-group">
                            <label htmlFor="stipendMax">Stipend (Max) *</label>
                            <input id="stipendMax" name="stipendMax" type="number" value={formData.stipendMax} onChange={handleInputChange} required disabled={isSaving}/>
                        </div>
                         <div className="form-group">
                            <label htmlFor="duration">Duration (in months) *</label>
                            <input id="duration" name="duration" type="number" value={formData.duration} onChange={handleInputChange} required disabled={isSaving}/>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="responsibilities">Responsibilities (Ek line mein ek)</label>
                        <textarea id="responsibilities" name="responsibilities" rows="5" value={formData.responsibilities} onChange={handleInputChange} disabled={isSaving}></textarea>
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-cancel" disabled={isSaving}>Cancel</button>
                        <button type="submit" className="btn-save" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditJobModal;