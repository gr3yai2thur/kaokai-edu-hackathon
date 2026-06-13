import { useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCourses } from '@/hooks/useCourses';
import { getCategoryFromTitle, getLevelFromTitle } from '@/lib/dataHelpers';
import { Plus, Pencil, Trash2, X, BookOpen } from 'lucide-react';

const EMPTY_FORM = { course_id: '', title: '', instructor: '', total_lessons: '', description: '' };

export default function AdminCourses() {
  const courses = useCourses() ?? [];
  const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', data }
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const openAdd = () => { setForm(EMPTY_FORM); setModal({ mode: 'add' }); };
  const openEdit = (course) => { setForm({ ...course, total_lessons: String(course.total_lessons) }); setModal({ mode: 'edit' }); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.instructor.trim()) return;
    setSaving(true);
    const courseId = modal.mode === 'add'
      ? `c-fs-${Date.now()}`
      : form.course_id;
    await setDoc(doc(db, 'courses', courseId), {
      title: form.title.trim(),
      instructor: form.instructor.trim(),
      total_lessons: parseInt(form.total_lessons) || 1,
      description: form.description.trim(),
    });
    setSaving(false);
    setModal(null);
  };

  const handleDelete = async () => {
    await deleteDoc(doc(db, 'courses', deleteId));
    setDeleteId(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Course Management</h1>
          <p className="text-slate-500 text-sm mt-1">{courses.length} courses</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400">Course</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 hidden md:table-cell">Instructor</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 hidden sm:table-cell">Category</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-slate-400">Lessons</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.course_id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-700 truncate max-w-xs">{course.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{course.course_id}</p>
                </td>
                <td className="px-5 py-3 text-slate-500 hidden md:table-cell">{course.instructor}</td>
                <td className="px-5 py-3 hidden sm:table-cell">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-600">
                    {getCategoryFromTitle(course.title)}
                  </span>
                </td>
                <td className="px-5 py-3 text-center text-slate-500">{course.total_lessons}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/admin/courses/${course.course_id}/lessons`} className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="Manage Lessons">
                      <BookOpen className="w-4 h-4" />
                    </Link>
                    <button onClick={() => openEdit(course)} className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    {/* Only Firestore courses can be deleted */}
                    {course.course_id.startsWith('c-fs-') && (
                      <button onClick={() => setDeleteId(course.course_id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-800">{modal.mode === 'add' ? 'Add Course' : 'Edit Course'}</h2>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" placeholder="e.g. Advanced Python" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Instructor *</label>
                <input value={form.instructor} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" placeholder="e.g. John Smith" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Total Lessons</label>
                <input type="number" min="1" value={form.total_lessons} onChange={e => setForm(f => ({ ...f, total_lessons: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" placeholder="e.g. 10" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none" placeholder="คำอธิบายคอร์ส..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.instructor.trim()}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h2 className="font-semibold text-slate-800 mb-1">ลบคอร์สนี้?</h2>
            <p className="text-sm text-slate-400 mb-5">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2.5 rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
