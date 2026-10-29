import { Client, Databases, ID, Permission, Role, Storage } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';
import { fileURLToPath } from 'node:url';

const endpoint = process.env.APPWRITE_ENDPOINT;
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = 'silveram-store';
const ordersCollectionId = 'orders';
const productsCollectionId = 'products';
const productImagesBucketId = 'product-images';

const orderAttributes = [
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

const productAttributes = [
  { key: 'sku', type: 'string', size: 64 },
  { key: 'name', type: 'string', size: 160 },
  { key: 'description', type: 'string', size: 2000 },
  { key: 'category', type: 'string', size: 32 },
  { key: 'priceInPaise', type: 'integer' },
  { key: 'currency', type: 'string', size: 3 },
  { key: 'stockQuantity', type: 'integer' },
  { key: 'active', type: 'boolean' },
  { key: 'imageFileId', type: 'string', size: 36 },
];

const starterProducts = [
  {
    id: 'product-celeste-diamond-ring',
    sku: 'SR-001',
    name: 'Celeste Diamond Ring',
    category: 'ring',
    priceInPaise: 2490000,
    imageFileId: 'product-ring',
    imageName: 'product-ring.webp',
  },
  {
    id: 'product-minimal-diamond-necklace',
    sku: 'SN-001',
    name: 'Minimal Diamond Necklace',
    category: 'necklace',
    priceInPaise: 1990000,
    imageFileId: 'product-necklace',
    imageName: 'product-necklace.webp',
  },
  {
    id: 'product-floral-pattern-earring',
    sku: 'SE-001',
    name: 'Floral Pattern Earring',
    category: 'earring',
    priceInPaise: 1490000,
    imageFileId: 'product-earring',
    imageName: 'product-earring.webp',
  },
  {
    id: 'product-solis-charm-bracelet',
    sku: 'SB-001',
    name: 'Solis Charm Bracelet',
    category: 'bracelet',
    priceInPaise: 1890000,
    imageFileId: 'product-bracelet',
    imageName: 'product-bracelet.webp',
  },
  {
    id: 'gold-statement-ring',
    sku: 'SR-002',
    name: 'Gold Statement Ring',
    category: 'ring',
    priceInPaise: 2990000,
    imageFileId: 'product-gold-statement-ring',
    imageName: 'hero-ring-box.webp',
  },
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

async function ensureCollection(databases, collectionId, name) {
  try {
    const collection = await databases.getCollection(databaseId, collectionId);
    if (!collection.documentSecurity || collection.permissions.length > 0) {
      throw new Error(
        `The existing ${collectionId} collection must have document security enabled and no collection-level permissions.`
      );
    }
  } catch (error) {
    if (error.code !== 404) throw error;
    await databases.createCollection(
      databaseId,
      collectionId,
      name,
      [],
      true,
      true
    );
    console.log(`Created private collection: ${collectionId}`);
  }
}

async function ensureAttributes(databases, collectionId, attributes) {
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
    } else if (definition.type === 'boolean') {
      await databases.createBooleanAttribute(
        databaseId,
        collectionId,
        definition.key,
        true
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

async function ensureProductImagesBucket(storage) {
  try {
    const bucket = await storage.getBucket(productImagesBucketId);
    if (!bucket.fileSecurity || bucket.permissions.length > 0) {
      throw new Error(
        'The existing product image bucket must have file security enabled and no bucket-level permissions.'
      );
    }
  } catch (error) {
    if (error.code !== 404) throw error;
    await storage.createBucket(
      productImagesBucketId,
      'Silveram Product Images',
      [],
      true,
      true,
      5 * 1024 * 1024,
      ['webp'],
      undefined,
      true,
      false
    );
    console.log(`Created private product image bucket: ${productImagesBucketId}`);
  }
}

async function uploadProductImage(storage, product) {
  try {
    await storage.getFile(productImagesBucketId, product.imageFileId);
    return;
  } catch (error) {
    if (error.code !== 404) throw error;
  }

  const imagePath = fileURLToPath(
    new URL(`../../../public/images/${product.imageName}`, import.meta.url)
  );
  await storage.createFile(
    productImagesBucketId,
    product.imageFileId,
    InputFile.fromPath(imagePath, product.imageName),
    [Permission.read(Role.any())]
  );
  console.log(`Uploaded ${product.imageName}`);
}

async function ensureStarterProducts(databases, storage) {
  for (const product of starterProducts) {
    await uploadProductImage(storage, product);
    try {
      await databases.getDocument(databaseId, productsCollectionId, product.id);
    } catch (error) {
      if (error.code !== 404) throw error;
      await databases.createDocument(
        databaseId,
        productsCollectionId,
        product.id,
        {
          sku: product.sku,
          name: product.name,
          description: 'Replace with verified materials, dimensions, and care details.',
          category: product.category,
          priceInPaise: product.priceInPaise,
          currency: 'INR',
          stockQuantity: 0,
          active: false,
          imageFileId: product.imageFileId,
        },
        [Permission.read(Role.any())]
      );
      console.log(`Created inactive starter product: ${product.id}`);
    }
  }
}

async function main() {
  assertEnvironment();
  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const databases = new Databases(client);
  const storage = new Storage(client);

  await ensureDatabase(databases);
  await ensureCollection(databases, ordersCollectionId, 'Orders');
  await ensureCollection(databases, productsCollectionId, 'Products');
  await ensureAttributes(databases, ordersCollectionId, orderAttributes);
  await ensureAttributes(databases, productsCollectionId, productAttributes);
  await ensureProductImagesBucket(storage);
  await ensureStarterProducts(databases, storage);

  console.log(`Database ID: ${databaseId}`);
  console.log(`Orders collection ID: ${ordersCollectionId}`);
  console.log(`Products collection ID: ${productsCollectionId}`);
  console.log(`Product image bucket ID: ${productImagesBucketId}`);
  console.log('Starter products are inactive with zero stock; no live orders can use them.');
  console.log('Collections and bucket have no broad permissions; product documents/images are individually public-read.');
}

main().catch((error) => {
  console.error(`Appwrite provisioning failed: ${error.message}`);
  process.exitCode = 1;
});
