import api from "./api";
import { storage } from "../utils/storage";
import { ENDPOINTS } from "../constants/api";
import type { User } from "../types/user.types";

// ─── OTP Auth Payloads (new) ──────────────────────────────────────────────────

export interface SignupInitiatePayload {
  name: string;
  email: string;
  password: string;
  terms_agreed: boolean;
  marketing_opt_in?: boolean;
}

export interface SignupInitiateResponse {
  message: string;
  email?: string;
  maskedEmail?: string;
  maskedPhone?: string;
}

export interface SignupVerifyPayload {
  email: string;
  otp: string;
}

export interface LoginInitiatePayload {
  email: string;
  password: string;
}

export interface LoginInitiateResponse {
  message: string;
  channel?: "email" | "phone";
  maskedTarget?: string;
  identifier?: string;
}

export interface LoginVerifyPayload {
  identifier: string;
  otp: string;
}

export interface OtpResendPayload {
  identifier: string;
  purpose: "signup" | "login";
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// ─── Legacy types (kept for backward compat references) ───────────────────────

/** @deprecated Use SignupInitiatePayload instead */
export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
}

/** @deprecated Use LoginInitiatePayload instead */
export interface LoginPayload {
  email: string;
  password?: string;
}

/** @deprecated */
export interface SignupResponse {
  message: string;
  email: string;
}

/** @deprecated Use SignupVerifyPayload */
export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

/** @deprecated Use OtpResendPayload */
export interface ResendOtpPayload {
  email: string;
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  // ── NEW: OTP-only methods ──────────────────────────────────────────────────

  /**
   * POST /api/auth/signup/initiate
   * Sends OTP to both email + phone simultaneously.
   */
  async signupInitiate(payload: SignupInitiatePayload): Promise<SignupInitiateResponse> {
    const { data } = await api.post<SignupInitiateResponse>(ENDPOINTS.signupInitiate, payload);
    return data;
  },

  /**
   * POST /api/auth/signup/verify
   * Verifies OTP, creates account, returns JWT.
   */
  async signupVerify(payload: SignupVerifyPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(ENDPOINTS.signupVerify, payload);
    await storage.saveToken(data.token);
    await storage.saveUser(data.user);
    return data;
  },

  /**
   * POST /api/auth/login/initiate
   * Detects email/phone, sends OTP to that channel.
   */
  async loginInitiate(payload: LoginInitiatePayload): Promise<LoginInitiateResponse> {
    const { data } = await api.post<LoginInitiateResponse>(ENDPOINTS.loginInitiate, payload);
    return data;
  },

  /**
   * POST /api/auth/login/verify
   * Verifies OTP, issues JWT.
   */
  async loginVerify(payload: LoginVerifyPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(ENDPOINTS.loginVerify, payload);
    await storage.saveToken(data.token);
    await storage.saveUser(data.user);
    return data;
  },

  /**
   * POST /api/auth/otp/resend
   * Rate-limited resend (60s cooldown, max 3 per session).
   */
  async resendOtp(payload: OtpResendPayload): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(ENDPOINTS.otpResend, payload);
    return data;
  },

  /**
   * POST /api/auth/logout — stateless on server, clears local storage.
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
   * GET /api/auth/me — requires Bearer token.
   */
  async getMe(): Promise<User> {
    const { data } = await api.get<{ user: User }>(ENDPOINTS.me);
    return data.user;
  },

  // ── DEPRECATED: kept so old call sites compile until fully migrated ─────────

  /** @deprecated Use signupInitiate + signupVerify instead */
  async signup(payload: RegisterPayload): Promise<SignupResponse> {
    const { data } = await api.post<SignupResponse>(ENDPOINTS.signup, payload);
    return data;
  },

  /** @deprecated Use signupInitiate + signupVerify instead */
  async register(payload: RegisterPayload): Promise<SignupResponse> {
    const { data } = await api.post<SignupResponse>(ENDPOINTS.register, payload);
    return data;
  },

  /** @deprecated Use loginInitiate + loginVerify instead */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(ENDPOINTS.login, payload);
    await storage.saveToken(data.token);
    await storage.saveUser(data.user);
    return data;
  },

  /** @deprecated Use signupVerify / loginVerify instead */
  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(ENDPOINTS.verifyOtp, payload);
    await storage.saveToken(data.token);
    await storage.saveUser(data.user);
    return data;
  },
};
