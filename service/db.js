require('dotenv').config();
const mongoose = require('mongoose');

// Connection a MongoDB avec Mongoose
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI).then(console.log('MongoDB connected'));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = { connectDB };