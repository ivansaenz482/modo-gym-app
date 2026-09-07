import { create } from 'zustand';
import { Product, subscribeToProducts, isFirebaseConfigured } from '../services/storeService';

type State = {
  products: Product[];
  loading: boolean;
  error: string | null;
  configured: boolean;
  subscribe: () => () => void;
  setProducts: (p: Product[]) => void;
};

export const useStore = create<State>((set) => ({
  products: [],
  loading: true,
  error: null,
  configured: isFirebaseConfigured(),
  subscribe: () => subscribeToProducts(
    (products) => set({ products, loading: false, error: null }),
    (e) => set({ error: e.message, loading: false }),
  ),
  setProducts: (products) => set({ products }),
}));
