import { create } from 'zustand';
import { asyncStorage } from '../services/storage';
import { STORAGE_KEYS } from '../utils/constants';

interface Settings {
  darkMode: boolean;
  notificationsEnabled: boolean;
}

interface SettingsState extends Settings {
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  darkMode: false,
  notificationsEnabled: true,

  toggleDarkMode: () => {
    const next = !get().darkMode;
    set({ darkMode: next });
    asyncStorage.setItem(STORAGE_KEYS.SETTINGS, {
      darkMode: next,
      notificationsEnabled: get().notificationsEnabled,
    });
  },

  toggleNotifications: () => {
    const next = !get().notificationsEnabled;
    set({ notificationsEnabled: next });
    asyncStorage.setItem(STORAGE_KEYS.SETTINGS, {
      darkMode: get().darkMode,
      notificationsEnabled: next,
    });
  },

  loadSettings: async () => {
    const saved = await asyncStorage.getItem<Settings>(STORAGE_KEYS.SETTINGS);
    if (saved) set(saved);
  },
}));
