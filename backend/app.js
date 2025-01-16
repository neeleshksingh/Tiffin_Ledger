const express = require('express');
const connection = require('./connections/connection');
connection();
const tiffinTrackingRoutes = require('./routes/tiffin-tracking.routes');
const User = require('./routes/authentication.routes');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());
app.use('/tiffin', tiffinTrackingRoutes);
app.use('/user', User);


app.get('*', (req, res) => {
    res.status(404).send('Api not found');
})

app.listen(1517 || process.env.PORT, () => console.log("listening on port 1517"));