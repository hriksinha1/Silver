import { useRef } from 'react';
import { MAX_ITEM_QUANTITY, useCart } from '@/features/cart/context/CartContext';
import { BagIcon, CloseIcon, MinusIcon, PlusIcon } from '@/shared/ui/icons';
import Button from '@/shared/ui/Button';
import ImageSlot from '@/shared/ui/ImageSlot';
import { useDialog } from '@/shared/hooks/useDialog';
import { formatINR } from '@/shared/lib/money';
import { isCheckoutEnabled } from '@/shared/lib/api';
import { WhatsAppButton, buildCartMessage } from '@/features/whatsapp';

interface CartDrawerProps {
  onCheckout: () => void;
}

export default function CartDrawer({ onCheckout }: CartDrawerProps) {
  const { cart, itemCount, subtotal, isCartOpen, setIsCartOpen, updateQuantity, removeItem } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const close = () => setIsCartOpen(false);

  useDialog(isCartOpen, close, panelRef);

  if (!isCartOpen) return null;

  const message = buildCartMessage(cart.map(({ name, price, quantity }) => ({ name, price, quantity })));

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-brand-primary/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      onClick={close}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative flex h-full w-full max-w-md flex-col bg-surface-primary text-text-primary shadow-2xl focus:outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <h2 id="cart-drawer-title" className="type-h3">
            Your bag{itemCount > 0 ? ` (${itemCount})` : ''}
          </h2>
          <button
            type="button"
            onClick={close}
            className="flex h-11 w-11 items-center justify-center rounded-[2px] text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
            aria-label="Close shopping bag"
          >
            <CloseIcon size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <BagIcon size={36} className="mb-4 text-accent-silver" />
              <p className="type-h3">Your bag is empty</p>
              <p className="type-body mt-2 max-w-xs text-text-secondary">
                Explore the collection, or message us on WhatsApp and we will help you choose.
              </p>
              <a
                href="#collection"
                onClick={close}
                className="mt-6 inline-flex min-h-11 items-center rounded-[2px] border border-brand-primary px-5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-primary hover:bg-brand-primary hover:text-surface-primary"
              >
                View the collection
              </a>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {cart.map((item) => (
                <li key={item.id} className="flex gap-4 py-5">
                  <ImageSlot
                    src={item.image}
                    alt={item.imageAlt ?? item.name}
                    width={4}
                    height={5}
                    placeholderLabel=""
                    className="w-20 shrink-0 rounded-[2px] border border-border"
                    sizes="80px"
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="type-body font-medium">{item.name}</h3>
                      <span className="type-body font-medium tabular-nums">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                    <p className="type-caption text-text-muted">{formatINR(item.price)} each</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-[2px] border border-border-strong">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="flex h-11 w-11 items-center justify-center text-text-secondary hover:bg-surface-secondary"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <MinusIcon size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium tabular-nums" aria-label={`Quantity ${item.quantity}`}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={item.quantity >= MAX_ITEM_QUANTITY}
                          className="flex h-11 w-11 items-center justify-center text-text-secondary hover:bg-surface-secondary disabled:opacity-40"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <PlusIcon size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex min-h-11 items-center px-1 text-sm text-text-secondary underline underline-offset-4 hover:text-text-primary"
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

        {cart.length > 0 && (
          <div className="space-y-4 border-t border-border bg-surface-secondary px-5 py-5 sm:px-6">
            <div className="flex items-baseline justify-between">
              <span className="type-body text-text-secondary">Total</span>
              <span className="type-h3 tabular-nums">{formatINR(subtotal)}</span>
            </div>
            <p className="type-caption text-text-secondary">
              Sending this list on WhatsApp is an enquiry only. Your order is not confirmed until Silveram
              confirms it with you, including availability, delivery and payment details.
            </p>
            <WhatsAppButton message={message} size="lg" className="w-full">
              Send order enquiry on WhatsApp
            </WhatsAppButton>
            {isCheckoutEnabled ? (
              <Button variant="secondary" size="lg" className="w-full" onClick={onCheckout}>
                Proceed to checkout
              </Button>
            ) : (
              <p className="type-caption text-center text-text-muted">
                Online payment is not available yet. Please order through WhatsApp.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
