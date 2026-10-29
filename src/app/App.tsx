/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { CartProvider } from '@/features/cart/context/CartContext';
import CartDrawer from '@/features/cart/components/CartDrawer';
import PolicyModal from '@/features/policies/components/PolicyModal';
import BestSellersSection from '@/features/storefront/components/BestSellersSection';
import CategoriesSection from '@/features/storefront/components/CategoriesSection';
import CraftsmanshipSection from '@/features/storefront/components/CraftsmanshipSection';
import FaqSection from '@/features/storefront/components/FaqSection';
import FooterSection from '@/features/storefront/components/FooterSection';
import HeroSection from '@/features/storefront/components/HeroSection';
import TestimonialsSection from '@/features/storefront/components/TestimonialsSection';
import WhyChooseSection from '@/features/storefront/components/WhyChooseSection';
import Toast from '@/shared/ui/Toast';
import CheckoutDialog from '@/features/checkout/components/CheckoutDialog';
import { useCart } from '@/features/cart/context/CartContext';

gsap.registerPlugin(ScrollTrigger);

function Storefront() {
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [policyTitle, setPolicyTitle] = useState('Privacy Policy');
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);
  const cartTriggerRef = useRef<HTMLButtonElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const { cart, clearCart, setIsCartOpen } = useCart();

  // GSAP ScrollTrigger for restrained section reveals
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const animatedSections = document.querySelectorAll(
        '#categories, #craftsmanship, #best-sellers, #why-silveram, #faq'
      );

      animatedSections.forEach((sec) => {
        const heading = sec.querySelector('h2');
        const cards = sec.querySelectorAll('article, .grid > div');

        if (heading) {
          gsap.from(heading, {
            scrollTrigger: {
              trigger: heading,
              start: 'top 85%',
              once: true,
            },
            y: 20,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            clearProps: 'all',
          });
        }

        if (cards && cards.length > 0) {
          gsap.from(cards, {
            scrollTrigger: {
              trigger: cards[0],
              start: 'top 85%',
              once: true,
            },
            y: 24,
            opacity: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power2.out',
            clearProps: 'all',
          });
        }
      });
    }, surfaceRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Skip to Content for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-[2px] focus:bg-[#69388F] focus:px-4 focus:py-2.5 focus:text-xs focus:font-medium focus:text-white focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      <div className="min-h-screen w-full bg-[#5F496E]">
        <div
          ref={surfaceRef}
          className="min-h-screen w-full overflow-x-clip bg-[#26102C] shadow-2xl"
        >
          {/* Hero Section */}
          <HeroSection cartTriggerRef={cartTriggerRef} />

          {/* Main Landmark for sections */}
          <main id="main-content" tabIndex={-1} className="focus:outline-none">
            {/* Shop by Category (Continuous grey #EFEFEF) */}
            <CategoriesSection />

            {/* Timeless Craftsmanship (Continuous grey #EFEFEF) */}
            <CraftsmanshipSection />

            {/* Best Sellers (Continuous grey #EFEFEF) */}
            <BestSellersSection />

            {/* Why Choose Silveram (Continuous grey #EFEFEF) */}
            <WhyChooseSection />

            {/* Loved by Our Customers (Full-width white band) */}
            <TestimonialsSection />

            {/* Frequently Asked Questions (Grey #EFEFEF) */}
            <FaqSection activeFaqId={activeFaqId} onFaqChange={setActiveFaqId} />
          </main>

          {/* Footer Card (Inset white card) */}
          <FooterSection
            onOpenPolicy={(title) => {
              setPolicyTitle(title);
              setIsPolicyOpen(true);
            }}
            onOpenFaqItem={(faqId) => {
              setActiveFaqId(faqId);
            }}
          />
        </div>
      </div>

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        triggerRef={cartTriggerRef}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutDialog
        isOpen={isCheckoutOpen}
        cart={cart}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderComplete={clearCart}
      />

      {/* Policy Modal Dialog */}
      <PolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        title={policyTitle}
      />

      {/* Toast and Live Region */}
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Storefront />
    </CartProvider>
  );
}
