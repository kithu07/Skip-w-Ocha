const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Only connect if MONGODB_URI is provided
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MongoDB URI not provided, running without database connection');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Removed deprecated options
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.log('⚠️  Running without database connection - using dummy data');
    // Don't exit process, just log the error
  }
};

module.exports = connectDB; 