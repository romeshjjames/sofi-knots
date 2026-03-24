"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  productId: string;
  quantity: number;
};

type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  addItem: (productId: string, quantity?: number) => void;
  setItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  replaceWithSingleItem: (productId: string, quantity?: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "sofi-knots-cart";

const CartContext = createContext<CartContextValue | null>(null);

function normalizeCart(lines: CartLine[]) {
  return lines
    .filter((line) => line.productId && Number.isFinite(line.quantity))
    .map((line) => ({
      productId: line.productId,
      quantity: Math.max(0, Math.min(99, Math.round(line.quantity))),
    }))
    .filter((line) => line.quantity > 0);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartLine[];
        setItems(normalizeCart(Array.isArray(parsed) ? parsed : []));
      }
    } catch {
      setItems([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      addItem: (productId, quantity = 1) =>
        setItems((current) => {
          const nextQuantity = Math.max(1, Math.round(quantity));
          const existing = current.find((item) => item.productId === productId);
          if (existing) {
            return normalizeCart(
              current.map((item) =>
                item.productId === productId ? { ...item, quantity: item.quantity + nextQuantity } : item,
              ),
            );
          }
          return normalizeCart([...current, { productId, quantity: nextQuantity }]);
        }),
      setItemQuantity: (productId, quantity) =>
        setItems((current) =>
          normalizeCart(current.map((item) => (item.productId === productId ? { ...item, quantity } : item))),
        ),
      removeItem: (productId) => setItems((current) => current.filter((item) => item.productId !== productId)),
      replaceWithSingleItem: (productId, quantity = 1) =>
        setItems(
          normalizeCart([
            {
              productId,
              quantity: Math.max(1, Math.round(quantity)),
            },
          ]),
        ),
      clearCart: () => setItems([]),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return value;
}
