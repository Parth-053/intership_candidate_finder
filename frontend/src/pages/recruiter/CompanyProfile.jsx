import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios'; // ✅ axios
import { AuthContext } from '../../context/AuthContext'; // ✅ AuthContext
import TopNavbar from '../../components/recruiter/common/TopNavbar';
import CompanyInfoCard from '../../components/recruiter/profile/CompanyInfoCard';
import EditCompanyForm from '../../components/recruiter/profile/EditCompanyForm';
import '../../styles/recruiter/profile/CompanyProfilePage.css'; 

const API_URL = 'http://localhost:5000/api'; // ✅ API URL

const CompanyProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [companyData, setCompanyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // ✅ Error state
    const { authData } = useContext(AuthContext); // ✅ Auth data
    const token = authData?.token || localStorage.getItem('authToken');
    
    // ✅ /api/profile/me endpoint se data fetch karein
    const fetchProfileData = useCallback(async () => {
        if (!token) {
            setLoading(false);
            setError("Please log in to view your profile.");
            return;
        }
         if (!axios.defaults.headers.common['Authorization']) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        setLoading(true); 
        setError(null);
        try {
            // ✅ Sahi endpoint use karein
            const response = await axios.get(`${API_URL}/profile/me`);
            
            if (response.data && response.data.role === 'recruiter') {
                setCompanyData(response.data);
            } else {
                setError("Failed to fetch recruiter profile or user is not a recruiter");
                setCompanyData(null); 
            }
        } catch (err) {
            console.error("Error fetching recruiter profile data:", err);
            setError(err.response?.data?.message || "Could not load profile data.");
            setCompanyData(null);
        } finally {
            setLoading(false); 
        }
    }, [token]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]); 

    if (loading) {
        return (
             <div className="recruiter-page">
                 <TopNavbar />
                 <main className="recruiter-page-content"><p>Loading Company Profile...</p></main>
             </div>
        );
    }

    if (error || !companyData) {
         return (
             <div className="recruiter-page">
                 <TopNavbar />
                 <main className="recruiter-page-content"><p className="error-message" style={{color: 'red'}}>{error || "Could not load company profile."}</p></main>
             </div>
        );
    }

    const handleSaveSuccess = () => {
        fetchProfileData(); // Data refresh karein
        setIsEditing(false); 
    };

    return (
        <div className="recruiter-page">
            <TopNavbar />
            <main className="recruiter-page-content company-profile-page">
                <h1>Company Profile</h1>

                {isEditing ? (
                    <EditCompanyForm
                        initialData={companyData}
                        // ✅ userId prop hataya
                        onSave={handleSaveSuccess}
                        onCancel={() => setIsEditing(false)}
                    />
                ) : (
                    <CompanyInfoCard 
                        data={companyData} 
                        onEditClick={() => setIsEditing(true)}
                    />
                )}
            </main>
        </div>
    );
};

export default CompanyProfile;