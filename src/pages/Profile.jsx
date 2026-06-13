import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useEnrollment } from '@/hooks/useEnrollment';
import { useCourses } from '@/hooks/useCourses';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { Award, BookOpen, CheckCircle2, Flame, Star, Edit2, Check, X } from 'lucide-react';

const BADGE_META = {
  badge_scholar: { label: 'Scholar', icon: BookOpen, cls: 'bg-blue-100 text-blue-700' },
  badge_achiever: { label: 'Achiever', icon: Award, cls: 'bg-amber-100 text-amber-700' },
  badge_elite: { label: 'Elite', icon: Star, cls: 'bg-violet-100 text-violet-700' },
};

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const { enrollments } = useEnrollment(user?.uid);
  const allCourses = useCourses();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const completedCourses = Object.values(enrollments).filter(e => e.status === 'COMPLETED').length;
  const inProgressCourses = Object.values(enrollments).filter(e => e.status === 'IN_PROGRESS').length;
  const totalCourses = allCourses?.length ?? 0;
  const streak = profile?.streak ?? 0;
  const pts = profile?.loyalty_points ?? 0;

  const handleSave = async () => {
    if (!name.trim()) return setError('กรุณากรอกชื่อ');
    setSaving(true);
    setError('');
    try {
      await updateProfile(user, { displayName: name.trim() });
      await updateDoc(doc(db, 'users', user.uid), { name: name.trim() });
      await refreshProfile();
      setEditing(false);
    } catch {
      setError('บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Profile</h1>

      {/* Profile card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {(profile?.name || user?.displayName || user?.email || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="flex-1 border border-violet-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
                <button onClick={handleSave} disabled={saving} className="p-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => { setEditing(false); setName(profile?.name || ''); setError(''); }} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-800 text-lg truncate">{profile?.name || user?.displayName}</p>
                <button onClick={() => setEditing(true)} className="p-1 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            <p className="text-sm text-slate-400 truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${profile?.membership_role === 'VIP' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                {profile?.membership_role || 'MEMBER'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Points', value: pts, icon: Award, color: 'bg-amber-50 text-amber-600' },
            { label: 'Streak', value: `${streak} วัน`, icon: Flame, color: 'bg-orange-50 text-orange-600' },
            { label: 'จบแล้ว', value: completedCourses, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'กำลังเรียน', value: inProgressCourses, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`rounded-xl p-3 flex flex-col items-center gap-1 ${color}`}>
              <Icon className="w-5 h-5" />
              <p className="font-bold text-lg leading-tight">{value}</p>
              <p className="text-xs opacity-70">{label}</p>
            </div>
          ))}
        </div>

        {/* Course progress bar */}
        {totalCourses > 0 && (
          <div className="mt-5">
            <div className="flex justify-between text-sm text-slate-500 mb-1.5">
              <span>คอร์สที่เรียนจบ</span>
              <span className="font-semibold text-slate-700">{completedCourses} / {totalCourses}</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all"
                style={{ width: `${Math.round((completedCourses / totalCourses) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">{Math.round((completedCourses / totalCourses) * 100)}% ของคอร์สทั้งหมด</p>
          </div>
        )}
      </div>

      {/* Badges */}
      {profile?.badges?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 mb-3">Badges ที่ได้รับ</h2>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map(id => {
              const m = BADGE_META[id];
              if (!m) return null;
              const Icon = m.icon;
              return (
                <span key={id} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border ${m.cls}`}>
                  <Icon className="w-4 h-4" /> {m.label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
