import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { users, courses, enrollments, getUserStats } from '@/lib/dataHelpers';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, Mail, Phone, Star, BookOpen, TrendingUp, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

const STATUS_BADGE = {
  COMPLETED: 'bg-violet-100 text-violet-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  NOT_STARTED: 'bg-slate-100 text-slate-500',
  DROPPED: 'bg-red-100 text-red-600',
};
const STATUS_LABELS = { COMPLETED: 'Completed', IN_PROGRESS: 'In Progress', NOT_STARTED: 'Not Started', DROPPED: 'Dropped' };

export default function UserDetail() {
  const { id } = useParams();
  const [fsUser, setFsUser] = useState(null);
  const [loadingFs, setLoadingFs] = useState(false);

  useEffect(() => {
    const isMockUser = users.some(u => u.user_id === id);
    if (!isMockUser) {
      setFsUser(null);
      setLoadingFs(true);
      getDoc(doc(db, 'users', id))
        .then(snap => {
          if (snap.exists()) {
            const data = snap.data();
            const pts = data.loyalty_points || 0;
            setFsUser({
              user_id: id,
              name: data.name || '',
              email: data.email || '',
              phone: data.phone || '',
              loyalty_points: pts,
              role: pts >= 1000 ? 'VIP' : 'MEMBER',
            });
          }
          setLoadingFs(false);
        })
        .catch(() => setLoadingFs(false));
    }
  }, [id]);

  const mockUser = users.find(u => u.user_id === id);

  if (!mockUser && loadingFs) return (
    <div className="p-6 flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  );

  const user = mockUser || fsUser;

  if (!user) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-slate-500">User not found</p>
        <Link to="/users" className="text-violet-600 hover:underline text-sm mt-2 inline-block">← Back to Users</Link>
      </div>
    );
  }

  const stats = getUserStats(id);
  const userEnrollments = enrollments
    .filter(e => e.user_id === id)
    .map(e => ({ ...e, course: courses.find(c => c.course_id === e.course_id) }));

  const loyaltyTier = user.loyalty_points >= 2000 ? 'Platinum' : user.loyalty_points >= 1000 ? 'Gold' : user.loyalty_points >= 500 ? 'Silver' : 'Bronze';
  const tierColors = { Platinum: 'text-purple-700 bg-purple-100', Gold: 'text-amber-700 bg-amber-100', Silver: 'text-slate-600 bg-slate-100', Bronze: 'text-orange-700 bg-orange-100' };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link to="/users" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </Link>

      {/* Profile Hero */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-slate-800">{user.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'VIP' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                {user.role === 'VIP' && <Star className="w-3 h-3 inline mr-1" fill="currentColor" />}
                {user.role}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tierColors[loyaltyTier]}`}>
                {loyaltyTier} Tier
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" />{user.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" />{user.phone}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-violet-700">{user.loyalty_points.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-0.5">Loyalty Points</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-violet-600 bg-violet-50' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-blue-600 bg-blue-50' },
          { label: 'Dropped', value: stats.dropped, icon: XCircle, color: 'text-red-500 bg-red-50' },
          { label: 'Avg Progress', value: `${stats.avgProgress}%`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-xl p-4 flex items-center gap-3 ${color}`}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold text-lg leading-tight">{value}</p>
              <p className="text-xs font-medium opacity-80">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Completion Rate visual */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Overall Progress</h2>
          <span className="text-xl font-bold text-violet-700">{stats.completionRate}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all" style={{ width: `${stats.completionRate}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-2">{stats.completed} completed out of {stats.total} enrolled courses</p>
      </div>

      {/* Enrolled courses */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="font-semibold text-slate-800 mb-4">Enrolled Courses ({userEnrollments.length})</h2>
        {userEnrollments.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No enrollments yet</p>
        ) : (
          <div className="space-y-3">
            {userEnrollments.map(e => (
              <Link
                key={e.enroll_id}
                to={`/courses/${e.course_id}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700 truncate text-sm group-hover:text-violet-700 transition-colors">{e.course?.title || e.course_id}</p>
                  <p className="text-xs text-slate-400">by {e.course?.instructor}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${e.progress_percent}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{e.progress_percent}%</span>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_BADGE[e.status]}`}>
                  {STATUS_LABELS[e.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}