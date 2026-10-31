import { WhatsAppIcon } from '@/shared/ui/icons';
import { buildWhatsAppUrl } from '../url';
import { buildGeneralMessage } from '../messages';

/** Floating chat shortcut. Renders nothing until a WhatsApp number is configured. */
export default function FloatingWhatsApp() {
  const href = buildWhatsAppUrl(buildGeneralMessage());
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Silveram on WhatsApp (opens in a new tab)"
      className="fixed bottom-4 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full border border-accent-silver bg-brand-primary text-surface-primary shadow-lg transition-colors hover:bg-brand-primary-hover md:bottom-6 md:right-6"
    >
      <WhatsAppIcon size={26} aria-hidden="true" />
    </a>
  );
}
