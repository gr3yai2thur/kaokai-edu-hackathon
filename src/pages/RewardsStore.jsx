import { useState } from 'react';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { Award, Star, Crown, BookOpen, Zap, Gift, CheckCircle2 } from 'lucide-react';

const REWARDS = [
  {
    id: 'badge_scholar',
    title: 'Badge: Scholar',
    desc: 'แสดงบนโปรไฟล์ — ผู้ใฝ่รู้',
    points: 100,
    icon: BookOpen,
    color: 'bg-blue-50 text-blue-600',
    border: 'border-blue-100',
    type: 'badge',
  },
  {
    id: 'badge_achiever',
    title: 'Badge: Achiever',
    desc: 'แสดงบนโปรไฟล์ — ผู้พิชิตเป้าหมาย',
    points: 300,
    icon: Award,
    color: 'bg-amber-50 text-amber-600',
    border: 'border-amber-100',
    type: 'badge',
  },
  {
    id: 'badge_elite',
    title: 'Badge: Elite',
    desc: 'แสดงบนโปรไฟล์ — ระดับสูงสุด',
    points: 600,
    icon: Star,
    color: 'bg-violet-50 text-violet-600',
    border: 'border-violet-100',
    type: 'badge',
  },
  {
    id: 'ai_boost',
    title: 'AI Chat Boost (7 วัน)',
    desc: 'ปลดล็อกการถามแบบ AI ไม่จำกัดนาน 7 วัน',
    points: 200,
    icon: Zap,
    color: 'bg-emerald-50 text-emerald-600',
    border: 'border-emerald-100',
    type: 'ai_boost',
  },
];

export default function RewardsStore() {
  const { user, profile, refreshProfile } = useAuth();
  const pts = profile?.loyalty_points ?? 0;
  const isVIP = profile?.membership_role === 'VIP' || pts >= 1000;
  const toVIP = Math.max(0, 1000 - pts);
  const vipProgress = Math.min(100, Math.round((pts / 1000) * 100));

  const redeemedBadges = profile?.badges ?? [];
  const aiBoostUntil = profile?.ai_boost_until ? new Date(profile.ai_boost_until) : null;
  const aiActive = aiBoostUntil && aiBoostUntil > new Date();

  const [loading, setLoading] = useState(null); // reward id being redeemed
  const [toast, setToast] = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const isRedeemed = (reward) => {
    if (reward.type === 'badge') return redeemedBadges.includes(reward.id);
    if (reward.type === 'ai_boost') return aiActive;
    return false;
  };

  const handleRedeem = async (reward) => {
    if (!user) return;
    if (pts < reward.points) return;
    setLoading(reward.id);
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const currentPts = snap.data()?.loyalty_points ?? 0;
      if (currentPts < reward.points) { showToast('points ไม่พอ', false); return; }

      const updates = { loyalty_points: currentPts - reward.points };

      if (reward.type === 'badge') {
        updates.badges = arrayUnion(reward.id);
      } else if (reward.type === 'ai_boost') {
        const until = new Date();
        until.setDate(until.getDate() + 7);
        updates.ai_boost_until = until.toISOString();
      }

      await updateDoc(userRef, updates);
      await refreshProfile();
      showToast(`แลก "${reward.title}" สำเร็จ! 🎉`);
    } catch (e) {
      showToast('เกิดข้อผิดพลาด', false);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Rewards Store</h1>
        <p className="text-slate-500 text-sm mt-1">สะสม points จากการเรียนจบคอร์สเพื่อแลกของรางวัล</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${toast.ok ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Points Card */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-violet-200 text-sm">Your Points</p>
            <p className="text-5xl font-black mt-1">{pts.toLocaleString()}</p>
          </div>
          {isVIP ? (
            <div className="bg-yellow-400 text-yellow-900 font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-2">
              <Crown className="w-4 h-4" /> VIP
            </div>
          ) : (
            <div className="bg-white/10 px-4 py-2 rounded-xl text-center">
              <p className="text-violet-200 text-xs">MEMBER</p>
              <p className="text-white font-semibold text-sm mt-0.5">{toVIP} pts to VIP</p>
            </div>
          )}
        </div>

        {!isVIP && (
          <div>
            <div className="flex justify-between text-xs text-violet-200 mb-1.5">
              <span>Progress to VIP (อัตโนมัติ)</span>
              <span>{pts} / 1,000 pts</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${vipProgress}%` }} />
            </div>
          </div>
        )}
        {isVIP && (
          <div className="flex items-center gap-2 text-yellow-300 text-sm">
            <Crown className="w-4 h-4" />
            <span>คุณเป็นสมาชิก VIP แล้ว! ได้รับสิทธิพิเศษทุกอย่าง</span>
          </div>
        )}
      </div>

      {/* My Items */}
      {(redeemedBadges.length > 0 || aiActive) && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> ของรางวัลที่มี
          </h2>
          <div className="flex flex-wrap gap-2">
            {redeemedBadges.map(id => {
              const r = REWARDS.find(x => x.id === id);
              return r ? (
                <span key={id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${r.color} ${r.border}`}>
                  <r.icon className="w-3.5 h-3.5" /> {r.title}
                </span>
              ) : null;
            })}
            {aiActive && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                <Zap className="w-3.5 h-3.5" /> AI Boost (หมด {aiBoostUntil.toLocaleDateString('th-TH')})
              </span>
            )}
          </div>
        </div>
      )}

      {/* How to earn */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
        <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" /> วิธีสะสม Points
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600">
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3">
            <BookOpen className="w-4 h-4 text-violet-500 flex-shrink-0" />
            <span>เรียนจบคอร์ส = <strong className="text-violet-600">lessons × 10 pts</strong></span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3">
            <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            <span>ครบ <strong className="text-yellow-600">1,000 pts</strong> = อัปเกรด VIP อัตโนมัติ</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3">
            <Gift className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>แลก points รับ <strong className="text-emerald-600">ของรางวัล</strong></span>
          </div>
        </div>
      </div>

      {/* Rewards Catalog */}
      <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Gift className="w-4 h-4 text-violet-500" /> ของรางวัล
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REWARDS.map(reward => {
          const canRedeem = pts >= reward.points;
          const redeemed = isRedeemed(reward);
          const isLoading = loading === reward.id;
          return (
            <div key={reward.id} className={`bg-white rounded-2xl p-5 shadow-sm border ${reward.border} flex flex-col gap-3`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${reward.color}`}>
                <reward.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm">{reward.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{reward.desc}</p>
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" />
                  {reward.points.toLocaleString()} pts
                </p>
              </div>
              {redeemed ? (
                <div className="w-full text-xs font-semibold py-2 rounded-xl bg-emerald-50 text-emerald-600 text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> มีแล้ว
                </div>
              ) : (
                <button
                  disabled={!canRedeem || isLoading || !user}
                  onClick={() => handleRedeem(reward)}
                  className={`w-full text-xs font-semibold py-2 rounded-xl transition-colors ${canRedeem && user
                    ? 'bg-violet-600 hover:bg-violet-700 text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                >
                  {isLoading ? 'กำลังแลก...' : canRedeem ? 'แลกรางวัล' : `ต้องการอีก ${(reward.points - pts).toLocaleString()} pts`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
