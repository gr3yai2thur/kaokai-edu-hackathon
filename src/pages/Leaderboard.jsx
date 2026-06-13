import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { Trophy, Award, Flame, Medal } from 'lucide-react';

export default function Leaderboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(query(collection(db, 'users'), orderBy('loyalty_points', 'desc'), limit(50)));
      setUsers(snap.docs
        .map(d => ({ uid: d.id, ...d.data() }))
        .filter(u => u.role !== 'admin')
      );
      setLoading(false);
    };
    fetch();
  }, []);

  const rankIcon = (i) => {
    if (i === 0) return <Trophy className="w-5 h-5 text-amber-500" />;
    if (i === 1) return <Medal className="w-5 h-5 text-slate-400" />;
    if (i === 2) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="text-sm font-bold text-slate-400 w-5 text-center">{i + 1}</span>;
  };

  if (loading) return <div className="p-6 text-center text-slate-400 py-20">กำลังโหลด...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-amber-500" />
        <h1 className="text-2xl font-bold text-slate-800">Leaderboard</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {users.length === 0 ? (
          <p className="text-center text-slate-400 py-12">ยังไม่มีข้อมูล</p>
        ) : (
          <div>
            {users.map((u, i) => {
              const isMe = u.uid === user?.uid;
              return (
                <div
                  key={u.uid}
                  className={`flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0 transition-colors ${isMe ? 'bg-violet-50' : i < 3 ? 'bg-amber-50/40' : ''}`}
                >
                  <div className="w-6 flex items-center justify-center flex-shrink-0">
                    {rankIcon(i)}
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {(u.name || u.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isMe ? 'text-violet-700' : 'text-slate-700'}`}>
                      {u.name || u.email} {isMe && <span className="text-xs font-normal">(คุณ)</span>}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {u.membership_role === 'VIP' && (
                        <span className="text-xs font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">VIP</span>
                      )}
                      {(u.streak ?? 0) > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-orange-500">
                          <Flame className="w-3 h-3" />{u.streak}d
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-slate-800 text-sm">{u.loyalty_points ?? 0}</span>
                    <span className="text-xs text-slate-400">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
