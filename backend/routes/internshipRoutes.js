const express = require('express');
const router = express.Router();
// ✅ Dono require statements mein .js add karein
const internshipCtrl = require('../controllers/internship.ctrl.js');
const { isAuthenticated, isRecruiter } = require('../middleware/auth.mw.js');

// PUBLIC Routes
router.get('/', internshipCtrl.getAllInternships);
router.get('/:id', internshipCtrl.getInternshipById);

// PROTECTED Routes (Recruiter)
router.post('/post', isAuthenticated, isRecruiter, internshipCtrl.postInternship);
router.put('/:id', isAuthenticated, isRecruiter, internshipCtrl.updateInternship);
router.delete('/:id', isAuthenticated, isRecruiter, internshipCtrl.deleteInternship);

module.exports = router;