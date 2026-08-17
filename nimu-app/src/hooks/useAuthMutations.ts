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

function getErrorMessage(err: any, fallback: string): string {
  if (err?.code === "ECONNREFUSED" || err?.code === "ERR_NETWORK" || err?.message?.includes("Network Error")) {
    return "Cannot connect to server. Make sure the backend is running.";
  }
  if (err?.code === "ECONNABORTED") {
    return "Request timed out. Please check your connection.";
  }
  return err?.response?.data?.message || fallback;
}

// ─── Signup Initiate Mutation ──────────────────────────────────────────────────
export function useSignupInitiateMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutateAsync = async (payload: SignupInitiatePayload): Promise<SignupInitiateResponse> => {
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

  return { mutateAsync, loading, isPending: loading, error };
}

// ─── Signup Verify Mutation ────────────────────────────────────────────────────
export function useSignupVerifyMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuthStore();

  const mutateAsync = async (payload: SignupVerifyPayload): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);
      const res = await authService.signupVerify(payload);
      setUser(res.user, res.token);
      return res;
    } catch (err: any) {
      const msg = getErrorMessage(err, "Verification failed. Please try again.");
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutateAsync, loading, isPending: loading, error };
}

// ─── Login Initiate Mutation ───────────────────────────────────────────────────
export function useLoginInitiateMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutateAsync = async (payload: LoginInitiatePayload): Promise<LoginInitiateResponse> => {
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

  return { mutateAsync, loading, isPending: loading, error };
}

// ─── Login Verify Mutation ─────────────────────────────────────────────────────
export function useLoginVerifyMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuthStore();

  const mutateAsync = async (payload: LoginVerifyPayload): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);
      const res = await authService.loginVerify(payload);
      setUser(res.user, res.token);
      return res;
    } catch (err: any) {
      const msg = getErrorMessage(err, "Verification failed. Please try again.");
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutateAsync, loading, isPending: loading, error };
}

// ─── OTP Resend Mutation ───────────────────────────────────────────────────────
export function useResendOtpMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutateAsync = async (payload: OtpResendPayload): Promise<{ message: string }> => {
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

  return { mutateAsync, loading, isPending: loading, error };
}

// ─── Legacy aliases (for any old imports that haven't been updated) ────────────

/** @deprecated Use useSignupInitiateMutation instead */
export function useSignupMutation() {
  return useSignupInitiateMutation();
}

/** @deprecated Use useSignupVerifyMutation / useLoginVerifyMutation */
export function useVerifyOtpMutation() {
  return useSignupVerifyMutation();
}
