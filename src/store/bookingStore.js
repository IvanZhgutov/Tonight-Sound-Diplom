import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useBookingStore = create(
  persist(
    (set) => ({
      bookings: [],

      // Черновик формы записи: переживает уход на /login и перезагрузку,
      // чтобы выбранные день/время/комментарий не терялись
      draft: null,
      setDraft: (draft) => set({ draft }),
      clearDraft: () => set({ draft: null }),

      addBooking: (booking) =>
        set((s) => ({
          bookings: [
            {
              id: crypto.randomUUID(),
              status: 'wait',
              createdAt: Date.now(),
              ...booking,
            },
            ...s.bookings,
          ],
        })),

      cancelBooking: (id) =>
        set((s) => ({ bookings: s.bookings.filter((b) => b.id !== id) })),

      // Для админки: смена статуса заявки
      setStatus: (id, status) =>
        set((s) => ({
          bookings: s.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
        })),
    }),
    { name: 'ts-bookings' }
  )
);
