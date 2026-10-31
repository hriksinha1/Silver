/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect, useRef, useState } from 'react';

import { CartProvider, useCart } from '@/features/cart/context/CartContext';
import CartDrawer from '@/features/cart/components/CartDrawer';
import PolicyModal from '@/features/policies/components/PolicyModal';
import type { PolicyId } from '@/features/policies/data/policies';
import ProductPage from '@/features/products/components/ProductPage';
import AnnouncementBar from '@/features/storefront/components/AnnouncementBar';
import CollectionSection from '@/features/storefront/components/CollectionSection';
import FaqSection from '@/features/storefront/components/FaqSection';
import FooterSection from '@/features/storefront/components/FooterSection';
import GiftingSection from '@/features/storefront/components/GiftingSection';
import Header from '@/features/storefront/components/Header';
import HeroSection from '@/features/storefront/components/HeroSection';
import StorySection from '@/features/storefront/components/StorySection';
import TrustSection from '@/features/storefront/components/TrustSection';
import { FloatingWhatsApp } from '@/features/whatsapp';
import { useHashRoute } from '@/shared/hooks/useHashRoute';
import { useReveal } from '@/shared/hooks/useReveal';
import { SITE } from '@/shared/config/site';
import { setPageMeta, setStructuredData } from '@/shared/lib/seo';
import Toast from '@/shared/ui/Toast';

const CheckoutDialog = lazy(() => import('@/features/checkout/components/CheckoutDialog'));

const HOME_META = {
  title: `${SITE.name} | Silver jewellery & gifting`,
  description:
    'Discover a thoughtfully curated collection of silver pieces, created for moments worth remembering. Enquire and order through WhatsApp.',
};

function HomePage() {
  const rootRef = useRef<HTMLElement>(null);
  useReveal(rootRef);

  useEffect(() => {
    setPageMeta(HOME_META);
    setStructuredData(null);
    // Arriving from a product page via "#collection" etc.: the browser tried to
    // scroll before this page existed, so scroll to the section now.
    const id = window.location.hash.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, []);

  return (
    <main id="main-content" tabIndex={-1} ref={rootRef} className="focus:outline-none">
      <HeroSection />
      <CollectionSection />
      <StorySection />
      <GiftingSection />
      <TrustSection />
      <FaqSection />
    </main>
  );
}

function Storefront() {
  const route = useHashRoute();
  const [policyId, setPolicyId] = useState<PolicyId | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { cart, clearCart, setIsCartOpen } = useCart();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[2px] focus:bg-brand-primary focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-surface-primary"
      >
        Skip to main content
      </a>

      <AnnouncementBar />
      <Header />

      {route.name === 'product' ? (
        <ProductPage key={route.slug} slug={route.slug} onOpenPolicy={setPolicyId} />
      ) : (
        <HomePage />
      )}

      <FooterSection onOpenPolicy={setPolicyId} />

      <CartDrawer
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {isCheckoutOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-primary/60 text-sm text-surface-primary" role="status">
              Loading checkout…
            </div>
          }
        >
          <CheckoutDialog
            isOpen
            cart={cart}
            onClose={() => setIsCheckoutOpen(false)}
            onOrderComplete={clearCart}
          />
        </Suspense>
      )}

      <PolicyModal policyId={policyId} onClose={() => setPolicyId(null)} />
      <FloatingWhatsApp />
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
