import React, { useState } from 'react';
import {
  FacebookIcon,
  XIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
  ArrowRightIcon,
} from './icons';
import { useCart } from '../context/CartContext';

interface FooterSectionProps {
  onOpenPolicy: (title: string) => void;
  onOpenFaqItem: (faqId: string) => void;
}

export function FooterSection({ onOpenPolicy, onOpenFaqItem }: FooterSectionProps) {
  const { highlightProduct } = useCart();

  // Newsletter state & validation
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid email format.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStatusMessage('Thanks. This is a demo form, so no email was sent or stored.');
      setEmail('');
    }, 400);
  };

  const handleSmoothScroll = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      id="contact"
      aria-labelledby="footer-brand-title"
      className="w-full bg-[#EFEFEF] p-3 sm:p-4 lg:p-6 pb-6 sm:pb-8"
    >
      {/* Inset White Card (14px radius) */}
      <div className="mx-auto max-w-[1360px] rounded-[14px] bg-white p-8 sm:p-12 lg:p-16 text-[#26102C]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Column (4 of 12) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <span id="footer-brand-title" className="font-heading text-3xl font-light tracking-[0.06em] text-[#69388F]">
                Aurelia
              </span>
              <p className="mt-4 max-w-[32ch] font-sans text-xs sm:text-sm leading-relaxed text-[#4E4852]">
                Fine jewellery designed for everyday elegance and life's defining moments. Crafted with precision and ethically sourced materials.
              </p>
            </div>

            {/* Social Links */}
            <div className="mt-8">
              <span className="block text-xs font-medium text-[#4E4852] mb-3">
                Follow us on
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-[#DCD7DF] text-[#4E4852] transition-colors hover:border-[#69388F] hover:text-[#69388F]"
                  aria-label="Aurelia on Facebook (opens in a new tab)"
                >
                  <FacebookIcon size={16} />
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-[#DCD7DF] text-[#4E4852] transition-colors hover:border-[#69388F] hover:text-[#69388F]"
                  aria-label="Aurelia on X (opens in a new tab)"
                >
                  <XIcon size={15} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-[#DCD7DF] text-[#4E4852] transition-colors hover:border-[#69388F] hover:text-[#69388F]"
                  aria-label="Aurelia on Instagram (opens in a new tab)"
                >
                  <InstagramIcon size={16} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-[#DCD7DF] text-[#4E4852] transition-colors hover:border-[#69388F] hover:text-[#69388F]"
                  aria-label="Aurelia on LinkedIn (opens in a new tab)"
                >
                  <LinkedinIcon size={16} />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-[#DCD7DF] text-[#4E4852] transition-colors hover:border-[#69388F] hover:text-[#69388F]"
                  aria-label="Aurelia on YouTube (opens in a new tab)"
                >
                  <YoutubeIcon size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Shop Column (2 of 12) */}
          <div className="lg:col-span-2">
            <h4 className="font-heading text-sm font-semibold tracking-wider uppercase text-[#26102C]">
              Shop
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-[#4E4852]">
              <li>
                <button
                  onClick={() => highlightProduct('product-celeste-diamond-ring', 'Celeste Diamond Ring')}
                  className="hover:text-[#69388F] cursor-pointer"
                >
                  Rings
                </button>
              </li>
              <li>
                <button
                  onClick={() => highlightProduct('product-minimal-diamond-necklace', 'Minimal Diamond Necklace')}
                  className="hover:text-[#69388F] cursor-pointer"
                >
                  Necklaces
                </button>
              </li>
              <li>
                <button
                  onClick={() => highlightProduct('product-floral-pattern-earring', 'Floral Pattern Earring')}
                  className="hover:text-[#69388F] cursor-pointer"
                >
                  Earrings
                </button>
              </li>
              <li>
                <button
                  onClick={() => highlightProduct('product-solis-charm-bracelet', 'Solis Charm Bracelet')}
                  className="hover:text-[#69388F] cursor-pointer"
                >
                  Bracelets
                </button>
              </li>
            </ul>
          </div>

          {/* Company Column (2 of 12) */}
          <div className="lg:col-span-2">
            <h4 className="font-heading text-sm font-semibold tracking-wider uppercase text-[#26102C]">
              Company
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-[#4E4852]">
              <li>
                <button
                  onClick={() => handleSmoothScroll('why-aurelia')}
                  className="hover:text-[#69388F] cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSmoothScroll('craftsmanship')}
                  className="hover:text-[#69388F] cursor-pointer"
                >
                  Our Story
                </button>
              </li>
              <li>
                <a
                  href="mailto:careers@aurelia.example"
                  className="hover:text-[#69388F]"
                >
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column (2 of 12) */}
          <div className="lg:col-span-2">
            <h4 className="font-heading text-sm font-semibold tracking-wider uppercase text-[#26102C]">
              Support
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-[#4E4852]">
              <li>
                <a
                  href="mailto:hello@aurelia.example"
                  className="hover:text-[#69388F]"
                >
                  Contact
                </a>
              </li>
              <li>
                <button
                  onClick={() => handleSmoothScroll('faq')}
                  className="hover:text-[#69388F] cursor-pointer"
                >
                  FAQs
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    handleSmoothScroll('faq');
                    onOpenFaqItem('faq-3');
                  }}
                  className="hover:text-[#69388F] cursor-pointer"
                >
                  Shipping &amp; Returns
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Column (2 of 12, expanded) */}
          <div className="lg:col-span-2">
            <p className="text-xs text-[#4E4852] leading-relaxed">
              Sign up to receive updates about our products and collaborations.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="mt-4" noValidate>
              <div className="relative flex items-center">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter email address"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'newsletter-error' : undefined}
                  className="w-full rounded-full border border-[#DCD7DF] bg-[#FAF8FB] py-2.5 pl-4 pr-12 text-xs text-[#26102C] placeholder-[#8A8490] focus:border-[#69388F] focus:outline-none focus:ring-1 focus:ring-[#69388F]"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#69388F] text-white transition-colors hover:bg-[#7B43A6] active:bg-[#572E77] cursor-pointer disabled:opacity-50"
                  aria-label="Subscribe to newsletter"
                >
                  <ArrowRightIcon size={14} />
                </button>
              </div>

              {error && (
                <p id="newsletter-error" className="mt-2 text-xs text-rose-600" role="alert">
                  {error}
                </p>
              )}

              {statusMessage && (
                <p className="mt-2 text-xs text-[#69388F]" role="status">
                  {statusMessage}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar Separated by hairline divider */}
        <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EFEFEF] pt-6 text-xs text-[#4E4852]">
          <p>© 2026 Aurelia. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => onOpenPolicy('Privacy Policy')}
              className="hover:text-[#69388F] cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onOpenPolicy('Terms & Conditions')}
              className="hover:text-[#69388F] cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterSection;
