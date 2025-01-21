const express = require('express');
const router = express.Router();
const { updateTracking, getTrackingData } = require('../controllers/tiffin-tracking.controller');
const { generateBillPDF } = require('../controllers/bill.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { getUserTiffinAndBilling } = require('../controllers/tiffin-billing.controller');
const validateRequest = require('../middlewares/validate-request.middleware');
const { getVendors, assignVendorToUser, createVendor, updateVendorById, deleteVendorById, deleteMultipleVendors, addMultipleVendors } = require('../controllers/vendor.controller');

// Update tracking data
router.post('/track/add', authenticateToken, validateRequest, updateTracking);

// Retrieve tracking data
router.get('/track/get', authenticateToken, getTrackingData);

//Generate Bill
router.post("/generate", authenticateToken, generateBillPDF);

//Get Tiffin and Billing Data
router.get("/tiffin-bill/:userId", authenticateToken, getUserTiffinAndBilling);

// Route to get available vendors (for UI)
router.get('/vendors', getVendors);

// Route to assign vendor to user
router.post('/assign-vendor', assignVendorToUser);

// Create a new vendor
router.post('/create-vendor', createVendor);

router.put('/update-vendor/:id', updateVendorById);

router.delete('/delete-vendor/:id', deleteVendorById);

router.delete('/delete-multiple-vendors', deleteMultipleVendors);

router.post('add-multiple-vendors', addMultipleVendors);

module.exports = router;