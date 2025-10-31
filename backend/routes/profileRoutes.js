const express = require('express');
const router = express.Router();
const profileCtrl = require('../controllers/profile.ctrl');
const { isAuthenticated, isCandidate } = require('../middleware/auth.mw');

// PROTECTED (Koi bhi logged-in user)
// GET /api/profile/me (Apni profile fetch karna)
router.get('/me', isAuthenticated, profileCtrl.getMyProfile);

// PUT /api/profile/me (Apni profile update karna)
router.put('/me', isAuthenticated, profileCtrl.updateMyProfile);


// PROTECTED (Sirf Candidate)
// POST /api/profile/save/:internshipId (Job ko save/unsave karna)
router.post('/save/:internshipId', isAuthenticated, isCandidate, profileCtrl.saveInternshipToggle);

module.exports = router;