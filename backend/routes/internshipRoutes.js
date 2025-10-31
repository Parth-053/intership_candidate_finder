const express = require('express');
const router = express.Router();
const internshipCtrl = require('../controllers/internship.ctrl');
const { isAuthenticated, isRecruiter } = require('../middleware/auth.mw');

// PUBLIC Routes (Koi bhi access kar sakta hai)
// GET /api/internships
router.get('/', internshipCtrl.getAllInternships);

// GET /api/internships/:id
router.get('/:id', internshipCtrl.getInternshipById);


// PROTECTED Routes (Sirf Recruiter access kar sakta hai)
// POST /api/internships/post
router.post('/post', isAuthenticated, isRecruiter, internshipCtrl.postInternship);

// PUT /api/internships/:id
router.put('/:id', isAuthenticated, isRecruiter, internshipCtrl.updateInternship);

// DELETE /api/internships/:id
router.delete('/:id', isAuthenticated, isRecruiter, internshipCtrl.deleteInternship);

module.exports = router;