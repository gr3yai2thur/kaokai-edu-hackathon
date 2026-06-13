import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { enrollments as staticEnrollments } from '@/lib/dataHelpers';

export function useAllEnrollments() {
  const [fsEnrollments, setFsEnrollments] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'enrollments'), snap => {
      setFsEnrollments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  if (fsEnrollments === null) return null; // still loading

  // Merge: Firestore overrides static JSON entries with same enroll_id/id
  const fsIds = new Set(fsEnrollments.map(e => e.id));
  const merged = [
    ...staticEnrollments.filter(e => !fsIds.has(e.enroll_id)),
    ...fsEnrollments,
  ];
  return merged;
}
