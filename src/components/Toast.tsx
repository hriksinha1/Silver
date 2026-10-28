import React from 'react';
import { useCart } from '../context/CartContext';
import { CartIcon } from './icons';

export function Toast() {
  const { toastMessage, liveAnnouncement } = useCart();

  return (
    <>
      {/* Screen reader live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Visual Toast Notification */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-[2px] bg-[#26102C] px-4 py-3 text-white shadow-xl border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#69388F] text-white">
            <CartIcon size={14} />
          </div>
          <span className="font-sans text-xs sm:text-sm font-medium">{toastMessage}</span>
        </aside>
      )}
    </>
  );
}

export default Toast;
