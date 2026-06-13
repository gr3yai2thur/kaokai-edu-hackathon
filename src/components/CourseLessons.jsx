import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updateDoc } from 'firebase/firestore';
import { CheckCircle2, Circle, PlayCircle, Lock } from 'lucide-react';

// Extract YouTube video ID from various URL formats
function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function CourseLessons({ courseId, enrollmentId, isEnrolled, onProgressUpdate }) {
  const [lessons, setLessons] = useState([]);
  const [completedSet, setCompletedSet] = useState(new Set());
  const [activeLesson, setActiveLesson] = useState(null);

  // Load lessons for this course
  useEffect(() => {
    if (!courseId) return;
    const unsub = onSnapshot(collection(db, 'courses', courseId, 'lessons'), snap => {
      const data = snap.docs
        .map(d => ({ lesson_id: d.id, ...d.data() }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setLessons(data);
      if (data.length > 0 && !activeLesson) setActiveLesson(data[0]);
    });
    return unsub;
  }, [courseId]);

  // Load completed lessons for this enrollment
  useEffect(() => {
    if (!enrollmentId) return;
    const unsub = onSnapshot(collection(db, 'enrollments', enrollmentId, 'completed_lessons'), snap => {
      setCompletedSet(new Set(snap.docs.map(d => d.id)));
    });
    return unsub;
  }, [enrollmentId]);

  const markComplete = async (lessonId) => {
    if (!enrollmentId || completedSet.has(lessonId)) return;
    await setDoc(doc(db, 'enrollments', enrollmentId, 'completed_lessons', lessonId), { completed_at: new Date() });
    const newCompleted = new Set([...completedSet, lessonId]);
    const progress = lessons.length > 0 ? Math.round((newCompleted.size / lessons.length) * 100) : 0;
    await updateDoc(doc(db, 'enrollments', enrollmentId), { progress_percent: progress });
    if (onProgressUpdate) onProgressUpdate(progress);
  };

  if (lessons.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <PlayCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">ยังไม่มี lessons สำหรับคอร์สนี้</p>
      </div>
    );
  }

  const videoId = extractYouTubeId(activeLesson?.video_url);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Video Player */}
      <div className="lg:col-span-2">
        {activeLesson && (
          <div>
            {videoId ? (
              <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow">
                <iframe
                  key={videoId}
                  src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                  title={activeLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <PlayCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">ไม่มี Video URL</p>
                </div>
              </div>
            )}
            <div className="mt-3 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">{activeLesson.title}</h3>
                {activeLesson.duration && <p className="text-xs text-slate-400 mt-0.5">{activeLesson.duration}</p>}
              </div>
              {isEnrolled && !completedSet.has(activeLesson.lesson_id) && (
                <button
                  onClick={() => markComplete(activeLesson.lesson_id)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Complete
                </button>
              )}
              {isEnrolled && completedSet.has(activeLesson.lesson_id) && (
                <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Completed
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lesson List */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">Lessons</p>
          <p className="text-xs text-slate-400">{completedSet.size}/{lessons.length} completed</p>
        </div>
        <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
          {lessons.map((lesson, i) => {
            const done = completedSet.has(lesson.lesson_id);
            const isActive = activeLesson?.lesson_id === lesson.lesson_id;
            const locked = !isEnrolled && i > 0;
            return (
              <button
                key={lesson.lesson_id}
                onClick={() => !locked && setActiveLesson(lesson)}
                disabled={locked}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${isActive ? 'bg-violet-50' : 'hover:bg-slate-50'} ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {locked ? <Lock className="w-4 h-4 text-slate-300" /> :
                   done ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                   <Circle className={`w-4 h-4 ${isActive ? 'text-violet-500' : 'text-slate-300'}`} />}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-medium truncate ${isActive ? 'text-violet-700' : 'text-slate-700'}`}>
                    {i + 1}. {lesson.title}
                  </p>
                  {lesson.duration && <p className="text-xs text-slate-400 mt-0.5">{lesson.duration}</p>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
