import { useState } from 'react';
import { ChevronDownIcon } from '@/shared/ui/icons';
import { FAQS } from '../data/content';

export default function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="faq" aria-labelledby="faq-heading" className="section-pad bg-surface-secondary">
      <div className="page-container grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-20">
        <div data-reveal>
          <p className="type-eyebrow text-text-muted">Help</p>
          <h2 id="faq-heading" className="type-h2 mt-4 text-balance">
            Questions, answered.
          </h2>
        </div>
        <ul className="divide-y divide-border-strong border-y border-border-strong" data-reveal>
          {FAQS.map((faq) => {
            const open = openId === faq.id;
            return (
              <li key={faq.id}>
                <h3>
                  <button
                    type="button"
                    id={`${faq.id}-button`}
                    aria-expanded={open}
                    aria-controls={`${faq.id}-panel`}
                    onClick={() => setOpenId(open ? null : faq.id)}
                    className="type-body-lg flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left font-medium"
                  >
                    {faq.question}
                    <ChevronDownIcon
                      size={20}
                      className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                  </button>
                </h3>
                <div
                  id={`${faq.id}-panel`}
                  role="region"
                  aria-labelledby={`${faq.id}-button`}
                  hidden={!open}
                >
                  <p className="type-body pb-5 pr-8 text-text-secondary">{faq.answer}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
