import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { CartIcon, MenuIcon, CloseIcon, RingMotifIcon } from '@/shared/ui/icons';
import Button from '@/shared/ui/Button';
import SafeImage from '@/shared/ui/SafeImage';
import { IMAGES } from '@/shared/data/images';
import { useCart } from '@/features/cart/context/CartContext';

interface HeroSectionProps {
  cartTriggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function HeroSection({ cartTriggerRef }: HeroSectionProps) {
  const { cart, setIsCartOpen, addToCart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuToggleRef = useRef<HTMLButtonElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const animElementsRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Smooth scroll handler with accessible focus update
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      // update focus for accessibility
      const heading = target.querySelector('h2, h1');
      if (heading) {
        setTimeout(() => {
          (heading as HTMLElement).focus();
        }, 500);
      }
    }
  };

  // Hero Buy Now handler
  const handleBuyNow = () => {
    // Adds Gold Statement Ring (demo price $299) and opens cart dialog
    addToCart(
      {
        id: 'gold-statement-ring',
        name: 'Gold Statement Ring',
        price: 299, // Demonstration price
        image: IMAGES.heroRingBox.src,
        subtitle: 'Luxury Edition handcrafted 18k gold band',
      },
      true
    );
  };

  // GSAP animation on mount with prefers-reduced-motion check
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Elements fade & translate up
      const items = animElementsRef.current?.querySelectorAll('.hero-anim-item');
      if (items && items.length > 0) {
        gsap.from(items, {
          y: 22,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
          clearProps: 'all',
        });
      }

