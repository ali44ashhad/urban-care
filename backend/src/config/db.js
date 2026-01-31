const mongoose = require('mongoose');

// Cache the database connection for serverless reuse
let cachedConnection = null;

/** Ensure users.email index is sparse so multiple users can have no email (E11000 fix) */
async function ensureEmailIndexSparse() {
  try {
    const User = require('../models/user.model');
    const coll = mongoose.connection.db.collection('users');
    const indexes = await coll.indexes();
    const emailIdx = indexes.find((i) => i.name === 'email_1');
    if (emailIdx && !emailIdx.sparse) {
      await coll.dropIndex('email_1');
      console.log('Dropped non-sparse email_1 index');
    }
    await User.syncIndexes();
    console.log('User indexes synced (email is sparse unique)');
  } catch (e) {
    console.warn('ensureEmailIndexSparse:', e.message);
  }
}

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
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds for DNS resolution
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000, // Connection timeout
      maxPoolSize: 10,
      minPoolSize: 2,
      // Disable buffering for immediate errors
      bufferCommands: false,
      // Retry connection on failure
      retryWrites: true,
      retryReads: true,
    });
    
    cachedConnection = mongoose.connection;
    console.log('MongoDB connected successfully');
    await ensureEmailIndexSparse();
    return cachedConnection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

module.exports = { connectDB };
