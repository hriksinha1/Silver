import { ObjectId } from 'mongodb';
import { Router } from 'express';
import { z } from 'zod';
import { collections } from '../db.js';
import { requireAdmin, requireUser } from '../middleware.js';

function createProductSchema(config) {
  const imageUrl = z.string().trim().min(1).max(500).refine((value) => {
    if (value.startsWith('/images/')) {
      return value.slice('/images/'.length).split('/').every((segment) =>
        /^[A-Za-z0-9_-][A-Za-z0-9._-]*$/.test(segment),
      );
    }
    try {
      const url = new URL(value);
      return url.protocol === 'https:' &&
        !url.username &&
        !url.password &&
        config.productImageHosts.has(url.hostname.toLowerCase());
    } catch {
      return false;
    }
  });

  return z.object({
    sku: z.string().trim().min(1).max(64),
    name: z.string().trim().min(1).max(160),
    description: z.string().trim().max(4000),
    category: z.enum(['ring', 'necklace', 'earring', 'bracelet']),
    priceInPaise: z.number().int().positive().max(2147483647),
    currency: z.literal('INR').default('INR'),
    stockQuantity: z.number().int().min(0).max(2147483647),
    imageUrl,
    active: z.boolean().default(false),
  }).strict();
}

function serializeProduct(product) {
  const { _id, ...fields } = product;
  return { ...fields, id: _id.toString() };
}

export function createProductsRouter(config) {
  const router = Router();
  const { products } = collections();
  const productSchema = createProductSchema(config);

  router.get('/', async (req, res, next) => {
    try {
      const category = req.query.category;
      if (category && !['ring', 'necklace', 'earring', 'bracelet'].includes(category)) {
        return res.status(400).json({ error: 'Choose a valid product category.' });
      }
      const filter = { active: true, ...(category ? { category } : {}) };
      const limit = Math.min(Number.parseInt(req.query.limit, 10) || 24, 100);
      const rows = await products.find(filter).sort({ _id: 1 }).limit(limit).toArray();
      return res.json({ products: rows.map(serializeProduct) });
    } catch (error) {
      next(error);
    }
  });

  const admin = [requireUser, requireAdmin(config)];
  router.get('/admin', ...admin, async (_req, res, next) => {
    try {
      const rows = await products.find({}).sort({ _id: 1 }).limit(500).toArray();
      return res.json({ products: rows.map(serializeProduct) });
    } catch (error) {
      next(error);
    }
  });

  router.post('/admin', ...admin, async (req, res, next) => {
    try {
      const parsed = productSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: 'Check the product fields and try again.' });
      const product = { ...parsed.data, createdAt: new Date(), updatedAt: new Date() };
      const result = await products.insertOne(product);
      return res.status(201).json({ product: serializeProduct({ ...product, _id: result.insertedId }) });
    } catch (error) {
      if (error?.code === 11000) return res.status(409).json({ error: 'That SKU is already in use.' });
      next(error);
    }
  });

  router.patch('/admin/:id', ...admin, async (req, res, next) => {
    try {
      if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid product ID.' });
      const parsed = productSchema.partial().strict().safeParse(req.body);
      if (!parsed.success || Object.keys(parsed.data || {}).length === 0) {
        return res.status(400).json({ error: 'Provide valid product fields to update.' });
      }
      const result = await products.findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: { ...parsed.data, updatedAt: new Date() } },
        { returnDocument: 'after' },
      );
      if (!result) return res.status(404).json({ error: 'Product not found.' });
      return res.json({ product: serializeProduct(result) });
    } catch (error) {
      if (error?.code === 11000) return res.status(409).json({ error: 'That SKU is already in use.' });
      next(error);
    }
  });

  router.delete('/admin/:id', ...admin, async (req, res, next) => {
    try {
      if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid product ID.' });
      const result = await products.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { active: false, deletedAt: new Date(), updatedAt: new Date() } },
      );
      if (!result.matchedCount) return res.status(404).json({ error: 'Product not found.' });
      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
