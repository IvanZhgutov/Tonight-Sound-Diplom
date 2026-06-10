import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { apiError, getToken, setToken, clearToken, setOnUnauthorized } from '../api/client';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      // true, когда первичная проверка сессии завершена —
      // до этого ProtectedRoute не делает выводов
      initialized: false,

      register: async ({ name, email, phone, password, password2 }) => {
        try {
          const { data } = await api.post('/auth/register', {
            name,
            email,
            phone,
            password,
            password_confirmation: password2,
          });
          setToken(data.token);
          set({ user: data.user, initialized: true });
          return { ok: true, user: data.user };
        } catch (e) {
          return { ok: false, ...apiError(e) };
        }
      },

      login: async (email, password) => {
        try {
          const { data } = await api.post('/auth/login', { email, password });
          setToken(data.token);
          set({ user: data.user, initialized: true });
          return { ok: true, user: data.user };
        } catch (e) {
          return { ok: false, ...apiError(e) };
        }
      },

      // Проверка сессии при старте приложения
      fetchMe: async () => {
        if (!getToken()) {
          set({ user: null, initialized: true });
          return;
        }
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.data ?? data, initialized: true });
        } catch {
          // 401 уже обработан интерцептором
          set({ user: null, initialized: true });
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // токен мог уже протухнуть — выходим локально в любом случае
        }
        clearToken();
        set({ user: null });
      },

      forceLogout: () => set({ user: null }),
    }),
    {
      name: 'ts-auth',
      partialize: (s) => ({ user: s.user }),
    }
  )
);

// 401 из интерцептора → локальный разлогин
setOnUnauthorized(() => useAuthStore.getState().forceLogout());
