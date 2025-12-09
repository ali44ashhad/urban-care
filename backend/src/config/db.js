const mongoose = require('mongoose');

// Cache the database connection for serverless reuse
let cachedConnection = null;

async function connectDB(uri) {
  // If we have a cached connection and it's ready, reuse it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  console.log('Creating new MongoDB connection...');
  if (!uri) throw new Error('MONGO_URI not provided');
  
  try {
    // Connect with optimized settings for serverless
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      // Disable buffering for immediate errors
      bufferCommands: false,
    });
    
    cachedConnection = mongoose.connection;
    console.log('MongoDB connected successfully');
    return cachedConnection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

module.exports = { connectDB };
