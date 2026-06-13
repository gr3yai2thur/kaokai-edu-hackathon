import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CheckCircle2, Circle, PlayCircle, Lock, XCircle } from 'lucide-react';

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function CourseLessons({ courseId, enrollmentId, isEnrolled, onProgressUpdate }) {
  const [lessons, setLessons] = useState([]);
  const [completedSet, setCompletedSet] = useState(new Set());
  const [activeLesson, setActiveLesson] = useState(null);
  const [quiz, setQuiz] = useState(null); // null=none/loading, object=has quiz
  const [quizState, setQuizState] = useState('hidden'); // 'hidden'|'show'|'correct'|'wrong'
  const [selected, setSelected] = useState(null);

  // Load lessons
  useEffect(() => {
    if (!courseId) return;
    const unsub = onSnapshot(collection(db, 'courses', courseId, 'lessons'), snap => {
      const data = snap.docs.map(d => ({ lesson_id: d.id, ...d.data() })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setLessons(data);
      if (data.length > 0) setActiveLesson(prev => prev ?? data[0]);
    });
    return unsub;
  }, [courseId]);

  // Load completed lessons
  useEffect(() => {
    if (!enrollmentId) return;
    const unsub = onSnapshot(collection(db, 'enrollments', enrollmentId, 'completed_lessons'), snap => {
      setCompletedSet(new Set(snap.docs.map(d => d.id)));
    });
    return unsub;
  }, [enrollmentId]);

  // Load quiz when active lesson changes
  useEffect(() => {
    if (!activeLesson) return;
    setQuizState('hidden');
    setSelected(null);
    setQuiz(null);
    getDoc(doc(db, 'courses', courseId, 'lessons', activeLesson.lesson_id, 'quiz', 'q1'))
      .then(snap => setQuiz(snap.exists() ? snap.data() : false));
  }, [activeLesson?.lesson_id]);

  const selectLesson = (lesson) => {
    setActiveLesson(lesson);
  };

  const handleMarkComplete = async () => {
    if (!enrollmentId || !activeLesson || completedSet.has(activeLesson.lesson_id)) return;
    await setDoc(doc(db, 'enrollments', enrollmentId, 'completed_lessons', activeLesson.lesson_id), { completed_at: new Date() });
    const newSize = completedSet.size + 1;
    const progress = lessons.length > 0 ? Math.round((newSize / lessons.length) * 100) : 0;
    await updateDoc(doc(db, 'enrollments', enrollmentId), { progress_percent: progress });
    if (onProgressUpdate) onProgressUpdate(progress);
  };

  const handleQuizSubmit = async () => {
    if (selected === null || !quiz) return;
    if (selected === quiz.answer) {
      setQuizState('correct');
      await handleMarkComplete();
    } else {
      setQuizState('wrong');
    }
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
  const isDone = activeLesson && completedSet.has(activeLesson.lesson_id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Video + Quiz */}
      <div className="lg:col-span-2 space-y-4">
        {activeLesson && (
          <>
            {videoId ? (
              <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow">
                <iframe key={videoId} src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                  title={activeLesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen className="w-full h-full" />
              </div>
            ) : (
              <div className="aspect-video rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <div className="text-center"><PlayCircle className="w-12 h-12 mx-auto mb-2 opacity-30" /><p className="text-sm">ไม่มี Video URL</p></div>
              </div>
            )}

            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">{activeLesson.title}</h3>
                {activeLesson.duration && <p className="text-xs text-slate-400 mt-0.5">{activeLesson.duration}</p>}
              </div>
              {isDone && (
                <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" /> Completed
                </span>
              )}
            </div>

            {/* Quiz section */}
            {isEnrolled && !isDone && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                {quiz === null && <p className="text-sm text-slate-400">Loading...</p>}

                {quiz === false && (
                  /* No quiz — direct mark complete */
                  <button onClick={handleMarkComplete}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                    Mark Complete ✓
                  </button>
                )}

                {quiz && quizState === 'hidden' && (
                  <button onClick={() => setQuizState('show')}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                    ทำแบบทดสอบเพื่อ Mark Complete
                  </button>
                )}

                {quiz && quizState === 'show' && (
                  <div>
                    <p className="font-medium text-slate-800 text-sm mb-4">{quiz.question}</p>
                    <div className="space-y-2 mb-4">
                      {quiz.choices?.map((c, i) => (
                        <button key={i} onClick={() => setSelected(i)}
                          className={`w-full text-left text-sm px-4 py-2.5 rounded-xl border transition-colors ${selected === i ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 hover:border-slate-300 text-slate-700'}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                    <button onClick={handleQuizSubmit} disabled={selected === null}
                      className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                      ส่งคำตอบ
                    </button>
                  </div>
                )}

                {quizState === 'correct' && (
                  <div className="flex items-center gap-3 text-emerald-600">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">ถูกต้อง! บทเรียนนี้ถูก mark complete แล้ว 🎉</p>
                  </div>
                )}

                {quizState === 'wrong' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-red-500">
                      <XCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm font-medium">ไม่ถูกต้อง ลองใหม่อีกครั้ง</p>
                    </div>
                    <button onClick={() => { setQuizState('show'); setSelected(null); }}
                      className="w-full border border-slate-200 text-slate-600 text-sm font-medium py-2 rounded-xl hover:bg-slate-50">
                      ลองใหม่
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
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
              <button key={lesson.lesson_id} onClick={() => !locked && selectLesson(lesson)} disabled={locked}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${isActive ? 'bg-violet-50' : 'hover:bg-slate-50'} ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="flex-shrink-0 mt-0.5">
                  {locked ? <Lock className="w-4 h-4 text-slate-300" /> :
                   done ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                   <Circle className={`w-4 h-4 ${isActive ? 'text-violet-500' : 'text-slate-300'}`} />}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-medium truncate ${isActive ? 'text-violet-700' : 'text-slate-700'}`}>{i + 1}. {lesson.title}</p>
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
