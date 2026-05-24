import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, GraduationCap, Send, CheckCircle2 } from 'lucide-react';
import { googleSheetsService } from '../services/googleSheets';
import Button from './ui/Button';

const courses = [
  'Advanced Cake Decorating',
  'Professional Baking',
  'Chocolate Making Masterclass',
  'Pastry Arts Certification',
  'Traditional Desserts Course'
];

const CertificateEnrollment = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    courseName: courses[0]
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await googleSheetsService.addStudent({
        studentName: formData.studentName,
        email:       formData.email,
        phone:       formData.phone,
        courseName:  formData.courseName,
      });

      if (result.success) {
        setSubmitted(true);
      } else {
        setError('Submission failed. Please try again later.');
      }
    } catch (err) {
      setError('An error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-500/10 border border-green-500/20 rounded-[2rem] p-8 md:p-12 text-center"
      >
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="text-green-500" size={40} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-white mb-4">Enrollment Submitted!</h2>
        <p className="text-brand-cream/60 leading-relaxed max-w-md mx-auto">
          Aapka application academy ko mil gaya hai. Admin se approval milte hi aap apna certificate isi page par search karke download kar sakenge.
        </p>
        <Button 
          onClick={() => setSubmitted(false)}
          className="mt-8 bg-brand-gold text-brand-dark px-10"
        >
          Got it
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="bg-brand-dark/30 backdrop-blur-xl border border-brand-gold/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
      <div className="mb-10">
        <h2 className="text-3xl font-serif font-bold text-brand-gold mb-2">New Student Enrollment</h2>
        <p className="text-brand-cream/40">Enter your details to register for your official certificate.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-brand-cream/40 ml-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/40" size={20} />
            <input 
              required
              type="text"
              placeholder="As on certificate"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand-gold/50 transition-all text-brand-cream"
              value={formData.studentName}
              onChange={(e) => setFormData({...formData, studentName: e.target.value})}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-brand-cream/40 ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/40" size={20} />
            <input 
              required
              type="email"
              placeholder="example@gmail.com"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand-gold/50 transition-all text-brand-cream"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-brand-cream/40 ml-1">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/40" size={20} />
            <input 
              required
              type="tel"
              placeholder="+91 00000 00000"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand-gold/50 transition-all text-brand-cream"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </div>

        {/* Course */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-brand-cream/40 ml-1">Select Course</label>
          <div className="relative">
            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/40" size={20} />
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand-gold/50 transition-all text-brand-cream appearance-none cursor-pointer"
              value={formData.courseName}
              onChange={(e) => setFormData({...formData, courseName: e.target.value})}
            >
              {courses.map(c => <option key={c} value={c} className="bg-brand-dark">{c}</option>)}
            </select>
          </div>
        </div>

        <div className="md:col-span-2 mt-4">
          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 text-lg flex items-center justify-center gap-3 bg-brand-gold text-brand-dark font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-brand-gold/20"
          >
            {loading ? <div className="w-6 h-6 border-3 border-brand-dark border-t-transparent rounded-full animate-spin" /> : <Send size={22} />}
            {loading ? 'Submitting...' : 'Register for Certificate'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CertificateEnrollment;
