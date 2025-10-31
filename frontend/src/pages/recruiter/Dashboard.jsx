import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios'; // ✅ axios
import { AuthContext } from '../../context/AuthContext'; // ✅ AuthContext
import TopNavbar from '../../components/recruiter/common/TopNavbar';
import DashboardStats from '../../components/recruiter/dashboard/DashboardStats';
import RecentApplicants from '../../components/recruiter/dashboard/RecentApplicants';
import ActiveJobs from '../../components/recruiter/dashboard/ActiveJobs';
import '../../styles/recruiter/dashboard/DashboardPage.css';

const API_URL = 'http://localhost:5000/api'; // ✅ API URL

const Dashboard = () => {
    const [jobs, setJobs] = useState([]); // All postings
    const [stats, setStats] = useState({
        totalPostedJobs: 0,
        totalApplicants: 0,
        totalShortlisted: 0,
    });
    const [recentApplicants, setRecentApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authData } = useContext(AuthContext);
    const token = authData?.token || localStorage.getItem('authToken');

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) {
                setLoading(false);
                setError("Please log in to view the dashboard.");
                return;
            }
            if (!axios.defaults.headers.common['Authorization']) {
                 axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            
            setLoading(true);
            setError(null);
            try {
                // ✅ Sabhi dashboard data ko parallel fetch karein
                const [statsRes, jobsRes, recentAppsRes] = await Promise.all([
                    axios.get(`${API_URL}/recruiter/dashboard/stats`),
                    axios.get(`${API_URL}/recruiter/my-postings`), // Naya endpoint
                    axios.get(`${API_URL}/recruiter/dashboard/recent-applicants`)
                ]);

                setStats(statsRes.data || { totalPostedJobs: 0, totalApplicants: 0, totalShortlisted: 0 });
                setJobs(jobsRes.data || []);
                setRecentApplicants(recentAppsRes.data || []);
                
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError(err.response?.data?.message || "Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token]);

    // ✅ Stats ko DashboardStats component ke liye transform karein
    const transformedStats = {
        activeJobs: jobs.filter(job => job.status === 'Active').length,
        totalApplicants: stats.totalApplicants,
        // newApplicants: recentApplicants.length, // Ya backend se specific count lein
        newApplicants: stats.newApplicants || 0, // Assuming backend provides this
        interviews: stats.totalShortlisted, // Shortlisted ko interviews maanein
    };

    return (
        <div className="recruiter-page">
            <TopNavbar />
            <main className="recruiter-page-content">
                <h1>Dashboard</h1>
                
                {loading ? (
                    <p>Loading dashboard data...</p>
                ) : error ? (
                    <p className="error-message" style={{color: 'red'}}>{error}</p>
                ) : (
                    <>
                        <DashboardStats stats={transformedStats} />
                        
                        <div className="dashboard-grid">
                            <RecentApplicants applicants={recentApplicants} />
                            <ActiveJobs jobs={jobs} />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default Dashboard;