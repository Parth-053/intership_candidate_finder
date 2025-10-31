import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import TopNavbar from '../../components/recruiter/common/TopNavbar';
import ApplicantRow from '../../components/recruiter/applicants/ApplicantRow';
import ApplicantProfileModal from '../../components/recruiter/applicants/ApplicantProfileModal'; // ✅ Naya modal import karein
import '../../styles/recruiter/applicants/ApplicantsPage.css';

const API_URL = 'http://localhost:5000/api';

const Applicants = () => {
    const [filteredApplicants, setFilteredApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authData } = useContext(AuthContext);
    const token = authData?.token || localStorage.getItem('authToken');
    
    const [searchParams] = useSearchParams();
    const jobIdFromUrl = searchParams.get('jobId');

    // ✅ Modal state ke liye
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    const fetchApplicants = useCallback(async () => {
        if (!token) {
            setLoading(false);
            setError("Please log in to view applicants.");
            return;
        }
        if (!axios.defaults.headers.common['Authorization']) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        setLoading(true);
        setError(null);
        try {
            let response;
            if (jobIdFromUrl) {
                response = await axios.get(`${API_URL}/recruiter/applicants/${jobIdFromUrl}`);
            } else {
                response = await axios.get(`${API_URL}/recruiter/dashboard/recent-applicants`);
            }
            setFilteredApplicants(response.data || []); 
        } catch (err) {
            console.error("Failed to fetch applicants:", err);
            setError(err.response?.data?.message || "Could not load applicants.");
            setFilteredApplicants([]);
        } finally {
            setLoading(false);
        }
    }, [token, jobIdFromUrl]);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    // ✅ "View Profile" button click handle karein
    const handleViewProfile = (candidateId, candidateDetails) => {
        setSelectedCandidate(candidateDetails); // Candidate ka data state mein save karein
        setIsModalOpen(true); // Modal kholein
    };

    const handleStatusUpdate = async (applicationId, newStatus) => {
        const originalApplicants = [...filteredApplicants];
        setFilteredApplicants(prev => 
            prev.map(app => 
                app.id === applicationId ? { ...app, status: newStatus } : app
            )
        );
        try {
            await axios.patch(`${API_URL}/recruiter/applications/${applicationId}/status`, {
                status: newStatus
            });
        } catch (err) {
             console.error(`Failed to ${newStatus} applicant:`, err);
             alert(err.response?.data?.message || `Could not ${newStatus} applicant.`);
             setFilteredApplicants(originalApplicants);
        }
    };
    
    const handleShortlist = (applicationId) => { handleStatusUpdate(applicationId, 'Shortlisted'); };
    const handleReject = (applicationId) => { handleStatusUpdate(applicationId, 'Rejected'); };

    return (
        <div className="recruiter-page">
            <TopNavbar />
            <main className="recruiter-page-content applicants-page">
                <div className="page-header">
                    <h1>{jobIdFromUrl ? `Applicants for Job #${jobIdFromUrl}` : 'All Recent Applicants'}</h1>
                </div>

                {loading ? ( <p>Loading applicants...</p> ) 
                : error ? ( <p className="error-message" style={{color: 'red'}}>{error}</p> )
                : filteredApplicants.length > 0 ? (
                    <div className="applicants-table-container">
                        <table className="applicants-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Applied For</th>
                                    <th>Date Applied</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplicants.map(applicant => (
                                    <ApplicantRow
                                        key={applicant.id}
                                        applicant={applicant}
                                        onViewProfile={handleViewProfile} // ✅ Updated handler pass karein
                                        onShortlist={handleShortlist}
                                        onReject={handleReject}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="empty-state">No applicants found.</p>
                )}
            </main>

            {/* ✅ Modal ko conditionally render karein */}
            {isModalOpen && selectedCandidate && (
                <ApplicantProfileModal 
                    candidate={selectedCandidate} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </div>
    );
};

export default Applicants;