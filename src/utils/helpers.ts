import type { Course, Instructor } from '../types';

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
export function transformUserToInstructor(user: Record<string, unknown>): Instructor {
  const nameObj = user.name as { first?: string; last?: string } | undefined;

  const first = nameObj?.first;
  const last = nameObj?.last;

  const name =
    first
      ? `${first} ${last ?? ''}`.trim()
      : (user.username as string | undefined) ?? 'Unknown Instructor';

  const picture = user.picture as { large?: string } | undefined;

  const avatarUrl =
    picture?.large ??
    (user.avatar as string | undefined) ??
    `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`;

  return {
    id: (user._id as string | undefined)
      ?? (user.id as string | undefined)
      ?? fallbackId('instructor'),

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
  const discountPercentage = Number(product.discountPercentage ?? 0);

  const discountedPrice =
    discountPercentage > 0
      ? +(price - (price * discountPercentage) / 100).toFixed(2)
      : price;

  // Deterministic duration (stable UI)
  const idNum = parseInt(id.replace(/\D/g, ''), 10) || 1;
  const hours = (idNum % 6) + 1;
  const minutes = (idNum % 50) + 10;

  return {
    id,
    title: (product.title as string) ?? 'Untitled Course',
    description: (product.description as string) ?? 'No description available.',

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
   Build WebView HTML (Safe + Clean)
------------------------------ */
export function buildCourseHTML(course: Course): string {
  const hasDiscount = (course.discountPercentage ?? 0) > 0;
  const discountedPrice = course.discountedPrice ?? course.price;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

<title>${escapeHTML(course.title)}</title>

<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f8fafc;
    color: #0f172a;
    padding: 16px;
  }

  .hero {
    background: linear-gradient(135deg, #0ea5e9, #10b981);
    border-radius: 16px;
    padding: 20px;
    color: #fff;
    margin-bottom: 16px;
  }

  .hero h1 {
    font-size: 20px;
    margin-bottom: 6px;
  }

  .hero p {
    font-size: 14px;
    opacity: 0.9;
    line-height: 1.4;
  }

  .badge {
    display: inline-block;
    margin-top: 10px;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(255,255,255,0.2);
    font-size: 12px;
  }

  .discount {
    margin-top: 10px;
    font-weight: 700;
    color: #fff;
  }

  .strike {
    text-decoration: line-through;
    opacity: 0.7;
    margin: 0 6px;
  }

  .card {
    background: #fff;
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  .card h2 {
    font-size: 14px;
    margin-bottom: 10px;
    color: #334155;
  }

  .instructor {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .instructor img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
  }

  .meta span {
    display: inline-block;
    margin-right: 10px;
    font-size: 13px;
    color: #64748b;
  }

  .lesson {
    border-left: 3px solid #0ea5e9;
    padding: 10px;
    margin-bottom: 8px;
    background: #f1f5f9;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
  }

  .lesson:active {
    background: #e2e8f0;
  }
</style>
</head>

<body>

  <div class="hero">
    <h1>${escapeHTML(course.title)}</h1>
    <p>${escapeHTML(course.description)}</p>

    <div class="badge">
      ⭐ ${Number(course.rating).toFixed(1)} · ${escapeHTML(course.duration)}
    </div>

    ${hasDiscount ? `
      <div class="discount">
        🔥 ${course.discountPercentage}% OFF
        <span class="strike">$${course.price.toFixed(2)}</span>
        → $${discountedPrice.toFixed(2)}
      </div>
    ` : ''}
  </div>

  <div class="card">
    <h2>Instructor</h2>
    <div class="instructor">
      <img src="${escapeHTML(course.instructor.avatarUrl)}" />
      <div>
        <strong>${escapeHTML(course.instructor.name)}</strong><br/>
        <small>${escapeHTML(course.instructor.email)}</small>
      </div>
    </div>
  </div>

  <div class="card">
    <h2>Course Info</h2>
    <div class="meta">
      <span>📂 ${escapeHTML(course.category)}</span>
      <span>⏱ ${escapeHTML(course.duration)}</span>
      <span>💰 $${course.price.toFixed(2)}</span>
    </div>
  </div>

  <div class="card">
    <h2>Lessons</h2>

    <div class="lesson" onclick="selectLesson(1)">01 Introduction</div>
    <div class="lesson" onclick="selectLesson(2)">02 Fundamentals</div>
    <div class="lesson" onclick="selectLesson(3)">03 Practice</div>
    <div class="lesson" onclick="selectLesson(4)">04 Advanced Topics</div>
    <div class="lesson" onclick="selectLesson(5)">05 Final Project</div>
  </div>

<script>
  function selectLesson(id) {
    const payload = {
      type: 'LESSON_SELECTED',
      lesson: id
    };

    // React Native (mobile)
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    }

    // Web iframe (browser)
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(payload, '*');
    }
  }
</script>

</body>
</html>`;
}