import { createHmac, timingSafeEqual } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { Router } from 'express';
import { z } from 'zod';
import { collections, mongoClient } from '../db.js';
import { requireUser } from '../middleware.js';

const requestSchema = z.object({
  requestId: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,35}$/),
  paymentMethod: z.enum(['razorpay', 'cod']),
  customer: z.object({
    name: z.string().trim().min(1).max(100),
    phone: z.string().regex(/^\d{10}$/),
    address: z.string().trim().min(1).max(300),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    postalCode: z.string().regex(/^\d{6}$/),
    country: z.literal('IN'),
  }).strict(),
  items: z.array(z.object({
    id: z.string().min(1).max(36),
    quantity: z.number().int().min(1).max(10),
  }).strict()).min(1).max(20),
}).strict();

function sameOrder(existing, userId, paymentMethod, requestedItems, shipping) {
  const existingItems = existing.items
    .map(({ productId, quantity }) => [productId.toString(), quantity])
    .sort(([left], [right]) => left.localeCompare(right));
  const expectedItems = [...requestedItems]
    .map(([id, quantity]) => [id, quantity])
    .sort(([left], [right]) => left.localeCompare(right));
  return existing.userId.equals(userId) &&
    existing.paymentMethod === paymentMethod &&
    JSON.stringify(existingItems) === JSON.stringify(expectedItems) &&
    JSON.stringify(existing.shipping) === JSON.stringify(shipping);
}

function orderResponse(order, keyId) {
  return {
    orderId: order._id,
    amountInPaise: order.amountInPaise,
    currency: 'INR',
    paymentMethod: order.paymentMethod,
    status: order.status,
    ...(order.razorpayOrderId && { razorpayOrderId: order.razorpayOrderId, razorpayKeyId: keyId }),
  };
}

async function findProduct(products, id, session) {
  const ids = ObjectId.isValid(id) ? [id, new ObjectId(id)] : [id];
  return products.findOne({ _id: { $in: ids } }, { session });
}

async function reserveOrder(config, input, user) {
  const requested = new Map();
  for (const item of input.items) {
    if (requested.has(item.id)) throw new Error('Your bag contains a duplicate item.');
    requested.set(item.id, item.quantity);
  }

  const { products, orders } = collections();
  const session = mongoClient().startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      const existing = await orders.findOne({ _id: input.requestId }, { session });
      if (existing) {
        if (!sameOrder(existing, user.id, input.paymentMethod, requested, input.customer)) {
          throw Object.assign(new Error('This order request is no longer available.'), { status: 409 });
        }
        order = existing;
        return;
      }

      const lines = [];
      let total = 0;
      for (const [id, quantity] of requested) {
        const product = await findProduct(products, id, session);
        if (!product || product.active !== true || product.currency !== 'INR') {
          throw Object.assign(new Error('An item in your bag is no longer available.'), { status: 400 });
        }
        if (!Number.isSafeInteger(product.priceInPaise) || product.priceInPaise < 1) {
          throw new Error('A product has an invalid configured price.');
        }
        const lineTotalInPaise = product.priceInPaise * quantity;
        total += lineTotalInPaise;
        lines.push({
          productId: product._id,
          sku: product.sku,
          name: product.name,
          quantity,
          unitPriceInPaise: product.priceInPaise,
          lineTotalInPaise,
        });
      }
      if (!Number.isSafeInteger(total) || total > 2147483647) {
        throw Object.assign(new Error('The order total is above the supported checkout limit.'), { status: 400 });
      }

      for (const line of lines) {
        const result = await products.updateOne(
          { _id: line.productId, active: true, stockQuantity: { $gte: line.quantity } },
          { $inc: { stockQuantity: -line.quantity }, $set: { updatedAt: new Date() } },
          { session },
        );
        if (result.modifiedCount !== 1) {
          throw Object.assign(new Error('An item in your bag is out of stock.'), { status: 409 });
        }
      }

      const now = new Date();
      order = {
        _id: input.requestId,
        userId: user.id,
        email: user.email,
        status: input.paymentMethod === 'cod' ? 'placed_cod' : 'pending_payment',
        paymentMethod: input.paymentMethod,
        amountInPaise: total,
        currency: 'INR',
        items: lines,
        shipping: input.customer,
        createdAt: now,
        updatedAt: now,
        ...(input.paymentMethod === 'razorpay' && {
          reservationExpiresAt: new Date(now.getTime() + 30 * 60 * 1000),
        }),
      };
      await orders.insertOne(order, { session });
    });
  } catch (error) {
    if (error?.code === 11000) {
      const existing = await orders.findOne({ _id: input.requestId });
      if (existing && sameOrder(existing, user.id, input.paymentMethod, requested, input.customer)) {
        order = existing;
      } else {
        throw Object.assign(new Error('This order request is no longer available.'), { status: 409 });
      }
    } else {
      throw error;
    }
  } finally {
    await session.endSession();
  }

  if (order.paymentMethod === 'cod' || order.razorpayOrderId) return order;
  const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.razorpayKeyId}:${config.razorpayKeySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: order.amountInPaise,
      currency: 'INR',
      receipt: order._id,
      notes: { silveram_order_id: order._id, silveram_user_id: user.id.toString() },
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!razorpayResponse.ok) {
    await razorpayResponse.text();
    throw Object.assign(new Error('The payment provider could not start checkout. Your stock is reserved temporarily; retry or contact the store.'), { status: 503 });
  }
  const razorpayOrder = await razorpayResponse.json();
  if (razorpayOrder.amount !== order.amountInPaise || razorpayOrder.currency !== 'INR' || !razorpayOrder.id) {
    throw Object.assign(new Error('The payment provider returned an invalid order.'), { status: 503 });
  }
  await orders.updateOne(
    { _id: order._id, status: 'pending_payment', reservationExpiresAt: { $gt: new Date() } },
    { $set: { razorpayOrderId: razorpayOrder.id, updatedAt: new Date() } },
  );
  order.razorpayOrderId = razorpayOrder.id;
  return order;
}

