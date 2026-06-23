import { OfflineBanner } from '@/components/OfflineBanner';
import { useTheme } from '@/context/ThemeContext';
import { useNetwork } from '@/hooks/useNetwork';
import { checkAndFireBookmarkMilestone } from '@/services/notifications';
import { useCourseStore } from '@/stores/courseStore';
import { getAvatarImage, getCourseImage } from '@/utils/images';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const {
    courses,
    bookmarkedIds,
    enrolledIds,
    toggleBookmark,
    enrollCourse,
  } = useCourseStore();
  const isConnected = useNetwork();

  const course = useMemo(() => courses.find((c) => c.id === id), [courses, id]);

  if (!course) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Course not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isBookmarked = bookmarkedIds.includes(course.id);
  const isEnrolled = enrolledIds.includes(course.id);

  const handleBookmark = async () => {
    await toggleBookmark(course.id);
    const updated = useCourseStore.getState().bookmarkedIds;
    await checkAndFireBookmarkMilestone(updated.length);
  };

  const handleEnroll = async () => {
    if (!isConnected) {
      Alert.alert('Offline', 'Please connect to the internet to enroll in this course.');
      return;
    }
    await enrollCourse(course.id);
  };

  const handleStartLearning = () => {
    router.push({ pathname: '/webview', params: { courseId: course.id } });
  };

  const thumbnailUri = getCourseImage(course);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      {!isConnected && <OfflineBanner />}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <Image
          source={{ uri: thumbnailUri }}
          style={styles.hero}
          contentFit="cover"
        />
        {/* Category badge */}
        <View style={[styles.categoryBadge, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.categoryText, { color: colors.primary }]}>{course.category}</Text>
        </View>

        <View style={styles.content}>
          {/* Title and rating */}
          <Text style={[styles.title, { color: colors.text }]}>{course.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.rating}>⭐ {course.rating.toFixed(1)}</Text>
            <Text style={[styles.dot, { color: colors.border }]}>·</Text>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>⏱ {course.duration}</Text>
            <Text style={[styles.dot, { color: colors.border }]}>·</Text>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>💰 ${course.price.toFixed(2)}</Text>
          </View>

          {/* Instructor */}
          <View style={[styles.instructorRow, { backgroundColor: colors.surface }]}>
            <Image
              source={{ uri: course.instructor.avatarUrl || getAvatarImage(course.instructor.name) }}
              style={styles.instructorAvatar}
            />
            <View>
              <Text style={[styles.instructorName, { color: colors.text }]}>{course.instructor.name}</Text>
              <Text style={[styles.instructorEmail, { color: colors.textSecondary }]}>{course.instructor.email}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.descLabel, { color: colors.text }]}>About this course</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>{course.description}</Text>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.bookmarkBtn, { borderColor: colors.primary }, isBookmarked && { backgroundColor: colors.primaryLight }]}
              onPress={handleBookmark}
              activeOpacity={0.8}
            >
              <Text style={[styles.bookmarkBtnText, { color: colors.primary }]}>
                {isBookmarked ? '🔖 Saved' : '🏷️ Save'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.enrollBtn, { backgroundColor: colors.primary }, isEnrolled && { backgroundColor: colors.success }]}
              onPress={handleEnroll}
              disabled={isEnrolled}
              activeOpacity={0.85}
            >
              <Text style={styles.enrollBtnText}>
                {isEnrolled ? '✅ Enrolled' : 'Enroll Now'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Start learning — only visible when enrolled */}
          {isEnrolled && (
            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: colors.text }]}
              onPress={handleStartLearning}
              activeOpacity={0.85}
            >
              <Text style={styles.startBtnText}>📖  Start Learning</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { paddingBottom: 40 },
  hero: {
    width: '100%',
    height: 230,
    backgroundColor: '#e2e8f0',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef2ff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginHorizontal: 16,
    marginTop: 14,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366f1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: { paddingHorizontal: 16, paddingTop: 10 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    lineHeight: 30,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  rating: { fontSize: 14, fontWeight: '600', color: '#f59e0b' },
  dot: { color: '#cbd5e1', fontSize: 14 },
  metaText: { fontSize: 14, color: '#64748b' },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  instructorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e2e8f0',
  },
  instructorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  instructorEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  descLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  bookmarkBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#6366f1',
  },
  bookmarkedBtn: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  bookmarkBtnText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#6366f1',
  },
  bookmarkedBtnText: {
    color: '#6366f1',
  },
  enrollBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#6366f1',
  },
  enrolledBtn: {
    backgroundColor: '#22c55e',
  },
  enrollBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  startBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  startBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, color: '#64748b' },
});
