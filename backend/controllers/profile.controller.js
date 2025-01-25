const User = require('../models/user');
const TiffinTracking = require('../models/tiffin-tracking');

exports.addOrUpdateProfile = async (req, res) => {
    const { userId, name, email, address, contact, messId } = req.body;

    try {
        let user = await User.findById(userId);
        if (!user) {
            user = new User({
                name,
                email,
                address,
                contact,
                messId,
                profilePic,
            });
        } else {
            user.name = name || user.name;
            user.email = email || user.email;
            user.address = address || user.address;
            user.contact = contact || user.contact;
            user.messId = messId || user.messId;
            user.profilePic = profilePic || user.profilePic;
        }

        const savedUser = await user.save();
        res.status(200).json({ message: 'User profile saved successfully', data: savedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error saving profile', error });
    }
};

exports.getProfileById = async (req, res) => {
    const { userId } = req.params;

    try {

        const user = await User.findById(userId)
            .select('-password')
            .populate('messId');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const tiffinTracking = await TiffinTracking.find({ userId });

        const tiffinOverview = tiffinTracking.map((tracking) => {
            const daysArray = Array.from(tracking.days).map(([date, isTiffinTaken]) => ({
                date,
                isTiffinTaken,
            }));

            const totalDays = daysArray.length;
            const tiffinTakenDays = daysArray.filter((day) => day.isTiffinTaken).length;

            return {
                month: tracking.month,
                totalDays,
                tiffinTakenDays,
                days: daysArray,
            };
        });

        res.status(200).json({
            message: 'User profile fetched successfully',
            data: {
                user,
                tiffinOverview,
                vendor: user.messId,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error });
    }
};

exports.deleteProfile = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User profile deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting profile', error });
    }
};