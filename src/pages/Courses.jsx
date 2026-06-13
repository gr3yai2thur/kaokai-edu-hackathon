import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { courses as staticCourses, getCategoryFromTitle, getLevelFromTitle } from '@/lib/dataHelpers';
import { Search, BookOpen, Users, ChevronRight, Filter, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { useEnrollment, calcCoursePoints } from '@/hooks/useEnrollment';
import { useAllEnrollments } from '@/hooks/useAllEnrollments';
import { useCourses } from '@/hooks/useCourses';

const CATEGORY_COLORS = {
  Programming: 'bg-blue-100 text-blue-700',
  'Tech & Data': 'bg-violet-100 text-violet-700',
  Creative: 'bg-pink-100 text-pink-700',
  Business: 'bg-amber-100 text-amber-700',
  Other: 'bg-slate-100 text-slate-600',
};

const LEVEL_COLORS = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-blue-100 text-blue-700',
  Advanced: 'bg-purple-100 text-purple-700',
  General: 'bg-slate-100 text-slate-600',
};

export default function Courses() {
  const { user, refreshProfile } = useAuth();
  const { enrollments: myEnrollments, enroll, drop, complete } = useEnrollment(user?.uid);
  const allEnrollments = useAllEnrollments();
  const courses = useCourses() ?? staticCourses;

  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearch(q);
  }, [searchParams]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [instructorFilter, setInstructorFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [pending, setPending] = useState({});

  const allCategories = ['All', 'Programming', 'Tech & Data', 'Creative', 'Business'];
  const allLevels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const allInstructors = useMemo(() => {
    const set = new Set(courses.map(c => c.instructor));
    return ['All', ...Array.from(set).sort()];
  }, [courses]);

  const enriched = useMemo(() => courses.map(c => ({
    ...c,
    category: getCategoryFromTitle(c.title),
    level: getLevelFromTitle(c.title),
    enrollmentCount: (allEnrollments ?? []).filter(e => e.course_id === c.course_id).length,
  })), [courses, allEnrollments]);

  const filtered = useMemo(() => enriched.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || c.category === categoryFilter;
    const matchLevel = levelFilter === 'All' || c.level === levelFilter;
    const matchInstructor = instructorFilter === 'All' || c.instructor === instructorFilter;
    return matchSearch && matchCat && matchLevel && matchInstructor;
  }), [enriched, search, categoryFilter, levelFilter, instructorFilter]);

  const hasActiveFilters = categoryFilter !== 'All' || levelFilter !== 'All' || instructorFilter !== 'All';

  const handleEnroll = async (e, courseId) => {
    e.preventDefault();
    setPending(p => ({ ...p, [courseId]: true }));
    await enroll(courseId);
    setPending(p => ({ ...p, [courseId]: false }));
  };

  const handleDrop = async (e, courseId) => {
    e.preventDefault();
    setPending(p => ({ ...p, [courseId]: true }));
    await drop(courseId);
    setPending(p => ({ ...p, [courseId]: false }));
  };

  const handleComplete = async (e, courseId, totalLessons) => {
    e.preventDefault();
    setPending(p => ({ ...p, [courseId]: true }));
    await complete(courseId, totalLessons, refreshProfile);
    setPending(p => ({ ...p, [courseId]: false }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Courses</h1>
        <p className="text-slate-500 text-sm mt-1">{filtered.length} of {courses.length} courses</p>
      </div>

      {/* Search & Filter bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อคอร์สหรือผู้สอน..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 bg-slate-50"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
              hasActiveFilters || showFilters
                ? 'bg-violet-600 text-white border-violet-600'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            <Filter className="w-4 h-4" />
            Filter
            {hasActiveFilters && <span className="w-2 h-2 bg-white rounded-full" />}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {allCategories.map(cat => (
                  <button key={cat} onClick={() => setCategoryFilter(cat)}
                    className={cn('px-3 py-1 rounded-full text-xs font-medium transition-all',
                      categoryFilter === cat ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block">Level</label>
              <div className="flex flex-wrap gap-2">
                {allLevels.map(lv => (
                  <button key={lv} onClick={() => setLevelFilter(lv)}
                    className={cn('px-3 py-1 rounded-full text-xs font-medium transition-all',
                      levelFilter === lv ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                    {lv}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block">Instructor</label>
              <select value={instructorFilter} onChange={e => setInstructorFilter(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-slate-50">
                {allInstructors.map(ins => <option key={ins} value={ins}>{ins}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(course => {
          const enrollment = myEnrollments[course.course_id];
          const status = enrollment?.status;
          const isLoading = pending[course.course_id];
          const pts = calcCoursePoints(course.total_lessons);

          return (
            <Link
              key={course.course_id}
              to={`/courses/${course.course_id}`}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-violet-200 transition-all group flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[course.category]}`}>
                    {course.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${LEVEL_COLORS[course.level]}`}>
                    {course.level}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors flex-shrink-0" />
              </div>

              <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-1 group-hover:text-violet-700 transition-colors">
                {course.title}
              </h3>
              <p className="text-xs text-slate-400 mb-3">by {course.instructor}</p>

              <div className="flex items-center gap-1 mb-3">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-amber-600 font-medium">{pts} pts เมื่อจบคอร์ส</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  {course.total_lessons} lessons
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-violet-400" />
                  <span className="font-medium text-violet-600">{course.enrollmentCount} enrolled</span>
                </span>
              </div>

              {status === 'IN_PROGRESS' && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{enrollment.progress_percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${enrollment.progress_percent}%` }} />
                  </div>
                </div>
              )}

              {user && (
                <div className="mt-auto pt-1 flex gap-2" onClick={e => e.preventDefault()}>
                  {!status && (
                    <button
                      disabled={isLoading}
                      onClick={e => handleEnroll(e, course.course_id)}
                      className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-medium py-2 rounded-xl transition-colors"
                    >
                      {isLoading ? '...' : 'เริ่มเรียน'}
                    </button>
                  )}
                  {status === 'IN_PROGRESS' && (
                    <>
                      <button
                        disabled={isLoading}
                        onClick={e => handleComplete(e, course.course_id, course.total_lessons)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium py-2 rounded-xl transition-colors"
                      >
                        {isLoading ? '...' : 'เรียนจบแล้ว ✓'}
                      </button>
                      <button
                        disabled={isLoading}
                        onClick={e => handleDrop(e, course.course_id)}
                        className="px-3 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 text-xs font-medium py-2 rounded-xl transition-colors"
                      >
                        Drop
                      </button>
                    </>
                  )}
                  {status === 'COMPLETED' && (
                    <span className="flex-1 text-center text-xs font-medium text-emerald-600 bg-emerald-50 py-2 rounded-xl">
                      ✓ เรียนจบแล้ว (+{pts} pts)
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No courses found</p>
          <p className="text-sm mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
        </div>
      )}
    </div>
  );
}
