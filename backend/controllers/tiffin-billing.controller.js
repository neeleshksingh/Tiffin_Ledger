const User = require('../models/user');
const TiffinTracking = require('../models/tiffin-tracking');
const Bill = require('../models/bill');
const mongoose = require('mongoose');

const calculateTotalAmount = (daysCount, amountPerDay) => {
    return daysCount * amountPerDay;
};

const generateInvoiceNumber = async () => {
    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const lastBill = await Bill.findOne({ invoiceNumber: { $regex: `^INV-${currentDate}-` } }).sort({ createdAt: -1 }).limit(1);
    let invoiceSequence = 1;

    if (lastBill) {
        const lastInvoiceNumber = lastBill.invoiceNumber;
        const lastSequence = parseInt(lastInvoiceNumber.split('-')[2]);
        invoiceSequence = lastSequence + 1;
    }

    return `INV-${currentDate}-${invoiceSequence.toString().padStart(4, '0')}`;
};

const getUserTiffinAndBilling = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        const user = await User.findById(userId).populate('messId');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const vendor = user.messId;
        if (!vendor) {
            return res.status(404).json({ message: 'No vendor associated with this user' });
        }

        const tiffinData = await TiffinTracking.find({ userId });
        if (!tiffinData || tiffinData.length === 0) {
            return res.status(404).json({ message: 'No tiffin tracking data found for this user' });
        }

        const bills = await Bill.find({ userId }).sort({ createdAt: -1 });

        // Group data by month and add it to an array
        const monthlyData = await Promise.all(tiffinData.map(async (tiffin) => {
            const month = tiffin.month;

            let tiffinDaysCount = Array.from(tiffin.days.values()).filter(Boolean).length;
            const totalAmount = calculateTotalAmount(tiffinDaysCount, vendor.amountPerDay);

            const invoiceNumber = await generateInvoiceNumber();

            const bill = bills.find(bill => bill.month === month);
            const billAmount = bill ? bill.totalAmount : totalAmount;

            return {
                month: month,
                tiffinDays: tiffinDaysCount,
                totalAmount: totalAmount,
                billAmount: billAmount,
                invoiceNumber: invoiceNumber,
                vendor: {
                    shopName: vendor.shopName,
                    address: vendor.address,
                    contactNumber: vendor.contactNumber,
                    gstNumber: vendor.gstNumber,
                    amountPerDay: vendor.amountPerDay,
                    billingInfo: vendor.billingInfo,
                }
            };
        }));

        res.status(200).json(monthlyData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getUserTiffinAndBilling };