import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const tokenKey = "health-kundali-auth-token";

function getWebStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export async function readAuthToken() {
  if (Platform.OS === "web") {
    return getWebStorage()?.getItem(tokenKey) ?? null;
  }

  return SecureStore.getItemAsync(tokenKey);
}

export async function saveAuthToken(token: string) {
  if (Platform.OS === "web") {
    getWebStorage()?.setItem(tokenKey, token);
    return;
  }

  await SecureStore.setItemAsync(tokenKey, token);
}

export async function clearAuthToken() {
  if (Platform.OS === "web") {
    getWebStorage()?.removeItem(tokenKey);
    return;
  }

  await SecureStore.deleteItemAsync(tokenKey);
}