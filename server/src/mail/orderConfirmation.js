import { collections } from '../db.js';
import { getMailer } from './transport.js';
import { orderConfirmationEmail } from './templates.js';

const CONFIRMABLE = ['paid', 'placed_cod'];
const CLAIM_TTL_MS = 5 * 60 * 1000;

// Sends the purchase acknowledgement at most once per order, even if the browser verify call,
// the Razorpay webhook and the retry sweep all fire together. The claim is an atomic update;
// a failed send releases it so the sweep (or the next trigger) can try again.
export async function sendOrderConfirmation(config, orderId) {
  const mailer = getMailer(config);
  if (!mailer) return false;
  const { orders } = collections();
  const now = new Date();

  const order = await orders.findOneAndUpdate(
    {
      _id: orderId,
      status: { $in: CONFIRMABLE },
      confirmationEmailSentAt: { $exists: false },
      $or: [
        { confirmationEmailClaimedAt: { $exists: false } },
        { confirmationEmailClaimedAt: { $lt: new Date(now.getTime() - CLAIM_TTL_MS) } },
      ],
    },
    { $set: { confirmationEmailClaimedAt: now }, $inc: { confirmationEmailAttempts: 1 } },
    { returnDocument: 'after' },
  );
  if (!order) return false;

  try {
    const message = orderConfirmationEmail(config, order);
    await mailer.sendMail({
      from: config.smtpFrom,
      to: order.email,
      ...(config.supportEmail && { replyTo: config.supportEmail }),
      ...message,
      headers: { 'X-MJ-CustomID': `order-${order._id}`.slice(0, 120), 'X-MJ-EventPayload': order._id },
    });
    await orders.updateOne(
      { _id: order._id },
      { $set: { confirmationEmailSentAt: new Date() }, $unset: { confirmationEmailClaimedAt: '' } },
    );
    return true;
  } catch (error) {
    await orders.updateOne({ _id: order._id }, { $unset: { confirmationEmailClaimedAt: '' } });
    console.error('Order confirmation email failed:', order._id, error?.message || 'Unknown error');
    return false;
  }
}

// Never let email trouble affect the checkout response.
export function queueOrderConfirmation(config, orderId) {
  void sendOrderConfirmation(config, orderId).catch((error) => {
    console.error('Order confirmation email failed:', orderId, error?.message || 'Unknown error');
  });
}

// Safety net: re-sends confirmations that failed (SMTP outage) or were lost to a restart.
export function startConfirmationRetrySweeper(config) {
  if (!getMailer(config)) return;
  const timer = setInterval(async () => {
    try {
      const pending = await collections().orders.find({
        status: { $in: CONFIRMABLE },
        confirmationEmailSentAt: { $exists: false },
        confirmationEmailAttempts: { $not: { $gte: 8 } },
        updatedAt: { $lt: new Date(Date.now() - 60_000) },
        createdAt: { $gt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      }).project({ _id: 1 }).limit(20).toArray();
      for (const { _id } of pending) await sendOrderConfirmation(config, _id);
    } catch (error) {
      console.error('Confirmation email sweep failed:', error?.message || 'Unknown error');
    }
  }, 120_000);
  timer.unref();
}
