import React, { useState, useEffect, useRef } from 'react'; // ✅ useEffect
import axios from 'axios'; // ✅ axios
import '../../../styles/recruiter/profile/EditCompanyForm.css';

const API_URL = 'http://localhost:5000/api'; // ✅ API URL
const BACKEND_STATIC_URL = 'http://localhost:5000'; // ✅ Static URL

// ✅ userId prop hata diya
const EditCompanyForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        company: '', description: '', website: '',
        industry: '', companySize: ''
    });
    const [locations, setLocations] = useState([]);
    const [newLocation, setNewLocation] = useState('');
    
    // ✅ Logo URL ko text input se manage karein
    const [logoUrl, setLogoUrl] = useState('');
    
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    // ✅ initialData se state set karein
    useEffect(() => {
        if (initialData) {
            setFormData({
                company: initialData.company || '',
                description: initialData.description || '',
                website: initialData.website || '',
                industry: initialData.industry || '',
                companySize: initialData.companySize || '',
            });
            setLocations(Array.isArray(initialData.locations) ? initialData.locations : []);
            setLogoUrl(initialData.companyLogo || ''); // Logo URL state
        }
    }, [initialData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddLocation = () => {
        if (newLocation.trim() && !locations.includes(newLocation.trim())) {
            setLocations(prev => [...prev, newLocation.trim()]);
            setNewLocation('');
        }
    };
    
    const handleRemoveLocation = (indexToRemove) => {
         setLocations(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        
        if (formData.website && !formData.website.startsWith('http://') && !formData.website.startsWith('https://')) {
            setError('Please enter a valid website URL (starting with http:// or https://)');
            setIsSaving(false);
            return;
        }

        // ✅ Plain JSON object banayein
        const dataToSend = {
            ...formData,
            locations: locations, // Locations array
            companyLogo: logoUrl // Logo URL text
        };
        
        try {
            // ✅ axios.put se /api/profile/me par bhejein
            const response = await axios.put(`${API_URL}/profile/me`, dataToSend);
            
            alert(response.data.message || "Profile saved successfully!");
            onSave(); // Parent ko notify karein (jo refetch karega)
        } catch (err) {
            console.error("Error saving profile:", err);
            setError(err.response?.data?.message || "An error occurred while saving.");
        } finally {
             setIsSaving(false);
        }
    };

    // ✅ Logo preview URL banayein
    const logoPreview = logoUrl
        ? (logoUrl.startsWith('http') ? logoUrl : `${BACKEND_STATIC_URL}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`)
        : null;

    return (
        <form onSubmit={handleSubmit} className="edit-company-form profile-section">
            <h3 className="section-title">Edit Company Profile</h3>
            
            {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}

            <div className="form-group">
                <label htmlFor="companyName">Company Name *</label>
                <input type="text" id="companyName" name="company" value={formData.company} onChange={handleInputChange} required disabled={isSaving}/>
            </div>
            <div className="form-group">
                <label htmlFor="companyWebsite">Website URL</label>
                <input type="url" id="companyWebsite" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://example.com" disabled={isSaving}/>
            </div>
             <div className="form-group">
                <label htmlFor="industry">Industry</label>
                <input type="text" id="industry" name="industry" value={formData.industry} onChange={handleInputChange} placeholder="e.g., Tech, Finance" disabled={isSaving}/>
            </div>
             <div className="form-group">
                <label htmlFor="companySize">Company Size</label>
                <input type="text" id="companySize" name="companySize" value={formData.companySize} onChange={handleInputChange} placeholder="e.g., 501-1000 employees" disabled={isSaving}/>
            </div>
             <div className="form-group">
                <label htmlFor="companyDescription">Description</label>
                <textarea id="companyDescription" name="description" value={formData.description} onChange={handleInputChange} disabled={isSaving}></textarea>
            </div>

            {/* Locations Section */}
            <div className="form-group">
                <label>Company Locations</label>
                <div className="location-input-group">
                    <input type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="Add city (e.g., Mumbai)" disabled={isSaving}/>
                    <button type="button" onClick={handleAddLocation} className="btn-add-inline" disabled={isSaving}>Add</button>
                </div>
                <ul className="locations-list">
                    {locations.map((loc, index) => (
                        <li key={index}>
                            {loc} 
                            <button type="button" onClick={() => handleRemoveLocation(index)} className="btn-remove-inline" disabled={isSaving}>×</button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Logo URL Input (File Upload hata diya) */}
             <div className="form-group">
                <label htmlFor="companyLogo">Company Logo URL</label>
                <input 
                    type="text" 
                    id="companyLogo" 
                    name="companyLogo" // ✅ name attribute add karein
                    value={logoUrl} // ✅ logoUrl state use karein
                    onChange={(e) => setLogoUrl(e.target.value)} // ✅ state update karein
                    placeholder="/icons/your-logo.png (path on server)"
                    disabled={isSaving}
                />
                 {logoPreview && <img src={logoPreview} alt="Logo Preview" className="logo-preview"/>}
            </div>

            <div className="form-actions">
                <button type="submit" className="btn-save" disabled={isSaving}> 
                   {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={onCancel} className="btn-cancel" disabled={isSaving}>Cancel</button>
            </div>
        </form>
    );
};

export default EditCompanyForm;