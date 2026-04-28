import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  // ─── State ─────────────────────────────────────────────────────────────────
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isHydrated: false,

  // ─── Hydrate from SecureStore ───────────────────────────────────────────────
  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        set({ token, isAuthenticated: true, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch {
      set({ isHydrated: true });
    }
  },

  // ─── Login ──────────────────────────────────────────────────────────────────
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authAPI.login({ email, password });
      const { token } = res.data;
      await SecureStore.setItemAsync('auth_token', token);
      set({ token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Try again.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // ─── Register ───────────────────────────────────────────────────────────────
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authAPI.register(userData);
      const { token } = res.data;
      await SecureStore.setItemAsync('auth_token', token);
      set({ token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // ─── Logout ─────────────────────────────────────────────────────────────────
  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
