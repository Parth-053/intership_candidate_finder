import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { AuthProvider, AuthContext } from "./context/AuthContext";

// Candidate Pages
import Home from "./pages/candidate/Home";
import Internship from "./pages/candidate/Internship";
import InternshipDetail from "./pages/candidate/InternshipDetail";
import Dashboard from "./pages/candidate/Dashboard";
import Profile from "./pages/candidate/Profile";
import SavedPage from "./pages/candidate/SavedPage";
import MyApplicationsPage from "./pages/candidate/MyApplicationsPage";
import NotificationsPage from "./pages/candidate/NotificationsPage";

// === NAYE AUTH PAGES ===
import Select from "./pages/login/Select";
import CandidateAuth from "./pages/login/CandidateAuth";
import RecruiterAuth from "./pages/login/RecruiterAuth";
// === PURANE AUTH PAGES DELETE HONGE ===
// import Select from "./pages/login/Select";
// import CandidateLogin from "./pages/login/CandidateLogin";
// import RecruiterLogin from "./pages/login/RecruiterLogin";

// Recruiter Pages
import RecruiterDashboard from "./pages/recruiter/Dashboard";
import RecruiterJobPostings from "./pages/recruiter/JobPostings";
import RecruiterApplicants from "./pages/recruiter/Applicants";
import RecruiterCompanyProfile from "./pages/recruiter/CompanyProfile";

// --- Protected Route Wrappers ---
// Yeh check karega ki candidate logged in hai ya nahi
const CandidateRoute = ({ children }) => {
  const { authData } = useContext(AuthContext);
  if (authData.loading) return <div>Loading...</div>; // Prevent flicker
  if (!authData.token || authData.user.role !== 'candidate') {
    return <Navigate to="/login/candidate" replace />;
  }
  return children;
};

// Yeh check karega ki recruiter logged in hai ya nahi
const RecruiterRoute = ({ children }) => {
  const { authData } = useContext(AuthContext);
  if (authData.loading) return <div>Loading...</div>; // Prevent flicker
  if (!authData.token || authData.user.role !== 'recruiter') {
    return <Navigate to="/login/recruiter" replace />;
  }
  return children;
};

// App ki Routes
function AppRoutes() {
  return (
    <Routes>
      {/* Default Route */}
      <Route path="/" element={<Navigate replace to="/home" />} />

      {/* Public Candidate Routes */}
      <Route path="/home" element={<Home />} />
      <Route path="/internships" element={<Internship />} />
      <Route path="/internships/:id" element={<InternshipDetail />} />

      {/* --- NAYE AUTH ROUTES --- */}
      <Route path="/login/candidate" element={<CandidateAuth />} />
      <Route path="/login/recruiter" element={<RecruiterAuth />} />
      <Route path="/login" element={<Select />} />

      {/* --- PROTECTED Candidate Routes --- */}
      <Route path="/candidate/dashboard" element={<CandidateRoute><Dashboard /></CandidateRoute>} />
      <Route path="/candidate/profile" element={<CandidateRoute><Profile /></CandidateRoute>} />
      <Route path="/candidate/dashboard/saved" element={<CandidateRoute><SavedPage /></CandidateRoute>} />
      <Route path="/candidate/dashboard/applications" element={<CandidateRoute><MyApplicationsPage /></CandidateRoute>} />
      <Route path="/candidate/dashboard/notifications" element={<CandidateRoute><NotificationsPage /></CandidateRoute>} />

      {/* --- PROTECTED Recruiter Routes --- */}
      <Route path="/recruiter/dashboard" element={<RecruiterRoute><RecruiterDashboard /></RecruiterRoute>} />
      <Route path="/recruiter/postings" element={<RecruiterRoute><RecruiterJobPostings /></RecruiterRoute>} />
      <Route path="/recruiter/applicants" element={<RecruiterRoute><RecruiterApplicants /></RecruiterRoute>} />
      <Route path="/recruiter/applicants/:jobId" element={<RecruiterRoute><RecruiterApplicants /></RecruiterRoute>} />
      <Route path="/recruiter/profile" element={<RecruiterRoute><RecruiterCompanyProfile /></RecruiterRoute>} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;