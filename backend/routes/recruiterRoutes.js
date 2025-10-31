const express = require('express');
const router = express.Router();
const appCtrl = require('../controllers/application.ctrl');
const dashboardCtrl = require('../controllers/recruiterDashboard.ctrl');
const internshipCtrl = require('../controllers/internship.ctrl'); // ✅ YEH LINE ADD KI GAYI HAI
const { isAuthenticated, isRecruiter } = require('../middleware/auth.mw');

// Saare routes protected hain, sirf recruiter ke liye

// GET /api/recruiter/dashboard/stats
router.get('/dashboard/stats', isAuthenticated, isRecruiter, dashboardCtrl.getDashboardStats);

// GET /api/recruiter/dashboard/recent-applicants
router.get('/dashboard/recent-applicants', isAuthenticated, isRecruiter, dashboardCtrl.getRecentApplicants);

// GET /api/recruiter/applicants/:internshipId (Ek job ke saare applicants)
router.get('/applicants/:internshipId', isAuthenticated, isRecruiter, appCtrl.getApplicantsForJob);

// PATCH /api/recruiter/applications/:applicationId/status (Status update karna)
router.patch('/applications/:applicationId/status', isAuthenticated, isRecruiter, appCtrl.updateApplicationStatus);

// ✅ YEH ROUTE ADD KIYA GAYA HAI
// GET /api/recruiter/my-postings (Recruiter ki saari postings fetch karna)
router.get('/my-postings', isAuthenticated, isRecruiter, internshipCtrl.getMyPostings);

module.exports = router;