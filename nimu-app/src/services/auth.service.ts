import api from "./api";
import { storage } from "../utils/storage";
import { ENDPOINTS } from "../constants/api";
import type { User } from "../types/user.types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// Server response shape for login & register:
// { message: string, token: string, user: { id, name, email, role } }
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const authService = {
  /**
   * POST /api/auth/login
   * Body: { email, password }
   * Returns: { message, token, user }
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(ENDPOINTS.login, payload);
    // Persist session
    await storage.saveToken(data.token);
    await storage.saveUser(data.user);
    return data;
  },

  /**
   * POST /api/auth/register
   * Body: { name, email, password, phone? }
   * Returns: { message, token, user }
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(ENDPOINTS.register, payload);
    await storage.saveToken(data.token);
    await storage.saveUser(data.user);
    return data;
  },

  /**
   * POST /api/auth/logout
   * Stateless on server — just clears local storage
   */
  async logout(): Promise<void> {
    try {
      await api.post(ENDPOINTS.logout);
    } catch {
      // ignore network errors on logout
    } finally {
      await storage.clearAll();
    }
  },

  /**
   * GET /api/auth/me  (requires Bearer token)
   * Server returns: { user: { id, name, email, phone, role, created_at } }
   */
  async getMe(): Promise<User> {
    const { data } = await api.get<{ user: User }>(ENDPOINTS.me);
    return data.user;
  },
};
