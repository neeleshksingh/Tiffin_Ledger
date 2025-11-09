const express = require("express");
const { generateUPIPaymentLink } = require("../controllers/payment.controller");
const { updatePaidRange, updatePaidTracking, getPaidTrackingData } = require("../controllers/paid-tracking.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/generate-upi-payment-link", generateUPIPaymentLink);

router.post("/mark-paid-range", authenticateToken, updatePaidRange);

router.post("/update-paid-tracking", authenticateToken, updatePaidTracking);

router.get("/paid-tracking", authenticateToken, getPaidTrackingData);

module.exports = router;