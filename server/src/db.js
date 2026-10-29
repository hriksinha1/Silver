import { MongoClient } from 'mongodb';

let client;
let database;

export async function connectDatabase(config) {
  client = new MongoClient(config.mongoUri, {
    appName: 'silveram-api',
    maxPoolSize: 10,
    minPoolSize: 0,
    maxIdleTimeMS: 60000,
    waitQueueTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    retryWrites: true,
    retryReads: true,
  });
  await client.connect();
  database = client.db(config.mongoDbName);
  await ensureIndexes(database);
  return { client, database };
}

async function ensureIndexes(db) {
  await Promise.all([
    db.collection('users').createIndex({ email: 1 }, { unique: true }),
    db.collection('authChallenges').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection('sessions').createIndex({ tokenHash: 1 }, { unique: true }),
    db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection('rateLimits').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection('products').createIndex({ sku: 1 }, { unique: true }),
    db.collection('products').createIndex({ active: 1, category: 1, _id: 1 }),
    db.collection('orders').createIndex({ userId: 1, createdAt: -1 }),
    db.collection(
      'orders',
    ).createIndex({ razorpayOrderId: 1 }, { unique: true, sparse: true }),
    db.collection('orders').createIndex(
      { reservationExpiresAt: 1 },
      { partialFilterExpression: { status: 'pending_payment' } },
    ),
    db.collection('webhookEvents').createIndex({ receivedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 }),
  ]);
}

export function collections() {
  if (!database) throw new Error('MongoDB is not connected.');
  return {
    users: database.collection('users'),
    authChallenges: database.collection('authChallenges'),
    sessions: database.collection('sessions'),
    rateLimits: database.collection('rateLimits'),
    products: database.collection('products'),
    orders: database.collection('orders'),
    webhookEvents: database.collection('webhookEvents'),
  };
}

export function mongoClient() {
  if (!client) throw new Error('MongoDB is not connected.');
  return client;
}

export async function checkDatabase() {
  if (!database) throw new Error('MongoDB is not connected.');
  await database.command({ ping: 1 });
}

export async function closeDatabase() {
  if (client) await client.close();
}
