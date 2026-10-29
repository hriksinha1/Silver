import { verifyRazorpayCheckoutSignature } from './signatures.js';

export async function createRazorpayOrder(config, order, user) {
  const response = await fetch('https://api.razorpay.com/v1/orders', {
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
  if (!response.ok) {
    await response.text();
    throw Object.assign(new Error('The payment provider could not start checkout. Your stock is reserved temporarily; retry or contact the store.'), { status: 503 });
  }

  const providerOrder = await response.json();
  if (providerOrder.amount !== order.amountInPaise || providerOrder.currency !== 'INR' || !providerOrder.id) {
    throw Object.assign(new Error('The payment provider returned an invalid order.'), { status: 503 });
  }
  return providerOrder;
}

export async function verifyCapturedPayment(config, order, paymentId) {
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

export { verifyRazorpayCheckoutSignature };
