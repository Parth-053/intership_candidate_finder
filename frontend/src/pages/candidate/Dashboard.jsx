import React from "react";
import TopNavbar from "../../components/candidate/common/TopNavbar";
import Sidebar from "../../components/candidate/dashboard/Sidebar";
import ProfileSummary from "../../components/candidate/dashboard/ProfileSummary";
import DashboardStats from "../../components/candidate/dashboard/DashboardStats";
import AppliedInternships from "../../components/candidate/dashboard/AppliedInternships";
import SavedInternships from "../../components/candidate/dashboard/SavedInternships";
import Notifications from "../../components/candidate/dashboard/Notifications";
import QuickActions from "../../components/candidate/dashboard/QuickActions";
import "../../styles/candidate/dashboard/DashboardPage.css";

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <TopNavbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main-content">
          <ProfileSummary />
          <DashboardStats />
          <div className="dashboard-grid"> {/* Changed to grid */}
             <div className="main-column"> {/* Left column */}
               <AppliedInternships />
               <SavedInternships />
             </div>
             <div className="side-column"> {/* Right column */}
                <QuickActions />
                <Notifications />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;