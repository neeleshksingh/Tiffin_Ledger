const mongoose = require('mongoose');
const {uri} = require('../key');

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