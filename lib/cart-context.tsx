"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { CartItem } from "./types";

const STORAGE_KEY = "smart-canteen:cart";

interface CartContextValue {
  cart: CartItem[];
  totalItems: number;
  totalPrice: number;
  setQuantity: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getQuantity: (id: string) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCart(JSON.parse(stored));
    } catch {
      // ignore malformed cart data
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  const setQuantity = useCallback(
    (item: Omit<CartItem, "quantity">, quantity: number) => {
      setCart((prev) => {
        // Switching stalls clears the cart — orders are placed per-stall.
        const fromDifferentStall =
          prev.length > 0 && prev[0].stall_id !== item.stall_id;
        const base = fromDifferentStall ? [] : prev;

        const existingIndex = base.findIndex((c) => c.id === item.id);
        if (quantity <= 0) {
          return base.filter((c) => c.id !== item.id);
        }
        if (existingIndex === -1) {
          return [...base, { ...item, quantity }];
        }
        const next = [...base];
        next[existingIndex] = { ...next[existingIndex], quantity };
        return next;
      });
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const getQuantity = useCallback(
    (id: string) => cart.find((c) => c.id === id)?.quantity ?? 0,
    [cart]
  );

  const totalItems = useMemo(
    () => cart.reduce((acc, i) => acc + i.quantity, 0),
    [cart]
  );

  const totalPrice = useMemo(
    () => cart.reduce((acc, i) => acc + i.price * i.quantity, 0),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItems,
        totalPrice,
        setQuantity,
        removeItem,
        clearCart,
        getQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
