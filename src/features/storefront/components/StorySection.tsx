import { buttonClasses } from '@/shared/ui/Button';
import ImageSlot from '@/shared/ui/ImageSlot';
import { STORY } from '../data/content';

export default function StorySection() {
  return (
    <section
      id="story"
      aria-labelledby="story-heading"
      className="on-navy section-pad bg-brand-primary text-surface-primary"
    >
      <div className="page-container grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div data-reveal className="order-2 lg:order-1">
          <p className="type-eyebrow text-accent-silver">Our story</p>
          <span className="mt-5 block h-px w-16 bg-accent-silver" aria-hidden="true" />
          <h2 id="story-heading" className="type-h2 mt-6 text-balance">
            {STORY.heading}
          </h2>
          <p className="type-body-lg mt-5 max-w-xl text-surface-primary/80">{STORY.description}</p>
          <a href="#collection" className={`${buttonClasses('outline-inverse', 'lg')} mt-8`}>
            Explore the pieces
          </a>
        </div>
        <div data-reveal className="order-1 lg:order-2">
          <ImageSlot
            src={STORY.image?.src}
            alt={STORY.image?.alt ?? 'Silver craftsmanship – photography coming soon'}
            width={STORY.image?.width ?? 6}
            height={STORY.image?.height ?? 5}
            ratio="6 / 5"
            tone="dark"
            sizes="(min-width: 1024px) 560px, 100vw"
            className="border border-accent-silver/40"
          />
        </div>
      </div>
    </section>
  );
}
