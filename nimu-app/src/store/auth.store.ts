import { create } from "zustand";
import { authService } from "../services/auth.service";
import { storage } from "../utils/storage";
import api from "../services/api";
import type { User, AuthState } from "../types/user.types";

interface AuthStore extends AuthState {
  setUser: (user: User, token: string) => void;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setUser: (user, token) =>
    set({ user, token, isAuthenticated: true }),

  logout: async () => {
    await authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateName: async (name: string) => {
    const res = await api.put('/user/profile', { name });
    const updatedUser = { ...get().user!, name: res.data.user?.name ?? name };
    await storage.saveUser(updatedUser);
    set({ user: updatedUser });
  },

  /**
   * Called on app launch — restores session from SecureStore.
   * If a token exists, also validates it against /api/auth/me.
   */
  loadFromStorage: async () => {
    const token = await storage.getToken();
    const cachedUser = await storage.getUser<User>();

    if (!token) return; // not logged in

    // Optimistically restore from cache first (fast)
    if (cachedUser) {
      set({ user: cachedUser, token, isAuthenticated: true });
    }

    // Then validate token against server in background
    try {
      const freshUser = await authService.getMe();
      await storage.saveUser(freshUser);
      set({ user: freshUser, token, isAuthenticated: true });
    } catch (err: any) {
      // 401 = token expired → log out
      if (err?.response?.status === 401) {
        await storage.clearAll();
        set({ user: null, token: null, isAuthenticated: false });
      }
      // Other errors (network down) → keep cached session
    }
  },
}));

