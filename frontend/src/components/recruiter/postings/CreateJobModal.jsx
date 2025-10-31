import React, { useState } from 'react';
import axios from 'axios'; // ✅ axios
import '../../../styles/recruiter/postings/CreateJobModal.css';

const API_URL = 'http://localhost:5000/api'; // ✅ API URL

// ✅ recruiterId prop hata diya
const CreateJobModal = ({ onPostSuccess, onClose }) => {
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [stipendMin, setStipendMin] = useState(0);
    const [stipendMax, setStipendMax] = useState(0);
    const [duration, setDuration] = useState('');
    const [mode, setMode] = useState('Remote'); // ✅ Default "Remote"
    const [responsibilities, setResponsibilities] = useState(''); 
    
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        // Mode mapping (Frontend "Work From Home" -> Backend "Remote")
        const mappedMode = mode === 'Work From Home' ? 'Remote' : mode;

        const newJobData = {
            // recruiterId yahaan se hata diya
            title: title,
            location: location,
            duration: `${duration} months`,
            stipend: {
                min: parseInt(stipendMin),
                max: parseInt(stipendMax),
                currency: "₹",
                interval: "/Month"
            },
            internshipType: { 
                type: mappedMode, // ✅ Mapped value
                timing: "Part Time" // Default
            },
            responsibilities: responsibilities.split('\n').filter(line => line.trim() !== ''),
        };

        try {
            // ✅ Sahi endpoint (/api/internships/post) aur axios use karein
            const response = await axios.post(`${API_URL}/internships/post`, newJobData);
            
            alert(response.data.message);
            onPostSuccess(); 
            onClose(); 
        } catch (err) {
            console.error("Failed to post job:", err);
            alert(`Error: ${err.response?.data?.message || "An error occurred."}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Post New Internship</h2>
                    <button onClick={onClose} className="btn-close">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label htmlFor="title">Internship Title *</label>
                        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required disabled={isSaving}/>
                    </div>
                    <div className="modal-form-grid">
                        <div className="form-group">
                            <label htmlFor="location">Location *</label>
                            <input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} required disabled={isSaving}/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="mode">Work Mode *</label>
                            {/* ✅ Options ko backend values se match karein */}
                            <select id="mode" value={mode} onChange={e => setMode(e.target.value)} disabled={isSaving}>
                                <option value="Remote">Remote (Work From Home)</option>
                                <option value="On-site">On-site (In-office)</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>
                     <div className="modal-form-grid">
                        <div className="form-group">
                            <label htmlFor="stipendMin">Stipend (Min) *</label>
                            <input id="stipendMin" type="number" value={stipendMin} onChange={e => setStipendMin(e.target.value)} required disabled={isSaving}/>
                        </div>
                         <div className="form-group">
                            <label htmlFor="stipendMax">Stipend (Max) *</label>
                            <input id="stipendMax" type="number" value={stipendMax} onChange={e => setStipendMax(e.target.value)} required disabled={isSaving}/>
                        </div>
                         <div className="form-group">
                            <label htmlFor="duration">Duration (in months) *</label>
                            <input id="duration" type="number" value={duration} onChange={e => setDuration(e.target.value)} required disabled={isSaving}/>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="responsibilities">Responsibilities (Ek line mein ek)</label>
                        <textarea 
                            id="responsibilities" 
                            rows="5" 
                            value={responsibilities} 
                            onChange={e => setResponsibilities(e.target.value)}
                            placeholder="e.g., Develop new user-facing features&#10;Build reusable code and libraries&#10;Collaborate with other team members"
                            disabled={isSaving}
                        ></textarea>
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-cancel" disabled={isSaving}>Cancel</button>
                        <button type="submit" className="btn-save" disabled={isSaving}>
                            {isSaving ? 'Posting...' : 'Post Internship'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default CreateJobModal;