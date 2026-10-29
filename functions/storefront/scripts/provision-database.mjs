import { Client, Databases } from 'node-appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT;
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = 'silveram-store';
const collectionId = 'orders';

const attributes = [
  { key: 'userId', type: 'string', size: 36 },
  { key: 'email', type: 'string', size: 254 },
  { key: 'status', type: 'string', size: 32 },
  { key: 'paymentMethod', type: 'string', size: 20 },
  { key: 'amountInPaise', type: 'integer' },
  { key: 'currency', type: 'string', size: 3 },
  { key: 'itemsJson', type: 'string', size: 10000 },
  { key: 'shippingAddressJson', type: 'string', size: 2000 },
  { key: 'razorpayOrderId', type: 'string', size: 100 },
  { key: 'razorpayPaymentId', type: 'string', size: 100 },
  { key: 'createdAt', type: 'datetime' },
];

function assertEnvironment() {
  const missing = [
    !endpoint && 'APPWRITE_ENDPOINT',
    !projectId && 'APPWRITE_PROJECT_ID',
    !apiKey && 'APPWRITE_API_KEY',
  ].filter(Boolean);
  if (missing.length) {
    throw new Error(`Set these local environment variables first: ${missing.join(', ')}`);
  }
}

async function ensureDatabase(databases) {
  try {
    await databases.get(databaseId);
  } catch (error) {
    if (error.code !== 404) throw error;
    await databases.create(databaseId, 'Silveram Store');
    console.log(`Created database: ${databaseId}`);
  }
}

async function ensureCollection(databases) {
  try {
    const collection = await databases.getCollection(databaseId, collectionId);
    if (!collection.documentSecurity || collection.permissions.length > 0) {
      throw new Error(
        'The existing orders collection must have document security enabled and no collection-level permissions.'
      );
    }
  } catch (error) {
    if (error.code !== 404) throw error;
    await databases.createCollection(
      databaseId,
      collectionId,
      'Orders',
      [],
      true,
      true
    );
    console.log(`Created private collection: ${collectionId}`);
  }
}

async function ensureAttributes(databases) {
  const existing = await databases.listAttributes(databaseId, collectionId);
  const existingByKey = new Map(existing.attributes.map((attribute) => [attribute.key, attribute]));

  for (const definition of attributes) {
    const current = existingByKey.get(definition.key);
    if (current) {
      const mismatch =
        current.type !== definition.type ||
        current.required !== true ||
        (definition.size && current.size < definition.size);
      if (mismatch) {
        throw new Error(`Existing attribute "${definition.key}" does not match the required schema.`);
      }
      continue;
    }

    if (definition.type === 'string') {
      await databases.createStringAttribute(
        databaseId,
        collectionId,
        definition.key,
        definition.size,
        true
      );
    } else if (definition.type === 'integer') {
      await databases.createIntegerAttribute(
        databaseId,
        collectionId,
        definition.key,
        true,
        0,
        2147483647
      );
    } else {
      await databases.createDatetimeAttribute(databaseId, collectionId, definition.key, true);
    }
    console.log(`Created attribute: ${definition.key}`);
  }

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const result = await databases.listAttributes(databaseId, collectionId);
    const current = new Map(result.attributes.map((attribute) => [attribute.key, attribute]));
    const failed = attributes.find((definition) => current.get(definition.key)?.status === 'failed');
    if (failed) throw new Error(`Appwrite could not create attribute "${failed.key}".`);
    if (attributes.every((definition) => current.get(definition.key)?.status === 'available')) {
      console.log('All order attributes are available.');
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error('Timed out waiting for Appwrite to finish creating order attributes.');
}

async function main() {
  assertEnvironment();
  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const databases = new Databases(client);

  await ensureDatabase(databases);
  await ensureCollection(databases);
  await ensureAttributes(databases);

  console.log(`Database ID: ${databaseId}`);
  console.log(`Orders collection ID: ${collectionId}`);
  console.log('No collection-level client permissions were added.');
}

main().catch((error) => {
  console.error(`Appwrite provisioning failed: ${error.message}`);
  process.exitCode = 1;
});
