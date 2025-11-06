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
        const vendorId = user?.messId?._id;
        if (!user || !vendorId) {
            return res.status(404).json({ message: "User or vendor not found" });
        }
        const month = date.substring(0, 7);
        const tiffinTracking = await TiffinTracking.findOne({ userId, vendorId, month });

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

        // Collect meals by day for calendar
        const mealsByDay = new Map();
        let totalMeals = 0;
        Array.from(tiffinTracking.days.entries()).forEach(([day, dayMeals]) => {
            const takenMeals = [];
            Array.from(dayMeals.entries()).forEach(([mealType, taken]) => {
                if (taken) {
                    takenMeals.push(mealType.charAt(0).toUpperCase()); // B, L, D
                    totalMeals++;
                }
            });
            if (takenMeals.length > 0) {
                mealsByDay.set(day, takenMeals);
            }
        });

        if (totalMeals === 0) {
            return res.status(404).json({ message: "No meals found for this user." });
        }

        const pricePerMeal = vendor.amountPerDay; // Assuming amountPerDay is per meal
        const totalAmount = totalMeals * pricePerMeal;

        // Default GST rate is 18% if not provided by vendor
        const gstRate = vendor.gstRate || 18;
        const gstAmount = (totalAmount * gstRate) / 100;
        const grandTotal = totalAmount + gstAmount;

        // PDF generation
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="bill.pdf"');
        doc.pipe(res);

        // Header - Invoice Info
        doc.fontSize(16).font('Helvetica-Bold').text('Invoice', { align: 'center' });
        doc.fontSize(12).font('Helvetica').text(`Invoice Number: ${invoiceNumber}`, { align: 'center' });
        doc.text(`Invoice Date: ${date}`, { align: 'center' });

        doc.moveDown(1);

        // Billing Information
        doc.fontSize(12).font('Helvetica-Bold').text('Billing Information:', { underline: true });
        doc.fontSize(12).font('Helvetica').text(`Customer Name: ${billingInfo.name}`);
        doc.text(`GSTIN: ${billingInfo.gstin}`);
        doc.text(`Shop Address: ${billingInfo.address}`);
        doc.text(`Shop Name: ${billingInfo.shopName}`);

        doc.moveDown(1.5);

        // Summary Section
        doc.fontSize(14).font('Helvetica-Bold').text('Billing Summary:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica').text(`Total Meals Taken: ${totalMeals}`);
        doc.text(`Subtotal: Rs. ${totalAmount.toFixed(2)}`);
        doc.text(`GST (${gstRate}%): Rs. ${gstAmount.toFixed(2)}`);
        doc.fontSize(14).font('Helvetica-Bold').text(`Grand Total: Rs. ${grandTotal.toFixed(2)}`);

        doc.moveDown(1.5);

        // Calendar Section
        doc.fontSize(12).font('Helvetica-Bold').text('Meals Taken Calendar:', { underline: true });
        doc.moveDown(0.5);

        // Calendar setup
        const year = parseInt(month.substring(0, 4));
        const mon = parseInt(month.substring(5, 7));
        const firstDate = new Date(year, mon - 1, 1);
        const firstDayOfWeek = firstDate.getDay(); // 0 = Sunday
        const daysInMonth = new Date(year, mon, 0).getDate();
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Calendar grid dimensions (larger cells to prevent overflow)
        const cellWidth = 45;
        const cellHeight = 35;
        const startX = 50;
        const startY = doc.y + 10;
        const numRows = 6; // Max 6 weeks for any month

        // Draw day headers (centered, bold, smaller font)
        daysOfWeek.forEach((day, col) => {
            const textX = startX + col * cellWidth + (cellWidth / 2 - (day.length * 2.5));
            doc.fontSize(8).font('Helvetica-Bold').text(day, textX, startY + 3);
        });

        let gridY = startY + cellHeight; // Grid starts after header

        // Draw grid lines
        // Header underline
        doc.moveTo(startX, startY + cellHeight).lineTo(startX + 7 * cellWidth, startY + cellHeight).stroke();

        // Vertical lines for all columns
        for (let col = 0; col <= 7; col++) {
            doc.moveTo(startX + col * cellWidth, startY).lineTo(startX + col * cellWidth, gridY + numRows * cellHeight).stroke();
        }

        // Horizontal lines for grid rows (header + 6 rows)
        for (let row = 0; row <= numRows + 1; row++) {
            const yLine = startY + row * cellHeight;
            doc.moveTo(startX, yLine).lineTo(startX + 7 * cellWidth, yLine).stroke();
        }

        // Fill calendar cells
        let currentDay = 1;
        let col = firstDayOfWeek; // Start from the correct column
        let row = 0;

        while (currentDay <= daysInMonth) {
            const cellX = startX + col * cellWidth + 2;
            const cellY = gridY + row * cellHeight + 2;

            const dayStr = currentDay.toString().padStart(2, '0');
            const takenMeals = mealsByDay.get(dayStr) || [];
            let cellText = currentDay.toString();

            if (takenMeals.length > 0) {
                // Compact: Day on top, then abbreviated meals (e.g., "B L D")
                const mealsStr = takenMeals.join(' ');
                cellText = `${currentDay}\n${mealsStr}`;
                // Light blue background for contrast
                doc.fillColor('#e3f2fd').rect(startX + col * cellWidth + 1, gridY + row * cellHeight + 1, cellWidth - 2, cellHeight - 2).fill();
            }

            // Reset to black text
            doc.fillColor('black');
            // Smaller font and tight width to fit
            doc.fontSize(7).font('Helvetica')
                .text(cellText, cellX, cellY, {
                    width: cellWidth - 6,
                    align: 'center',
                    lineGap: 1
                });

            currentDay++;
            col++;
            if (col === 7) {
                col = 0;
                row++;
            }
        }

        // Legend
        doc.moveDown(3);
        doc.fontSize(10).font('Helvetica-Bold').text('Legend:', 50, doc.y);
        doc.moveDown(0.5);
        doc.fontSize(9).font('Helvetica').text('B = Breakfast, L = Lunch, D = Dinner', 50, doc.y);
        doc.text('Highlighted cells indicate days with meals taken.', 50, doc.y + 15);

        // Footer
        let footerY = doc.y + 80;
        if (footerY > doc.page.height - 100) {
            doc.addPage();
            footerY = 80;
        }
        doc.moveTo(50, footerY).lineTo(550, footerY).stroke();

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