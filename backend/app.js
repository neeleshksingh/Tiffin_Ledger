const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connection = require('./connections/connection');
const tiffinTrackingRoutes = require('./routes/tiffin-tracking.routes');
const userRoutes = require('./routes/authentication.routes');
const paymentRoutes = require('./routes/payment.routes');
const profileRoutes = require('./routes/profile.routes');
const profilePicRoutes = require('./routes/profile-pic.routes');

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

app.get('/', (req, res) => res.status(200).send('Backend OK'));

app.use((req, res) => res.status(404).send('API not found'));

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});