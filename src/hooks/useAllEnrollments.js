import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Live Firestore enrollments for all users (admin/global use)
export function useAllEnrollments() {
  const [enrollments, setEnrollments] = useState(null); // null = loading
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'enrollments'), snap => {
      setEnrollments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);
  return enrollments; // null while loading, array when ready
}
