import { buttonClasses } from '@/shared/ui/Button';
import ImageSlot from '@/shared/ui/ImageSlot';
import { GIFTING } from '../data/content';

export default function GiftingSection() {
  return (
    <section id="gifting" aria-labelledby="gifting-heading" className="section-pad bg-surface-secondary">
      <div className="page-container grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div data-reveal>
          <ImageSlot
            src={GIFTING.image?.src}
            alt={GIFTING.image?.alt ?? 'Silver gifting – photography coming soon'}
            width={GIFTING.image?.width ?? 1}
            height={GIFTING.image?.height ?? 1}
            ratio="1 / 1"
            sizes="(min-width: 1024px) 560px, 100vw"
            className="border border-border"
          />
        </div>
        <div data-reveal>
          <p className="type-eyebrow text-text-muted">Gifting</p>
          <h2 id="gifting-heading" className="type-h2 mt-4 text-balance">
            {GIFTING.heading}
          </h2>
          <p className="type-body-lg mt-5 max-w-xl text-text-secondary">{GIFTING.description}</p>
          <a href="#collection" className={`${buttonClasses('primary', 'lg')} mt-8`}>
            Explore the collection
          </a>
        </div>
      </div>
    </section>
  );
}
