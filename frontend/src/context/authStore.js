import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        set({ user: data.user, token: data.token, isAuthenticated: true });
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        return data;
      },

      register: async (username, email, password) => {
        const { data } = await api.post('/auth/register', { username, email, password });
        set({ user: data.user, token: data.token, isAuthenticated: true });
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        return data;
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        set({ user: null, token: null, isAuthenticated: false });
        delete api.defaults.headers.common['Authorization'];
      },

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);
