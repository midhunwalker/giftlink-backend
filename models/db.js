const { MongoClient } = require('mongodb');

let db;

async function connectToDatabase(uri, dbName) {
  if (db) return db;

  const client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  console.log('MongoDB connected');
  return db;
}

function getDb() {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
}

module.exports = { connectToDatabase, getDb };
