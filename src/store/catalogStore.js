import { create } from 'zustand';
import api, { apiError } from '../api/client';

// Каталог студии: услуги и плагины с бэкенда
export const useCatalogStore = create((set) => ({
  services: [],
  servicesLoading: false,
  servicesFetched: false,

  plugins: [],
  pluginsLoading: false,
  pluginsFetched: false,

  fetchServices: async () => {
    set({ servicesLoading: true });
    try {
      const { data } = await api.get('/services');
      set({ services: data.data ?? [], servicesLoading: false, servicesFetched: true });
    } catch {
      set({ servicesLoading: false });
    }
  },

  fetchPlugins: async () => {
    set({ pluginsLoading: true });
    try {
      const { data } = await api.get('/plugins');
      set({ plugins: data.data ?? [], pluginsLoading: false, pluginsFetched: true });
    } catch {
      set({ pluginsLoading: false });
    }
  },

  requestPlugin: async (name) => {
    try {
      const { data } = await api.post('/plugins/requests', { name });
      set((s) => ({ plugins: [...s.plugins, data.plugin] }));
      return { ok: true, message: data.message };
    } catch (e) {
      return { ok: false, ...apiError(e) };
    }
  },
}));
