import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS } from '@/features/storefront/data/catalog';

const MAX_ITEM_QUANTITY = 10;

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  subtitle?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: { id: string; name: string; price: number; image?: string; subtitle?: string }, openCartAfter?: boolean) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toastMessage: string | null;
  highlightedProductId: string | null;
  setHighlightedProductId: (id: string | null) => void;
  highlightProduct: (productId: string, productName: string) => void;
  liveAnnouncement: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'silveram_cart_items';
const LEGACY_STORAGE_KEY = 'aurelia_cart_items';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!saved) return [];
      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((item: unknown) => {
        if (
          !item ||
          typeof item !== 'object' ||
          !('id' in item) ||
          typeof item.id !== 'string' ||
          !('quantity' in item) ||
          typeof item.quantity !== 'number' ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > MAX_ITEM_QUANTITY
        ) {
          return [];
        }
        const product = PRODUCTS.find(({ id }) => id === item.id);
        return product ? [{ ...product, quantity: item.quantity }] : [];
      });
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // storage unavailable or full
    }
  }, [cart]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const addToCart = (
    item: { id: string; name: string; price: number; image?: string; subtitle?: string },
    openCartAfter = false
  ) => {
    if (cart.find((current) => current.id === item.id)?.quantity >= MAX_ITEM_QUANTITY) {
      const message = `Maximum ${MAX_ITEM_QUANTITY} of each item per order`;
      setToastMessage(message);
      setLiveAnnouncement(message);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: Math.min(MAX_ITEM_QUANTITY, i.quantity + 1) }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    const msg = `${item.name} added to cart`;
    setToastMessage(msg);
    setLiveAnnouncement(msg);

    if (openCartAfter) {
      setIsCartOpen(true);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.min(MAX_ITEM_QUANTITY, item.quantity + delta);
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const highlightProduct = (productId: string, productName: string) => {
    setHighlightedProductId(productId);
    setLiveAnnouncement(`Showing ${productName}`);

    // Scroll to #best-sellers or element
    const el = document.getElementById(productId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Move focus after short delay
      setTimeout(() => {
        el.focus();
      }, 500);
    } else {
      const section = document.getElementById('best-sellers');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }

    setTimeout(() => {
      setHighlightedProductId(null);
    }, 2200);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        toastMessage,
        highlightedProductId,
        setHighlightedProductId,
        highlightProduct,
        liveAnnouncement,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
