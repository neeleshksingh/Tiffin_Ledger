const express = require('express');
const { protectVendor } = require('../middlewares/protect-vendor.middleware');
const { getVendorProfile, updateVendorProfile, deleteVendorProfile, getAssignedUsers } = require('../controllers/vendor-profile.controller');
const router = express.Router();

router.get('/profile', protectVendor, getVendorProfile);

router.put('/profile', protectVendor, updateVendorProfile);

router.delete('/profile', protectVendor, deleteVendorProfile);

router.get('/users', protectVendor, getAssignedUsers);

module.exports = router;