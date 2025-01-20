const PDFDocument = require('pdfkit');
const User = require('../models/user');
const TiffinTracking = require('../models/tiffin-tracking');

const generateBillPDF = async (req, res) => {
    const { userId, date } = req.body;

    if (!userId || !date) {
        return res.status(400).json({ message: "Invalid request data" });
    }

    try {
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

        const sortedDates = datesTaken
            .map(date => {
                const [day, month, year] = date.split('/');
                const formattedDay = day.padStart(2, '0');
                return `${formattedDay}`;
            })
            .sort((a, b) => a - b);

        const items = sortedDates.map((dateTaken) => {
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
        const grandTotal = totalAmount + gstAmount;

        // Create a PDF document
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        // Set the response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="bill.pdf"');

        // Pipe the document to the response
        doc.pipe(res);

        // Header - Invoice Info
        doc.fontSize(16).font('Helvetica-Bold').text('Invoice', { align: 'center' });
        doc.fontSize(12).font('Helvetica').text(`Invoice Number: ${invoiceNumber}`, { align: 'center' });
        doc.text(`Invoice Date: ${date}`, { align: 'center' });

        doc.moveDown(1);

        // Billing Information
        doc.fontSize(12).font('Helvetica-Bold').text('Billing Information:', { underline: true });
        doc.fontSize(12).font('Helvetica').text(`Name: ${billingInfo.name}`);
        doc.text(`GSTIN: ${billingInfo.gstin}`);
        doc.text(`Address: ${billingInfo.address}`);

        doc.moveDown(2);

        // Table Header - Aligning the columns
        const headerY = doc.y;
        const headerX = 50;

        doc.fontSize(12).font('Helvetica-Bold').text('Description', headerX, headerY);
        doc.text('Quantity', headerX + 200, headerY, { width: 100, align: 'center' });
        doc.text('Price', headerX + 300, headerY, { width: 100, align: 'center' });
        doc.text('Amount', headerX + 400, headerY, { width: 100, align: 'center' });

        // Draw table rows for each item
        let yPosition = headerY + 20;

        items.forEach(item => {
            doc.fontSize(10).font('Helvetica').text(item.name, headerX, yPosition, { width: 200, align: 'left' });
            doc.text(item.quantity.toString(), headerX + 200, yPosition, { width: 100, align: 'center' });
            doc.text(item.price.toString(), headerX + 300, yPosition, { width: 100, align: 'center' });
            doc.text(item.amount.toString(), headerX + 400, yPosition, { width: 100, align: 'center' });
            yPosition += 20;
        });

        // Draw the totals
        doc.moveDown(1);
        doc.fontSize(12).font('Helvetica-Bold').text(`Total Amount: ${totalAmount}`, headerX, yPosition + 20);
        doc.text(`GST (18%): ${gstAmount}`, headerX, yPosition + 40);
        doc.text(`Grand Total: ${grandTotal}`, headerX, yPosition + 60);

        // Footer section
        const footerY = yPosition + 80;
        doc.moveTo(50, footerY)
            .lineTo(550, footerY)
            .stroke();

        doc.fontSize(8).font('Helvetica').text('Thank you for your business!', 50, footerY + 10);
        doc.text('For any inquiries, contact us at support@tiffinservice.com', 50, footerY + 20);
        doc.text('Terms and conditions apply. Payment due within 7 days of invoice date.', 50, footerY + 30);

        // Finalize the PDF and end the stream
        doc.end();

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { generateBillPDF };