import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { apiError } from '../api/client';

export const useBookingStore = create(
  persist(
    (set, get) => ({
      bookings: [],
      loading: false,
      error: null,

      // Черновик формы записи: переживает уход на /login и перезагрузку
      draft: null,
      setDraft: (draft) => set({ draft }),
      clearDraft: () => set({ draft: null }),

      fetchBookings: async () => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.get('/bookings');
          set({ bookings: data.data ?? [], loading: false });
        } catch (e) {
          set({ loading: false, error: apiError(e).message });
        }
      },

      createBooking: async (payload) => {
        try {
          const { data } = await api.post('/bookings', payload);
          set((s) => ({ bookings: [data.booking, ...s.bookings] }));
          return { ok: true, message: data.message };
        } catch (e) {
          return { ok: false, ...apiError(e) };
        }
      },

      cancelBooking: async (id) => {
        const previous = get().bookings;
        // оптимистично убираем из списка, при ошибке откатываем
        set({ bookings: previous.filter((b) => b.id !== id) });
        try {
          await api.delete(`/bookings/${id}`);
          return { ok: true };
        } catch (e) {
          set({ bookings: previous });
          return { ok: false, ...apiError(e) };
        }
      },
    }),
    {
      name: 'ts-bookings',
      partialize: (s) => ({ draft: s.draft }), // в storage живёт только черновик
    }
  )
);
