import { Router } from 'express';
import { z } from 'zod';
import { marketingConfigured, subscribeContact } from '../mail/mailjet.js';
import { consumeRateLimit } from '../security.js';

const schema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  name: z.string().trim().max(100).optional(),
}).strict();

export function createNewsletterRouter(config) {
  const router = Router();

  router.post('/subscribe', async (req, res, next) => {
    try {
      if (!marketingConfigured(config)) {
        return res.status(503).json({ error: 'Newsletter sign-up is not available yet.' });
      }
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: 'Enter a valid email address.' });
      if (
        !(await consumeRateLimit(req.ip, 'newsletter-ip', 10, 60 * 60 * 1000)) ||
        !(await consumeRateLimit(parsed.data.email, 'newsletter-email', 3, 60 * 60 * 1000))
      ) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
      }
      await subscribeContact(config, parsed.data.email, parsed.data.name);
      // Same answer whether or not the address was already subscribed.
      return res.status(202).json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
