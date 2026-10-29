import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  Account,
  Client,
  Databases,
  ID,
  Permission,
  Query,
  Role,
  Users,
} from 'node-appwrite';

const catalog = {
  'product-celeste-diamond-ring': { name: 'Celeste Diamond Ring', priceInRupees: 24900 },
  'product-minimal-diamond-necklace': { name: 'Minimal Diamond Necklace', priceInRupees: 19900 },
  'product-floral-pattern-earring': { name: 'Floral Pattern Earring', priceInRupees: 14900 },
  'product-solis-charm-bracelet': { name: 'Solis Charm Bracelet', priceInRupees: 18900 },
  'gold-statement-ring': { name: 'Gold Statement Ring', priceInRupees: 29900 },
};

const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID;
const ordersCollectionId = process.env.APPWRITE_ORDERS_COLLECTION_ID;

function getAdminClient() {
  if (!endpoint || !projectId || !apiKey || !databaseId || !ordersCollectionId) {
    throw new Error('The Appwrite function is missing required environment configuration.');
  }
  return new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
}

function readBody(req) {
  if (req.bodyJson && typeof req.bodyJson === 'object' && !Array.isArray(req.bodyJson)) {
    return req.bodyJson;
  }
  if (typeof req.body === 'string') {
    const body = JSON.parse(req.body);
    return body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  }
  if (typeof req.bodyText === 'string') {
    const body = JSON.parse(req.bodyText);
    return body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  }
  return {};
}

function validString(value, maxLength) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;
}

function jsonError(res, status, message) {
  return res.json({ error: message }, status);
}

function normalizePath(path) {
  const normalized = (path || '/').replace(/\/+$/, '');
  return normalized || '/';
}

async function beginEmailOtp(body, res, log) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError(res, 400, 'Enter a valid email address.');
  }

  const client = getAdminClient();
  const users = new Users(client);
  const auth = new Account(new Client().setEndpoint(endpoint).setProject(projectId));
  let userId;

  try {
    const matches = await users.list([Query.equal('email', email), Query.limit(1)]);
    userId = matches.users[0]?.$id ?? ID.unique();

    try {
      await auth.createEmailToken(userId, email);
    } catch (error) {
      if (matches.users.length || error?.code !== 409) throw error;
      const retry = await users.list([Query.equal('email', email), Query.limit(1)]);
      if (!retry.users[0]) throw error;
      userId = retry.users[0].$id;
      await auth.createEmailToken(userId, email);
    }

    return res.json({ userId });
  } catch (error) {
    log(`Email OTP start failed (${error?.code ?? 'unknown'}).`);
    const status = error?.code === 429 ? 429 : 503;
    return jsonError(
      res,
      status,
      status === 429
        ? 'Too many verification requests. Wait a little before trying again.'
        : 'We could not send a verification code. Check the email and try again.'
    );
  }
}

async function authenticatedUser(req) {
  const jwt = req.headers?.['x-appwrite-user-jwt'];
  if (typeof jwt !== 'string' || !jwt) return null;
  const client = new Client().setEndpoint(endpoint).setProject(projectId).setJWT(jwt);
  return new Account(client).get();
}

function getOrderItems(input) {
  if (!Array.isArray(input) || input.length === 0 || input.length > 20) {
    throw new Error('Your bag is empty or contains too many different items.');
  }
  const seen = new Set();
  return input.map((item) => {
    if (
      !item ||
      typeof item.id !== 'string' ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 10 ||
      seen.has(item.id)
    ) {
      throw new Error('One or more items in your bag are invalid. Please review your bag.');
    }
    seen.add(item.id);
    const product = Object.hasOwn(catalog, item.id) ? catalog[item.id] : undefined;
    if (!product) throw new Error('An item in your bag is no longer available.');
    const unitPriceInPaise = product.priceInRupees * 100;
    return {
      id: item.id,
      name: product.name,
      quantity: item.quantity,
      unitPriceInPaise,
      lineTotalInPaise: unitPriceInPaise * item.quantity,
    };
  });
}

