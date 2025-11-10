import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import TopNavbar from "../../components/candidate/common/TopNavbar";
import Sidebar from "../../components/candidate/dashboard/Sidebar";
import ProfileSummary from "../../components/candidate/dashboard/ProfileSummary";
import DashboardStats from "../../components/candidate/dashboard/DashboardStats";
import AppliedInternships from "../../components/candidate/dashboard/AppliedInternships";
import SavedInternships from "../../components/candidate/dashboard/SavedInternships";
import Notifications from "../../components/candidate/dashboard/Notifications";
import QuickActions from "../../components/candidate/dashboard/QuickActions";
import "../../styles/candidate/dashboard/DashboardPage.css";

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [savedInternships, setSavedInternships] = useState([]);
  const [statsData, setStatsData] = useState({
    applications: 0,
    saved: 0,
    shortlisted: 0
  });
  const [loading, setLoading] = useState(true);
  const { authData } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      if (!authData.token) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Dono calls ek saath karein
        const [appsRes, savedRes] = await Promise.all([
          axios.get(`${API_URL}/candidate/my-applications`),
          axios.get(`${API_URL}/candidate/saved-internships`)
        ]);

        const apps = appsRes.data || [];
        const saved = savedRes.data || [];

        setApplications(apps);
        setSavedInternships(saved);

        // Stats calculate karein
        const interviewStatuses = ['shortlisted', 'interview scheduled', 'hired'];
        const shortlistedCount = apps.filter(app =>
            interviewStatuses.includes(app.status?.toLowerCase())
        ).length;

        setStatsData({
          applications: apps.length,
          saved: saved.length,
          shortlisted: shortlistedCount
        });

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authData.token]); // Jab token mile tab fetch karein

  return (
    <div className="dashboard-page">
      <TopNavbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main-content">
          <ProfileSummary />
          
          {/* StatsData ko prop ki tarah pass karein */}
          <DashboardStats statsData={statsData} loading={loading} />

          <div className="dashboard-grid">
             <div className="main-column">
               {/* Applications ko prop ki tarah pass karein */}
               <AppliedInternships applications={applications} loading={loading} />
               {/* SavedInternships ko prop ki tarah pass karein */}
               <SavedInternships savedInternships={savedInternships} loading={loading} />
             </div>
             <div className="side-column">
                <QuickActions />
                {/* Notifications apna data khud fetch karta hai */}
                <Notifications />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;