import { MongoClient } from 'mongodb';
import { SCHEMA } from './database/schema.js';

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

// Indexes are declared in database/schema.js. Validators are applied by `npm run db:setup`.
async function ensureIndexes(db) {
  await Promise.all(
    Object.entries(SCHEMA).flatMap(([name, def]) =>
      def.indexes.map(({ key, options }) => db.collection(name).createIndex(key, options)),
    ),
  );
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
