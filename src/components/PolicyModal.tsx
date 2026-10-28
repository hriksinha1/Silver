import React, { useEffect, useRef } from 'react';
import { CloseIcon } from './icons';
import Button from './Button';

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
            Demonstration copy: replace with your own policy before commercial production.
          </div>
          <p>
            Welcome to Aurelia. This website is a portfolio landing page demonstration created to exhibit modern frontend design, typography, layout rhythm, and responsive craftsmanship.
          </p>
          <p>
            No user tracking cookies or persistent identifiers are transmitted to third parties. Any cart items and interactions reside solely within your browser session memory.
          </p>
          <p>
            All jewellery photographs, brand concepts, and product titles are demonstration placeholders honoring artisanal luxury aesthetics.
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
