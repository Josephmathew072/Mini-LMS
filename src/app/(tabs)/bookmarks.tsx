// app/(tabs)/bookmarks.tsx

import CourseCard from '@/components/CourseCard';
import { useCourseStore } from '@/stores/courseStore';
import type { Course } from '@/types';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookmarksScreen() {
  const router = useRouter();
  const { courses, bookmarkedIds, toggleBookmark } = useCourseStore();

  const bookmarkedCourses = courses.filter((c) => bookmarkedIds.includes(c.id));

  const handleBookmark = useCallback(
    (courseId: string) => toggleBookmark(courseId),
    [toggleBookmark],
  );

  if (bookmarkedCourses.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Saved Courses</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🔖</Text>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptyBody}>
            Tap the bookmark icon on any course to save it here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Saved Courses</Text>
        <Text style={styles.count}>{bookmarkedCourses.length} saved</Text>
      </View>
      <FlatList
        data={bookmarkedCourses}
        keyExtractor={(item: Course) => item.id}
      renderItem={({ item }: { item: Course }) => (
        <CourseCard
          course={item}
          isBookmarked
          onPress={() => router.push(`/course/${item.id}`)}
          onBookmarkPress={() => handleBookmark(item.id)}
        />
      )}
      contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  pageHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
  },
  count: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  listContent: { paddingBottom: 24 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});
