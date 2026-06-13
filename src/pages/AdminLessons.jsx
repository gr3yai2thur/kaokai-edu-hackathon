import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCourses } from '@/hooks/useCourses';
import { useEffect } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';

const EMPTY_LESSON = { title: '', video_url: '', duration: '', order: '' };
const EMPTY_QUIZ = { question: '', choices: ['', '', '', ''], answer: 0 };

export default function AdminLessons() {
  const { courseId } = useParams();
  const allCourses = useCourses();
  const course = allCourses?.find(c => c.course_id === courseId);

  const [lessons, setLessons] = useState([]);
  const [expanded, setExpanded] = useState(null); // lesson_id showing quiz
  const [lessonModal, setLessonModal] = useState(null); // null | { mode, data }
  const [lessonForm, setLessonForm] = useState(EMPTY_LESSON);
  const [quizModal, setQuizModal] = useState(null); // null | { lessonId, data }
  const [quizForm, setQuizForm] = useState(EMPTY_QUIZ);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'lesson'|'quiz', lessonId, quizId? }

  useEffect(() => {
    if (!courseId) return;
    const unsub = onSnapshot(collection(db, 'courses', courseId, 'lessons'), snap => {
      setLessons(snap.docs.map(d => ({ lesson_id: d.id, ...d.data() })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    });
    return unsub;
  }, [courseId]);

  // Lessons CRUD
  const openAddLesson = () => { setLessonForm({ ...EMPTY_LESSON, order: lessons.length + 1 }); setLessonModal({ mode: 'add' }); };
  const openEditLesson = (l) => { setLessonForm({ ...l, order: String(l.order) }); setLessonModal({ mode: 'edit', lessonId: l.lesson_id }); };

  const saveLesson = async () => {
    if (!lessonForm.title.trim()) return;
    setSaving(true);
    const lessonId = lessonModal.mode === 'add' ? `l-${Date.now()}` : lessonModal.lessonId;
    await setDoc(doc(db, 'courses', courseId, 'lessons', lessonId), {
      title: lessonForm.title.trim(),
      video_url: lessonForm.video_url.trim(),
      duration: lessonForm.duration.trim(),
      order: parseInt(lessonForm.order) || lessons.length + 1,
    });
    setSaving(false);
    setLessonModal(null);
  };

  const deleteLesson = async () => {
    await deleteDoc(doc(db, 'courses', courseId, 'lessons', deleteTarget.lessonId));
    setDeleteTarget(null);
  };

  // Quiz CRUD (stored as subcollection: lessons/{lessonId}/quiz — single doc 'q1')
  const openAddQuiz = (lessonId) => { setQuizForm(EMPTY_QUIZ); setQuizModal({ mode: 'add', lessonId }); };
  const openEditQuiz = (lessonId, quiz) => { setQuizForm(quiz); setQuizModal({ mode: 'edit', lessonId }); };

  const saveQuiz = async () => {
    if (!quizForm.question.trim()) return;
    setSaving(true);
    await setDoc(doc(db, 'courses', courseId, 'lessons', quizModal.lessonId, 'quiz', 'q1'), {
      question: quizForm.question.trim(),
      choices: quizForm.choices.map(c => c.trim()),
      answer: quizForm.answer,
    });
    setSaving(false);
    setQuizModal(null);
  };

  const deleteQuiz = async () => {
    await deleteDoc(doc(db, 'courses', courseId, 'lessons', deleteTarget.lessonId, 'quiz', 'q1'));
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/admin/courses" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lessons</h1>
          <p className="text-slate-500 text-sm mt-1">{course?.title ?? courseId} · {lessons.length} lessons</p>
        </div>
        <button onClick={openAddLesson} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Lesson
        </button>
      </div>

      {lessons.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-sm">ยังไม่มี lessons กด Add Lesson เพื่อเริ่ม</p>
        </div>
      )}

      <div className="space-y-3">
        {lessons.map(lesson => (
          <LessonRow
            key={lesson.lesson_id}
            courseId={courseId}
            lesson={lesson}
            expanded={expanded === lesson.lesson_id}
            onToggle={() => setExpanded(expanded === lesson.lesson_id ? null : lesson.lesson_id)}
            onEdit={() => openEditLesson(lesson)}
            onDelete={() => setDeleteTarget({ type: 'lesson', lessonId: lesson.lesson_id })}
            onAddQuiz={() => openAddQuiz(lesson.lesson_id)}
            onEditQuiz={(quiz) => openEditQuiz(lesson.lesson_id, quiz)}
            onDeleteQuiz={() => setDeleteTarget({ type: 'quiz', lessonId: lesson.lesson_id })}
          />
        ))}
      </div>

      {/* Lesson Modal */}
      {lessonModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-800">{lessonModal.mode === 'add' ? 'Add Lesson' : 'Edit Lesson'}</h2>
              <button onClick={() => setLessonModal(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              {[
                { key: 'title', label: 'Title *', placeholder: 'e.g. Introduction to Python' },
                { key: 'video_url', label: 'YouTube URL', placeholder: 'https://youtube.com/watch?v=...' },
                { key: 'duration', label: 'Duration', placeholder: 'e.g. 12:30' },
                { key: 'order', label: 'Order', placeholder: 'e.g. 1', type: 'number' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">{label}</label>
                  <input type={type ?? 'text'} value={lessonForm[key]} onChange={e => setLessonForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setLessonModal(null)} className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={saveLesson} disabled={saving || !lessonForm.title.trim()}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {quizModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-800">{quizModal.mode === 'add' ? 'Add Quiz' : 'Edit Quiz'}</h2>
              <button onClick={() => setQuizModal(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Question *</label>
                <textarea rows={2} value={quizForm.question} onChange={e => setQuizForm(f => ({ ...f, question: e.target.value }))}
                  placeholder="e.g. Python ใช้สำหรับทำอะไร?" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-2">Choices (เลือกข้อที่ถูก)</label>
                <div className="space-y-2">
                  {quizForm.choices.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="radio" checked={quizForm.answer === i} onChange={() => setQuizForm(f => ({ ...f, answer: i }))}
                        className="accent-violet-600" />
                      <input value={c} onChange={e => setQuizForm(f => { const ch = [...f.choices]; ch[i] = e.target.value; return { ...f, choices: ch }; })}
                        placeholder={`ตัวเลือก ${i + 1}`}
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-1">คลิก radio ข้างหน้าเพื่อเลือกข้อที่ถูกต้อง</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setQuizModal(null)} className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={saveQuiz} disabled={saving || !quizForm.question.trim()}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="font-semibold text-slate-800 mb-4">ลบ{deleteTarget.type === 'lesson' ? 'บทเรียน' : 'คำถาม'}นี้?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 border border-slate-200 text-slate-600 text-sm py-2.5 rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={deleteTarget.type === 'lesson' ? deleteLesson : deleteQuiz}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2.5 rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LessonRow({ courseId, lesson, expanded, onToggle, onEdit, onDelete, onAddQuiz, onEditQuiz, onDeleteQuiz }) {
  const [quiz, setQuiz] = useState(null); // null=loading, false=none, object=exists

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'courses', courseId, 'lessons', lesson.lesson_id, 'quiz'), snap => {
      const q = snap.docs.find(d => d.id === 'q1');
      setQuiz(q ? { id: q.id, ...q.data() } : false);
    });
    return unsub;
  }, [courseId, lesson.lesson_id]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{lesson.order}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-800 text-sm truncate">{lesson.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{lesson.duration || 'ไม่ระบุความยาว'}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={onToggle} className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500">Quiz หลังดูวิดีโอ</p>
            {quiz === false && (
              <button onClick={onAddQuiz} className="flex items-center gap-1 text-xs text-violet-600 font-medium hover:text-violet-700">
                <Plus className="w-3.5 h-3.5" /> เพิ่มคำถาม
              </button>
            )}
          </div>
          {quiz === null && <p className="text-xs text-slate-400">Loading...</p>}
          {quiz === false && <p className="text-xs text-slate-400">ยังไม่มีคำถาม</p>}
          {quiz && (
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-3">{quiz.question}</p>
              <div className="space-y-1.5 mb-3">
                {quiz.choices?.map((c, i) => (
                  <div key={i} className={`text-xs px-3 py-1.5 rounded-lg ${i === quiz.answer ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-500'}`}>
                    {i === quiz.answer ? '✓ ' : ''}{c}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEditQuiz(quiz)} className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1">
                  <Pencil className="w-3 h-3" /> แก้ไข
                </button>
                <button onClick={onDeleteQuiz} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> ลบ
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
