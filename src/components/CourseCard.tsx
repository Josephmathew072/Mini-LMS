import { useTheme } from '@/context/ThemeContext';
import { Image } from 'expo-image';
import { memo } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Course } from '../types';
import { getCourseImage } from '../utils/images';

interface Props {
  course: Course;
  isBookmarked: boolean;
  onPress: () => void;
  onBookmarkPress: () => void;
}

// Wrapped in memo so LegendList only re-renders when props actually change
const CourseCard = memo(function CourseCard({
  course,
  isBookmarked,
  onPress,
  onBookmarkPress,
}: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Image
        source={{
          uri: getCourseImage(course),
        }}
        style={styles.thumbnail}
        contentFit="cover"
      />
      
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {course.title}
        </Text>

        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {course.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.meta}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>⭐ {course.rating.toFixed(1)}</Text>
            <Text style={[styles.dot, { color: colors.textSecondary }]}>·</Text>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{course.duration}</Text>
          </View>

          <TouchableOpacity
            onPress={onBookmarkPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.bookmarkBtn}
          >
            <Text style={styles.bookmarkIcon}>{isBookmarked ? '🔖' : '🏷️'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.instructor, { color: colors.primary }]} numberOfLines={1}>
          By {course.instructor.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export default CourseCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginHorizontal: 12,
    marginBottom: 14,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 8,
          elevation: 3,
        }),
  },
  thumbnail: {
    width: '100%',
    height: 150,
    backgroundColor: '#e2e8f0',
  },
  body: {
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  dot: {
    color: '#94a3b8',
    fontSize: 12,
  },
  bookmarkBtn: {
    padding: 2,
  },
  bookmarkIcon: {
    fontSize: 18,
  },
  instructor: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
});
