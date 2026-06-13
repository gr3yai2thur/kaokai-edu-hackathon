import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { users, enrollments, getCategoryFromTitle, getLevelFromTitle, getCourseStats } from '@/lib/dataHelpers';
import { ArrowLeft, BookOpen, Users, Award, Clock, TrendingUp, CheckCircle2, XCircle, AlertCircle, Star, Download } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '@/lib/AuthContext';
import { useEnrollment, calcCoursePoints } from '@/hooks/useEnrollment';
import { useCourses } from '@/hooks/useCourses';
import CourseLessons from '@/components/CourseLessons';
import html2canvas from 'html2canvas';
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
  const { user, refreshProfile, isAdmin } = useAuth();
  const { enrollments: myEnrollments, enroll, drop, complete } = useEnrollment(user?.uid);
  const [actionLoading, setActionLoading] = useState(false);
  const allCourses = useCourses();
  const [lessonCount, setLessonCount] = useState(null);
  const [certLoading, setCertLoading] = useState(false);
  const certRef = useRef(null);

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

  const downloadCert = async () => {
    if (!certRef.current || certLoading) return;
    setCertLoading(true);
    try {
      const canvas = await html2canvas(certRef.current, { scale: 3, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
      pdf.save(`Certificate_${course.title.replace(/\s+/g, '_')}.pdf`);
    } finally {
      setCertLoading(false);
    }
  };

  const stats = getCourseStats(id);
  const category = getCategoryFromTitle(course.title);
  const level = getLevelFromTitle(course.title);
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
    <>
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
                  disabled={certLoading}
                  className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-amber-900 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {certLoading ? 'กำลังสร้าง PDF...' : '📜 รับใบประกาศนียบัตร'}
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

    {/* Hidden certificate template for PDF export */}
    {myStatus === 'COMPLETED' && (
      <div className="fixed -left-[9999px] -top-[9999px]">
        <div
          ref={certRef}
          style={{
            width: '1122px', height: '794px',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
            position: 'relative', overflow: 'hidden', fontFamily: 'Georgia, serif',
          }}
        >
          {/* Corner decorations */}
          {[['top-0 left-0','border-t-8 border-l-8'],['top-0 right-0','border-t-8 border-r-8'],['bottom-0 left-0','border-b-8 border-l-8'],['bottom-0 right-0','border-b-8 border-r-8']].map(([pos, border], i) => (
            <div key={i} className={`absolute ${pos} w-20 h-20 ${border} border-amber-400 opacity-80`} />
          ))}

          {/* Watermark circles */}
          <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'320px', height:'320px', borderRadius:'50%', background:'rgba(255,255,255,0.03)' }} />
          <div style={{ position:'absolute', bottom:'-60px', left:'-60px', width:'240px', height:'240px', borderRadius:'50%', background:'rgba(255,255,255,0.03)' }} />

          {/* Inner border */}
          <div style={{ position:'absolute', inset:'24px', border:'1.5px solid rgba(251,191,36,0.4)', borderRadius:'8px' }} />

          {/* Content */}
          <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', padding:'48px', textAlign:'center' }}>

            {/* Header badge */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px' }}>
              <div style={{ height:'1px', width:'80px', background:'linear-gradient(to right, transparent, #fbbf24)' }} />
              <span style={{ color:'#fbbf24', fontSize:'13px', letterSpacing:'4px', fontFamily:'Arial, sans-serif', fontWeight:600, textTransform:'uppercase' }}>KaoKai Education Platform</span>
              <div style={{ height:'1px', width:'80px', background:'linear-gradient(to left, transparent, #fbbf24)' }} />
            </div>

            {/* Title */}
            <div style={{ fontSize:'42px', fontWeight:'bold', color:'#fbbf24', letterSpacing:'6px', textTransform:'uppercase', marginBottom:'8px', textShadow:'0 2px 12px rgba(251,191,36,0.4)' }}>
              Certificate
            </div>
            <div style={{ fontSize:'16px', color:'rgba(196,181,253,0.9)', letterSpacing:'8px', textTransform:'uppercase', marginBottom:'36px', fontFamily:'Arial, sans-serif' }}>
              of Completion
            </div>

            {/* Divider */}
            <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'32px', width:'60%' }}>
              <div style={{ flex:1, height:'1px', background:'linear-gradient(to right, transparent, rgba(251,191,36,0.5))' }} />
              <div style={{ width:'8px', height:'8px', background:'#fbbf24', borderRadius:'50%', transform:'rotate(45deg)' }} />
              <div style={{ flex:1, height:'1px', background:'linear-gradient(to left, transparent, rgba(251,191,36,0.5))' }} />
            </div>

            <div style={{ color:'rgba(196,181,253,0.8)', fontSize:'15px', letterSpacing:'2px', marginBottom:'16px', fontFamily:'Arial, sans-serif' }}>
              THIS IS TO CERTIFY THAT
            </div>

            {/* Name */}
            <div style={{ fontSize:'48px', color:'#ffffff', fontWeight:'bold', marginBottom:'8px', textShadow:'0 2px 20px rgba(139,92,246,0.6)', letterSpacing:'2px' }}>
              {user?.displayName || user?.email}
            </div>
            <div style={{ width:'320px', height:'2px', background:'linear-gradient(to right, transparent, #a78bfa, transparent)', marginBottom:'28px' }} />

            <div style={{ color:'rgba(196,181,253,0.8)', fontSize:'15px', letterSpacing:'2px', marginBottom:'16px', fontFamily:'Arial, sans-serif' }}>
              HAS SUCCESSFULLY COMPLETED
            </div>

            {/* Course title */}
            <div style={{ fontSize:'22px', color:'#e0e7ff', fontWeight:600, maxWidth:'680px', lineHeight:1.4, marginBottom:'8px' }}>
              "{course.title}"
            </div>
            <div style={{ color:'rgba(167,139,250,0.7)', fontSize:'14px', marginBottom:'40px', fontFamily:'Arial, sans-serif' }}>
              Instructor: {course.instructor}
            </div>

            {/* Footer */}
            <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px', width:'60%' }}>
              <div style={{ flex:1, height:'1px', background:'linear-gradient(to right, transparent, rgba(251,191,36,0.3))' }} />
              <div style={{ width:'6px', height:'6px', background:'rgba(251,191,36,0.5)', borderRadius:'50%', transform:'rotate(45deg)' }} />
              <div style={{ flex:1, height:'1px', background:'linear-gradient(to left, transparent, rgba(251,191,36,0.3))' }} />
            </div>

            <div style={{ color:'rgba(148,163,184,0.7)', fontSize:'12px', letterSpacing:'3px', fontFamily:'Arial, sans-serif', textTransform:'uppercase' }}>
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
