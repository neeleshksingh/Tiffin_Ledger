const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const User = require('../models/user');
const TiffinTracking = require('../models/tiffin-tracking');
const Bill = require('../models/bill');

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
        let { userId } = req.params;

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        const parsedUserId = new ObjectId(userId);

        const user = await User.findById(parsedUserId).populate('messId');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const vendor = user.messId;
        if (!vendor) {
            return res.status(404).json({ message: 'No vendor associated with this user' });
        }

        const tiffinData = await TiffinTracking.find({ userId: parsedUserId, vendorId: vendor._id });
        if (!tiffinData || tiffinData.length === 0) {
            return res.status(204).json({ message: 'No tiffin tracking data found for this user' });
        }

        const bills = await Bill.find({ userId: parsedUserId }).sort({ createdAt: -1 });

        const monthlyData = await Promise.all(tiffinData.map(async (tiffin) => {
            const month = tiffin.month;

            let totalMeals = 0;
            Array.from(tiffin.days.entries()).forEach(([dayKey, dayMeals]) => {
                Array.from(dayMeals.entries()).forEach(([mealKey, mealTaken]) => {
                    if (mealTaken) totalMeals++;
                });
            });

            const totalAmount = calculateTotalAmount(totalMeals, vendor.amountPerMeal || vendor.amountPerDay);

            const invoiceNumber = await generateInvoiceNumber();

            const bill = bills.find(bill => bill.month === month);
            const billAmount = bill ? bill.totalAmount : totalAmount;

            const allDays = Object.fromEntries(
                Array.from(tiffin.days.entries()).map(([day, meals]) => [
                    day,
                    {
                        date: day,
                        meals: Object.fromEntries(Array.from(meals.entries()))
                    }
                ])
            );

            return {
                month: month,
                tiffinMeals: totalMeals,
                totalAmount: totalAmount,
                billAmount: billAmount,
                invoiceNumber: invoiceNumber,
                vendor: {
                    id: vendor._id,
                    shopName: vendor.shopName,
                    address: vendor.address,
                    contactNumber: vendor.contactNumber,
                    gstNumber: vendor.gstNumber,
                    amountPerMeal: vendor.amountPerDay,
                    billingInfo: vendor.billingInfo,
                },
                days: allDays
            };
        }));

        res.status(200).json(monthlyData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getUserTiffinAndBilling };