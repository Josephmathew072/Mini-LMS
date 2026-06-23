import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const isWeb = Platform.OS === 'web';

/**
 * Secure storage (tokens, auth data)
 * - Native: expo-secure-store
 * - Web: localStorage fallback (since SecureStore is unreliable on web)
 */
export const secureStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (isWeb) {
        localStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (err) {
      console.error('secureStorage.setItem error:', err);
    }
  },

  getItem: async (key: string): Promise<string | null> => {
    try {
      if (isWeb) {
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.error('secureStorage.getItem error:', err);
      return null;
    }
  },

  deleteItem: async (key: string): Promise<void> => {
    try {
      if (isWeb) {
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (err) {
      console.error('secureStorage.deleteItem error:', err);
    }
  },
};

/**
 * Non-sensitive storage (settings, cache, bookmarks)
 */
export const asyncStorage = {
  setItem: async (key: string, value: unknown): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error('asyncStorage.setItem error:', err);
    }
  },

  getItem: async <T>(key: string): Promise<T | null> => {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error('asyncStorage.getItem error:', err);
      return null;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.error('asyncStorage.removeItem error:', err);
    }
  },
};