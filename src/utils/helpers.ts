import type { Course, Instructor } from '../types';
import { COLORS } from '../context/ThemeContext';

/* -----------------------------
   Safe HTML escaping (XSS protection)
------------------------------ */
function escapeHTML(str: unknown): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* -----------------------------
   Stable fallback ID generator
------------------------------ */
function fallbackId(prefix = 'course'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/* -----------------------------
   Map API user → Instructor
------------------------------ */
export function transformUserToInstructor(
  user: Record<string, unknown>,
): Instructor {
  const nameObj = user.name as
    | { first?: string; last?: string }
    | undefined;

  const first = nameObj?.first;
  const last = nameObj?.last;

  const name = first
    ? `${first} ${last ?? ''}`.trim()
    : (user.username as string | undefined) ?? 'Unknown Instructor';

  const picture = user.picture as { large?: string } | undefined;

  const avatarUrl =
    picture?.large ??
    (user.avatar as string | undefined) ??
    `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`;

  return {
    id:
      (user._id as string | undefined) ??
      (user.id as string | undefined) ??
      fallbackId('instructor'),

    name,
    avatarUrl,
    email: (user.email as string | undefined) ?? '',
  };
}

/* -----------------------------
   Map product → Course
------------------------------ */
export function transformProductToCourse(
  product: Record<string, unknown>,
  instructor: Instructor,
): Course {
  const id = String(product.id ?? product._id);

  const price = Number(product.price ?? 0);
  const discountPercentage = Number(
    product.discountPercentage ?? 0,
  );

  const discountedPrice =
    discountPercentage > 0
      ? +(price - (price * discountPercentage) / 100).toFixed(2)
      : price;

  const idNum = parseInt(id.replace(/\D/g, ''), 10) || 1;

  const hours = (idNum % 6) + 1;
  const minutes = (idNum % 50) + 10;

  return {
    id,
    title: (product.title as string) ?? 'Untitled Course',
    description:
      (product.description as string) ??
      'No description available.',

    thumbnailUrl: (product.thumbnail as string) ?? '',
    images: (product.images as string[]) ?? [],

    price,
    rating: Number(product.rating ?? 4.0),

    instructor,

    category: (product.category as string) ?? 'General',

    duration: `${hours}h ${minutes}m`,

    discountPercentage,
    discountedPrice,
  };
}

/* -----------------------------
   Build WebView HTML
------------------------------ */
export function buildCourseHTML(
  course: Course,
  colors: typeof COLORS.light,
  isDarkMode: boolean,
): string {
  const hasDiscount = (course.discountPercentage ?? 0) > 0;

  const discountedPrice =
    course.discountedPrice ?? course.price;

  const heroGradient = isDarkMode
    ? 'linear-gradient(135deg, #312e81, #1e40af)'
    : 'linear-gradient(135deg, #0ea5e9, #10b981)';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<title>${escapeHTML(course.title)}</title>

<style>
:root{
  --bg:${colors.background};
  --surface:${colors.surface};
  --surface-alt:${colors.surfaceAlt};
  --text:${colors.text};
  --text-secondary:${colors.textSecondary};
  --border:${colors.border};
  --primary:${colors.primary};
  --primary-light:${colors.primaryLight};
  --success:${colors.success};
  --warning:${colors.warning};
}

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

html{
  font-size:16px;
}

body{
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;

  background:var(--bg);
  color:var(--text);
  padding:1rem;
  line-height:1.5;
}

.hero{
  background:${heroGradient};
  color:#ffffff;
  border-radius:1rem;
  padding:1.25rem;
  margin-bottom:1rem;
}

.hero h1{
  font-size:1.35rem;
  font-weight:700;
  margin-bottom:0.5rem;
}

.hero p{
  font-size:0.9rem;
  opacity:0.95;
}

.badge{
  display:inline-block;
  margin-top:0.75rem;
  padding:0.35rem 0.75rem;
  border-radius:9999px;
  background:rgba(255,255,255,0.2);
  font-size:0.75rem;
}

.discount{
  margin-top:0.75rem;
  font-size:0.95rem;
  font-weight:700;
}

.strike{
  text-decoration:line-through;
  opacity:0.75;
  margin:0 0.375rem;
}

.card{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:0.75rem;
  padding:0.95rem;
  margin-bottom:0.875rem;
}

.card h2{
  font-size:1rem;
  margin-bottom:0.75rem;
  color:var(--text);
}

.instructor{
  display:flex;
  align-items:center;
  gap:0.75rem;
}

.instructor img{
  width:3rem;
  height:3rem;
  border-radius:50%;
  object-fit:cover;
  border:1px solid var(--border);
}

.instructor strong{
  color:var(--text);
}

.instructor small{
  color:var(--text-secondary);
}

.meta{
  display:flex;
  flex-wrap:wrap;
  gap:0.75rem;
}

.meta span{
  color:var(--text-secondary);
  font-size:0.875rem;
}

.lesson{
  border-left:0.1875rem solid var(--primary);
  background:var(--surface-alt);
  color:var(--text);

  padding:0.75rem;
  border-radius:0.5rem;

  margin-bottom:0.625rem;

  cursor:pointer;

  transition:
    background 0.2s ease,
    transform 0.15s ease;
}

.lesson:hover{
  background:var(--primary-light);
}

.lesson:active{
  transform:scale(0.99);
}

.footer{
  text-align:center;
  color:var(--text-secondary);
  font-size:0.75rem;
  margin-top:1rem;
}
</style>
</head>

<body>

<div class="hero">
  <h1>${escapeHTML(course.title)}</h1>

  <p>
    ${escapeHTML(course.description)}
  </p>

  <div class="badge">
    ⭐ ${Number(course.rating).toFixed(1)}
    ·
    ${escapeHTML(course.duration)}
  </div>

  ${
    hasDiscount
      ? `
      <div class="discount">
        🔥 ${course.discountPercentage}% OFF
        <span class="strike">
          $${course.price.toFixed(2)}
        </span>
        → $${discountedPrice.toFixed(2)}
      </div>
    `
      : ''
  }
</div>

<div class="card">
  <h2>Instructor</h2>

  <div class="instructor">
    <img
      src="${escapeHTML(course.instructor.avatarUrl)}"
      alt="${escapeHTML(course.instructor.name)}"
    />

    <div>
      <strong>
        ${escapeHTML(course.instructor.name)}
      </strong>
      <br />

      <small>
        ${escapeHTML(course.instructor.email)}
      </small>
    </div>
  </div>
</div>

<div class="card">
  <h2>Course Information</h2>

  <div class="meta">
    <span>
      📂 ${escapeHTML(course.category)}
    </span>

    <span>
      ⏱ ${escapeHTML(course.duration)}
    </span>

    <span>
      💰 $${course.price.toFixed(2)}
    </span>
  </div>
</div>

<div class="card">
  <h2>Lessons</h2>

  <div
    class="lesson"
    onclick="selectLesson(1)"
  >
    01 • Introduction
  </div>

  <div
    class="lesson"
    onclick="selectLesson(2)"
  >
    02 • Fundamentals
  </div>

  <div
    class="lesson"
    onclick="selectLesson(3)"
  >
    03 • Practice
  </div>

  <div
    class="lesson"
    onclick="selectLesson(4)"
  >
    04 • Advanced Topics
  </div>

  <div
    class="lesson"
    onclick="selectLesson(5)"
  >
    05 • Final Project
  </div>
</div>

<div class="footer">
  Happy Learning 🚀
</div>

<script>
function selectLesson(id) {
  const payload = {
    type: 'LESSON_SELECTED',
    lesson: id
  };

  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify(payload)
    );
  }

  if (
    window.parent &&
    window.parent !== window
  ) {
    window.parent.postMessage(
      payload,
      '*'
    );
  }
}
</script>

</body>
</html>
`;
}