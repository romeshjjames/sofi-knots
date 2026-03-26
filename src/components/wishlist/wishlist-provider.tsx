"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type WishlistContextValue = {
  items: string[];
  itemCount: number;
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
};

const STORAGE_KEY = "sofi-knots-wishlist";

const WishlistContext = createContext<WishlistContextValue | null>(null);

function normalizeWishlist(productIds: string[]) {
  return Array.from(new Set(productIds.filter(Boolean)));
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        setItems(normalizeWishlist(Array.isArray(parsed) ? parsed : []));
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

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      itemCount: items.length,
      addItem: (productId) => setItems((current) => normalizeWishlist([...current, productId])),
      removeItem: (productId) => setItems((current) => current.filter((item) => item !== productId)),
      toggleItem: (productId) =>
        setItems((current) =>
          current.includes(productId)
            ? current.filter((item) => item !== productId)
            : normalizeWishlist([...current, productId]),
        ),
      clearWishlist: () => setItems([]),
      isInWishlist: (productId) => items.includes(productId),
    }),
    [items],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const value = useContext(WishlistContext);
  if (!value) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return value;
}
