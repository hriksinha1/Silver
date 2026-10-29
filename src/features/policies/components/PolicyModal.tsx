import { useEffect, useRef } from 'react';
import { CloseIcon } from '@/shared/ui/icons';
import Button from '@/shared/ui/Button';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function PolicyModal({ isOpen, onClose, title }: PolicyModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-dialog-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg rounded-[2px] bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E2DEE5] pb-4">
          <h2 id="policy-dialog-title" className="font-heading text-2xl font-medium text-[#26102C]">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[2px] text-[#4E4852] hover:bg-[#F5F2F7] hover:text-[#26102C]"
            aria-label="Close dialog"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#4E4852]">
          <div className="rounded-[2px] bg-[#FAF8FB] p-3 text-xs text-[#69388F] border border-[#E2DEE5]">
            This {title.toLowerCase()} has not been finalized. Live orders must remain disabled until Silveram publishes approved policy details and a support contact.
          </div>
          <p>
            Checkout uses email verification and, once configured, stores customer and delivery details with Appwrite to process orders. Online payments are processed by Razorpay. Cart contents are also saved in this browser.
          </p>
          <p>
            Before launch, replace this notice with the store's actual privacy, payment, shipping, cancellation, returns, and refund terms, including applicable retention periods and customer-support details.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PolicyModal;
