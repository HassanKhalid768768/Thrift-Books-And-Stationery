const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ MongoDB Connected Successfully');
        return mongoose.connection;
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        // Retry connection after 5 seconds
        setTimeout(() => {
            console.log('🔄 Retrying MongoDB connection...');
            connectDB();
        }, 5000);
    }
};

module.exports = connectDB;
