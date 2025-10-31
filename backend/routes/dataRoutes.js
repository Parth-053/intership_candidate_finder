const express = require('express');
const router = express.Router();
const dataController = require('../controllers/data.ctrl'); // Check path

router.get('/companies', dataController.getDistinctCompanies);
router.get('/categories', dataController.getDistinctCategories);

module.exports = router;