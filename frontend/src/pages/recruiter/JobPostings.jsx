import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; // ✅ axios
import { AuthContext } from '../../context/AuthContext'; // ✅ AuthContext
import TopNavbar from '../../components/recruiter/common/TopNavbar';
import JobPostingCard from '../../components/recruiter/postings/JobPostingCard';
import CreateJobModal from '../../components/recruiter/postings/CreateJobModal';
import EditJobModal from '../../components/recruiter/postings/EditJobModal';
import '../../styles/recruiter/postings/JobPostingsPage.css';

const API_URL = 'http://localhost:5000/api'; // ✅ API URL

const JobPostings = () => {
    const [postings, setPostings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // ✅ Error state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingJobId, setEditingJobId] = useState(null);
    
    const navigate = useNavigate();
    const { authData } = useContext(AuthContext); // ✅ Auth data
    const token = authData?.token || localStorage.getItem('authToken'); // Get token

    // ✅ Naye endpoint se jobs fetch karein
    const fetchJobs = useCallback(async () => {
        if (!token) {
            setLoading(false);
            setError("Please log in to view job postings.");
            return;
        }
        if (!axios.defaults.headers.common['Authorization']) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        setLoading(true);
        setError(null);
        try {
            // ✅ Naye backend endpoint ko call karein
            const response = await axios.get(`${API_URL}/recruiter/my-postings`);
            setPostings(response.data || []);
        } catch (err) {
            console.error("Error fetching jobs:", err);
            setError(err.response?.data?.message || "Could not load job postings.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleEditJob = (jobId) => { setEditingJobId(jobId); };
    const handleViewApplicants = (jobId) => { navigate(`/recruiter/applicants?jobId=${jobId}`); };

    // ✅ Job status toggle (Close/Reopen)
    const handleCloseToggleJob = async (jobId, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Closed' : 'Active';
        if (!window.confirm(`Are you sure you want to ${newStatus === 'Active' ? 'reopen' : 'close'} this job?`)) {
            return;
        }
        
        try {
            // ✅ PUT request /api/internships/:id par bhejein (yahi update endpoint hai)
            const response = await axios.put(`${API_URL}/internships/${jobId}`, {
                status: newStatus 
            }); 
            
            alert(response.data.message || "Status updated!");
            fetchJobs(); // List ko refresh karein
        } catch (err) {
            console.error("Failed to update status:", err);
            alert(err.response?.data?.message || "Error updating status.");
        }
    };

    return (
        <div className="recruiter-page">
            <TopNavbar />
            <main className="recruiter-page-content job-postings-page">
                <div className="page-header">
                    <h1>My Job Postings</h1>
                    <button className="create-job-btn" onClick={() => setShowCreateModal(true)}>
                       + Post New Internship
                    </button>
                </div>

                {loading ? ( <p>Loading job postings...</p> ) : 
                 error ? ( <p className="error-message" style={{color: 'red'}}>{error}</p> ) :
                 postings.length > 0 ? (
                    <div className="postings-list">
                        {postings.map(job => (
                            <JobPostingCard
                                key={job.id}
                                job={job}
                                onEdit={handleEditJob}
                                onViewApplicants={handleViewApplicants} // Pass handler
                                onCloseToggle={handleCloseToggleJob}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="empty-state">You haven't posted any jobs yet.</p>
                )}

                {/* Create Modal (recruiterId prop hata diya) */}
                {showCreateModal && (
                    <CreateJobModal 
                        onPostSuccess={fetchJobs} 
                        onClose={() => setShowCreateModal(false)} 
                    />
                )}

                {/* Edit Modal */}
                {editingJobId && (
                    <EditJobModal
                        jobId={editingJobId}
                        onSaveSuccess={() => {
                            fetchJobs();
                            setEditingJobId(null);
                        }}
                        onClose={() => setEditingJobId(null)}
                    />
                )}
            </main>
        </div>
    );
};

export default JobPostings;