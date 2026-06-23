import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

import { OfflineBanner } from '@/components/OfflineBanner';
import { useTheme } from '@/context/ThemeContext';
import { useNetwork } from '@/hooks/useNetwork';
import { useAuthStore } from '@/stores/authStore';
import { useCourseStore } from '@/stores/courseStore';
import { buildCourseHTML } from '@/utils/helpers';
import { showToast } from '@/utils/showToast';

const INJECT_ON_LOAD = `
  (function() {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: 'WEBVIEW_READY' })
    );
  })();
  true;
`;

export default function WebViewScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { colors, isDarkMode } = useTheme();
  const { courses, completedIds, markCourseComplete } = useCourseStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const isConnected = useNetwork();

  const webviewRef = useRef<WebView>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [loadError, setLoadError] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<'idle' | 'connected'>('idle');
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  const course = courses.find((c) => c.id === courseId);
  const isCompleted = courseId && completedIds.includes(courseId);

  const handleMarkComplete = async () => {
    if (!courseId) return;

    try {
      await markCourseComplete(courseId);
      showToast('Course completed! 🎉', 'Great job! Keep learning.');
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error) {
      showToast('Error', 'Failed to mark course as complete.');
    }
  };

  // ---------------------------
  // MOBILE WEBVIEW MESSAGES
  // ---------------------------
  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.type === 'WEBVIEW_READY') {
          setBridgeStatus('connected');

          const injectUser = `
            (function() {
              var el = document.querySelector('.hero h1');
              if (el) {
                el.insertAdjacentHTML(
                  'afterend',
                  '<p style="font-size:12px;opacity:0.8;margin-top:4px">👤 Viewing as ${user?.username ?? 'Guest'
            }</p>'
                );
              }
            })();
            true;
          `;

          webviewRef.current?.injectJavaScript(injectUser);
        }

        if (data.type === 'LESSON_SELECTED') {
          setSelectedLesson(data.lesson);
          Alert.alert('Lesson Selected', `Opening Lesson ${data.lesson}`);
        }
      } catch {
        // ignore
      }
    },
    [user?.username],
  );

  // ---------------------------
  // WEB (IFRAME) MESSAGES
  // ---------------------------
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handler = (event: MessageEvent) => {
      const data = event.data;

      if (data?.type === 'LESSON_SELECTED') {
        setSelectedLesson(data.lesson);
        Alert.alert('Lesson Selected', `Opening Lesson ${data.lesson}`);
      }

      if (data?.type === 'WEBVIEW_READY') {
        setBridgeStatus('connected');
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleRetry = useCallback(() => {
    webviewRef.current?.reload();
    setLoadError(false);
  }, []);

  if (!course) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.text }]}>Course not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={[styles.errorText, { color: colors.text }]}>Failed to load course content.</Text>

          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={handleRetry}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const htmlContent = buildCourseHTML(
    course,
    colors,
    isDarkMode,
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      {!isConnected && <OfflineBanner />}

      {/* Bridge status */}
      {bridgeStatus === 'connected' && (
        <View style={[styles.bridgeBadge, { backgroundColor: colors.surface }]}>
          <Text style={[styles.bridgeText, { color: colors.primary }]}>🔗 WebView bridge active</Text>
        </View>
      )}

      {/* Lesson status */}
      {selectedLesson !== null && (
        <View style={[styles.lessonBadge, { backgroundColor: colors.surface }]}>
          <Text style={[styles.lessonText, { color: colors.primary }]}>📖 Lesson {selectedLesson}</Text>
        </View>
      )}

      {/* WEB */}
      {Platform.OS === 'web' ? (
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          onLoad={() => {
            setBridgeStatus('connected');

            const doc = iframeRef.current?.contentDocument;
            const el = doc?.querySelector('.hero h1');

            if (el) {
              el.insertAdjacentHTML(
                'afterend',
                `<p style="font-size:12px;opacity:0.8;margin-top:4px">
                  👤 Viewing as ${user?.username ?? 'Guest'}
                </p>`,
              );
            }
          }}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      ) : (
        <WebView
          key={courseId}
          ref={webviewRef}
          source={{
            html: htmlContent,
            baseUrl: 'https://mini-lms.app',
          }}
          injectedJavaScript={INJECT_ON_LOAD}
          onMessage={handleMessage}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text }]}>
                Loading course content…
              </Text>
            </View>
          )}
          onError={() => setLoadError(true)}
          onHttpError={() => setLoadError(true)}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          style={styles.webview}
        />
      )}
      {/* Mark as Complete Button */}
      {!isCompleted && (
        <TouchableOpacity
          style={[styles.completeBtn, { backgroundColor: colors.primary }]}
          onPress={handleMarkComplete}
          activeOpacity={0.8}
        >
          <Text style={styles.completeBtnText}>✅ Mark as Complete</Text>
        </TouchableOpacity>
      )}

      {isCompleted && (
        <View style={[styles.completedBadge, { backgroundColor: colors.success }]}>
          <Text style={[styles.completedText, { color: isDarkMode ? '#ffff' : '#16a34a' }]}>✅ Course Completed</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  webview: { flex: 1 },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },

  errorEmoji: { fontSize: 40, marginBottom: 12 },

  errorText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },

  retryBtn: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryText: {
    color: '#fff',
    fontWeight: '700',
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },

  completeBtn: {
    backgroundColor: '#22c55e',
    marginHorizontal: 8,
    marginVertical: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },

  completeBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },

  completedBadge: {
    backgroundColor: '#f0fdf4',
    marginHorizontal: 8,
    marginVertical: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },

  completedText: {
    fontWeight: '700',
    fontSize: 14,
  },

  bridgeBadge: {
    backgroundColor: '#f0fdf4',
    padding: 8,
    margin: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    alignSelf: 'flex-start',
  },

  bridgeText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
  },

  lessonBadge: {
    backgroundColor: '#eff6ff',
    padding: 8,
    marginHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },

  lessonText: {
    fontSize: 11,
    color: '#1d4ed8',
    fontWeight: '600',
  },
});