const pdf = require('html-pdf');
const ejs = require('ejs');
const path = require('path');
const User = require('../models/User');
const TiffinTracking = require('../models/tiffin-tracking');

const generateBillPDF = async (req, res) => {
    const { userId, invoiceNumber, date } = req.body;

    if (!userId || !invoiceNumber || !date) {
        return res.status(400).json({ message: "Invalid request data" });
    }

    try {
        // Fetch the user's details using the userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const billingInfo = {
            name: user.name,
            gstin: user.gstin,
            address: user.address,
        };

        const shippingInfo = { ...billingInfo };

        const tiffinTracking = await TiffinTracking.findOne({ userId });
        if (!tiffinTracking) {
            return res.status(404).json({ message: "Tiffin tracking data not found" });
        }

        const datesTaken = [];
        tiffinTracking.days.forEach((value, key) => {
            if (value === true) {
                datesTaken.push(key);
            }
        });

        if (datesTaken.length === 0) {
            return res.status(404).json({ message: "No tiffin days found for this user." });
        }

        const items = datesTaken.map((dateTaken) => {
            return {
                name: `Tiffin on ${dateTaken}`,
                quantity: 1,
                price: 50,
                amount: 50,
            };
        });

        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

        const gstAmount = (totalAmount * 18) / 100;

        const html = await ejs.renderFile(path.join(__dirname, "../views/bill-template.ejs"), {
            invoiceNumber,
            date,
            billingInfo,
            items,
            totalAmount,
            gstAmount,
        });

        pdf.create(html).toBuffer((err, buffer) => {
            if (err) {
                return res.status(500).json({ message: "Server error" });
            }

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", 'attachment; filename="bill.pdf"');
            res.send(buffer);
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    generateBillPDF,
};