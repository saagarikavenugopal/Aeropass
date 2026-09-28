const mongoose = require('mongoose');
const config = require('./index');

async function connectDB() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(config.mongoUri);
    console.log(`[db] connected to MongoDB at ${config.mongoUri}`);
  } catch (err) {
    console.error('[db] connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
