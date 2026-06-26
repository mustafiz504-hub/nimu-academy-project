import { Platform } from "react-native";

/**
 * ─── API Base URL ────────────────────────────────────────────────────────────
 *
 * Android Emulator  → 10.0.2.2  (maps to host machine's localhost)
 * iOS Simulator     → localhost
 * Physical Device   → your machine's LAN IP (auto-detected below)
 *
 * Your machine's current LAN IP: 10.67.96.66
 * If this changes (different WiFi), update MACHINE_IP below.
 */
const MACHINE_IP = "10.67.96.66";
const PORT = "8000";

const API_BASE_URL_MAP = {
  android: `http://10.0.2.2:${PORT}/api`,          // Android emulator
  ios:     `http://localhost:${PORT}/api`,           // iOS simulator
  web:     `http://localhost:${PORT}/api`,           // Expo web
} as const;

// For physical device (Expo Go), use the machine LAN IP
// Expo Go runs on device — needs real network IP
const isExpoGo = !__DEV__ === false; // always true in dev builds

export const API_BASE_URL =
  __DEV__
    ? `http://${MACHINE_IP}:${PORT}/api`   // Any device on same WiFi (universal)
    : `http://${MACHINE_IP}:${PORT}/api`;  // Replace with your production URL

export const ENDPOINTS = {
  // Auth
  login:    "/auth/login",
  register: "/auth/register",
  logout:   "/auth/logout",
  me:       "/auth/me",

  // Courses
  courses:       "/courses",
  courseDetail:  (id: string) => `/courses/${id}`,
  myEnrollments: "/enrollments/my",

  // Orders / Payments
  createOrder:   "/orders",
  verifyPayment: "/orders/verify",
};
