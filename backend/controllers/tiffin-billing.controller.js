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

        const currentMonth = new Date().toISOString().slice(0, 7);

        const tiffinData = await TiffinTracking.findOne({ userId, month: currentMonth });

        if (!tiffinData) {
            return res.status(404).json({ message: 'No tiffin tracking data found for this month' });
        }

        let tiffinDaysCount = Array.from(tiffinData.days.values()).filter(Boolean).length;

        const vendor = user.messId;
        if (!vendor) {
            return res.status(404).json({ message: 'No vendor associated with this user' });
        }

        const totalAmount = calculateTotalAmount(tiffinDaysCount, vendor.amountPerDay);

        const invoiceNumber = await generateInvoiceNumber();

        const bill = await Bill.findOne({ userId }).sort({ createdAt: -1 }).limit(1);

        const responseData = {
            userName: user.name,
            tiffinDays: tiffinDaysCount,
            totalAmount,
            billAmount: bill ? bill.totalAmount : totalAmount,
            month: currentMonth,
            invoiceNumber: invoiceNumber,
            vendor: {
                shopName: vendor.shopName,
                address: vendor.address,
                contactNumber: vendor.contactNumber,
                gstNumber: vendor.gstNumber,
                amountPerDay: vendor.amountPerDay,
                billingInfo: vendor.billingInfo,
            },
        };

        res.status(200).json(responseData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getUserTiffinAndBilling };
