import { Router } from 'express';
import { z } from 'zod';
import { collections } from '../db.js';
import { requireAdmin, requireUser } from '../middleware.js';

const orderStatuses = new Set(['placed_cod', 'paid', 'fulfilled', 'cancelled', 'refunded']);

export function createAdminRouter(config) {
  const router = Router();
  router.use(requireUser, requireAdmin(config));

  router.get('/orders', async (req, res, next) => {
    try {
      const limit = Math.min(Number.parseInt(req.query.limit, 10) || 50, 100);
      const rows = await collections().orders.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      return res.json({ orders: rows });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/orders/:id/status', async (req, res, next) => {
    try {
      const parsed = z.object({ status: z.string() }).strict().safeParse(req.body);
      if (!parsed.success || !orderStatuses.has(parsed.data.status)) {
        return res.status(400).json({ error: 'Choose a supported order status.' });
      }
      const result = await collections().orders.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { status: parsed.data.status, updatedAt: new Date() } },
        { returnDocument: 'after' },
      );
      if (!result) return res.status(404).json({ error: 'Order not found.' });
      return res.json({ order: result });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
