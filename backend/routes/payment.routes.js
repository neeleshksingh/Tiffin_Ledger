const express = require("express");
const { generateUPIPaymentLink } = require("../controllers/payment.controller");
const router = express.Router();

// POST route to generate UPI payment link
router.post("/generate-upi-payment-link", generateUPIPaymentLink);

module.exports = router;