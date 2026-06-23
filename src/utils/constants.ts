// src/utils/constants.ts

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  BOOKMARKS: 'bookmarks',
  ENROLLED: 'enrolled',
  CACHED_COURSES: 'cachedCourses',
  SETTINGS: 'settings',
  PROFILE_AVATAR: 'profileAvatar',
  LAST_OPENED_AT: 'lastOpenedAt',
  BOOKMARK_MILESTONE_DONE: 'bookmarkMilestoneDone',
  INACTIVITY_REMINDER_SENT: 'inactivityReminderSent',
  THEME_MODE: 'themeMode',
  COMPLETED_COURSES: 'completedCourses',
} as const;

export const INACTIVITY_HOURS = 24;
export const BOOKMARK_MILESTONE = 5;
