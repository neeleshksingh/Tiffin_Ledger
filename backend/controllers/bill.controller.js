const PDFDocument = require('pdfkit');
const User = require('../models/user');
const TiffinTracking = require('../models/tiffin-tracking');
const Vendor = require('../models/vendor');

const generateBillPDF = async (req, res) => {
    const { userId, date } = req.body;

    if (!userId || !date) {
        return res.status(400).json({ message: "Invalid request data" });
    }

    try {
        const user = await User.findById(userId).populate('messId');
        const tiffinTracking = await TiffinTracking.findOne({ userId, month: date.substring(0, 7) });

        if (!user || !tiffinTracking) {
            return res.status(404).json({ message: "User or Tiffin tracking data not found" });
        }

        const uniqueCode = user._id.toString().slice(-4).toUpperCase();
        const invoiceNumber = `INV${uniqueCode}${Date.now()}`;

        const vendor = user.messId;
        if (!vendor) {
            return res.status(404).json({ message: "No vendor associated with this user" });
        }

        const billingInfo = {
            name: user.name,
            gstin: vendor.gstNumber,
            address: vendor.address,
            shopName: vendor.shopName
        };

        // Collect all meals taken (nested)
        const mealsTaken = [];
        Array.from(tiffinTracking.days.entries()).forEach(([day, dayMeals]) => {
            Array.from(dayMeals.entries()).forEach(([mealType, taken]) => {
                if (taken) {
                    mealsTaken.push({ day, mealType });
                }
            });
        });

        if (mealsTaken.length === 0) {
            return res.status(404).json({ message: "No meals found for this user." });
        }

        // Sort by day, then meal order (breakfast, lunch, dinner)
        const mealOrder = { breakfast: 1, lunch: 2, dinner: 3 };
        const sortedMeals = mealsTaken.sort((a, b) => {
            if (a.day !== b.day) return parseInt(a.day) - parseInt(b.day);
            return (mealOrder[a.mealType] || 4) - (mealOrder[b.mealType] || 4);
        });

        const items = sortedMeals.map(({ day, mealType }) => {
            const price = vendor.amountPerDay;  // Per meal
            const amount = price * 1;
            return {
                name: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} on ${day.padStart(2, '0')}`,  // e.g., "Breakfast on 01"
                quantity: 1,
                price,
                amount,
            };
        });

        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

        // Default GST rate is 18% if not provided by vendor
        const gstRate = vendor.gstRate || 18;
        const gstAmount = (totalAmount * gstRate) / 100;
        const grandTotal = totalAmount + gstAmount;

        // PDF generation (unchanged structure, but items now per-meal)
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="bill.pdf"');
        doc.pipe(res);

        // Header - Invoice Info
        doc.fontSize(16).font('Helvetica-Bold').text('Invoice', { align: 'center' });
        doc.fontSize(12).font('Helvetica').text(`Invoice Number: ${invoiceNumber}`, { align: 'center' });
        doc.text(`Invoice Date: ${date}`, { align: 'center' });

        doc.moveDown(1);

        // Billing Information (unchanged)
        doc.fontSize(12).font('Helvetica-Bold').text('Billing Information:', { underline: true });
        doc.fontSize(12).font('Helvetica').text(`Customer Name: ${billingInfo.name}`);
        doc.text(`GSTIN: ${billingInfo.gstin}`);
        doc.text(`Shop Address: ${billingInfo.address}`);
        doc.text(`Shop Name: ${billingInfo.shopName}`);

        doc.moveDown(2);

        // Table Header (unchanged)
        const headerY = doc.y;
        const headerX = 50;

        doc.fontSize(12).font('Helvetica-Bold').text('Description', headerX, headerY);
        doc.text('Quantity', headerX + 200, headerY, { width: 100, align: 'center' });
        doc.text('Price', headerX + 300, headerY, { width: 100, align: 'center' });
        doc.text('Amount', headerX + 400, headerY, { width: 100, align: 'center' });

        // Draw table rows for each MEAL (may need wrapping if many)
        let yPosition = headerY + 20;

        items.forEach(item => {
            doc.fontSize(10).font('Helvetica').text(item.name, headerX, yPosition, { width: 200, align: 'left' });
            doc.text(item.quantity.toString(), headerX + 200, yPosition, { width: 100, align: 'center' });
            doc.text(item.price.toString(), headerX + 300, yPosition, { width: 100, align: 'center' });
            doc.text(item.amount.toString(), headerX + 400, yPosition, { width: 100, align: 'center' });
            yPosition += 20;
        });

        // Draw the totals (unchanged)
        doc.moveDown(1);
        doc.fontSize(12).font('Helvetica-Bold').text(`Total Amount: ${totalAmount}`, headerX, yPosition + 20);
        doc.text(`GST (${gstRate}%): ${gstAmount}`, headerX, yPosition + 40);
        doc.text(`Grand Total: ${grandTotal}`, headerX, yPosition + 60);

        // Footer (unchanged)
        const footerY = yPosition + 80;
        doc.moveTo(50, footerY)
            .lineTo(550, footerY)
            .stroke();

        doc.fontSize(8).font('Helvetica').text('Thank you for your business!', 50, footerY + 10);
        doc.text('For any inquiries, contact us at support@tiffinservice.com', 50, footerY + 20);
        doc.text('Terms and conditions apply. Payment due within 7 days of invoice date.', 50, footerY + 30);

        doc.end();

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { generateBillPDF };