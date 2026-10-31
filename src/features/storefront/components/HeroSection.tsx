import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { buttonClasses } from '@/shared/ui/Button';
import ImageSlot from '@/shared/ui/ImageSlot';
import { HERO } from '../data/content';

export default function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);

  // One short entrance timeline; skipped for reduced-motion users.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power2.out' } })
        .from('[data-hero-text]', { y: 24, opacity: 0, duration: 0.8, stagger: 0.12 })
        .from('[data-hero-visual]', { opacity: 0, duration: 1 }, 0.2);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={rootRef}
      aria-labelledby="hero-heading"
      className="on-navy silver-light text-surface-primary"
    >
      <div className="page-container grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
        <div>
          <p data-hero-text className="type-eyebrow text-accent-silver">
            {HERO.eyebrow}
          </p>
          <h1 id="hero-heading" data-hero-text className="type-display mt-5 text-balance">
            {HERO.heading}
          </h1>
          <p data-hero-text className="type-body-lg mt-6 max-w-xl text-surface-primary/80">
            {HERO.description}
          </p>
          <div data-hero-text className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#collection" className={buttonClasses('inverse', 'lg')}>
              Discover the collection
            </a>
            <a href="#story" className={buttonClasses('outline-inverse', 'lg')}>
              Our story
            </a>
          </div>
        </div>

        <div data-hero-visual className="mx-auto w-full max-w-md lg:max-w-none">
          <ImageSlot
            src={HERO.image?.src}
            alt={HERO.image?.alt ?? 'Silveram silver collection – photography coming soon'}
            width={HERO.image?.width ?? 4}
            height={HERO.image?.height ?? 5}
            ratio="4 / 5"
            tone="dark"
            priority
            sizes="(min-width: 1024px) 480px, 90vw"
            placeholderLabel="Silver photography coming soon"
            className="border border-accent-silver/40"
          />
        </div>
      </div>
    </section>
  );
}
