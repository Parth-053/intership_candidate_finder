const express = require('express');
const router = express.Router();
// Controller ko require karte waqt .js add karein
const dataController = require('../controllers/data.ctrl.js');

router.get('/companies', dataController.getDistinctCompanies);
router.get('/categories', dataController.getDistinctCategories);
router.get('/locations', dataController.getDistinctLocations);

module.exports = router;