      // Hero model slide & fade
      if (modelRef.current) {
        gsap.from(modelRef.current, {
          x: 24,
          opacity: 0,
          duration: 1,
          delay: 0.2,
          ease: 'power2.out',
          clearProps: 'all',
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      aria-label="Introduction and hero showcase"
      className="hero-silk-sheen relative w-full overflow-hidden text-white"
    >
      {/* ================= HEADER ================= */}
      <header className="relative z-30 mx-auto flex w-full max-w-[1600px] items-center justify-between px-5 pt-6 pb-4 sm:px-8 lg:px-8">
        {/* Wordmark */}
        <a
          href="#"
          className="font-heading text-2xl font-light tracking-[0.08em] text-white transition-opacity hover:opacity-90 sm:text-3xl"
          aria-label="Silveram Home"
        >
          Silveram
        </a>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden lg:flex items-center gap-8 text-[14px] font-normal tracking-wide text-white/85"
          aria-label="Primary site navigation"
        >
          <a
            href="#categories"
            onClick={(e) => handleNavClick(e, 'categories')}
            className="transition-colors hover:text-white"
          >
            Jewellery
          </a>
          <a
            href="#best-sellers"
            onClick={(e) => handleNavClick(e, 'best-sellers')}
            className="transition-colors hover:text-white"
          >
            Collections
          </a>
          <a
            href="#craftsmanship"
            onClick={(e) => handleNavClick(e, 'craftsmanship')}
            className="transition-colors hover:text-white"
          >
            Our Store
          </a>
          <a
            href="#why-silveram"
            onClick={(e) => handleNavClick(e, 'why-silveram')}
            className="transition-colors hover:text-white"
          >
            About
          </a>
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, 'contact')}
            className="transition-colors hover:text-white"
          >
            Contact
          </a>
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-3">
          {/* Cart Icon Button */}
          <button
            ref={cartTriggerRef}
            onClick={() => setIsCartOpen(true)}
            className="relative flex h-9 w-9 min-w-[36px] min-h-[36px] items-center justify-center rounded-[2px] border border-white/25 text-white/90 transition-colors hover:border-white hover:bg-white/5 active:bg-white/10"
            aria-label={`Open shopping cart. ${cartItemCount} items`}
          >
            <CartIcon size={18} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#69388F] text-[10px] font-bold text-white shadow">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Desktop Get Started Button */}
          <div className="hidden lg:block">
            <Button
              variant="outline-dark"
              size="md"
              onClick={() => {
                document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            ref={mobileMenuToggleRef}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-9 w-9 min-w-[36px] min-h-[36px] items-center justify-center rounded-[2px] border border-white/25 text-white/90 lg:hidden hover:border-white hover:bg-white/5"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMobileMenuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Panel */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="fixed inset-0 top-[73px] z-40 flex flex-col bg-[#26102C] p-6 lg:hidden"
          role="region"
          aria-label="Mobile Navigation"
        >
          <nav className="flex flex-col gap-5 text-lg font-medium text-white/90">
            <a
              href="#categories"
              onClick={(e) => handleNavClick(e, 'categories')}
              className="py-2 border-b border-white/10 hover:text-white"
            >
              Jewellery
            </a>
            <a
              href="#best-sellers"
              onClick={(e) => handleNavClick(e, 'best-sellers')}
              className="py-2 border-b border-white/10 hover:text-white"
            >
              Collections
            </a>
            <a
              href="#craftsmanship"
              onClick={(e) => handleNavClick(e, 'craftsmanship')}
              className="py-2 border-b border-white/10 hover:text-white"
            >
              Our Store
            </a>
            <a
              href="#why-silveram"
              onClick={(e) => handleNavClick(e, 'why-silveram')}
              className="py-2 border-b border-white/10 hover:text-white"
            >
              About
            </a>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, 'contact')}
              className="py-2 border-b border-white/10 hover:text-white"
            >
              Contact
            </a>
          </nav>
          <div className="mt-8">
            <Button
              variant="primary"
              className="w-full py-3 text-sm"
              onClick={() => {
                setIsMobileMenuOpen(false);
                document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}

      {/* ================= HERO MAIN CONTENT ================= */}
      <div className="relative mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-8 pt-6 pb-12 sm:pb-16 lg:pb-0 lg:min-h-[clamp(34rem,46vw,45rem)] flex flex-col justify-between">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center relative z-10 my-auto">
          {/* Left Column (Content, 6/12) */}
          <div ref={animElementsRef} className="lg:col-span-6 lg:pr-8 py-4 lg:py-12 z-20">
            {/* Headline with gold ring motif */}
            <div className="hero-anim-item">
              <h1 className="font-heading text-3xl sm:text-5xl lg:text-[3.5rem] xl:text-[3.85rem] font-normal leading-[1.05] tracking-[-0.02em] text-white text-balance">
                <span className="sr-only">Designed to Shine, Made to Last</span>
                <span aria-hidden="true" className="block">
                  Designed to Shine,
                </span>
                <span aria-hidden="true" className="block mt-1 sm:mt-2">
                  Made <RingMotifIcon size="0.88em" /> to Last
                </span>
              </h1>
            </div>

            {/* Sub-headline */}
            <p className="hero-anim-item mt-4 sm:mt-6 max-w-[46ch] font-sans text-sm sm:text-base leading-relaxed text-white/80">
              Discover timeless jewellery pieces that blend elegance, craftsmanship, and modern sophistication.
            </p>

            {/* CTAs */}
            <div className="hero-anim-item mt-7 sm:mt-9 flex flex-wrap items-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  document.getElementById('best-sellers')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore New Arrivals
              </Button>
              <button
                onClick={() => {
                  document.getElementById('craftsmanship')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center text-xs sm:text-sm font-medium text-white/85 transition-colors hover:text-white underline underline-offset-4 decoration-white/40 hover:decoration-white cursor-pointer px-2 py-2"
              >
                Our Story
              </button>
            </div>

            {/* Stats Row */}
            <div className="hero-anim-item mt-10 sm:mt-14 grid grid-cols-2 gap-6 sm:gap-10 max-w-sm">
              <div className="border-b border-white/25 pb-3">
                <p className="font-heading text-3xl sm:text-4xl font-light text-white tracking-tight">3k+</p>
                <p className="mt-1 font-sans text-xs text-white/70">Products available on store</p>
              </div>
              <div className="border-b border-white/25 pb-3">
                <p className="font-heading text-3xl sm:text-4xl font-light text-white tracking-tight">10+</p>
                <p className="mt-1 font-sans text-xs text-white/70">Years of Craftsmanship</p>
              </div>
            </div>
          </div>

          {/* Right Stage (≥1024px Desktop Layout) */}
          <div className="hidden lg:block lg:col-span-6 relative h-full min-h-[560px]">
            {/* White horizontal panel: sits from left edge of stage to right edge of surface */}
            <div
              className="absolute left-0 right-[-48px] xl:right-[-96px] bg-white text-[#26102C] z-10 flex items-center pl-8 pr-12 shadow-sm rounded-l-[2px]"
              style={{
                top: '48%',
                bottom: '10%',
                minHeight: '190px',
              }}
            >
              {/* Product description in white panel, left-aligned, width constrained so model doesn't overlap */}
              <div className="w-[50%] xl:w-[46%] pt-12 xl:pt-14 pb-4">
                <span className="block text-[11px] uppercase tracking-wider font-semibold text-[#4E4852]">
                  Luxury Edition
                </span>
                <h3 className="font-heading text-xl xl:text-2xl font-medium tracking-tight text-[#26102C] mt-0.5">
                  Gold Statement Ring
                </h3>
                <div className="mt-3">
                  <Button variant="primary" size="sm" onClick={handleBuyNow}>
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>

            {/* Ring Box cut-out: stands on/over top-left of panel */}
            <div
              className="absolute z-20 pointer-events-none"
              style={{
                top: '25%',
                left: '2%',
                width: '180px',
                height: '180px',
              }}
            >
              <SafeImage
                src={IMAGES.heroRingBox.src}
                alt={IMAGES.heroRingBox.alt}
                width={180}
                height={180}
                type="box"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>

            {/* Model cut-out / crop: anchored bottom-right, in FRONT of panel right end */}
            <div
              ref={modelRef}
              className="absolute right-0 bottom-0 z-20 pointer-events-none flex items-end justify-end"
              style={{
                height: '92%',
                width: '68%',
                maxHeight: '580px',
              }}
            >
              <SafeImage
                src={IMAGES.heroModel.src}
                alt={IMAGES.heroModel.alt}
                width={IMAGES.heroModel.width}
                height={IMAGES.heroModel.height}
                priority={true}
                type="portrait"
                className="h-full w-auto max-w-full object-cover object-top select-none"
              />
            </div>
          </div>
        </div>

        {/* Mobile / Tablet (<1024px) Staged Visuals */}
        <div className="lg:hidden mt-8 flex flex-col gap-4">
          {/* Visual Stage */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden rounded-[2px] bg-gradient-to-t from-[#36173E] to-[#26102C] flex items-end justify-end">
            <SafeImage
              src={IMAGES.heroModel.src}
              alt={IMAGES.heroModel.alt}
              width={IMAGES.heroModel.width}
              height={IMAGES.heroModel.height}
              priority={true}
              type="portrait"
              className="h-full w-auto max-w-[70%] sm:max-w-[55%] object-cover object-top"
            />
          </div>

          {/* White in-flow product panel */}
          <div className="w-full bg-white text-[#26102C] p-4 sm:p-5 rounded-[2px] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-[#EFEFEF] rounded-[2px] overflow-hidden flex items-center justify-center">
                <SafeImage
                  src={IMAGES.heroRingBox.src}
                  alt={IMAGES.heroRingBox.alt}
                  width={80}
                  height={80}
                  type="box"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider font-semibold text-[#4E4852]">
                  Luxury Edition
                </span>
                <h3 className="font-heading text-lg sm:text-xl font-medium text-[#26102C]">
                  Gold Statement Ring
                </h3>
              </div>
            </div>

            <Button variant="primary" size="sm" onClick={handleBuyNow}>
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
