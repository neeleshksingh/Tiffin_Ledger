const express = require('express');
const router = express.Router();
const { updateTracking, getTrackingData } = require('../controllers/tiffin-tracking.controller');
const {generateBillPDF} = require('../controllers/bill.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const validateRequest = require('../middlewares/validate-request.middleware');

// Update tracking data
router.post('/track/add', authenticateToken, validateRequest, updateTracking);

// Retrieve tracking data
router.get('/track/get', authenticateToken, getTrackingData);

//Generate Bill
router.post("/generate", authenticateToken, generateBillPDF);

module.exports = router;