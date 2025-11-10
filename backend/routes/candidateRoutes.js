const express = require('express');
const router = express.Router();
// Dono require statements mein .js add karein
const appCtrl = require('../controllers/application.ctrl.js');
const dashboardCtrl = require('../controllers/candidateDashboard.ctrl.js');
const { isAuthenticated, isCandidate } = require('../middleware/auth.mw.js');

router.post('/apply', isAuthenticated, isCandidate, appCtrl.applyForInternship);
router.get('/my-applications', isAuthenticated, isCandidate, dashboardCtrl.getMyApplications);
router.get('/saved-internships', isAuthenticated, isCandidate, dashboardCtrl.getMySavedInternships);
router.get('/notifications', isAuthenticated, isCandidate, dashboardCtrl.getMyNotifications);
router.patch('/notifications/:id/read', isAuthenticated, isCandidate, dashboardCtrl.markNotificationAsRead);

module.exports = router;