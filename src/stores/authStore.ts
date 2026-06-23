import { create } from 'zustand';
import { secureStorage, asyncStorage } from '../services/storage';
import { authApi } from '../api/endpoints';
import type { User } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateAvatar: (uri: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const { user, accessToken, refreshToken } = await authApi.login(email, password);
    await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    await asyncStorage.setItem('cachedUser', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  register: async (username, email, password) => {
    const { user, accessToken, refreshToken } = await authApi.register(
      username,
      email,
      password,
    );
    await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    await asyncStorage.setItem('cachedUser', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await secureStorage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
    await secureStorage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);

    await asyncStorage.removeItem('cachedUser');
    await asyncStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
    await asyncStorage.removeItem(STORAGE_KEYS.ENROLLED);
    await asyncStorage.removeItem(STORAGE_KEYS.CACHED_COURSES);
    await asyncStorage.removeItem(STORAGE_KEYS.PROFILE_AVATAR);

    set({
      user: null,
      isAuthenticated: false,
    });
  },

  restoreSession: async () => {
    try {
      const token = await secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (token) {
        const cachedUserRaw = await asyncStorage.getItem<string>('cachedUser');
        const cachedUser = cachedUserRaw ? JSON.parse(cachedUserRaw) : null;
        set({ isAuthenticated: true, user: cachedUser });
      }
    } catch(e) {
      console.log('restoreSession error:', e);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  updateAvatar: (uri: string) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, avatarUrl: uri };
    set({ user: updated });
    asyncStorage.setItem('cachedUser', updated);
  },
}));
