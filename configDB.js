const mongoose = require('mongoose');
require('dotenv').config();

const url = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    }
    catch {
        console.log('Error in DB connection');
    }
};

module.exports = { connectDB };