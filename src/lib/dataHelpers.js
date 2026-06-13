import users from '@/data/users.json';
import courses from '@/data/courses.json';
import enrollments from '@/data/enrollments.json';

export { users, courses, enrollments };

export function getEnrollmentsForUser(userId) {
  return enrollments.filter(e => e.user_id === userId).map(e => ({
    ...e,
    course: courses.find(c => c.course_id === e.course_id),
  }));
}

export function getEnrollmentsForCourse(courseId) {
  return enrollments.filter(e => e.course_id === courseId).map(e => ({
    ...e,
    user: users.find(u => u.user_id === e.user_id),
  }));
}

export function getCourseStats(courseId) {
  const courseEnrollments = enrollments.filter(e => e.course_id === courseId);
  const total = courseEnrollments.length;
  const completed = courseEnrollments.filter(e => e.status === 'COMPLETED').length;
  const inProgress = courseEnrollments.filter(e => e.status === 'IN_PROGRESS').length;
  const dropped = courseEnrollments.filter(e => e.status === 'DROPPED').length;
  const notStarted = courseEnrollments.filter(e => e.status === 'NOT_STARTED').length;
  const avgProgress = total > 0
    ? Math.round(courseEnrollments.reduce((s, e) => s + e.progress_percent, 0) / total)
    : 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, inProgress, dropped, notStarted, avgProgress, completionRate };
}

export function getUserStats(userId) {
  const userEnrollments = enrollments.filter(e => e.user_id === userId);
  const total = userEnrollments.length;
  const completed = userEnrollments.filter(e => e.status === 'COMPLETED').length;
  const inProgress = userEnrollments.filter(e => e.status === 'IN_PROGRESS').length;
  const dropped = userEnrollments.filter(e => e.status === 'DROPPED').length;
  const avgProgress = total > 0
    ? Math.round(userEnrollments.reduce((s, e) => s + e.progress_percent, 0) / total)
    : 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, inProgress, dropped, avgProgress, completionRate };
}

export function getTopCoursesByEnrollment(limit = 5) {
  const counts = {};
  enrollments.forEach(e => {
    counts[e.course_id] = (counts[e.course_id] || 0) + 1;
  });
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([courseId, count]) => ({
      course: courses.find(c => c.course_id === courseId),
      enrollmentCount: count,
    }));
}

export function getStatusBreakdown() {
  const breakdown = { COMPLETED: 0, IN_PROGRESS: 0, NOT_STARTED: 0, DROPPED: 0 };
  enrollments.forEach(e => { breakdown[e.status] = (breakdown[e.status] || 0) + 1; });
  return breakdown;
}

export function getInstructorStats() {
  const stats = {};
  courses.forEach(c => {
    if (!stats[c.instructor]) stats[c.instructor] = { courses: 0, enrollments: 0, completions: 0 };
    stats[c.instructor].courses += 1;
    const courseEnrollments = enrollments.filter(e => e.course_id === c.course_id);
    stats[c.instructor].enrollments += courseEnrollments.length;
    stats[c.instructor].completions += courseEnrollments.filter(e => e.status === 'COMPLETED').length;
  });
  return Object.entries(stats)
    .map(([name, s]) => ({ name, ...s }))
    .sort((a, b) => b.enrollments - a.enrollments);
}

export function getCategoryFromTitle(title) {
  const t = title.toLowerCase();
  if (t.includes('python') || t.includes('web dev') || t.includes('react') || t.includes('vue') || t.includes('angular') || t.includes('mobile')) return 'Programming';
  if (t.includes('data science') || t.includes('machine learning') || t.includes('blockchain') || t.includes('cryptocurrency') || t.includes('cloud')) return 'Tech & Data';
  if (t.includes('design') || t.includes('ux') || t.includes('ui') || t.includes('photography') || t.includes('video') || t.includes('creative writing')) return 'Creative';
  if (t.includes('seo') || t.includes('marketing') || t.includes('project management') || t.includes('business english') || t.includes('cybersecurity')) return 'Business';
  return 'Other';
}

export function getLevelFromTitle(title) {
  const t = title.toLowerCase();
  if (t.startsWith('basic') || t.startsWith('fundamentals')) return 'Beginner';
  if (t.startsWith('intermediate') || t.startsWith('crash course')) return 'Intermediate';
  if (t.startsWith('advanced') || t.startsWith('mastery')) return 'Advanced';
  return 'General';
}