import { create } from 'zustand';
import { userAPI } from '../services/api';

const useUserStore = create((set, get) => ({
  // ─── State ─────────────────────────────────────────────────────────────────
  profile: null,
  isLoading: false,
  error: null,

  // ─── Fetch Profile ──────────────────────────────────────────────────────────
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await userAPI.getProfile();
      set({ profile: res.data, isLoading: false });
      return { success: true, data: res.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load profile.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // ─── Update Profile ─────────────────────────────────────────────────────────
  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await userAPI.updateProfile(data);
      set({ profile: res.data, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Update failed.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  // ─── Optimistic XP Update ───────────────────────────────────────────────────
  addXP: (amount) => {
    const { profile } = get();
    if (!profile) return;
    const newXP = (profile.xp || 0) + amount;
    const newLevel = Math.floor(newXP / 500) + 1;
    set({ profile: { ...profile, xp: newXP, level: newLevel } });
  },

  clearProfile: () => set({ profile: null, error: null }),
}));

export default useUserStore;
