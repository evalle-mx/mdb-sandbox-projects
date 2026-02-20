const { MongoClient } = require('mongodb');

let client;
let db;

async function connectDB() {
  if (db) return db;

  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db('sample_mflix');
  console.log('✅ Connected to MongoDB Atlas – sample_mflix');
  return db;
}

async function getDB() {
  if (!db) await connectDB();
  return db;
}

async function closeDB() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed.');
  }
}

module.exports = { connectDB, getDB, closeDB };
