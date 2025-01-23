const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Add or update user profile
router.post('/add-profile', authenticateToken, profileController.addOrUpdateProfile);

// Get user profile by ID
router.get('/view-profile/:userId', profileController.getProfileById);

// Delete user profile
router.delete('/delete-profile/:userId', profileController.deleteProfile);

module.exports = router;
