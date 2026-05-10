import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Calendar, Clock, Plus, Edit, Trash2, X, Save, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/ui/Button';
import { Course, useGlobal } from '../../context/GlobalContext';
import { api } from '../../lib/api';

type CourseForm = {
  id: number;
  title: string;
  description: string;
  price: string;
  duration: string;
  timing: string;
  mode: string;
  topics: string;
  active: boolean;
};

const emptyCourse: CourseForm = {
  id: 0,
  title: '',
  description: '',
  price: '',
  duration: '',
  timing: '',
  mode: 'Online & Offline',
  topics: '',
  active: true,
};

const toForm = (course: Course): CourseForm => ({
  id: course.id,
  title: course.title,
  description: course.description || '',
  price: String(course.price || '').replace(/,/g, ''),
  duration: course.duration || '',
  timing: course.timing || '',
  mode: course.mode || 'Online & Offline',
  topics: (course.topics || []).join(', '),
  active: true,
});

const AdminCourses = () => {
  const { courses, refreshCourses, coursesLoading } = useGlobal();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this course? Superadmin role required.')) return;
    setSaving(true);
    setError('');
    try {
      await api.courses.delete(id);
      await refreshCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Course delete nahi ho paya.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(toForm(course));
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    if (!editingCourse) return;

    setSaving(true);
    setError('');

    const payload = {
      name: editingCourse.title,
      description: editingCourse.description,
      duration: editingCourse.duration,
      timing: editingCourse.timing,
      mode: editingCourse.mode,
      price: Number(editingCourse.price || 0),
      topics: editingCourse.topics.split(',').map((item) => item.trim()).filter(Boolean),
      active: editingCourse.active,
    };

    try {
      if (editingCourse.id === 0) {
        await api.courses.create(payload);
      } else {
        await api.courses.update(editingCourse.id, payload);
      }
      await refreshCourses();
      setIsModalOpen(false);
      setEditingCourse(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Course save nahi ho paya.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Academy Courses</h1>
          <p className="text-brand-cream/40 mt-1">Manage baking classes, schedules and pricing</p>
        </div>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => {
            setEditingCourse(emptyCourse);
            setError('');
            setIsModalOpen(true);
          }}
        >
          <Plus size={20} /> Add New Course
        </Button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-red-200">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {coursesLoading ? (
        <div className="text-brand-cream/40">Loading courses...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {courses.map((course) => (
            <motion.div
              layout
              key={course.id}
              className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row group hover:border-brand-gold/30 transition-all"
            >
              <div className="md:w-48 h-48 md:h-auto overflow-hidden relative">
                <img src={course.image || 'https://via.placeholder.com/500'} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-4 right-4 bg-brand-gold text-brand-dark text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
                  {course.mode}
                </div>
              </div>
              <div className="flex-grow p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="text-xl font-bold text-white">{course.title || 'Untitled Course'}</h3>
                    <span className="text-brand-gold font-bold text-lg">Rs {Number(course.price || 0).toLocaleString('en-IN')}</span>
                  </div>

                  <p className="text-sm text-brand-cream/45 line-clamp-2">{course.description || 'No course description added yet.'}</p>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-xs text-brand-cream/60">
                      <Clock size={14} className="text-brand-gold" />
                      <span>{course.duration || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-brand-cream/60">
                      <Calendar size={14} className="text-brand-gold" />
                      <span>{course.days || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-brand-cream/60 col-span-2">
                      <Clock size={14} className="text-brand-gold" />
                      <span>{course.timing || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-[10px] uppercase font-bold text-brand-gold mb-2 tracking-widest">Topics Covered</p>
                    <div className="flex flex-wrap gap-2">
                      {(course.topics || []).slice(0, 4).map((topic) => (
                        <span key={topic} className="text-[10px] bg-white/5 px-2 py-1 rounded-md text-brand-cream/60">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                  <button
                    onClick={() => handleEdit(course)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm transition-colors"
                  >
                    <Edit size={16} className="text-brand-gold" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && editingCourse && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-brand-dark border border-brand-gold/30 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-brand-gold">
                    {editingCourse.id === 0 ? 'Create New Course' : 'Edit Course Details'}
                  </h2>
                  <p className="text-brand-cream/40 text-[10px] uppercase tracking-[0.2em] mt-1">Saved through server API</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 rounded-full bg-white/5 text-brand-cream/60 hover:bg-brand-gold hover:text-brand-dark transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-cream/60 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen size={14} className="text-brand-gold" /> Course Title
                  </label>
                  <input
                    type="text"
                    value={editingCourse.title}
                    onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-gold/50 text-white transition-colors"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-cream/60 uppercase tracking-widest">Price</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCourse.price}
                    onChange={(e) => setEditingCourse({ ...editingCourse, price: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-gold/50 text-white transition-colors"
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-brand-cream/60 uppercase tracking-widest">Description</label>
                  <textarea
                    value={editingCourse.description}
                    onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-gold/50 text-white resize-none transition-colors"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-cream/60 uppercase tracking-widest">Course Mode</label>
                  <select
                    value={editingCourse.mode}
                    onChange={(e) => setEditingCourse({ ...editingCourse, mode: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-gold/50 text-white transition-colors"
                  >
                    <option>Online & Offline</option>
                    <option>Online Only</option>
                    <option>Offline Only</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-cream/60 uppercase tracking-widest">Duration</label>
                  <input
                    type="text"
                    value={editingCourse.duration}
                    onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-gold/50 text-white transition-colors"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-brand-cream/60 uppercase tracking-widest">Batch Timings</label>
                  <input
                    type="text"
                    value={editingCourse.timing}
                    onChange={(e) => setEditingCourse({ ...editingCourse, timing: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-gold/50 text-white transition-colors"
                    placeholder="10 AM - 12 PM / 5 PM - 7 PM"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-brand-cream/60 uppercase tracking-widest">Course Syllabus (comma separated)</label>
                  <textarea
                    value={editingCourse.topics}
                    onChange={(e) => setEditingCourse({ ...editingCourse, topics: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-gold/50 text-white resize-none transition-colors"
                    rows={2}
                  />
                </div>
              </form>

              <div className="px-8 py-6 border-t border-white/10 flex gap-4 bg-white/5">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl border border-white/10 text-brand-cream font-bold hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-[2] py-4 rounded-2xl bg-brand-gold text-brand-dark font-bold shadow-xl shadow-brand-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={20} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminCourses;
