const express = require('express');
const router = express.Router();
// Controller ko require karte waqt .js add karein
const authController = require('../controllers/auth.ctrl.js');

router.post('/register', authController.registerUser);

module.exports = router;