module.exports = (req, res, next) => {
    const { userId, month, days } = req.body;

    if (req.method === 'POST') {
        if (!userId || !month || !days || Object.keys(days).length === 0) {
            return res.status(400).json({ message: 'Invalid request. Missing required fields.' });
        }
    }

    next();
};