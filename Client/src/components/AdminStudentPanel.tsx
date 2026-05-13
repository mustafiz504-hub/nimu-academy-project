import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckCircle, Clock, Search, Filter, 
  Award, RefreshCw, Plus, User, Mail, Phone, GraduationCap, X,
  Calendar as CalendarIcon, AlertCircle
} from 'lucide-react';
import { googleSheetsService, Student } from '../services/googleSheets';
import Button from './ui/Button';

const courses = [
  'Advanced Cake Decorating',
  'Professional Baking',
  'Chocolate Making Masterclass',
  'Pastry Arts Certification',
  'Traditional Desserts Course'
];

const AdminStudentPanel = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'completed'>('all');
  const [selectedDates, setSelectedDates] = useState<Record<string, string>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    studentName: '',
    phone: '',
    courseName: courses[0],
    completionDate: new Date().toISOString().split('T')[0]
  });

  const fetchData = async (isBackground = false) => {
    // Only show loader if we don't have any students yet
    if (!isBackground && students.length === 0) setLoading(true);
    try {
      const data = await googleSheetsService.fetchStudents();
      setStudents(data);
      
      const initialDates: Record<string, string> = {};
      const today = new Date().toISOString().split('T')[0];
      data.forEach(s => {
        initialDates[s.studentId] = s.completionDate || today;
      });
      setSelectedDates(initialDates);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch - if we have no data, show loader. If we have local data, it will be fast.
    fetchData();
  }, []);

  const [formError, setFormError] = useState('');

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // CHECKPOINT: Phone number must be 10 digits
    if (newStudent.phone.length !== 10) {
      setFormError('Phone number exactly 10 digits ka hona chahiye!');
      return;
    }

    // CHECKPOINT: Prevent duplicate phone numbers
    const exists = students.some(s => s.phone === newStudent.phone);
    if (exists) {
      setFormError('Ye phone number pehle se registered hai!');
      return;
    }
    
    const studentId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
    const dateObj = new Date(newStudent.completionDate);
    const formattedDate = dateObj.toLocaleDateString('en-GB', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    });

    const studentData: Student = {
      studentId,
      studentName: newStudent.studentName,
      phone: newStudent.phone,
      courseName: newStudent.courseName,
      completionDate: formattedDate,
      approved: true,
      completed: true,
      email: '',
      certificateId: `NIMU-${Math.floor(Math.random() * 10000)}`
    };

    // OPTIMISTIC UPDATE
    setStudents(prev => [studentData, ...prev]);
    setShowAddForm(false);
    setNewStudent({ 
      studentName: '', phone: '', courseName: courses[0], 
      completionDate: new Date().toISOString().split('T')[0] 
    });

    // Background call
    googleSheetsService.addStudent(studentData).catch(err => {
      console.error('Background Sync Failed:', err);
    });
  };

  const handleApprove = async (studentId: string) => {
    const success = await googleSheetsService.updateStudent(studentId, { approved: true });
    if (success) {
      setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, approved: true } : s));
    }
  };

  const handleComplete = async (student: Student) => {
    const rawDate = selectedDates[student.studentId] || new Date().toISOString().split('T')[0];
    const dateObj = new Date(rawDate);
    const formattedDate = dateObj.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    const certId = `NIMU-2026-${String(students.filter(s => s.completed).length + 1).padStart(3, '0')}`;
    
    const success = await googleSheetsService.updateStudent(student.studentId, { 
      completed: true, 
      certificateId: certId,
      completionDate: formattedDate
    });

    if (success) {
      setStudents(prev => prev.map(s => 
        s.studentId === student.studentId ? { ...s, completed: true, certificateId: certId, completionDate: formattedDate } : s
      ));
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.phone.includes(searchQuery) ||
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'pending' ? !s.approved :
      filter === 'approved' ? (s.approved && !s.completed) :
      filter === 'completed' ? s.completed : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 md:p-10 bg-[#120a05] min-h-screen text-brand-cream">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-serif font-bold text-brand-gold">Certificate Admin</h1>
            {loading && students.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-3 py-1 bg-brand-gold/10 rounded-full border border-brand-gold/20"
              >
                <RefreshCw size={12} className="text-brand-gold animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold">Syncing...</span>
              </motion.div>
            )}
          </div>
          <p className="text-brand-cream/50">Manually add students and issue certificates.</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 bg-brand-gold text-brand-dark">
            <Plus size={18} /> Add Student
          </Button>
          <Button onClick={fetchData} className="flex items-center gap-2 bg-white/5 text-brand-gold border-brand-gold/10">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Add Student Modal */}
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
              className="relative bg-brand-dark border border-brand-gold/20 p-8 rounded-[2rem] w-full max-w-xl shadow-2xl"
            >
              <button onClick={() => setShowAddForm(false)} className="absolute right-6 top-6 text-brand-cream/30 hover:text-white">
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-serif font-bold text-brand-gold mb-8">Add New Student</h2>
              
              <form onSubmit={handleAddStudent} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-cream/40 uppercase tracking-widest ml-1">Student Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/30" size={18} />
                      <input 
                        required type="text" placeholder="Full Name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-brand-gold/50 text-brand-cream"
                        value={newStudent.studentName}
                        onChange={e => setNewStudent({...newStudent, studentName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-cream/40 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/30" size={18} />
                      <input 
                        required type="tel" placeholder="9876543210"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-brand-gold/50 text-brand-cream"
                        value={newStudent.phone}
                        onChange={e => setNewStudent({...newStudent, phone: e.target.value.replace(/\D/g, '')})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-cream/40 uppercase tracking-widest ml-1">Course</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/30" size={18} />
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-brand-gold/50 appearance-none text-brand-cream cursor-pointer"
                        value={newStudent.courseName}
                        onChange={e => setNewStudent({...newStudent, courseName: e.target.value})}
                      >
                        {courses.map(c => <option key={c} value={c} className="bg-brand-dark">{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-cream/40 uppercase tracking-widest ml-1">Completion Date</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/30" size={18} />
                      <input 
                        required type="date"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-brand-gold/50 text-brand-cream"
                        value={newStudent.completionDate}
                        onChange={e => setNewStudent({...newStudent, completionDate: e.target.value})}
                      />
                    </div>
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

                <Button type="submit" disabled={loading} className="w-full py-4 bg-brand-gold text-brand-dark font-black">
                  {loading ? 'Adding...' : 'Save Student Details'}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filters & List (Same as before but with search by number focus) */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cream/30" size={20} />
          <input 
            type="text"
            placeholder="Search by name or number..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-brand-gold/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-brand-gold/20 scrollbar-track-transparent">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 bg-[#1a110a] backdrop-blur-md">
              <tr className="border-b border-white/10 text-xs font-black uppercase tracking-widest text-brand-gold/60">
                <th className="px-6 py-5 border-b border-white/10">Student Info</th>
                <th className="px-6 py-5 border-b border-white/10">Course</th>
                <th className="px-6 py-5 border-b border-white/10">Status</th>
                <th className="px-6 py-5 border-b border-white/10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && students.length === 0 ? (
                // Skeleton Rows
                [...Array(5)].map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="px-6 py-6">
                      <div className="h-5 w-32 bg-white/10 rounded mb-2" />
                      <div className="h-3 w-20 bg-white/5 rounded" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-4 w-40 bg-white/5 rounded" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-6 w-20 bg-white/5 rounded-full" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="h-8 w-24 bg-white/10 rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-brand-cream/30 italic">
                    {searchQuery ? 'No students found matching your search.' : 'No students registered yet.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.studentId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-lg">{student.studentName}</div>
                      <div className="text-xs text-brand-gold font-mono">{student.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-cream/60">{student.courseName}</td>
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
                      <div className="flex items-center gap-3">
                        {!student.approved && (
                          <button onClick={() => handleApprove(student.studentId)} className="bg-brand-gold text-brand-dark px-3 py-1.5 rounded-lg text-xs font-bold">Approve</button>
                        )}
                        {student.approved && !student.completed && (
                          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg">
                            <input type="date" className="bg-transparent text-[10px] outline-none" value={selectedDates[student.studentId] || ''} onChange={e => setSelectedDates({...selectedDates, [student.studentId]: e.target.value})} />
                            <button onClick={() => handleComplete(student)} className="bg-green-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold">Issue Cert</button>
                          </div>
                        )}
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
