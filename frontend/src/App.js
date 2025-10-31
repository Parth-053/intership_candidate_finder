import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";

// Candidate Pages
import Home from "./pages/candidate/Home";
import Internship from "./pages/candidate/Internship";
import InternshipDetail from "./pages/candidate/InternshipDetail";
import Dashboard from "./pages/candidate/Dashboard";
import Profile from "./pages/candidate/Profile";
import SavedPage from "./pages/candidate/SavedPage";
import MyApplicationsPage from "./pages/candidate/MyApplicationsPage";
import NotificationsPage from "./pages/candidate/NotificationsPage";

// Login Pages
import Select from "./pages/login/Select";
import CandidateLogin from "./pages/login/CandidateLogin";
import RecruiterLogin from "./pages/login/RecruiterLogin";

// Recruiter Pages
import RecruiterDashboard from "./pages/recruiter/Dashboard";
import RecruiterJobPostings from "./pages/recruiter/JobPostings";
import RecruiterApplicants from "./pages/recruiter/Applicants";
import RecruiterCompanyProfile from "./pages/recruiter/CompanyProfile";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Default Route */}
          <Route path="/" element={<Navigate replace to="/home" />} />

          {/* Candidate Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/internships" element={<Internship />} />
          <Route path="/internships/:id" element={<InternshipDetail />} />
          <Route path="/candidate/dashboard" element={<Dashboard />} />
          <Route path="/candidate/profile" element={<Profile />} />
          <Route path="/candidate/dashboard/saved" element={<SavedPage />} />
          <Route path="/candidate/dashboard/applications" element={<MyApplicationsPage />} />
          <Route path="/candidate/dashboard/notifications" element={<NotificationsPage />} />

          {/* Login Routes */}
          <Route path="/login" element={<Select />} />
          <Route path="/login/candidate" element={<CandidateLogin />} />
          <Route path="/login/recruiter" element={<RecruiterLogin />} />

          {/* Recruiter Routes */}
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/postings" element={<RecruiterJobPostings />} />
          
          {/* ✅ YEH ROUTE ADD KIYA GAYA HAI (jo /recruiter/applicants ko handle karega) */}
          <Route path="/recruiter/applicants" element={<RecruiterApplicants />} />
          
          {/* Note: Yeh route /recruiter/applicants?jobId=... ko bhi handle karega */}
          <Route path="/recruiter/applicants/:jobId" element={<RecruiterApplicants />} />
          <Route path="/recruiter/profile" element={<RecruiterCompanyProfile />} />

        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;