import { useTheme } from '@/context/ThemeContext';
import { asyncStorage } from '@/services/storage';
import { useAuthStore } from '@/stores/authStore';
import { useCourseStore } from '@/stores/courseStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { STORAGE_KEYS } from '@/utils/constants';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, logout, updateAvatar } = useAuthStore();
  const { bookmarkedIds, enrolledIds, completedIds } = useCourseStore();
  const { notificationsEnabled, toggleNotifications } = useSettingsStore();
  const { colors, isDarkMode, setThemeMode } = useTheme();
  const router = useRouter();
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [themeMode, setThemeModeSaved] = useState<'system' | 'light' | 'dark'>('system');

  useEffect(() => {
    asyncStorage.getItem<string>(STORAGE_KEYS.PROFILE_AVATAR).then((saved) => {
      if (saved) setLocalAvatar(saved);
    });
    asyncStorage.getItem<'system' | 'light' | 'dark'>(STORAGE_KEYS.THEME_MODE).then((saved) => {
      if (saved) setThemeModeSaved(saved);
    });
  }, []);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your photos to update your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setLocalAvatar(uri);
      updateAvatar(uri);
      await asyncStorage.setItem(STORAGE_KEYS.PROFILE_AVATAR, uri);
    }
  };

  const handleThemeChange = async () => {
    const modes: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];
    const currentIndex = modes.indexOf(themeMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setThemeModeSaved(nextMode);
    await setThemeMode(nextMode);
  };

  const handleLogout = () => {
    const onConfirm = async () => {
      await logout();
      router.replace('/login');
    };

    if (Platform.OS === 'web') {
      const ok = window.confirm('Are you sure you want to sign out?');
      if (ok) onConfirm();
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: onConfirm,
      },
    ]);
  };

  const avatarSource = localAvatar
    ? { uri: localAvatar }
    : user?.avatarUrl
      ? { uri: user.avatarUrl }
      : { uri: 'https://i.pravatar.cc/150?u=' + (user?.email ?? 'default') };

  const displayName = user?.username ?? 'Learner';
  const themeLabel = themeMode === 'system' ? '🔄 System' : isDarkMode ? '🌙 Dark' : '☀️ Light';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar */}
        <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage} activeOpacity={0.8}>
          <Image source={avatarSource} style={styles.avatar} />
          <View style={[styles.editBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.editBadgeText}>✏️</Text>
          </View>
        </TouchableOpacity>

        <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
        {user?.email && <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatBox label="Enrolled" value={enrolledIds.length} emoji="📚" colors={colors} />
          <StatBox label="Saved" value={bookmarkedIds.length} emoji="🔖" colors={colors} />
          <StatBox label="Done" value={completedIds.length} emoji="✅" colors={colors} />
        </View>

        {/* Settings section */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Settings</Text>

          <View style={[styles.settingRow, { borderBottomColor: colors.border, borderBottomWidth: 1, paddingBottom: 12 }]}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>🌓 Appearance</Text>
            <TouchableOpacity 
              onPress={handleThemeChange}
              style={[styles.themeModeBtn, { backgroundColor: colors.primaryLight }]}
            >
              <Text style={[styles.themeModeText, { color: colors.primary }]}>{themeLabel}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.settingRow, { marginTop: 12 }]}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>🔔 Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.surface}
            />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.error + '15', borderColor: colors.error + '40' }]} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, emoji, colors }: { label: string; value: number; emoji: string; colors: any }) {
  return (
    <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#6366f1',
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
  },
  editBadgeText: { fontSize: 13 },
  name: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 28,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }),
  },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    width: '100%',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }),
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  themeModeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  themeModeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  logoutBtn: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  logoutText: {
    fontWeight: '700',
    fontSize: 15,
  },
});
