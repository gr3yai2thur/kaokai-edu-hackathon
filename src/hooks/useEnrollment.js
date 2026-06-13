import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, getDoc, doc, setDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// points awarded per course = total_lessons * 10
export function calcCoursePoints(totalLessons) {
  return (totalLessons || 1) * 10;
}

export function useEnrollment(userId) {
  const [enrollments, setEnrollments] = useState({}); // { courseId: { status, progress_percent, enrollId } }
  const [loading, setLoading] = useState(false);

  const fetchEnrollments = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'enrollments'), where('user_id', '==', userId));
      const snap = await getDocs(q);
      const map = {};
      snap.docs.forEach(d => {
        const data = d.data();
        map[data.course_id] = { enrollId: d.id, status: data.status, progress_percent: data.progress_percent ?? 0 };
      });
      setEnrollments(map);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);

  const enroll = useCallback(async (courseId) => {
    if (!userId) return;
    const enrollId = `${userId}_${courseId}`;
    await setDoc(doc(db, 'enrollments', enrollId), {
      user_id: userId,
      course_id: courseId,
      status: 'IN_PROGRESS',
      progress_percent: 0,
    });
    setEnrollments(prev => ({ ...prev, [courseId]: { enrollId, status: 'IN_PROGRESS', progress_percent: 0 } }));
  }, [userId]);

  const drop = useCallback(async (courseId) => {
    if (!userId) return;
    const enrollId = `${userId}_${courseId}`;
    await deleteDoc(doc(db, 'enrollments', enrollId));
    setEnrollments(prev => {
      const next = { ...prev };
      delete next[courseId];
      return next;
    });
  }, [userId]);

  // Mark complete → award points → upgrade to VIP if >= 1000
  const complete = useCallback(async (courseId, totalLessons, refreshProfile) => {
    if (!userId) return;
    const enrollId = `${userId}_${courseId}`;
    await updateDoc(doc(db, 'enrollments', enrollId), { status: 'COMPLETED', progress_percent: 100 });
    const pts = calcCoursePoints(totalLessons);
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { loyalty_points: increment(pts) });
    // re-read to check VIP threshold
    const snap = await getDoc(userRef);
    if (snap.exists() && (snap.data().loyalty_points >= 1000)) {
      await updateDoc(userRef, { membership_role: 'VIP' });
    }
    setEnrollments(prev => ({ ...prev, [courseId]: { ...prev[courseId], status: 'COMPLETED', progress_percent: 100 } }));
    if (refreshProfile) await refreshProfile();
  }, [userId]);

  return { enrollments, loading, enroll, drop, complete, refetch: fetchEnrollments };
}
