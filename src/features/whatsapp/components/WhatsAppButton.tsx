import type { ReactNode } from 'react';
import { buttonClasses, type ButtonSize, type ButtonVariant } from '@/shared/ui/Button';
import { WhatsAppIcon } from '@/shared/ui/icons';
import { buildWhatsAppUrl } from '../url';

interface WhatsAppButtonProps {
  message: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  icon?: boolean;
}

/** Opens a pre-filled WhatsApp chat. Falls back to a disabled "contact pending" state. */
export default function WhatsAppButton({
  message,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon = true,
}: WhatsAppButtonProps) {
  const href = buildWhatsAppUrl(message);

  if (!href) {
    return (
      <span className="block">
        <button
          type="button"
          disabled
          className={buttonClasses(variant, size, `w-full ${className}`)}
          aria-describedby="whatsapp-pending-note"
        >
          WhatsApp contact pending
        </button>
        <span id="whatsapp-pending-note" className="type-caption mt-2 block text-text-muted">
          The store’s WhatsApp number has not been configured yet.
        </span>
      </span>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClasses(variant, size, className)}>
      {icon && <WhatsAppIcon size={18} aria-hidden="true" />}
      {children}
      <span className="sr-only"> (opens WhatsApp in a new tab)</span>
    </a>
  );
}
