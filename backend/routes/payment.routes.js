const express = require("express");
const { generateUPIPaymentLink } = require("../controllers/payment.controller");
const { getEligiblePaidDays, markPaidSelectedDays, getPaidDays } = require("../controllers/paid-tracking.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/generate-upi-payment-link", generateUPIPaymentLink);

router.get("/eligible-paid-days", authenticateToken, getEligiblePaidDays);
router.post("/mark-paid-selected", authenticateToken, markPaidSelectedDays);
router.get("/get-paid-days", authenticateToken, getPaidDays)

module.exports = router;