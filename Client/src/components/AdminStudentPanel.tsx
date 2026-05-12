import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckCircle, Clock, Search, Filter, 
  Award, RefreshCw, Plus, User, Mail, Phone, GraduationCap, X,
  Calendar as CalendarIcon
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await googleSheetsService.fetchStudents();
      setStudents(data);
      
      const initialDates: Record<string, string> = {};
      const today = new Date().toISOString().split('T')[0];
      data.forEach(s => {
        initialDates[s.studentId] = today;
      });
      setSelectedDates(initialDates);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const studentId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const dateObj = new Date(newStudent.completionDate);
      const formattedDate = dateObj.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });

      // Directly add as Approved and Completed
      await googleSheetsService.addStudent({
        studentId,
        studentName: newStudent.studentName,
        phone: newStudent.phone,
        courseName: newStudent.courseName,
        completionDate: formattedDate,
        approved: true,
        completed: true
      });

      // Wait for sync
      setTimeout(async () => {
        await fetchData();
        setShowAddForm(false);
        setNewStudent({ 
          studentName: '', 
          phone: '', 
          courseName: courses[0], 
          completionDate: new Date().toISOString().split('T')[0] 
        });
      }, 2000);
    } catch (error) {
      console.error('Error adding student:', error);
      setLoading(false);
    }
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
          <h1 className="text-3xl font-serif font-bold text-brand-gold mb-2">Certificate Admin</h1>
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
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-brand-gold/50 text-brand-cream"
                        value={newStudent.phone}
                        onChange={e => setNewStudent({...newStudent, phone: e.target.value})}
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

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-xs font-black uppercase tracking-widest text-brand-cream/40">
                <th className="px-6 py-4">Student Info</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStudents.map(student => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminStudentPanel;