async function releaseExpiredReservations() {
  const { orders, products } = collections();
  const expired = await orders.find({
    status: 'pending_payment',
    reservationExpiresAt: { $lte: new Date() },
  }).project({ _id: 1 }).limit(50).toArray();

  for (const candidate of expired) {
    const session = mongoClient().startSession();
    try {
      await session.withTransaction(async () => {
        const order = await orders.findOneAndUpdate(
          {
            _id: candidate._id,
            status: 'pending_payment',
            reservationExpiresAt: { $lte: new Date() },
          },
          { $set: { status: 'expired', updatedAt: new Date() } },
          { session, returnDocument: 'before' },
        );
        if (!order) return;
        for (const line of order.items) {
          await products.updateOne(
            { _id: line.productId },
            { $inc: { stockQuantity: line.quantity }, $set: { updatedAt: new Date() } },
            { session },
          );
        }
      });
    } finally {
      await session.endSession();
    }
  }
}

export function startReservationSweeper() {
  const timer = setInterval(() => {
    releaseExpiredReservations().catch((error) => {
      console.error('Reservation expiry sweep failed:', error.message);
    });
  }, 60_000);
  timer.unref();
}

async function verifyCapturedPayment(config, order, paymentId) {
  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.razorpayKeyId}:${config.razorpayKeySecret}`).toString('base64')}`,
      },
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!response.ok) return false;
  const payment = await response.json();
  return payment.order_id === order.razorpayOrderId &&
    payment.amount === order.amountInPaise &&
    payment.currency === 'INR' &&
    payment.status === 'captured';
}

export function createOrdersRouter(config) {
  const router = Router();

  router.use(requireUser);

  router.get('/', async (req, res, next) => {
    try {
      const rows = await collections().orders
        .find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();
      return res.json({
        orders: rows.map(({ shipping, email, userId, ...order }) => ({
          ...order,
          id: order._id,
        })),
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      if (!config.liveCheckout) {
        return res.status(503).json({ error: 'Checkout is not enabled yet. Please contact the store.' });
      }
      const parsed = requestSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: 'Check your delivery details and bag.' });
      if (parsed.data.paymentMethod === 'razorpay' && (!config.razorpayKeyId || !config.razorpayKeySecret)) {
        return res.status(503).json({ error: 'Online payments are not configured. Please choose cash on delivery.' });
      }

      const order = await reserveOrder(config, parsed.data, req.user);
      return res.json(orderResponse(order, config.razorpayKeyId));
    } catch (error) {
      if (error?.status) return res.status(error.status).json({ error: error.message });
      next(error);
    }
  });

  router.post('/:id/verify', async (req, res, next) => {
    try {
      if (!config.liveCheckout || !config.razorpayKeyId || !config.razorpayKeySecret) {
        return res.status(503).json({ error: 'Payment verification is not configured.' });
      }
      const input = z.object({
        razorpay_payment_id: z.string().min(1).max(100),
        razorpay_order_id: z.string().min(1).max(100),
        razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/i),
      }).strict().safeParse(req.body);
      if (!input.success) return res.status(400).json({ error: 'The payment response is invalid.' });

      const { razorpay_payment_id: paymentId, razorpay_order_id: razorpayOrderId, razorpay_signature: signature } = input.data;
      const order = await collections().orders.findOne({ _id: req.params.id, userId: req.user.id });
      if (!order || order.paymentMethod !== 'razorpay' || order.razorpayOrderId !== razorpayOrderId) {
        return res.status(403).json({ error: 'This payment does not match your order.' });
      }
      if (order.status === 'paid' && order.razorpayPaymentId === paymentId) {
        return res.json({ success: true, orderId: order._id });
      }
      if (order.status !== 'pending_payment') {
        return res.status(409).json({ error: 'This order is no longer awaiting payment.' });
      }

      const expected = createHmac('sha256', config.razorpayKeySecret)
        .update(`${razorpayOrderId}|${paymentId}`)
        .digest();
      const received = Buffer.from(signature, 'hex');
      if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
        return res.status(400).json({ error: 'Payment verification failed.' });
      }
      if (!(await verifyCapturedPayment(config, order, paymentId))) {
        return res.status(409).json({ error: 'The payment has not been captured. Please contact the store if your account was charged.' });
      }

      const updated = await collections().orders.updateOne(
        { _id: order._id, userId: req.user.id, status: 'pending_payment', razorpayOrderId },
        { $set: { status: 'paid', razorpayPaymentId: paymentId, updatedAt: new Date() } },
      );
      if (!updated.modifiedCount) {
        const latest = await collections().orders.findOne({ _id: order._id });
        if (latest?.status !== 'paid' || latest.razorpayPaymentId !== paymentId) {
          return res.status(409).json({ error: 'The order status changed while payment was being verified.' });
        }
      }
      return res.json({ success: true, orderId: order._id });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
