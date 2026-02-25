const { MongoClient } = require('mongodb');

let db;
let client;

async function connectToDatabase(uri, dbName) {
  if (db) {
    console.log('Using existing database connection');
    return db;
  }

  if (!uri || !dbName) {
    throw new Error('MONGO_URI and DB_NAME are required');
  }

  try {
    // MongoDB connection options for production
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true
    };

    client = new MongoClient(uri, options);
    
    console.log('Connecting to MongoDB...');
    await client.connect();
    
    // Verify connection works
    await client.db('admin').command({ ping: 1 });
    
    db = client.db(dbName);
    console.log(`MongoDB connected to database: ${dbName}`);
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase() first.');
  }
  return db;
}

// Graceful shutdown
async function closeDatabase() {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('MongoDB connection closed');
  }
}

module.exports = { connectToDatabase, getDb, closeDatabase };
