import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ADMIN_CREDENTIALS } from '../general/constants';

// Мок-авторизация на localStorage. Пароли хранятся в открытом виде —
// это только для демо, при подключении бэкенда логика заменится.
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      users: [],

      register: ({ name, email, phone, password }) => {
        if (email.toLowerCase() === ADMIN_CREDENTIALS.email) {
          return { ok: false, error: 'Этот email зарезервирован' };
        }
        const exists = get().users.some(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (exists) {
          return { ok: false, error: 'Пользователь с таким email уже существует' };
        }
        const user = {
          id: crypto.randomUUID(),
          name,
          email,
          phone,
          password,
        };
        set((s) => ({ users: [...s.users, user], user }));
        return { ok: true };
      },

      login: (email, password) => {
        // Мок-админ: при подключении бэкенда роль будет приходить с сервера
        if (email.toLowerCase() === ADMIN_CREDENTIALS.email) {
          if (password !== ADMIN_CREDENTIALS.password) {
            return { ok: false, error: 'Неверный пароль' };
          }
          set({
            user: { id: 'admin', name: 'Администратор', email, isAdmin: true },
          });
          return { ok: true, isAdmin: true };
        }

        const user = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (!user) return { ok: false, error: 'Аккаунт с таким email не найден' };
        if (user.password !== password) return { ok: false, error: 'Неверный пароль' };
        set({ user });
        return { ok: true };
      },

      logout: () => set({ user: null }),
    }),
    { name: 'ts-auth' }
  )
);
