const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connection = require('./connections/connection');
const tiffinTrackingRoutes = require('./routes/tiffin-tracking.routes');
const userRoutes = require('./routes/authentication.routes');
const paymentRoutes = require('./routes/payment.routes');
const profileRoutes = require('./routes/profile.routes');
const profilePicRoutes = require('./routes/profile-pic.routes');
const vendorProfileRoutes = require('./routes/vendor-user.routes');

dotenv.config();

const app = express();
connection();

app.use(express.json());
app.use(cors());

app.use('/tiffin', tiffinTrackingRoutes);
app.use('/user', userRoutes);
app.use('/payment', paymentRoutes);
app.use('/profile', profileRoutes);
app.use('/profile-pic', profilePicRoutes);
app.use('/vendor', vendorProfileRoutes);

app.get('/', (req, res) => res.status(200).send('Backend OK'));

app.use((req, res) => res.status(404).send('API not found'));

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown() {
    console.log('Shutting down...');
    try {
        await require('./config/redis').quit();
        console.log('Redis connection closed.');
    } catch (err) {
        console.error('Error closing Redis:', err);
    }
    process.exit(0);
}

app.get('/test-redis', async (req, res) => {
    try {
        await redisClient.set('test', 'hello');
        const val = await redisClient.get('test');
        res.json({ redis: 'working', value: val });
    } catch (err) {
        res.status(500).json({ redis: 'not working', error: err.message });
    }
});