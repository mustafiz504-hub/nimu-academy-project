import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, BookOpen, Send, CheckCircle2 } from 'lucide-react';
import { googleSheetsService } from '../services/googleSheets';
import Button from './ui/Button';

const courses = [
  "Basic Baking Foundation",
  "Advanced Cake Decorating",
  "Pastry & Viennoiserie",
  "Bread Mastery",
  "Professional Chocolatier"
];

const StudentAdmissionForm = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    courseName: courses[0]
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    const studentId = `STU-${Date.now().toString().slice(-6)}`;
    
    const success = await googleSheetsService.addStudent({
      ...formData,
      studentId
    });

    if (success) {
      setStatus('success');
      setFormData({ studentName: '', email: '', phone: '', courseName: courses[0] });
    } else {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto p-8 bg-brand-dark/40 backdrop-blur-xl border border-brand-gold/20 rounded-3xl text-center">
        <div className="w-20 h-20 bg-brand-gold/20 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-brand-gold mb-2">Admission Submitted!</h2>
        <p className="text-brand-cream/60 mb-8">Your details have been sent to the academy. Our team will review and approve your admission soon.</p>
        <Button onClick={() => setStatus('idle')} className="w-full">Fill Another Form</Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-brand-gold/50 to-brand-gold/0 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
      
      <div className="relative bg-brand-dark/40 backdrop-blur-2xl border border-brand-gold/10 p-8 rounded-[2rem] shadow-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-brand-gold mb-2">Admission Form</h2>
          <p className="text-brand-cream/40 text-sm italic">Start your professional baking journey today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-gold uppercase tracking-[0.2em] ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/40" size={18} />
              <input
                type="text"
                required
                placeholder="Chef Muskan Naz"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand-gold/50 text-brand-cream transition-all placeholder:text-brand-cream/20"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-gold uppercase tracking-[0.2em] ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/40" size={18} />
              <input
                type="email"
                required
                placeholder="chef@nimuacademy.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand-gold/50 text-brand-cream transition-all placeholder:text-brand-cream/20"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-gold uppercase tracking-[0.2em] ml-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/40" size={18} />
              <input
                type="tel"
                required
                placeholder="+91 97772 40070"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand-gold/50 text-brand-cream transition-all placeholder:text-brand-cream/20"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Course Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-gold uppercase tracking-[0.2em] ml-1">Select Course</label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/40" size={18} />
              <select
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand-gold/50 text-brand-cream transition-all appearance-none cursor-pointer"
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              >
                {courses.map(course => (
                  <option key={course} value={course} className="bg-brand-dark text-brand-cream">{course}</option>
                ))}
              </select>
            </div>
          </div>

          {status === 'error' && (
            <p className="text-red-400 text-xs text-center font-medium">Submission failed. Please try again.</p>
          )}

          <Button 
            type="submit" 
            disabled={status === 'submitting'}
            className="w-full py-5 text-lg group flex items-center justify-center gap-3"
          >
            {status === 'submitting' ? (
              <div className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Submit Admission <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default StudentAdmissionForm;
