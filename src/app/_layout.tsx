import { ThemeProvider } from '@/context/ThemeContext';
import {
  handleInactivityReminder,
  requestNotificationPermission,
} from '@/services/notifications';
import { useAuthStore } from '@/stores/authStore';
import { useCourseStore } from '@/stores/courseStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import "../../global.css";

export default function RootLayout() {
  const { isLoading, restoreSession } = useAuthStore();
  const { hydrate } = useCourseStore();
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    async function boot() {
      // Run in parallel for speed
      await Promise.all([
        restoreSession(),
        hydrate(),
        loadSettings(),
        requestNotificationPermission(),
      ]);
      // Inactivity check after boot so it doesn't block app start
      handleInactivityReminder();
    }
    boot();
  }, []);

  // Show spinner until session restore is done — prevents routing race
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="course/[id]"
              options={{
                headerShown: true,
                title: 'Course Details',
                headerStyle: { backgroundColor: '#6366f1' },
                headerTintColor: '#ffffff',
                headerTitleStyle: { fontWeight: '700' },
              }}
            />
            <Stack.Screen
              name="webview/index"
              options={{
                headerShown: true,
                title: 'Course Content',
                headerStyle: { backgroundColor: '#6366f1' },
                headerTintColor: '#ffffff',
                headerTitleStyle: { fontWeight: '700' },
              }}
            />
          </Stack>
          <Toast />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
