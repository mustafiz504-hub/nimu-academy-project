import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "nimu_auth_token";
const USER_KEY = "nimu_user";

// expo-secure-store is native only — fall back to localStorage on web
const isWeb = Platform.OS === "web";

const store = {
  async get(key: string): Promise<string | null> {
    if (isWeb) return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (isWeb) { localStorage.setItem(key, value); return; }
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string): Promise<void> {
    if (isWeb) { localStorage.removeItem(key); return; }
    await SecureStore.deleteItemAsync(key);
  },
};

export const storage = {
  async saveToken(token: string): Promise<void> {
    await store.set(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return store.get(TOKEN_KEY);
  },

  async removeToken(): Promise<void> {
    await store.remove(TOKEN_KEY);
  },

  async saveUser(user: object): Promise<void> {
    await store.set(USER_KEY, JSON.stringify(user));
  },

  async getUser<T>(): Promise<T | null> {
    const raw = await store.get(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async removeUser(): Promise<void> {
    await store.remove(USER_KEY);
  },

  async clearAll(): Promise<void> {
    await store.remove(TOKEN_KEY);
    await store.remove(USER_KEY);
  },
};
