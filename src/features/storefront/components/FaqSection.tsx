import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, MinusIcon } from '@/shared/ui/icons';
import { FAQS } from '@/features/storefront/data/content';

interface FaqSectionProps {
  activeFaqId?: string | null;
  onFaqChange?: (id: string | null) => void;
}

export function FaqSection({ activeFaqId: externalActiveId, onFaqChange }: FaqSectionProps) {
  // First item open by default
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Synchronize with external active ID if provided (e.g. from footer link)
  useEffect(() => {
    if (externalActiveId) {
      setOpenId(externalActiveId);
    }
  }, [externalActiveId]);

  const toggle = (id: string) => {
    const nextId = openId === id ? null : id;
    setOpenId(nextId);
    if (onFaqChange) onFaqChange(nextId);
  };

  // Keyboard navigation for WAI-ARIA accordion pattern
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const total = FAQS.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      triggerRefs.current[(index + 1) % total]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      triggerRefs.current[(index - 1 + total) % total]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      triggerRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      triggerRefs.current[total - 1]?.focus();
    }
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="w-full bg-[#EFEFEF] py-14 sm:py-20 px-5 sm:px-8 lg:px-8"
    >
      <div className="mx-auto max-w-[1000px]">
        {/* Centered Heading */}
        <div className="text-center mb-10 sm:mb-14">
          <h2
            id="faq-heading"
            tabIndex={-1}
            className="font-heading text-2xl sm:text-3xl lg:text-4xl font-normal text-[#26102C] tracking-tight focus:outline-none"
          >
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordion Container */}
        <div className="flex flex-col gap-3" role="presentation">
          {FAQS.map((faq, index) => {
            const isOpen = openId === faq.id;
            const buttonId = `faq-trigger-${faq.id}`;
            const panelId = `faq-panel-${faq.id}`;

            return (
              <div
                key={faq.id}
                className="overflow-hidden rounded-[2px] bg-white transition-colors"
              >
                <h3>
                  <button
                    ref={(el) => { triggerRefs.current[index] = el; }}
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(faq.id)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer transition-colors hover:bg-[#FAF8FB]"
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                      <span className="font-heading text-xs sm:text-sm font-light text-[#4E4852] tabular-nums">
                        {faq.number}
                      </span>
                      <span className="font-sans text-sm sm:text-base font-medium text-[#26102C]">
                        {faq.question}
                      </span>
                    </div>

                    <div className="flex h-7 w-7 shrink-0 items-center justify-center text-[#26102C]">
                      {isOpen ? <MinusIcon size={16} /> : <PlusIcon size={16} />}
                    </div>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-6 pt-1 sm:px-6 text-xs sm:text-sm leading-relaxed text-[#4E4852] border-t border-[#EFEFEF]/80">
                      <p className="pl-8 sm:pl-10">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
