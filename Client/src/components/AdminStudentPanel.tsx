import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, CheckCircle, Search,
  Award, RefreshCw, Plus, User, Phone, GraduationCap, X,
  Calendar as CalendarIcon, AlertCircle, Trash2
} from 'lucide-react';
import { api, ApiStudent } from '../lib/api';
import Button from './ui/Button';

const COURSES = [
  'Advanced Cake Decorating',
  'Professional Baking',
  'Chocolate Making Masterclass',
  'Pastry Arts Certification',
  'Traditional Desserts Course',
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatDisplayDate = (raw: string): string => {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const toISODate = () => new Date().toISOString().split('T')[0];

// ── Component ─────────────────────────────────────────────────────────────────
const AdminStudentPanel: React.FC = () => {
  const [students, setStudents]       = useState<ApiStudent[]>([]);
  const [loading, setLoading]         = useState(true);
  const [syncing, setSyncing]         = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter]           = useState<'all' | 'pending' | 'approved' | 'completed'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError]     = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Completion date picker state per student (keyed by id)
  const [completionDates, setCompletionDates] = useState<Record<number, string>>({});

  // Add-student form fields
  const [newStudent, setNewStudent] = useState({
    student_name:    '',
    phone:           '',
    course_name:     COURSES[0],
    completion_date: toISODate(),
  });

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchStudents = useCallback(async (background = false) => {
    if (!background) setLoading(true);
    else setSyncing(true);
    try {
      const { students: data } = await api.students.list();
      setStudents(data);
      // Pre-fill completion date pickers
      const dates: Record<number, string> = {};
      const today = toISODate();
      data.forEach(s => { dates[s.id] = today; });
      setCompletionDates(dates);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // ── Add Student ────────────────────────────────────────────────────────────
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (newStudent.phone.length !== 10) {
      setFormError('Phone number exactly 10 digits ka hona chahiye!');
      return;
    }

    try {
      const { student } = await api.students.create({
        student_name:    newStudent.student_name,
        phone:           newStudent.phone,
        course_name:     newStudent.course_name,
        completion_date: formatDisplayDate(newStudent.completion_date),
      });

      setStudents(prev => [student, ...prev]);
      setShowAddForm(false);
      setNewStudent({ student_name: '', phone: '', course_name: COURSES[0], completion_date: toISODate() });
    } catch (err: any) {
      setFormError(err?.message || 'Student add karne mein error aaya. Please try again.');
    }
  };

  // ── Approve ────────────────────────────────────────────────────────────────
  const handleApprove = async (student: ApiStudent) => {
    try {
      const { student: updated } = await api.students.update(student.id, { approved: true });
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    } catch (err) {
      console.error('Approve failed:', err);
    }
  };

  // ── Issue Certificate ──────────────────────────────────────────────────────
  const handleComplete = async (student: ApiStudent) => {
    const rawDate = completionDates[student.id] || toISODate();
    const formattedDate = formatDisplayDate(rawDate);
    try {
      const { student: updated } = await api.students.update(student.id, {
        completed:       true,
        completion_date: formattedDate,
      });
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    } catch (err) {
      console.error('Complete failed:', err);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    try {
      await api.students.delete(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = students.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.student_name.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      s.email.toLowerCase().includes(q);
    const matchesFilter =
      filter === 'all'       ? true :
      filter === 'pending'   ? !s.approved :
      filter === 'approved'  ? (s.approved && !s.completed) :
      filter === 'completed' ? s.completed : true;
    return matchesSearch && matchesFilter;
  });

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalCompleted = students.filter(s => s.completed).length;
  const totalPending   = students.filter(s => !s.approved).length;
  const totalApproved  = students.filter(s => s.approved && !s.completed).length;

  return (
    <div className="p-6 md:p-10 bg-[#120a05] min-h-screen text-brand-cream">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-serif font-bold text-brand-gold">Certificate Admin</h1>
            {syncing && (
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-3 py-1 bg-brand-gold/10 rounded-full border border-brand-gold/20"
              >
                <RefreshCw size={12} className="text-brand-gold animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold">Syncing…</span>
              </motion.div>
            )}
          </div>
          <p className="text-brand-cream/50">Supabase se live data — students ko add, approve aur certificate issue karein.</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-brand-gold text-brand-dark"
          >
            <Plus size={18} /> Add Student
          </Button>
          <Button
            onClick={() => fetchStudents(true)}
            className="flex items-center gap-2 bg-white/5 text-brand-gold border-brand-gold/10"
          >
            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Students', value: students.length, color: 'text-brand-gold',  bg: 'bg-brand-gold/10',  icon: Users },
          { label: 'Completed',      value: totalCompleted,  color: 'text-green-400',   bg: 'bg-green-500/10',   icon: Award },
          { label: 'Approved',       value: totalApproved,   color: 'text-blue-400',    bg: 'bg-blue-500/10',    icon: CheckCircle },
          { label: 'Pending',        value: totalPending,    color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  icon: AlertCircle },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 border border-white/5 flex items-center gap-4`}>
            <stat.icon className={stat.color} size={24} />
            <div>
              <p className="text-xs text-brand-cream/40 font-semibold uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add Student Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-brand-dark border border-brand-gold/20 p-6 md:p-8 rounded-[2rem] w-full max-w-xl shadow-2xl max-h-[90dvh] overflow-y-auto"
            >
              <button onClick={() => setShowAddForm(false)} className="absolute right-6 top-6 text-brand-cream/30 hover:text-white">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-serif font-bold text-brand-gold mb-8">Add New Student</h2>

              <form onSubmit={handleAddStudent} className="space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-cream/40 uppercase tracking-widest ml-1">Student Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/30" size={18} />
                    <input
                      required type="text" placeholder="Full Name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-brand-gold/50 text-brand-cream"
                      value={newStudent.student_name}
                      onChange={e => setNewStudent({ ...newStudent, student_name: e.target.value })}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-cream/40 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/30" size={18} />
                    <input
                      required type="tel" placeholder="9876543210"
                      maxLength={10} pattern="[0-9]{10}"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-brand-gold/50 text-brand-cream"
                      value={newStudent.phone}
                      onChange={e => setNewStudent({ ...newStudent, phone: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                </div>

                {/* Course */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-cream/40 uppercase tracking-widest ml-1">Course</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/30" size={18} />
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-brand-gold/50 appearance-none text-brand-cream cursor-pointer"
                      value={newStudent.course_name}
                      onChange={e => setNewStudent({ ...newStudent, course_name: e.target.value })}
                    >
                      {COURSES.map(c => <option key={c} value={c} className="bg-brand-dark">{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Completion Date */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-cream/40 uppercase tracking-widest ml-1">Completion Date</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/30" size={18} />
                    <input
                      required type="date"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-brand-gold/50 text-brand-cream"
                      style={{ colorScheme: 'dark' }}
                      value={newStudent.completion_date}
                      onChange={e => setNewStudent({ ...newStudent, completion_date: e.target.value })}
                    />
                  </div>
                </div>

                {formError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="text-red-400 text-sm font-bold bg-red-400/10 p-4 rounded-xl flex items-center gap-2"
                  >
                    <AlertCircle size={16} /> {formError}
                  </motion.p>
                )}

                <Button type="submit" className="w-full py-4 bg-brand-gold text-brand-dark font-black">
                  Save Student Details
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-brand-dark border border-red-500/30 p-8 rounded-[2rem] w-full max-w-sm shadow-2xl text-center"
            >
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Student?</h3>
              <p className="text-brand-cream/50 text-sm mb-6">Ye action permanent hai. Student ka data aur certificate record hamesha ke liye delete ho jayega.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-brand-cream/60 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cream/30" size={20} />
          <input
            type="text"
            placeholder="Search by name, phone or email…"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-brand-gold/50"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'approved', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filter === f
                  ? 'bg-brand-gold text-brand-dark'
                  : 'bg-white/5 text-brand-cream/50 hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="max-h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-brand-gold/20 scrollbar-track-transparent">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 bg-[#1a110a] backdrop-blur-md">
              <tr className="text-xs font-black uppercase tracking-widest text-brand-gold/60 border-b border-white/10">
                <th className="px-6 py-5 border-b border-white/10">Student</th>
                <th className="px-6 py-5 border-b border-white/10">Course</th>
                <th className="px-6 py-5 border-b border-white/10">Status</th>
                <th className="px-6 py-5 border-b border-white/10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6"><div className="h-5 w-36 bg-white/10 rounded mb-2" /><div className="h-3 w-24 bg-white/5 rounded" /></td>
                    <td className="px-6 py-6"><div className="h-4 w-40 bg-white/5 rounded" /></td>
                    <td className="px-6 py-6"><div className="h-6 w-20 bg-white/5 rounded-full" /></td>
                    <td className="px-6 py-6"><div className="h-8 w-24 bg-white/10 rounded-lg" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-brand-cream/30 italic">
                    {searchQuery ? 'Koi student nahi mila.' : 'Abhi koi student registered nahi hai.'}
                  </td>
                </tr>
              ) : (
                filtered.map(student => (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-base">{student.student_name}</div>
                      <div className="text-xs text-brand-gold font-mono">{student.phone}</div>
                      {student.certificate_id && (
                        <div className="text-[10px] text-brand-cream/30 font-mono mt-0.5">{student.certificate_id}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-cream/60">{student.course_name}</td>
                    <td className="px-6 py-4">
                      {student.completed ? (
                        <span className="text-[10px] font-black uppercase bg-green-500/10 text-green-400 px-3 py-1 rounded-full">Completed</span>
                      ) : student.approved ? (
                        <span className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full">Approved</span>
                      ) : (
                        <span className="text-[10px] font-black uppercase bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Approve */}
                        {!student.approved && (
                          <button
                            onClick={() => handleApprove(student)}
                            className="bg-brand-gold text-brand-dark px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
                          >
                            Approve
                          </button>
                        )}

                        {/* Issue Certificate */}
                        {student.approved && !student.completed && (
                          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg">
                            <input
                              type="date"
                              className="bg-transparent text-[10px] outline-none text-brand-cream"
                              value={completionDates[student.id] || toISODate()}
                              onChange={e => setCompletionDates(prev => ({ ...prev, [student.id]: e.target.value }))}
                            />
                            <button
                              onClick={() => handleComplete(student)}
                              className="bg-green-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold hover:bg-green-600 transition-colors"
                            >
                              Issue Cert
                            </button>
                          </div>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteConfirm(student.id)}
                          className="ml-auto p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all active:scale-95"
                          title="Delete student"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminStudentPanel;
