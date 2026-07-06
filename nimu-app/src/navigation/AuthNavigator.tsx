import React from "react";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

// Auth navigator — shows Login or Register based on local state.
// In a full Expo Router setup, these would be file-based routes under /app/(auth)/
// For now, this exports the screens for use by the root navigator.

export { LoginScreen, RegisterScreen };
