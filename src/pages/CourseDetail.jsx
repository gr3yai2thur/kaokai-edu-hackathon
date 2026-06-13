import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { users, enrollments, getCategoryFromTitle, getLevelFromTitle, getCourseStats } from '@/lib/dataHelpers';
import { ArrowLeft, BookOpen, Users, Award, Clock, TrendingUp, CheckCircle2, XCircle, AlertCircle, Star, Download } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '@/lib/AuthContext';
import { useEnrollment, calcCoursePoints } from '@/hooks/useEnrollment';
import { useCourses } from '@/hooks/useCourses';
import CourseLessons from '@/components/CourseLessons';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { jsPDF } from 'jspdf';

const STATUS_COLORS = { COMPLETED: '#7c3aed', IN_PROGRESS: '#2563eb', NOT_STARTED: '#94a3b8', DROPPED: '#ef4444' };
const STATUS_LABELS = { COMPLETED: 'Completed', IN_PROGRESS: 'In Progress', NOT_STARTED: 'Not Started', DROPPED: 'Dropped' };
const STATUS_BADGE = {
  COMPLETED: 'bg-violet-100 text-violet-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  NOT_STARTED: 'bg-slate-100 text-slate-500',
  DROPPED: 'bg-red-100 text-red-600',
};

export default function CourseDetail() {
  const { id } = useParams();
  const { user, profile, refreshProfile, isAdmin } = useAuth();
  const { enrollments: myEnrollments, enroll, drop, complete } = useEnrollment(user?.uid);
  const [actionLoading, setActionLoading] = useState(false);
  const allCourses = useCourses();
  const [lessonCount, setLessonCount] = useState(null); // null = unknown, 0 = no lessons

  const course = allCourses?.find(c => c.course_id === id);

  if (allCourses === null) {
    return <div className="p-6 text-center py-20 text-slate-400">กำลังโหลด...</div>;
  }

  if (!course) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-slate-500">Course not found</p>
        <Link to="/courses" className="text-violet-600 hover:underline text-sm mt-2 inline-block">← Back to Courses</Link>
      </div>
    );
  }

  const myEnrollment = myEnrollments[id];
  const myStatus = myEnrollment?.status;
  const pts = calcCoursePoints(course.total_lessons);

  const handleAction = async (action) => {
    setActionLoading(true);
    if (action === 'enroll') await enroll(id);
    else if (action === 'drop') await drop(id);
    else if (action === 'complete') await complete(id, course.total_lessons, refreshProfile);
    setActionLoading(false);
  };

  const [certLoading, setCertLoading] = useState(false);

  const downloadCert = async () => {
    if (!user || certLoading) return;
    setCertLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const tokens = snap.data()?.cert_tokens ?? 0;
      if (tokens < 1) { alert('ไม่มี Certificate Token กรุณาแลกที่ Rewards Store'); setCertLoading(false); return; }
      await updateDoc(userRef, { cert_tokens: tokens - 1 });

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const W = 297, H = 210;

      // Background
      pdf.setFillColor(245, 243, 255);
      pdf.rect(0, 0, W, H, 'F');
      pdf.setFillColor(109, 40, 217);
      pdf.rect(0, 0, W, 12, 'F');
      pdf.rect(0, H - 12, W, 12, 'F');
      pdf.setDrawColor(109, 40, 217);
      pdf.setLineWidth(1);
      pdf.rect(14, 16, W - 28, H - 32);

      // Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(28);
      pdf.setTextColor(109, 40, 217);
      pdf.text('CERTIFICATE OF COMPLETION', W / 2, 45, { align: 'center' });

      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 120);
      pdf.text('This is to certify that', W / 2, 62, { align: 'center' });

      pdf.setFontSize(26);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 30, 50);
      pdf.text(user.displayName || user.email, W / 2, 80, { align: 'center' });

      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 120);
      pdf.text('has successfully completed the course', W / 2, 95, { align: 'center' });

      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(109, 40, 217);
      const title = pdf.splitTextToSize(course.title, 220);
      pdf.text(title, W / 2, 112, { align: 'center' });

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(120, 120, 140);
      pdf.text(`Instructor: ${course.instructor}`, W / 2, 130, { align: 'center' });
      pdf.text(`Date: ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}`, W / 2, 140, { align: 'center' });

      pdf.setFontSize(9);
      pdf.setTextColor(160, 160, 180);
      pdf.text('KaoKai Education Platform', W / 2, H - 18, { align: 'center' });

      pdf.save(`Certificate_${course.title.replace(/\s+/g, '_')}.pdf`);
      await refreshProfile();
    } catch (e) {
      console.error(e);
    } finally {
      setCertLoading(false);
    }
  };

  const stats = getCourseStats(id);
  const category = getCategoryFromTitle(course.title);  const level = getLevelFromTitle(course.title);
  const courseEnrollments = enrollments
    .filter(e => e.course_id === id)
    .map(e => ({ ...e, user: users.find(u => u.user_id === e.user_id) }));

  const pieData = [
    { name: 'Completed', value: stats.completed, color: STATUS_COLORS.COMPLETED },
    { name: 'In Progress', value: stats.inProgress, color: STATUS_COLORS.IN_PROGRESS },
    { name: 'Not Started', value: stats.notStarted, color: STATUS_COLORS.NOT_STARTED },
    { name: 'Dropped', value: stats.dropped, color: STATUS_COLORS.DROPPED },
  ].filter(d => d.value > 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back */}
      <Link to="/courses" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </Link>

      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">{category}</span>
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">{level}</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold mb-2">{course.title}</h1>
        <p className="text-violet-200 text-sm">Instructor: <span className="text-white font-medium">{course.instructor}</span></p>
        {course.description && (
          <p className="text-violet-100 text-sm mt-3 leading-relaxed max-w-2xl">{course.description}</p>
        )}
        {course.youtube_url && (() => {
          const match = course.youtube_url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
          const vid = match?.[1];
          return vid ? (
            <div className="mt-4 aspect-video w-full max-w-xl rounded-xl overflow-hidden shadow-lg">
              <iframe src={`https://www.youtube.com/embed/${vid}?rel=0`}
                title={course.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen className="w-full h-full" />
            </div>
          ) : null;
        })()}
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <span className="flex items-center gap-1.5 text-violet-200">
            <BookOpen className="w-4 h-4" /> {course.total_lessons} lessons
          </span>
          <span className="flex items-center gap-1.5 text-violet-200">
            <Users className="w-4 h-4" /> {stats.total} enrolled
          </span>
          <span className="flex items-center gap-1.5 text-violet-200">
            <TrendingUp className="w-4 h-4" /> {stats.avgProgress}% avg progress
          </span>
          <span className="flex items-center gap-1.5 text-amber-300">
            <Star className="w-4 h-4" /> {pts} pts เมื่อจบคอร์ส
          </span>
        </div>

        {/* Enrollment actions for logged-in user */}
        {user && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {!myStatus && (
              <button disabled={actionLoading} onClick={() => handleAction('enroll')}
                className="bg-white text-violet-700 hover:bg-violet-50 disabled:opacity-60 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
                {actionLoading ? '...' : '▶ เริ่มเรียน'}
              </button>
            )}
            {myStatus === 'IN_PROGRESS' && (
              <>
                <div className="flex-1 min-w-48">
                  <div className="flex justify-between text-xs text-violet-200 mb-1">
                    <span>Progress</span>
                    <span>{myEnrollment.progress_percent}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all" style={{ width: `${myEnrollment.progress_percent}%` }} />
                  </div>
                </div>
                {lessonCount === 0 && (
                  <button disabled={actionLoading} onClick={() => handleAction('complete')}
                    className="bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
                    {actionLoading ? '...' : '✓ เรียนจบแล้ว'}
                  </button>
                )}
                <button disabled={actionLoading} onClick={() => handleAction('drop')}
                  className="bg-white/10 hover:bg-white/20 disabled:opacity-60 text-white text-sm px-4 py-2.5 rounded-xl transition-colors">
                  Drop
                </button>
              </>
            )}
            {myStatus === 'COMPLETED' && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-white/20 text-white text-sm font-medium px-4 py-2.5 rounded-xl">
                  ✓ เรียนจบแล้ว (+{pts} pts)
                </span>
                <button
                  onClick={downloadCert}
                  disabled={certLoading || (profile?.cert_tokens ?? 0) < 1}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                  title={(profile?.cert_tokens ?? 0) < 1 ? 'ต้องใช้ Certificate Token — แลกได้ที่ Rewards Store' : 'ดาวน์โหลดใบรับรอง'}
                >
                  <Download className="w-4 h-4" />
                  {certLoading ? 'กำลังสร้าง...' : `Certificate${(profile?.cert_tokens ?? 0) > 0 ? ` (Token: ${profile.cert_tokens})` : ' (ไม่มี Token)'}`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lessons + Video Player */}
      <div className="mb-6">
        <h2 className="font-semibold text-slate-800 mb-4">เนื้อหาคอร์ส</h2>
        <CourseLessons
          courseId={id}
          enrollmentId={myStatus ? `${user?.uid}_${id}` : null}
          isEnrolled={!!myStatus && myStatus !== 'DROPPED'}
          onProgressUpdate={(progress) => {
            if (progress >= 100 && myStatus === 'IN_PROGRESS') {
              handleAction('complete');
            }
          }}
        />
      </div>

      {/* Admin-only analytics */}
      {isAdmin && <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-violet-600 bg-violet-50' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-blue-600 bg-blue-50' },
          { label: 'Not Started', value: stats.notStarted, icon: AlertCircle, color: 'text-slate-500 bg-slate-100' },
          { label: 'Dropped', value: stats.dropped, icon: XCircle, color: 'text-red-500 bg-red-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-xl p-4 flex items-center gap-3 ${color}`}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold text-xl leading-tight">{value}</p>
              <p className="text-xs font-medium opacity-80">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Completion rate */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 mb-4">Completion Rate</h2>
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="40" fill="none" stroke="#7c3aed" strokeWidth="10"
                  strokeDasharray={`${(stats.completionRate / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-violet-700">{stats.completionRate}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-slate-500">Avg Progress</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${stats.avgProgress}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{stats.avgProgress}%</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">{stats.completed} of {stats.total} learners completed</p>
            </div>
          </div>
        </div>

        {/* Status Pie */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 mb-2">Status Breakdown</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={65} dataKey="value" paddingAngle={2}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 py-8 text-center">No enrollment data</p>
          )}
        </div>
      </div>

      {/* Learner list */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="font-semibold text-slate-800 mb-4">Enrolled Learners ({courseEnrollments.length})</h2>
        {courseEnrollments.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No enrollments yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-400">Learner</th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-400">Role</th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-400">Progress</th>
                  <th className="text-left py-2 text-xs font-semibold text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {courseEnrollments.map(e => (
                  <tr key={e.enroll_id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 pr-4">
                      <Link to={`/users/${e.user_id}`} className="flex items-center gap-2 hover:text-violet-700">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {e.user?.name?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium text-slate-700 truncate">{e.user?.name || e.user_id}</span>
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.user?.role === 'VIP' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                        {e.user?.role || '-'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${e.progress_percent}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{e.progress_percent}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[e.status]}`}>
                        {STATUS_LABELS[e.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>}
    </div>
  );
}