/**
 * WhatsApp configuration. Set VITE_WHATSAPP_NUMBER in .env (Indian mobile, e.g.
 * 9XXXXXXXXX or 919XXXXXXXXX). No number is hardcoded; when it is missing or
 * invalid the UI shows a "contact pending" state instead of a broken link.
 */
export function normalizeWhatsAppNumber(raw: string | undefined): string | null {
  const digits = (raw ?? '').replace(/\D/g, '');
  if (/^[6-9]\d{9}$/.test(digits)) return `91${digits}`;
  if (/^91[6-9]\d{9}$/.test(digits)) return digits;
  return null;
}

export const WHATSAPP_NUMBER = normalizeWhatsAppNumber(import.meta.env.VITE_WHATSAPP_NUMBER);
export const isWhatsAppConfigured = WHATSAPP_NUMBER !== null;
