import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Запрошенные пользователями плагины.
// pending → показывается с тегом «Скоро»; админ принимает (тег «Новинка») или отклоняет.
export const usePluginStore = create(
  persist(
    (set, get) => ({
      requested: [],

      requestPlugin: (name) => {
        const clean = name.trim();
        if (!clean) return { ok: false, error: 'Введите название плагина' };
        const exists = get().requested.some(
          (p) => p.name.toLowerCase() === clean.toLowerCase()
        );
        if (exists) {
          return { ok: false, error: 'Этот плагин уже в списке на добавление' };
        }
        set((s) => ({
          requested: [
            ...s.requested,
            {
              id: crypto.randomUUID(),
              name: clean,
              vendor: 'По запросу артиста',
              version: '—',
              category: 'Скоро',
              pending: true,
              createdAt: Date.now(),
            },
          ],
        }));
        return { ok: true };
      },

      // Админка: плагин куплен и установлен
      approveRequest: (id) =>
        set((s) => ({
          requested: s.requested.map((p) =>
            p.id === id
              ? { ...p, pending: false, category: 'Новинка', version: 'v1.0', vendor: 'Установлен в студии' }
              : p
          ),
        })),

      // Админка: отклонить запрос
      removeRequest: (id) =>
        set((s) => ({ requested: s.requested.filter((p) => p.id !== id) })),
    }),
    { name: 'ts-plugins' }
  )
);
