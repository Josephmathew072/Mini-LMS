import type { Course } from '../types';

type CourseLike = {
  id: string | number;
  title?: string;
  category?: string;
  thumbnailUrl?: string;
  images?: string[];
};

/* -----------------------------
   Deterministic color palette
------------------------------ */
const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e',
  '#06b6d4', '#3b82f6', '#6366f1', '#a855f7',
  '#ec4899', '#14b8a6',
];

function getColor(id: string | number): string {
  const base =
    typeof id === 'string'
      ? [...id].reduce((a, c) => a + c.charCodeAt(0), 0)
      : Number(id);

  return COLORS[Math.abs(base) % COLORS.length];
}

/* -----------------------------
   DummyJSON image generator
------------------------------ */
function generateImage(params: {
  width: number;
  height: number;
  text: string;
  bg: string;
  color?: string;
}): string {
  const { width, height, text, bg, color = '#ffffff' } = params;

  return `https://dummyjson.com/image/${width}x${height}/${bg.replace('#', '')}/${color.replace('#', '')}?text=${encodeURIComponent(text)}`;
}

/* -----------------------------
   Course image resolver
------------------------------ */
export function getCourseImage(course: CourseLike): string {
  const realImage = course.thumbnailUrl ?? course.images?.[0];

  if (realImage && realImage.startsWith('http')) {
    // return realImage;
  }

  /**
   * Image strategy:
   * - API thumbnails are inconsistent (some URLs invalid / missing)
   * - We use deterministic generated placeholders to ensure:
   *   • no broken images
   *   • consistent layout
   *   • fast loading without retries
   */

  const text = (course.title ?? course.category ?? `Course ${course.id}`)
    .slice(0, 40);

  return generateImage({
    width: 800,
    height: 400,
    text,
    bg: getColor(course.id),
  });
}

/* -----------------------------
   Avatar generator
------------------------------ */
export function getAvatarImage(name?: string): string {
  return generateImage({
    width: 200,
    height: 200,
    text: (name?.[0] ?? 'U').toUpperCase(),
    bg: '#0f172a',
  });
}

export type { Course };