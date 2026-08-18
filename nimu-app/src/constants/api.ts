import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * ─── API Base URL ────────────────────────────────────────────────────────────
 *
 * Loaded from environment variables (.env via process.env or expo-constants).
 * Fallback to local network IP if not set.
 */
// Auto-detect host computer IP from Expo Go
const getExpoHostIp = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;
  return hostUri ? hostUri.split(":")[0] : null;
};

const expoHostIp = getExpoHostIp();

const ENV_BASE =
  (expoHostIp ? `http://${expoHostIp}:8000` : null) ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "https://nimu-academy-backend.onrender.com";

const RAW_BASE_URL = ENV_BASE.endsWith("/api")
  ? ENV_BASE.slice(0, -4)
  : ENV_BASE;

export const API_BASE_URL =
  Platform.OS === "web"
    ? `http://localhost:8000/api`
    : `${RAW_BASE_URL}/api`;

export const ENDPOINTS = {
  // Auth — OTP-only (new)
  signupInitiate: "/auth/signup/initiate",
  signupVerify:   "/auth/signup/verify",
  loginInitiate:  "/auth/login/initiate",
  loginVerify:    "/auth/login/verify",
  otpResend:      "/auth/otp/resend",

  // Auth — Legacy aliases (kept for backward compat)
  login:     "/auth/login",
  register:  "/auth/register",
  signup:    "/auth/signup",
  verifyOtp: "/auth/verify-otp",
  resendOtp: "/auth/resend-otp",
  logout:    "/auth/logout",
  me:        "/auth/me",

  // Courses
  courses:       "/courses",
  courseDetail:  (id: string) => `/courses/${id}`,
  myEnrollments: "/enrollments/my",

  // Orders / Payments
  createOrder:   "/payments/create-order",
  verifyPayment: "/payments/verify",

  // Progress
  myProgress:         "/progress/my",
  courseProgress:     (courseId: string) => `/progress/course/${courseId}`,
  markVideoWatched:   (videoId: string)  => `/progress/video/${videoId}`,
};
