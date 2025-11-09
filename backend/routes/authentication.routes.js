const express = require('express');
const router = express.Router();
const { signup, signin, logoutController } = require('../controllers/auth.controller');
const validateRequest = require('../middlewares/validate-user-request.middleware');
const { signupVendorUser, loginVendorUser } = require('../controllers/vendor-auth.controller');

// Signup Route
router.post('/signup', validateRequest, signup);

// Signin Route
router.post('/signin', validateRequest, signin);

router.post('/logout', validateRequest, logoutController);

//vendor user auth routes
router.post('/vendors/signup', signupVendorUser);
router.post('/vendors/login', loginVendorUser);


module.exports = router;