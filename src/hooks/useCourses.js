import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { courses as staticCourses } from '@/lib/dataHelpers';

// Merge static JSON courses + Firestore courses (Firestore wins on same course_id)
export function useCourses() {
  const [fsCourses, setFsCourses] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'courses'), snap => {
      setFsCourses(snap.docs.map(d => ({ course_id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  if (fsCourses === null) return null; // loading

  const fsIds = new Set(fsCourses.map(c => c.course_id));
  return [
    ...staticCourses.filter(c => !fsIds.has(c.course_id)),
    ...fsCourses,
  ];
}
