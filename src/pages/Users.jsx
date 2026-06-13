import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { users, getUserStats } from '@/lib/dataHelpers';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Search, Users as UsersIcon, Star, Filter, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLE_BADGE = {
  VIP: 'bg-amber-100 text-amber-700 border border-amber-200',
  MEMBER: 'bg-slate-100 text-slate-600 border border-slate-200',
};

export default function Users() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [firestoreUsers, setFirestoreUsers] = useState([]);
  const [error, setError] = useState(null);

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
            };
          })
          .filter(fu => !users.some(mu => mu.email === fu.email));
        setFirestoreUsers(fsUsers);
      })
      .catch(err => {
        console.error("Firestore fetch error:", err);
        setError(err.message || String(err));
      });
  }, []);

  const allUsers = useMemo(() => [...users, ...firestoreUsers], [firestoreUsers]);

  const enriched = useMemo(() => allUsers.map(u => ({
    ...u,
    ...getUserStats(u.user_id),
  })), [allUsers]);

  const filtered = useMemo(() => {
    let result = enriched.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'All' || u.role === roleFilter;
      return matchSearch && matchRole;
    });
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'points') return b.loyalty_points - a.loyalty_points;
      if (sortBy === 'courses') return b.total - a.total;
      if (sortBy === 'completion') return b.completionRate - a.completionRate;
      return 0;
    });
    return result;
  }, [enriched, search, roleFilter, sortBy]);

  const vipCount = allUsers.filter(u => u.role === 'VIP').length;
  const memberCount = allUsers.filter(u => u.role === 'MEMBER').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Users</h1>
        <p className="text-slate-500 text-sm mt-1">{filtered.length} of {allUsers.length} users</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>เกิดข้อผิดพลาดในการดึงข้อมูลจาก Firestore: {error} (กำลังแสดงเฉพาะรายชื่อจำลอง 15 คน)</span>
        </div>
      )}

      {/* Role summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
          <Star className="w-8 h-8 text-amber-500" fill="#f59e0b" />
          <div>
            <p className="text-2xl font-bold text-amber-700">{vipCount}</p>
            <p className="text-sm text-amber-600">VIP Members</p>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
          <UsersIcon className="w-8 h-8 text-slate-400" />
          <div>
            <p className="text-2xl font-bold text-slate-700">{memberCount}</p>
            <p className="text-sm text-slate-500">Regular Members</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 relative min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อหรืออีเมล..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 bg-slate-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {['All', 'VIP', 'MEMBER'].map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={cn('px-3 py-2 rounded-xl text-xs font-medium transition-all', roleFilter === role ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
              >
                {role}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-slate-50 text-slate-600"
          >
            <option value="name">Sort: Name</option>
            <option value="points">Sort: Loyalty Points</option>
            <option value="courses">Sort: Courses Enrolled</option>
            <option value="completion">Sort: Completion Rate</option>
          </select>
        </div>
      </div>

      {/* User cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(user => (
          <Link
            key={user.user_id}
            to={`/users/${user.user_id}`}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-violet-200 transition-all group"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800 truncate group-hover:text-violet-700 transition-colors">{user.name}</p>
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-violet-500 transition-colors flex-shrink-0" />
                </div>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${ROLE_BADGE[user.role]}`}>
                {user.role === 'VIP' && <Star className="w-3 h-3 inline mr-0.5" fill="currentColor" />}
                {user.role}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-slate-50 rounded-xl p-2 text-center">
                <p className="font-bold text-slate-700 text-sm">{user.total}</p>
                <p className="text-xs text-slate-400 leading-tight">Enrolled</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-2 text-center">
                <p className="font-bold text-violet-700 text-sm">{user.completed}</p>
                <p className="text-xs text-violet-400 leading-tight">Done</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-2 text-center">
                <p className="font-bold text-amber-700 text-sm">{user.loyalty_points.toLocaleString()}</p>
                <p className="text-xs text-amber-400 leading-tight">Points</p>
              </div>
            </div>

            {/* Completion bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Completion</span>
                <span className="font-medium text-violet-600">{user.completionRate}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${user.completionRate}%` }} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No users found</p>
        </div>
      )}
    </div>
  );
}