// src/stores/courseStore.ts

import { create } from 'zustand';
import { coursesApi } from '../api/endpoints';
import { checkAndFireBookmarkMilestone, resetBookmarkMilestone } from '../services/notifications';
import { asyncStorage } from '../services/storage';
import type { Course } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { transformProductToCourse, transformUserToInstructor } from '../utils/helpers';

interface CourseState {
  courses: Course[];
  bookmarkedIds: string[];
  enrolledIds: string[];
  completedIds: string[];
  isLoading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  toggleBookmark: (courseId: string) => Promise<void>;
  enrollCourse: (courseId: string) => Promise<void>;
  markCourseComplete: (courseId: string) => Promise<void>;
  hydrate: () => Promise<void>;
  setCourses: (courses: Course[]) => void;
  setError: (error: string | null) => void;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  bookmarkedIds: [],
  enrolledIds: [],
  completedIds: [],
  isLoading: false,
  error: null,

  hydrate: async () => {
    const bookmarks = await asyncStorage.getItem<string[]>(STORAGE_KEYS.BOOKMARKS);
    const enrolled = await asyncStorage.getItem<string[]>(STORAGE_KEYS.ENROLLED);
    const completed = await asyncStorage.getItem<string[]>(STORAGE_KEYS.COMPLETED_COURSES);
    set({
      bookmarkedIds: bookmarks ?? [],
      enrolledIds: enrolled ?? [],
      completedIds: completed ?? [],
    });

    const cached = await asyncStorage.getItem<Course[]>(STORAGE_KEYS.CACHED_COURSES);
    if (cached && cached.length > 0) {
      set({ courses: cached });
    }
  },

  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const [rawUsers, rawProducts] = await Promise.all([
        coursesApi.fetchInstructors(30),
        coursesApi.fetchProducts(30),
      ]);

      const instructors = (rawUsers as Record<string, unknown>[]).map(transformUserToInstructor);

      const courses = (rawProducts as Record<string, unknown>[]).map((product, index) => {
        const instructor = instructors[index % instructors.length];
        return transformProductToCourse(product, instructor);
      });

      set({ courses, error: null });
      await asyncStorage.setItem(STORAGE_KEYS.CACHED_COURSES, courses);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? 'Failed to load courses.';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleBookmark: async (courseId) => {
    const current = get().bookmarkedIds;
    const exists = current.includes(courseId);
    const updated = exists
      ? current.filter((id) => id !== courseId)
      : [...current, courseId];
    
    set({ bookmarkedIds: updated });
    await asyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, updated);

    // Handle bookmark milestone notifications
    if (updated.length >= 5) {
      await checkAndFireBookmarkMilestone(updated.length);
    } else if (updated.length < 5) {
      // Reset the milestone flag so it can fire again when reaching 5+
      await resetBookmarkMilestone();
    }
  },

  enrollCourse: async (courseId) => {
    const current = get().enrolledIds;
    if (current.includes(courseId)) return;
    const updated = [...current, courseId];
    set({ enrolledIds: updated });
    await asyncStorage.setItem(STORAGE_KEYS.ENROLLED, updated);
  },

  markCourseComplete: async (courseId) => {
    const current = get().completedIds;
    if (current.includes(courseId)) return;
    const updated = [...current, courseId];
    set({ completedIds: updated });
    await asyncStorage.setItem(STORAGE_KEYS.COMPLETED_COURSES, updated);
  },

  setCourses: (courses) => set({ courses }),
  setError: (error) => set({ error }),
}));
