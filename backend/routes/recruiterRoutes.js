const express = require('express');
const router = express.Router();
// Sabhi require statements mein .js add karein
const appCtrl = require('../controllers/application.ctrl.js');
const dashboardCtrl = require('../controllers/recruiterDashboard.ctrl.js');
const internshipCtrl = require('../controllers/internship.ctrl.js');
const { isAuthenticated, isRecruiter } = require('../middleware/auth.mw.js');

// Dashboard
router.get('/dashboard/stats', isAuthenticated, isRecruiter, dashboardCtrl.getDashboardStats);
router.get('/dashboard/recent-applicants', isAuthenticated, isRecruiter, dashboardCtrl.getRecentApplicants);

// Applicants
router.get('/applicants/:internshipId', isAuthenticated, isRecruiter, appCtrl.getApplicantsForJob);
router.patch('/applications/:applicationId/status', isAuthenticated, isRecruiter, appCtrl.updateApplicationStatus);

// Postings
router.get('/my-postings', isAuthenticated, isRecruiter, internshipCtrl.getMyPostings);

module.exports = router;