function validateCustomer(customer) {
  if (
    !customer ||
    !validString(customer.name, 100) ||
    !validString(customer.address, 300) ||
    !validString(customer.city, 100) ||
    !validString(customer.state, 100) ||
    !/^\d{10}$/.test(customer.phone || '') ||
    !/^\d{6}$/.test(customer.postalCode || '') ||
    customer.country !== 'IN'
  ) {
    throw new Error('Check your name, Indian mobile number, and delivery address.');
  }
  return {
    name: customer.name.trim(),
    phone: customer.phone,
    address: customer.address.trim(),
    city: customer.city.trim(),
    state: customer.state.trim(),
    postalCode: customer.postalCode,
    country: 'IN',
  };
}

async function createRazorpayOrder(amountInPaise, requestId, userId) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Online payments are not configured. Please choose cash on delivery.');
  }

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt: requestId,
      notes: { silveram_order_id: requestId, appwrite_user_id: userId },
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    await response.text();
    throw new Error('The payment provider could not start checkout. Please try again.');
  }

  const result = await response.json();
  if (result.amount !== amountInPaise || result.currency !== 'INR' || !result.id) {
    throw new Error('The payment provider returned an invalid order.');
  }
  return { id: result.id, keyId };
}

function orderResponse(document, keyId) {
  return {
    orderId: document.$id,
    amountInPaise: document.amountInPaise,
    currency: 'INR',
    paymentMethod: document.paymentMethod,
    ...(document.razorpayOrderId && {
      razorpayOrderId: document.razorpayOrderId,
      razorpayKeyId: keyId,
    }),
  };
}

async function createOrder(body, res, log, user) {
  if (!validString(body.requestId, 36) || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,35}$/.test(body.requestId)) {
    return jsonError(res, 400, 'Invalid order request. Please refresh checkout and try again.');
  }
  if (
    typeof body.email !== 'string' ||
    body.email.trim().toLowerCase() !== user.email?.toLowerCase()
  ) {
    return jsonError(res, 400, 'The verified email does not match your checkout email.');
  }
  if (!['razorpay', 'cod'].includes(body.paymentMethod)) {
    return jsonError(res, 400, 'Choose a supported payment method.');
  }

  let items;
  let shipping;
  try {
    items = getOrderItems(body.items);
    shipping = validateCustomer(body.customer);
  } catch (error) {
    return jsonError(res, 400, error.message);
  }

  const amountInPaise = items.reduce((total, item) => total + item.lineTotalInPaise, 0);
  const databases = new Databases(getAdminClient());
  let existing;

  try {
    existing = await databases.getDocument(databaseId, ordersCollectionId, body.requestId);
  } catch (error) {
    if (error?.code !== 404) {
      log(`Order lookup failed (${error?.code ?? 'unknown'}).`);
      return jsonError(res, 503, 'We could not create your order. Please try again.');
    }
  }

  if (existing) {
    if (existing.userId !== user.$id) return jsonError(res, 409, 'This order request is no longer available.');
    if (existing.paymentMethod !== body.paymentMethod) {
      return jsonError(res, 409, 'Your payment choice changed. Refresh checkout and try again.');
    }
    if (existing.amountInPaise !== amountInPaise || existing.itemsJson !== JSON.stringify(items)) {
      return jsonError(res, 409, 'Your bag changed. Refresh checkout before placing the order.');
    }
    if (existing.razorpayOrderId) {
      return res.json(orderResponse(existing, process.env.RAZORPAY_KEY_ID));
    }
    if (existing.paymentMethod === 'cod') return res.json(orderResponse(existing));
  }

  const data = {
    userId: user.$id,
    email: user.email,
    status: body.paymentMethod === 'cod' ? 'placed_cod' : 'pending_payment',
    paymentMethod: body.paymentMethod,
    amountInPaise,
    currency: 'INR',
    itemsJson: JSON.stringify(items),
    shippingAddressJson: JSON.stringify(shipping),
    razorpayOrderId: existing?.razorpayOrderId ?? '',
    razorpayPaymentId: existing?.razorpayPaymentId ?? '',
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };

  try {
    let order = existing;
    if (!order) {
      try {
        order = await databases.createDocument(
          databaseId,
          ordersCollectionId,
          body.requestId,
          data,
          [Permission.read(Role.user(user.$id))]
        );
      } catch (error) {
        if (error?.code !== 409) throw error;
        order = await databases.getDocument(databaseId, ordersCollectionId, body.requestId);
        if (order.userId !== user.$id) return jsonError(res, 409, 'This order request is no longer available.');
      }
    }

    if (body.paymentMethod === 'cod') {
      return res.json(orderResponse(order));
    }

    const razorpay = await createRazorpayOrder(amountInPaise, body.requestId, user.$id);
    order = await databases.updateDocument(databaseId, ordersCollectionId, body.requestId, {
      razorpayOrderId: razorpay.id,
    });
    return res.json(orderResponse(order, razorpay.keyId));
  } catch (error) {
    log(`Order creation failed (${error?.code ?? 'provider'}).`);
    const publicMessage = error.message?.startsWith('Online payments are not configured')
      ? error.message
      : 'We could not create your order. Please try again.';
    return jsonError(res, 503, publicMessage);
  }
}

