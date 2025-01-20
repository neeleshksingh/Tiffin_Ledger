const pdf = require('puppeteer');
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
        // Log input for debugging
        console.log('User ID:', userId);
        console.log('Date:', date);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const uniqueCode = user._id.toString().slice(-4).toUpperCase();
        const invoiceNumber = `INV${uniqueCode}${Date.now()}`;

        const billingInfo = {
            name: user.name,
            gstin: user.gstin,
            address: user.address,
        };

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
            const price = 50;
            const amount = price * 1;
            return {
                name: `Tiffin on ${dateTaken}`,
                quantity: 1,
                price,
                amount,
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

        // Log generated HTML for debugging
        console.log(html);

         // Generate PDF using Puppeteer
         const browser = await pdf.launch();
         const page = await browser.newPage();
         await page.setContent(html);
         const buffer = await page.pdf({ format: 'A4' });
         await browser.close();
 
         // Send PDF as response
         res.setHeader("Content-Type", "application/pdf");
         res.setHeader("Content-Disposition", 'attachment; filename="bill.pdf"');
         res.send(buffer);
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    generateBillPDF,
};