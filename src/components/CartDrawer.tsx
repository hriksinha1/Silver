import React, { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { CloseIcon, PlusIcon, MinusIcon, CartIcon } from './icons';
import Button from './Button';

interface CartDrawerProps {
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export function CartDrawer({ triggerRef }: CartDrawerProps) {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeItem } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Subtotal calculation
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Esc key & body scroll lock
  useEffect(() => {
    if (!isCartOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      // Return focus to trigger
      triggerRef?.current?.focus();
    };
  }, [isCartOpen, setIsCartOpen, triggerRef]);

  if (!isCartOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      onClick={() => setIsCartOpen(false)}
    >
      <div
        ref={drawerRef}
        className="relative flex h-full w-full max-w-md flex-col bg-white text-[#26102C] shadow-2xl transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2DEE5] px-6 py-4">
          <div className="flex items-center gap-2">
            <CartIcon size={20} className="text-[#69388F]" />
            <h2 id="cart-drawer-title" className="font-heading text-xl font-medium tracking-tight">
              Your Bag ({cart.reduce((n, i) => n + i.quantity, 0)})
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={() => setIsCartOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-[2px] text-[#4E4852] hover:bg-[#F5F2F7] hover:text-[#26102C] focus-visible:outline-2"
            aria-label="Close shopping bag"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F2F7] text-[#69388F]">
                <CartIcon size={28} />
              </div>
              <p className="font-heading text-lg font-medium text-[#26102C]">Your bag is currently empty</p>
              <p className="mt-1 text-sm text-[#4E4852]">
                Explore our handcrafted collections and discover timeless pieces.
              </p>
              <Button
                variant="primary"
                className="mt-6"
                onClick={() => {
                  setIsCartOpen(false);
                  document.getElementById('best-sellers')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Discover Best Sellers
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-[#E2DEE5]" role="list">
              {cart.map((item) => (
                <li key={item.id} className="flex gap-4 py-4">
                  {item.image && (
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[2px] bg-[#EFEFEF] border border-[#E2DEE5]">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h3 className="font-heading text-base font-medium text-[#26102C]">{item.name}</h3>
                        <span className="font-sans text-sm font-semibold tabular-nums text-[#26102C]">
                          ${item.price * item.quantity}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="text-xs text-[#4E4852]">{item.subtitle}</p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity stepper */}
                      <div className="flex items-center rounded-[2px] border border-[#DCD7DF]">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="flex h-7 w-7 items-center justify-center text-[#4E4852] hover:bg-[#F5F2F7] hover:text-[#26102C]"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <MinusIcon size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-medium tabular-nums" aria-label={`Quantity: ${item.quantity}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="flex h-7 w-7 items-center justify-center text-[#4E4852] hover:bg-[#F5F2F7] hover:text-[#26102C]"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <PlusIcon size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-[#4E4852] underline underline-offset-2 hover:text-[#69388F]"
                        aria-label={`Remove ${item.name} from bag`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer with subtotal and demo disclaimer */}
        {cart.length > 0 && (
          <div className="border-t border-[#E2DEE5] bg-[#FAF8FB] p-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-[#4E4852]">Subtotal</span>
              <span className="font-heading text-xl font-bold tabular-nums text-[#26102C]">
                ${subtotal.toLocaleString()}
              </span>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-[#4E4852]">
              Taxes and complimentary shipping calculated at checkout.
            </p>

            <Button
              variant="primary"
              className="w-full py-3 text-sm tracking-wide"
              onClick={() => {
                // Checkout is disabled in demonstration
              }}
            >
              Proceed to Checkout
            </Button>

            <div className="mt-3 rounded-[2px] bg-[#EFEFEF] p-2.5 text-center">
              <p className="text-xs text-[#4E4852]">
                <strong>Notice:</strong> This is a demonstration. Checkout is not available.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
