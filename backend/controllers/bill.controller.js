const pdf = require('html-pdf');
const phantomPath = require('phantomjs-prebuilt').path;
const ejs = require('ejs');
const path = require('path');
const User = require('../models/user');
const TiffinTracking = require('../models/tiffin-tracking');

const generateBillPDF = async (req, res) => {
    const { userId, date } = req.body;

    if (!userId || !date) {
        return res.status(400).json({ message: "Invalid request data" });
    }

    try {
        // Fetch user and tiffin tracking data
        const user = await User.findById(userId);
        const tiffinTracking = await TiffinTracking.findOne({ userId });

        if (!user || !tiffinTracking) {
            return res.status(404).json({ message: "User or Tiffin tracking data not found" });
        }

        const uniqueCode = user._id.toString().slice(-4).toUpperCase();
        const invoiceNumber = `INV${uniqueCode}${Date.now()}`;

        const billingInfo = {
            name: user.name,
            gstin: user.gstin,
            address: user.address,
        };

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
            const price = 50;
            return {
                name: `Tiffin on ${dateTaken}`,
                quantity: 1,
                price,
                amount: price,
            };
        });

        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
        const gstAmount = (totalAmount * 18) / 100;
        const grandTotal = totalAmount + gstAmount;

        // Render EJS template
        const ejsPath = path.join(__dirname, '../views/bill-template.ejs');
        const html = await ejs.renderFile(ejsPath, {
            invoiceNumber,
            date,
            billingInfo,
            items,
            totalAmount,
            gstAmount,
            grandTotal,
        });

        // Convert HTML to PDF
        const options = {
            format: 'A4',
            orientation: 'portrait',
            phantomPath, // Set the path to phantomjs
        };
        pdf.create(html, options).toStream((err, stream) => {
            if (err) {
                console.error('PDF generation error:', err);
                return res.status(500).json({ message: "Failed to generate PDF." });
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="bill.pdf"');
            stream.pipe(res);
        });

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { generateBillPDF };
