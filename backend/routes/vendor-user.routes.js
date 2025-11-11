const express = require('express');
const { protectVendor } = require('../middlewares/protect-vendor.middleware');
const { getVendorProfile, updateVendorProfile, deleteVendorProfile, getAssignedUsers, getAllUsersPaymentStatus, getUserPaymentHistory } = require('../controllers/vendor-profile.controller');
const { getRevenueStats } = require('../controllers/vendor-revenue.controller');
const { toggleBlockUser } = require('../controllers/vendor.controller');
const router = express.Router();

router.get('/profile', protectVendor, getVendorProfile);

router.put('/profile', protectVendor, updateVendorProfile);

router.delete('/profile', protectVendor, deleteVendorProfile);

router.get('/users', protectVendor, getAssignedUsers);

router.get('/revenue-stats', protectVendor, getRevenueStats);

router.patch('/users/:userId/block', protectVendor, toggleBlockUser);

router.get('/transactions', protectVendor, getAllUsersPaymentStatus);

router.get('/users/:userId/payment-history', protectVendor, getUserPaymentHistory);

module.exports = router;