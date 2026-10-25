const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/staffsync';

  try {
    // Attempt connecting to specified or local MongoDB URI
    console.log(`Connecting to MongoDB at: ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log('MongoDB connected successfully to primary database.');
  } catch (primaryErr) {
    console.warn(`Primary MongoDB connection at ${uri} unavailable: ${primaryErr.message}`);
    console.log('Initiating embedded MongoMemoryServer for development fallback...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'staffsync'
        }
      });
      const memoryUri = mongodInstance.getUri();
      console.log(`MongoMemoryServer started at ${memoryUri}`);

      await mongoose.connect(memoryUri);
      console.log('MongoDB connected successfully via embedded memory server.');
    } catch (memErr) {
      console.error('Failed to initialize MongoDB connection:', memErr);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    console.log('MongoDB disconnected cleanly.');
  } catch (err) {
    console.error('Error disconnecting MongoDB:', err);
  }
};

module.exports = { connectDB, disconnectDB };
