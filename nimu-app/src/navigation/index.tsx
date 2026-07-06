// src/navigation/index.tsx
// Root navigation entry — re-exports navigators for use in app/index.tsx

export { default as BottomTabNavigator } from "./BottomTabNavigator";
export type { TabName } from "./BottomTabNavigator";
export { LoginScreen, RegisterScreen } from "./AuthNavigator";
