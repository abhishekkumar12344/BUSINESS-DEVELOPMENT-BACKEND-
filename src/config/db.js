const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const memoryServer = await MongoMemoryServer.create();
      process.env.MONGO_URI = memoryServer.getUri('nisha_pbm');
      console.log('Using in-memory MongoDB for local development.');
    }

    const uriToUse = process.env.MONGO_URI || process.env.MONGODB_URI;

    try {
      const conn = await mongoose.connect(uriToUse, {
        serverSelectionTimeoutMS: 10000,
        autoIndex: true
      });

      console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (atlasError) {
      const isLocalDev = process.env.NODE_ENV !== 'production';
      const isDnsFailure = /ENOTFOUND|querySrv|ECONNREFUSED|EAI_AGAIN|CERT|authentication/i.test(atlasError.message || '');

      if (isLocalDev && isDnsFailure) {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const memoryServer = await MongoMemoryServer.create();
        const memoryUri = memoryServer.getUri('nisha_pbm');
        process.env.MONGO_URI = memoryUri;

        console.warn('Atlas MongoDB DNS failed. Falling back to in-memory MongoDB for local development.');
        console.warn('Real Atlas issue:', atlasError.message);

        const conn = await mongoose.connect(memoryUri, {
          serverSelectionTimeoutMS: 10000,
          autoIndex: true
        });

        console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name} (fallback)`);
        return conn;
      }

      throw atlasError;
    }
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
