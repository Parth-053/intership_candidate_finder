const express = require('express');
const router = express.Router();
const appCtrl = require('../controllers/application.ctrl');
const dashboardCtrl = require('../controllers/candidateDashboard.ctrl');
const { isAuthenticated, isCandidate } = require('../middleware/auth.mw');

// Saare routes protected hain, sirf candidate ke liye

// POST /api/candidate/apply (Internship ke liye apply karna)
router.post('/apply', isAuthenticated, isCandidate, appCtrl.applyForInternship);

// GET /api/candidate/my-applications (Apni saari applications dekhna)
router.get('/my-applications', isAuthenticated, isCandidate, dashboardCtrl.getMyApplications);

// GET /api/candidate/saved-internships (Apni saved internships dekhna)
router.get('/saved-internships', isAuthenticated, isCandidate, dashboardCtrl.getMySavedInternships);

// GET /api/candidate/notifications
router.get('/notifications', isAuthenticated, isCandidate, dashboardCtrl.getMyNotifications);

module.exports = router;