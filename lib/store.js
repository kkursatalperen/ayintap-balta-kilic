'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCart = create(persist((set, get) => ({
  items: [],
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  add: (product, opts = {}) => {
    const items = [...get().items];
    const personalization = opts.personalization || null;
    const key = product.id + (personalization ? ':' + personalization : '');
    const existing = items.find((i) => i.key === key);
    if (existing) existing.qty += opts.qty || 1;
    else items.push({
      key,
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0] || product.image,
      price: product.price,
      personalization,
      personalizationPrice: personalization ? (product.personalizationPrice || 250) : 0,
      qty: opts.qty || 1,
    });
    set({ items, isOpen: true });
  },
  remove: (key) => set({ items: get().items.filter((i) => i.key !== key) }),
  setQty: (key, qty) => set({ items: get().items.map((i) => i.key === key ? { ...i, qty: Math.max(1, qty) } : i) }),
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((s, i) => s + (i.price + i.personalizationPrice) * i.qty, 0),
  count: () => get().items.reduce((s, i) => s + i.qty, 0),
}), {
  name: 'ayintap-cart',
  onRehydrateStorage: () => (state) => {
    state?.setHasHydrated(true);
  },
}));

export const useAuth = create(persist((set) => ({
  user: null,
  token: null,
  setUser: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}), { name: 'ayintap-auth' }));

