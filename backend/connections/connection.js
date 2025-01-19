const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

mongoose.set(`strictQuery`, true);
async function getConnection() {
    await mongoose.connect(uri)
        .then(() => {
            console.log("Database connected successfully 🥳");
        }).catch((e) => {
            console.error(e);
        })
}

module.exports = getConnection;