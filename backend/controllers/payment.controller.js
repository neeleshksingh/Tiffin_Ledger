const UPI_ID = "8877450120@ybl";

const generateUPIPaymentLink = (req, res) => {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
        return res.status(400).json({
            message: "Amount and Order ID are required"
        });
    }

    const upiLink = `upi://pay?pa=${UPI_ID}&pn=Your%20Business%20Name&mc=0000&tid=${orderId}&tr=${orderId}&tn=Payment%20for%20Order%20${orderId}&am=${amount}&cu=INR`;

    return res.json({
        paymentLink: upiLink
    });
};

module.exports = {
    generateUPIPaymentLink
};