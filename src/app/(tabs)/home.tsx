// app/(tabs)/home.tsx

import CourseCard from '@/components/CourseCard';
import { ErrorView } from '@/components/ErrorView';
import { OfflineBanner } from '@/components/OfflineBanner';
import { SearchBar } from '@/components/SearchBar';
import { SkeletonList } from '@/components/SkeletonCard';
import { useDebounce } from '@/hooks/useDebounce';
import { useNetwork } from '@/hooks/useNetwork';
import { checkAndFireBookmarkMilestone } from '@/services/notifications';
import { useAuthStore } from '@/stores/authStore';
import { useCourseStore } from '@/stores/courseStore';
import type { Course } from '@/types';
import { LegendList } from '@legendapp/list/react-native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    courses,
    bookmarkedIds,
    isLoading,
    error,
    fetchCourses,
    toggleBookmark,
    setError,
    setCourses,
  } = useCourseStore();
  const isConnected = useNetwork();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (courses.length === 0) {
      fetchCourses();
    }
  }, []);

  const filteredCourses = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.instructor.name.toLowerCase().includes(q),
    );
  }, [courses, debouncedSearch]);

  const handleRefresh = useCallback(() => {
    if (isConnected) fetchCourses();
  }, [isConnected, fetchCourses]);

  const handleBookmark = useCallback(
    async (course: Course) => {
      await toggleBookmark(course.id);
      const updatedIds = useCourseStore.getState().bookmarkedIds;
      await checkAndFireBookmarkMilestone(updatedIds.length);
    },
    [toggleBookmark],
  );

  const renderItem = useCallback(
    ({ item }: { item: Course }) => (
      <CourseCard
        course={item}
        isBookmarked={bookmarkedIds.includes(item.id)}
        onPress={() => router.push(`/course/${item.id}`)}
        onBookmarkPress={() => handleBookmark(item)}
      />
    ),
    [bookmarkedIds, handleBookmark, router],
  );

  // Initial loading state — show skeletons
  if (isLoading && courses.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        {!isConnected && <OfflineBanner />}
        <View style={styles.headerRow}>
          <Text style={styles.greeting}>Hey {user?.username ?? 'there'} 👋</Text>
        </View>
        <SkeletonList />
      </SafeAreaView>
    );
  }

  // Network error with no cache
  if (error && courses.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        {!isConnected && <OfflineBanner />}
        <ErrorView message={error} onRetry={fetchCourses} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {!isConnected && <OfflineBanner />}

      <LegendList
        data={filteredCourses}
        keyExtractor={(item: Course) => item.id}
        extraData={bookmarkedIds}
        renderItem={renderItem}
        estimatedItemSize={270}
        recycleItems
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.greeting}>Hey {user?.username ?? 'there'} 👋</Text>
                <Text style={styles.subGreeting}>What do you want to learn today?</Text>
              </View>
            </View>
            <SearchBar value={search} onChangeText={setSearch} />
            {error && isConnected && (
              <Text style={styles.cacheNote}>Showing cached results</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No courses match "{debouncedSearch}"</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
  },
  subGreeting: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  cacheNote: {
    fontSize: 12,
    color: '#f59e0b',
    textAlign: 'center',
    paddingBottom: 4,
  },
  listContent: { paddingBottom: 24 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#64748b', textAlign: 'center' },
});
