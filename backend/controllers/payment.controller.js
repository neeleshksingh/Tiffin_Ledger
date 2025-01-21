const UPI_ID = "8877450120@ybl";

const generateUPIPaymentLink = (req, res) => {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
        return res.status(400).json({
            message: "Amount and Order ID are required"
        });
    }

    const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=Your%20Business%20Name&mc=0000&tid=${encodeURIComponent(orderId)}&tr=${encodeURIComponent(orderId)}&tn=${encodeURIComponent(`Payment for Order ${orderId}`)}&am=${encodeURIComponent(amount)}&cu=INR`;

    return res.json({
        paymentLink: upiLink
    });
};

module.exports = {
    generateUPIPaymentLink
};