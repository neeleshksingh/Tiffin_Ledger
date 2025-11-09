const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

let isConnected = false;
let connectionPromise = null;

async function getConnection() {
    if (isConnected) {
        console.log('Using existing database connection');
        return mongoose.connection;
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = mongoose.connect(uri, options)
        .then((conn) => {
            isConnected = true;
            console.log('Database connected successfully 🥳');

            conn.connection.on('error', (err) => {
                console.error('MongoDB connection error:', err);
                isConnected = false;
            });

            conn.connection.on('disconnected', () => {
                console.log('MongoDB disconnected');
                isConnected = false;
                connectionPromise = null;
            });

            conn.connection.on('reconnected', () => {
                console.log('MongoDB reconnected');
                isConnected = true;
            });

            return conn;
        })
        .catch((error) => {
            console.error('Failed to connect to database:', error);
            connectionPromise = null;
            isConnected = false;
            throw error;
        });

    return connectionPromise;
}

process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error during graceful shutdown:', err);
        process.exit(1);
    }
});

module.exports = getConnection;