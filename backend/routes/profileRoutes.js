const express = require('express');
const router = express.Router();
// Sabhi require statements mein .js add karein
const profileCtrl = require('../controllers/profile.ctrl.js');
const { isAuthenticated, isCandidate } = require('../middleware/auth.mw.js');
const upload = require('../middleware/upload.mw.js'); 

router.get('/me', isAuthenticated, profileCtrl.getMyProfile);
router.put('/me', isAuthenticated, upload, profileCtrl.updateMyProfile);
router.post('/save/:internshipId', isAuthenticated, isCandidate, profileCtrl.saveInternshipToggle);

module.exports = router;