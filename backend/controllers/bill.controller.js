const puppeteer = require('puppeteer');
const chrome = require('chrome-aws-lambda');
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
        // Fetch user details
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate a unique invoice number
        const uniqueCode = user._id.toString().slice(-4).toUpperCase();
        const invoiceNumber = `INV${uniqueCode}${Date.now()}`;

        const billingInfo = {
            name: user.name,
            gstin: user.gstin,
            address: user.address,
        };

        // Fetch tiffin tracking data
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

        // Render HTML template
        const html = await ejs.renderFile(path.join(__dirname, "../views/bill-template.ejs"), {
            invoiceNumber,
            date,
            billingInfo,
            items,
            totalAmount,
            gstAmount,
        });

        // Launch browser using chrome-aws-lambda's provided path to Chromium
        const browser = await puppeteer.launch({
            args: [...chrome.args, '--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: await chrome.executablePath,  // Automatically fetches the correct path in serverless environments
            headless: chrome.headless,
        });
        

        const page = await browser.newPage();
        await page.setContent(html);
        const buffer = await page.pdf({ format: 'A4' });
        await browser.close();

        // Send PDF as response
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="bill.pdf"');
        res.send(buffer);

    } catch (error) {
        console.error("Error generating PDF:", error);
        return res.status(500).json({ message: "Error generating PDF" });
    }
};

module.exports = { generateBillPDF };
