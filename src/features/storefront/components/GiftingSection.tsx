import { buttonClasses } from '@/shared/ui/Button';
import ImageSlot from '@/shared/ui/ImageSlot';
import { GIFTING } from '../data/content';

export default function GiftingSection() {
  return (
    <section id="gifting" aria-labelledby="gifting-heading" className="section-pad bg-surface-secondary">
      <div className="page-container grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div data-reveal>
          <div className="overflow-hidden rounded-[2px] border border-border shadow-md">
            <ImageSlot
              src={GIFTING.image?.src}
              alt={GIFTING.image?.alt ?? 'Silver gifting – photography coming soon'}
              width={GIFTING.image?.width ?? 1}
              height={GIFTING.image?.height ?? 1}
              ratio="1 / 1"
              sizes="(min-width: 1024px) 560px, 100vw"
            />
          </div>
        </div>
        <div data-reveal>
          <span className="block h-px w-14 bg-brand-primary" aria-hidden="true" />
          <h2 id="gifting-heading" className="type-h2 mt-6 text-balance font-medium">
            {GIFTING.heading}
          </h2>
          <p className="type-body-lg mt-5 max-w-xl text-text-secondary leading-relaxed">{GIFTING.description}</p>
          
          <ul className="mt-6 space-y-2.5 text-sm text-text-secondary">
            <li className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" aria-hidden="true" />
              <span>Signature Silveram midnight presentation box</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" aria-hidden="true" />
              <span>Complimentary soft silver-polishing cloth & velvet pouch</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" aria-hidden="true" />
              <span>Personalized handwritten gift note on request</span>
            </li>
          </ul>

          <div className="mt-8">
            <a href="#collection" className={buttonClasses('primary', 'lg')}>
              Explore gifting pieces
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
