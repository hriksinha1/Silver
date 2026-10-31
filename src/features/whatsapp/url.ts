import { WHATSAPP_NUMBER } from './config';

/** Official click-to-chat URL (https://wa.me/<number>?text=<encoded>), or null if no number is configured. */
export function buildWhatsAppUrl(message: string, number: string | null = WHATSAPP_NUMBER): string | null {
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
