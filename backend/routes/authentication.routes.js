const express = require('express');
const router = express.Router();
const { signup, signin, logoutController } = require('../controllers/auth.controller');
const validateRequest = require('../middlewares/validate-user-request.middleware');

// Signup Route
router.post('/signup', validateRequest, signup);

// Signin Route
router.post('/signin', validateRequest, signin);

router.post('/logout', validateRequest, logoutController);

module.exports = router;