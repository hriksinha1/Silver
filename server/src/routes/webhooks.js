import { Router } from 'express';
import { collections } from '../db.js';
import { verifyRazorpayWebhookSignature } from '../payments/razorpay/signatures.js';

export function createWebhookRouter(config) {
  const router = Router();
  router.post('/razorpay', async (req, res, next) => {
    try {
      if (!config.razorpayEnabled || !Buffer.isBuffer(req.body) || !verifyRazorpayWebhookSignature(
        req.body,
        req.get('x-razorpay-signature'),
        config.razorpayWebhookSecret,
      )) {
        return res.status(400).json({ error: 'Webhook signature is invalid.' });
      }
      const eventId = req.get('x-razorpay-event-id');
      if (!eventId || eventId.length > 200) {
        return res.status(400).json({ error: 'Webhook event ID is missing.' });
      }
      const { orders, webhookEvents } = collections();
      if (await webhookEvents.findOne({ _id: eventId })) return res.status(200).json({ received: true });

      const event = JSON.parse(req.body.toString('utf8'));
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id && event.event === 'payment.captured') {
        const result = await orders.updateOne(
          {
            razorpayOrderId: payment.order_id,
            status: 'pending_payment',
            amountInPaise: payment.amount,
            currency: payment.currency,
          },
          { $set: { status: 'paid', razorpayPaymentId: payment.id, updatedAt: new Date() } },
        );
        if (!result.matchedCount) {
          await orders.updateOne(
            { razorpayOrderId: payment.order_id, status: 'expired' },
            {
              $set: {
                status: 'payment_review',
                razorpayPaymentId: payment.id,
                updatedAt: new Date(),
              },
            },
          );
        }
      } else if (payment?.order_id && event.event === 'payment.refunded') {
        await orders.updateOne(
          { razorpayOrderId: payment.order_id, status: 'paid' },
          { $set: { status: 'refunded', updatedAt: new Date() } },
        );
      }
      await webhookEvents.insertOne({ _id: eventId, eventType: event.event, receivedAt: new Date() });
      return res.status(200).json({ received: true });
    } catch (error) {
      if (error?.code === 11000) return res.status(200).json({ received: true });
      next(error);
    }
  });
  return router;
}
