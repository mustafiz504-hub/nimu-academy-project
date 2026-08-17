import { useState } from "react";
import {
  authService,
  SignupInitiatePayload,
  SignupInitiateResponse,
  SignupVerifyPayload,
  LoginInitiatePayload,
  LoginInitiateResponse,
  LoginVerifyPayload,
  OtpResendPayload,
  AuthResponse,
} from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

/** Extract a clean error message from an axios error */
function getErrorMessage(err: any, fallback: string): string {
  if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
    return err.response.data.errors.map((e: any) => Object.values(e).join(": ")).join("\n");
  }
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }
  if (err?.code === "ECONNREFUSED" || err?.code === "ERR_NETWORK" || err?.message?.includes("Network Error")) {
    return "Cannot connect to server. Make sure the backend is running.";
  }
  if (err?.code === "ECONNABORTED") {
    return "Request timed out. Please check your internet connection.";
  }
  return fallback;
}

export function useAuth() {
  const { user, isAuthenticated, setUser, logout: storeLogout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** POST /auth/signup/initiate */
  const signupInitiate = async (payload: SignupInitiatePayload): Promise<SignupInitiateResponse> => {
    try {
      setLoading(true);
      setError(null);
      return await authService.signupInitiate(payload);
    } catch (err: any) {
      const msg = getErrorMessage(err, "Signup failed. Please try again.");
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** POST /auth/signup/verify */
  const signupVerify = async (payload: SignupVerifyPayload): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.signupVerify(payload);
      setUser(data.user, data.token);
      return data;
    } catch (err: any) {
      const msg = getErrorMessage(err, "Verification failed. Please try again.");
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** POST /auth/login/initiate */
  const loginInitiate = async (payload: LoginInitiatePayload): Promise<LoginInitiateResponse> => {
    try {
      setLoading(true);
      setError(null);
      return await authService.loginInitiate(payload);
    } catch (err: any) {
      const msg = getErrorMessage(err, "Login failed. Please try again.");
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** POST /auth/login/verify */
  const loginVerify = async (payload: LoginVerifyPayload): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.loginVerify(payload);
      setUser(data.user, data.token);
      return data;
    } catch (err: any) {
      const msg = getErrorMessage(err, "Login verification failed. Please try again.");
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** POST /auth/otp/resend */
  const resendOtp = async (payload: OtpResendPayload): Promise<{ message: string }> => {
    try {
      setLoading(true);
      setError(null);
      return await authService.resendOtp(payload);
    } catch (err: any) {
      const msg = getErrorMessage(err, "Could not resend OTP. Please try again.");
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    storeLogout();
  };

  // Legacy stubs — keep so old code doesn't break immediately
  const register = signupInitiate as any;
  const login = loginInitiate as any;

  return {
    user,
    isAuthenticated,
    loading,
    error,
    // New OTP methods
    signupInitiate,
    signupVerify,
    loginInitiate,
    loginVerify,
    resendOtp,
    logout,
    // Legacy aliases
    login,
    register,
  };
}
