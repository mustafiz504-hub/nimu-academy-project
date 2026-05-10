import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Calendar, Clock, Plus, Edit, Trash2, MapPin, X, Save, CheckCircle2, ShieldCheck, User, ChevronRight } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/ui/Button';
import { useGlobal, Course } from '../../context/GlobalContext';

const AdminCourses = () => {
  const { courses, setCourses } = useGlobal();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [isModePickerOpen, setIsModePickerOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const handleEdit = (course: any) => {
    setEditingCourse({
      ...course,
      instructor: course.instructor || { name: '', bio: '' },
      topics: course.topics || [],
      learn: course.learn || [],
      batches: course.batches || []
    });
    setIsImagePickerOpen(false);
    setIsModePickerOpen(false);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    if (editingCourse.id === 0) {
      // Add new course logic
      const newCourse = { 
        ...editingCourse, 
        id: Date.now(),
        // Clean price formatting for storage if needed, though UI handles ₹
      };
      setCourses(prev => [...prev, newCourse]);
    } else {
      // Update existing course
      setCourses(prev => prev.map(c => c.id === editingCourse.id ? editingCourse : c));
    }
    
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Academy Courses</h1>
          <p className="text-brand-cream/40 mt-1">Manage baking classes, schedules and pricing</p>
        </div>
        <Button 
          variant="primary" 
          className="flex items-center gap-2"
          onClick={() => {
            setEditingCourse({ id: 0, title: '', price: '', duration: '', timing: '', days: '', image: '', mode: 'ONLINE & OFFLINE', topics: [] });
            setIsModalOpen(true);
          }}
        >
          <Plus size={20} /> Add New Course
        </Button>
      </div>

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
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{course.title || 'Untitled Course'}</h3>
                  <span className="text-brand-gold font-bold text-lg">₹{course.price?.replace('₹', '') || '0'}</span>
                </div>
                
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
                     {course.topics?.slice(0, 3).map((t: string, i: number) => (
                       <span key={i} className="text-[10px] bg-white/5 px-2 py-1 rounded-md text-brand-cream/60">
                         {t}
                       </span>
                     ))}
                     {course.topics?.length > 3 && <span className="text-[10px] text-brand-gold">+{course.topics.length - 3} more</span>}
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
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm transition-colors"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit/Add Modal */}
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
              className="relative w-full max-w-4xl bg-brand-dark border border-brand-gold/30 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-brand-gold">
                    {editingCourse.id === 0 ? 'Create New Course' : 'Edit Course Details'}
                  </h2>
                  <p className="text-brand-cream/40 text-[10px] uppercase tracking-[0.2em] mt-1">Academy Management System</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 rounded-full bg-white/5 text-brand-cream/60 hover:bg-brand-gold hover:text-brand-dark transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Basic Information */}
                  <div className="md:col-span-2 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.3em]">Basic Information</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-cream/60 uppercase tracking-widest flex items-center gap-2">
                      <BookOpen size={14} className="text-brand-gold" /> Course Title
                    </label>
                    <input 
                      type="text" 
                      value={editingCourse.title}
                      onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                      placeholder="e.g. Basic Baking Course"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-gold/50 text-white transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-cream/60 uppercase tracking-widest flex items-center gap-2">
                      <Save size={14} className="text-brand-gold" /> Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold font-bold">₹</span>
                      <input 
                        type="text" 
                        value={(editingCourse.price || '').replace('₹', '')}
                        onChange={(e) => setEditingCourse({...editingCourse, price: e.target.value.replace('₹', '')})}
                        placeholder="4,999"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-10 outline-none focus:border-brand-gold/50 text-white transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 relative">
                    <label className="text-xs font-bold text-brand-cream/60 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={14} className="text-brand-gold" /> Course Mode
                    </label>
                    <button 
                      type="button"
                      onClick={() => setIsModePickerOpen(!isModePickerOpen)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-brand-gold/50 transition-colors text-left"
                    >
                      <span className="text-white">{editingCourse.mode}</span>
                      <ChevronRight size={16} className={`text-brand-gold transition-transform ${isModePickerOpen ? 'rotate-90' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isModePickerOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-[120] top-full left-0 right-0 mt-2 bg-brand-dark border border-brand-gold/30 rounded-2xl shadow-2xl overflow-hidden"
                        >
                          {['ONLINE & OFFLINE', 'ONLINE ONLY', 'OFFLINE ONLY'].map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => {
                                setEditingCourse({...editingCourse, mode});
                                setIsModePickerOpen(false);
                              }}
                              className={`w-full px-6 py-4 text-left text-sm transition-colors hover:bg-white/5 ${
                                editingCourse.mode === mode ? 'text-brand-gold bg-brand-gold/5' : 'text-brand-cream/60'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Image Picker Dropdown */}
                  <div className="space-y-2 relative">
                    <label className="text-xs font-bold text-brand-cream/60 uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={14} className="text-brand-gold" /> Course Image
                    </label>
                    <button 
                      type="button"
                      onClick={() => setIsImagePickerOpen(!isImagePickerOpen)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between hover:border-brand-gold/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
                          <img src={editingCourse.image} className="w-full h-full object-cover" alt="Selected" />
                        </div>
                        <span className="text-brand-cream/40 text-sm">Select from gallery</span>
                      </div>
                      <Plus size={16} className={`text-brand-gold transition-transform ${isImagePickerOpen ? 'rotate-45' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isImagePickerOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-[110] top-full left-0 right-0 mt-2 p-4 bg-brand-dark border border-brand-gold/30 rounded-[2rem] shadow-2xl overflow-hidden"
                        >
                          <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto custom-scrollbar p-1">
                            {[
                              'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop',
                              'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=300&auto=format&fit=crop',
                              'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=300&auto=format&fit=crop',
                              'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=300&auto=format&fit=crop',
                              'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=300&auto=format&fit=crop',
                              'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=300&auto=format&fit=crop',
                              'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=300&auto=format&fit=crop',
                              'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=300&auto=format&fit=crop'
                            ].map((img, i) => (
                              <div 
                                key={i} 
                                onClick={() => {
                                  setEditingCourse({...editingCourse, image: img});
                                  setIsImagePickerOpen(false);
                                }}
                                className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                                  editingCourse.image === img ? 'border-brand-gold scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                              >
                                <img src={img} className="w-full h-full object-cover" alt="Option" />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Schedule */}
                  <div className="md:col-span-2 flex items-center gap-3 mt-4">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.3em]">Schedule & Duration</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-cream/60 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={14} className="text-brand-gold" /> Duration
                    </label>
                    <input 
                      type="text" 
                      value={editingCourse.duration}
                      onChange={(e) => setEditingCourse({...editingCourse, duration: e.target.value})}
                      placeholder="e.g. 4 Weeks"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-gold/50 text-white transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-cream/60 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={14} className="text-brand-gold" /> Class Days
                    </label>
                    <input 
                      type="text" 
                      value={editingCourse.days}
                      onChange={(e) => setEditingCourse({...editingCourse, days: e.target.value})}
                      placeholder="e.g. Sat - Sun"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-gold/50 text-white transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-brand-cream/60 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={14} className="text-brand-gold" /> Batch Timings
                    </label>
                    <input 
                      type="text" 
                      value={editingCourse.timing}
                      onChange={(e) => setEditingCourse({...editingCourse, timing: e.target.value})}
                      placeholder="e.g. 10 AM - 12 PM / 5 PM - 7 PM"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-gold/50 text-white transition-colors"
                    />
                  </div>

                  {/* Content & Instructor */}
                  <div className="md:col-span-2 flex items-center gap-3 mt-4">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.3em]">Instructor & Content</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-cream/60 uppercase tracking-widest flex items-center gap-2">
                      <User size={14} className="text-brand-gold" /> Instructor Name
                    </label>
                    <input 
                      type="text" 
                      value={editingCourse.instructor?.name}
                      onChange={(e) => setEditingCourse({...editingCourse, instructor: {...editingCourse.instructor, name: e.target.value}})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-gold/50 text-white transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-cream/60 uppercase tracking-widest flex items-center gap-2">
                      <Edit size={14} className="text-brand-gold" /> Instructor Bio
                    </label>
                    <input 
                      type="text" 
                      value={editingCourse.instructor?.bio}
                      onChange={(e) => setEditingCourse({...editingCourse, instructor: {...editingCourse.instructor, bio: e.target.value}})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-gold/50 text-white transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-brand-cream/60 uppercase tracking-widest flex items-center gap-2">
                       Course Syllabus (Comma separated)
                    </label>
                    <textarea 
                      value={editingCourse.topics?.join(', ')}
                      onChange={(e) => setEditingCourse({...editingCourse, topics: e.target.value.split(',').map(s => s.trim())})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-gold/50 text-white resize-none transition-colors"
                      rows={2}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-brand-cream/60 uppercase tracking-widest flex items-center gap-2">
                       Learning Outcomes (Comma separated)
                    </label>
                    <textarea 
                      value={editingCourse.learn?.join(', ')}
                      onChange={(e) => setEditingCourse({...editingCourse, learn: e.target.value.split(',').map(s => s.trim())})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-gold/50 text-white resize-none transition-colors"
                      rows={2}
                    />
                  </div>

                </form>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 border-t border-white/10 flex gap-4 bg-white/5">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl border border-white/10 text-brand-cream font-bold hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] py-4 rounded-2xl bg-brand-gold text-brand-dark font-bold shadow-xl shadow-brand-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} /> Save Changes
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
