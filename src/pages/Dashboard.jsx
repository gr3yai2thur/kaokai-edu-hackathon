import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { users, courses, enrollments, getTopCoursesByEnrollment, getStatusBreakdown, getInstructorStats, getCategoryFromTitle } from '@/lib/dataHelpers';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { Users, BookOpen, TrendingUp, Award, ArrowRight, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';

const STATUS_COLORS = {
  COMPLETED: '#7c3aed',
  IN_PROGRESS: '#2563eb',
  NOT_STARTED: '#94a3b8',
  DROPPED: '#ef4444',
};

const STATUS_LABELS = {
  COMPLETED: 'Completed',
  IN_PROGRESS: 'In Progress',
  NOT_STARTED: 'Not Started',
  DROPPED: 'Dropped',
};

function KPICard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [firestoreUsers, setFirestoreUsers] = useState([]);

  useEffect(() => {
    getDocs(collection(db, 'users'))
      .then(snapshot => {
        const fsUsers = snapshot.docs
          .map(d => {
            const data = d.data();
            const pts = data.loyalty_points || 0;
            return {
              user_id: d.id,
              name: data.name || data.email?.split('@')[0] || 'Unknown User',
              email: data.email || '',
              phone: data.phone || '',
              loyalty_points: pts,
              role: pts >= 1000 ? 'VIP' : 'MEMBER',
              isAdmin: data.role === 'admin',
            };
          })
          .filter(fu => !fu.isAdmin)
          .filter(fu => !users.some(mu => mu.email === fu.email));
        setFirestoreUsers(fsUsers);
      })
      .catch(err => console.error("Dashboard error fetching users:", err));
  }, []);

  const allUsers = useMemo(() => [...users, ...firestoreUsers], [firestoreUsers]);

  const statusBreakdown = useMemo(() => getStatusBreakdown(), []);
  const topCourses = useMemo(() => getTopCoursesByEnrollment(6), []);
  const instructorStats = useMemo(() => getInstructorStats().slice(0, 5), []);

  const completionRate = useMemo(() => {
    const total = enrollments.length;
    const completed = enrollments.filter(e => e.status === 'COMPLETED').length;
    return Math.round((completed / total) * 100);
  }, []);

  const pieData = useMemo(() =>
    Object.entries(statusBreakdown).map(([key, value]) => ({
      name: STATUS_LABELS[key],
      value,
      color: STATUS_COLORS[key],
    })), [statusBreakdown]);

  const categoryData = useMemo(() => {
    const counts = {};
    courses.forEach(c => {
      const cat = getCategoryFromTitle(c.title);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  const vipCount = useMemo(() => allUsers.filter(u => u.role === 'VIP').length, [allUsers]);
  const avgLoyalty = useMemo(() => allUsers.length > 0 ? Math.round(allUsers.reduce((s, u) => s + u.loyalty_points, 0) / allUsers.length) : 0, [allUsers]);

  const top10CoursesBarData = useMemo(() => getTopCoursesByEnrollment(10).map(({ course, enrollmentCount }) => ({
    name: course?.title?.length > 22 ? course.title.slice(0, 22) + '…' : course?.title,
    fullName: course?.title,
    enrollments: enrollmentCount,
  })), []);

  const studentSummaryData = useMemo(() => [
    { name: 'Completed', value: statusBreakdown.COMPLETED, fill: '#7c3aed' },
    { name: 'In Progress', value: statusBreakdown.IN_PROGRESS, fill: '#2563eb' },
    { name: 'Not Started', value: statusBreakdown.NOT_STARTED, fill: '#94a3b8' },
    { name: 'Dropped', value: statusBreakdown.DROPPED, fill: '#ef4444' },
  ], [statusBreakdown]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">ภาพรวมระบบการเรียนรู้และสถิติสำคัญ</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard icon={Users} label="Total Users" value={allUsers.length} sub={`${vipCount} VIP`} color="bg-gradient-to-br from-violet-500 to-violet-700" />
        <KPICard icon={BookOpen} label="Total Courses" value={courses.length} sub="50 active" color="bg-gradient-to-br from-blue-500 to-blue-700" />
        <KPICard icon={TrendingUp} label="Enrollments" value={enrollments.length} sub={`${statusBreakdown.IN_PROGRESS} in progress`} color="bg-gradient-to-br from-emerald-500 to-emerald-700" />
        <KPICard icon={Award} label="Completion Rate" value={`${completionRate}%`} sub={`${statusBreakdown.COMPLETED} completed`} color="bg-gradient-to-br from-amber-500 to-orange-600" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Completed', value: statusBreakdown.COMPLETED, icon: CheckCircle2, color: 'text-violet-600 bg-violet-50' },
          { label: 'In Progress', value: statusBreakdown.IN_PROGRESS, icon: Clock, color: 'text-blue-600 bg-blue-50' },
          { label: 'Not Started', value: statusBreakdown.NOT_STARTED, icon: AlertCircle, color: 'text-slate-500 bg-slate-100' },
          { label: 'Dropped', value: statusBreakdown.DROPPED, icon: XCircle, color: 'text-red-500 bg-red-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-xl p-4 flex items-center gap-3 ${color}`}>
            <Icon className="w-5 h-5" />
            <div>
              <p className="font-bold text-lg leading-tight">{value}</p>
              <p className="text-xs font-medium opacity-80">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Pie */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 mb-4">Enrollment Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 mb-4">Courses by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip />
              <Bar dataKey="value" fill="#7c3aed" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Student Summary + Course Popularity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Total Students Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 mb-1">นักเรียนทั้งหมด</h2>
          <p className="text-xs text-slate-400 mb-4">สรุปจำนวนนักเรียนตามสถานะ</p>
          <div className="flex items-center justify-center mb-5">
            <div className="text-center">
              <p className="text-5xl font-black text-violet-700">{enrollments.length}</p>
              <p className="text-sm text-slate-400 mt-1">Total Enrollments</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {studentSummaryData.map(({ name, value, fill }) => (
              <div key={name} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: fill }} />
                <span className="text-sm text-slate-600 flex-1">{name}</span>
                <span className="text-sm font-semibold text-slate-800">{value}</span>
                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.round((value / enrollments.length) * 100)}%`, backgroundColor: fill }} />
                </div>
                <span className="text-xs text-slate-400 w-8 text-right">{Math.round((value / enrollments.length) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Course Popularity Bar */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-slate-800">ความนิยมของคอร์ส</h2>
            <Link to="/courses" className="text-xs text-violet-600 hover:underline flex items-center gap-1">
              ดูทั้งหมด <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-xs text-slate-400 mb-4">Top 10 คอร์สที่มีผู้ลงทะเบียนมากที่สุด</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={top10CoursesBarData} layout="vertical" margin={{ left: 8, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value) => [value, 'Enrollments']}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Bar dataKey="enrollments" radius={[0, 6, 6, 0]} fill="#7c3aed">
                {top10CoursesBarData.map((entry, i) => (
                  <Cell key={i} fill={i === 0 ? '#5b21b6' : i <= 2 ? '#7c3aed' : '#a78bfa'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Courses & Instructors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Top Enrolled Courses</h2>
            <Link to="/courses" className="text-xs text-violet-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topCourses.map(({ course, enrollmentCount }, i) => (
              <Link key={course?.course_id} to={`/courses/${course?.course_id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-600'}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate group-hover:text-violet-700">{course?.title}</p>
                  <p className="text-xs text-slate-400">{course?.instructor}</p>
                </div>
                <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{enrollmentCount}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Instructors */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Top Instructors</h2>
          </div>
          <div className="space-y-3">
            {instructorStats.map((inst, i) => (
              <div key={inst.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {inst.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">{inst.name}</p>
                  <p className="text-xs text-slate-400">{inst.courses} courses · {inst.enrollments} enrollments</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-emerald-600">{inst.completions}</p>
                  <p className="text-xs text-slate-400">completed</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Avg loyalty */}
      {isAdmin && (
        <div className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-violet-200 text-sm">Average Loyalty Points per User</p>
            <p className="text-4xl font-bold mt-1">{avgLoyalty.toLocaleString()}</p>
          </div>
          <Link to="/users" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition rounded-xl px-4 py-2.5 text-sm font-medium">
            View All Users <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}