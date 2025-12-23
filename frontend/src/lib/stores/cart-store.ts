import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  courseId: number;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  deliveryMethod: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (courseId: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed
  getItemCount: () => number;
  getTotalPrice: () => number;
  hasItem: (courseId: number) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.courseId === item.courseId);

        if (existingItem) {
          // Course already in cart - don't add duplicates
          return;
        }

        const newItem: CartItem = {
          ...item,
          id: Date.now(),
        };

        set({ items: [...items, newItem] });
      },

      removeItem: (courseId) => {
        set({ items: get().items.filter((item) => item.courseId !== courseId) });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getItemCount: () => get().items.length,

      getTotalPrice: () => get().items.reduce((acc, item) => acc + item.price, 0),

      hasItem: (courseId) => get().items.some((item) => item.courseId === courseId),
    }),
    {
      name: 'seitech-cart',
    }
  )
);
