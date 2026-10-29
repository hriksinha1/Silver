import { Router } from 'express';
import { z } from 'zod';
import { collections, mongoClient } from '../db.js';
import { requireAdmin, requireUser } from '../middleware.js';

const orderStatuses = new Set(['fulfilled']);

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
        { _id: req.params.id, status: { $in: ['placed_cod', 'paid'] } },
        { $set: { status: parsed.data.status, updatedAt: new Date() } },
        { returnDocument: 'after' },
      );
      if (!result) {
        const order = await collections().orders.findOne({ _id: req.params.id }, { projection: { _id: 1 } });
        if (!order) return res.status(404).json({ error: 'Order not found.' });
        return res.status(409).json({ error: 'Only placed or paid orders can be marked fulfilled.' });
      }
      return res.json({ order: result });
    } catch (error) {
      next(error);
    }
  });

  router.post('/orders/:id/cancel', async (req, res, next) => {
    const session = mongoClient().startSession();
    try {
      let cancelledOrder;
      await session.withTransaction(async () => {
        cancelledOrder = await collections().orders.findOneAndUpdate(
          { _id: req.params.id, status: 'placed_cod' },
          { $set: { status: 'cancelled', updatedAt: new Date() } },
          { session, returnDocument: 'before' },
        );
        if (!cancelledOrder) return;
        for (const line of cancelledOrder.items) {
          await collections().products.updateOne(
            { _id: line.productId },
            { $inc: { stockQuantity: line.quantity }, $set: { updatedAt: new Date() } },
            { session },
          );
        }
        await collections().orders.updateOne(
          { _id: req.params.id, status: 'cancelled' },
          { $set: { cancellationRecordedAt: new Date() } },
          { session },
        );
      });
      if (!cancelledOrder) {
        const order = await collections().orders.findOne(
          { _id: req.params.id },
          { projection: { status: 1 } },
        );
        if (!order) return res.status(404).json({ error: 'Order not found.' });
        return res.status(409).json({ error: 'Only unfulfilled cash-on-delivery orders can be cancelled this way.' });
      }
      return res.json({ success: true, orderId: cancelledOrder._id });
    } catch (error) {
      next(error);
    } finally {
      await session.endSession();
    }
  });

  return router;
}
