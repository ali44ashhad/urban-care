const mongoose = require('mongoose');

// async function connectDB(uri) {
//   if (!uri) throw new Error('MONGO_URI not provided');
//   await mongoose.connect(uri);
//   console.log('MongoDB connected');
// }

async function connectDB(uri) {
  console.log('MONGO_URI present?', !!uri);
  if (!uri) throw new Error('MONGO_URI not provided');
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}


module.exports = { connectDB };