async function verifyPayment(body, res, log, user) {
  const { requestId, razorpay_payment_id: paymentId, razorpay_order_id: razorpayOrderId, razorpay_signature: signature } = body;
  if (
    !validString(requestId, 36) ||
    !validString(paymentId, 100) ||
    !validString(razorpayOrderId, 100) ||
    typeof signature !== 'string' ||
    !/^[a-f0-9]{64}$/i.test(signature)
  ) {
    return jsonError(res, 400, 'The payment response is invalid.');
  }

  try {
    const databases = new Databases(getAdminClient());
    const order = await databases.getDocument(databaseId, ordersCollectionId, requestId);
    if (order.userId !== user.$id || order.paymentMethod !== 'razorpay') {
      return jsonError(res, 403, 'This payment does not match your order.');
    }
    if (order.status === 'paid' && order.razorpayPaymentId === paymentId) {
      return res.json({ success: true, orderId: order.$id });
    }
    if (order.status !== 'pending_payment' || order.razorpayOrderId !== razorpayOrderId) {
      return jsonError(res, 409, 'The payment does not match an active order.');
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error('Online payment verification is not configured.');
    const expected = createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${paymentId}`)
      .digest('hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    const signatureBuffer = Buffer.from(signature, 'hex');
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return jsonError(res, 400, 'Payment verification failed.');
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const response = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString('base64')}`,
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      await response.text();
      return jsonError(res, 503, 'Payment is awaiting confirmation. Please check your order status before retrying.');
    }
    const payment = await response.json();
    if (
      payment.order_id !== razorpayOrderId ||
      payment.amount !== order.amountInPaise ||
      payment.currency !== 'INR' ||
      payment.status !== 'captured'
    ) {
      return jsonError(res, 409, 'The payment is not captured yet. Please contact the store if your account was charged.');
    }

    await databases.updateDocument(databaseId, ordersCollectionId, requestId, {
      status: 'paid',
      razorpayPaymentId: paymentId,
    });
    return res.json({ success: true, orderId: requestId });
  } catch (error) {
    log(`Payment verification failed (${error?.code ?? 'unknown'}).`);
    return jsonError(res, 503, 'We could not confirm the payment. Contact the store before trying again.');
  }
}

export default async ({ req, res, log }) => {
  const path = normalizePath(req.path);

  try {
    const body = readBody(req);
    if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed.');
    if (path === '/auth/start') return await beginEmailOtp(body, res, log);

    const user = await authenticatedUser(req);
    if (!user) return jsonError(res, 401, 'Verify your email before continuing.');
    if (path === '/orders') return await createOrder(body, res, log, user);
    if (path === '/orders/verify') return await verifyPayment(body, res, log, user);
    return jsonError(res, 404, 'Store endpoint not found.');
  } catch (error) {
    log(`Store request failed (${error?.code ?? 'unknown'}).`);
    return jsonError(res, 500, 'The store could not complete this request. Please try again.');
  }
};
