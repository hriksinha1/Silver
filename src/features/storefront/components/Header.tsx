import { useEffect, useRef, useState } from 'react';
import { BagIcon, CloseIcon, MenuIcon } from '@/shared/ui/icons';
import { useCart } from '@/features/cart/context/CartContext';
import { NAV_LINKS } from '../data/content';

export default function Header() {
  const { itemCount, setIsCartOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const linkClass =
    'type-caption inline-flex min-h-11 items-center font-semibold uppercase tracking-[0.14em] text-text-primary underline-offset-8 decoration-accent-silver decoration-1 hover:underline';

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface-primary/95 backdrop-blur-sm">
      <div className="page-container flex h-16 items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]">
        <a
          href="#home"
          className="inline-flex min-h-11 items-center text-lg font-semibold uppercase tracking-[0.3em] text-brand-primary"
          aria-label="Silveram – home"
        >
          Silveram
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex h-11 w-11 items-center justify-center rounded-[2px] text-brand-primary hover:bg-surface-secondary"
            aria-label={`Open shopping bag, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
          >
            <BagIcon size={24} />
            {itemCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-primary px-1 text-[0.6875rem] font-semibold text-surface-primary">
                {itemCount}
              </span>
            )}
          </button>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-[2px] text-brand-primary hover:bg-surface-secondary md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-border bg-surface-primary md:hidden">
          <ul className="page-container py-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-b border-border last:border-b-0">
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="type-body flex min-h-12 items-center font-medium uppercase tracking-[0.14em]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
