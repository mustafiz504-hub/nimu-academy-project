import { useState } from "react";
import { authService, LoginPayload, RegisterPayload } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

/** Extract a clean error message from an axios error */
function getErrorMessage(err: any, fallback: string): string {
  if (err?.code === "ECONNREFUSED" || err?.code === "ERR_NETWORK" || err?.message?.includes("Network Error")) {
    return "Cannot connect to server. Make sure the backend is running.";
  }
  if (err?.code === "ECONNABORTED") {
    return "Request timed out. Please check your internet connection.";
  }
  // Server sent back a message
  return err?.response?.data?.message || fallback;
}

export function useAuth() {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (payload: LoginPayload) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.login(payload);
      setUser(data.user, data.token);
    } catch (err: any) {
      const msg = getErrorMessage(err, "Login failed. Please try again.");
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.register(payload);
      setUser(data.user, data.token);
    } catch (err: any) {
      const msg = getErrorMessage(err, "Registration failed. Please try again.");
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { user, isAuthenticated, loading, error, login, register, logout };
}
