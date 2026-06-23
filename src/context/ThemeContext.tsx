import { asyncStorage } from '@/services/storage';
import { STORAGE_KEYS } from '@/utils/constants';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

export const COLORS = {
  light: {
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceAlt: '#f1f5f9',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    primary: '#6366f1',
    primaryLight: '#e0e7ff',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  dark: {
    background: '#0f172a',
    surface: '#1e293b',
    surfaceAlt: '#334155',
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    border: '#475569',
    primary: '#818cf8',
    primaryLight: '#4f46e5',
    success: '#16a34a',
    error: '#dc2626',
    warning: '#d97706',
  },
};

export type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  isDarkMode: boolean;
  colorScheme: ColorScheme;
  colors: typeof COLORS.light;
  toggleTheme: () => void;
  setThemeMode: (mode: 'system' | ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [savedThemeMode, setSavedThemeMode] = useState<'system' | ColorScheme>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on mount
  useEffect(() => {
    asyncStorage.getItem<'system' | ColorScheme>(STORAGE_KEYS.THEME_MODE).then((saved) => {
      if (saved) {
        setSavedThemeMode(saved);
      }
      setIsLoading(false);
    });
  }, []);

  // Determine effective color scheme
  const effectiveColorScheme: ColorScheme =
    savedThemeMode === 'system'
      ? (systemColorScheme as ColorScheme) || 'light'
      : savedThemeMode;

  const isDarkMode = effectiveColorScheme === 'dark';
  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  const toggleTheme = async () => {
    if (savedThemeMode === 'system') {
      // Switch to opposite of current system scheme
      const newMode: ColorScheme = isDarkMode ? 'light' : 'dark';
      setSavedThemeMode(newMode);
      await asyncStorage.setItem(STORAGE_KEYS.THEME_MODE, newMode);
    } else {
      // Switch to system
      setSavedThemeMode('system');
      await asyncStorage.setItem(STORAGE_KEYS.THEME_MODE, 'system');
    }
  };

  const setThemeMode = async (mode: 'system' | ColorScheme) => {
    setSavedThemeMode(mode);
    await asyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  };

  const value: ThemeContextType = {
    isDarkMode,
    colorScheme: effectiveColorScheme,
    colors,
    toggleTheme,
    setThemeMode,
  };

  // Don't render until theme is loaded to prevent flash
  if (isLoading) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
