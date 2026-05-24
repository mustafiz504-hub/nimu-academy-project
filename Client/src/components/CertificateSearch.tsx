import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileCheck, AlertCircle } from 'lucide-react';
import { api, ApiStudent } from '../lib/api';
import Button from './ui/Button';
import CertificateDownloader from './CertificateDownloader';

const CertificateSearch = () => {
  const [query, setQuery]     = useState('');
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<ApiStudent | null>(null);
  const [error, setError]     = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setStudent(null);

    try {
      const { student: found } = await api.students.search(q);
      setStudent(found);
    } catch (err: any) {
      if (err?.status === 404) {
        setError('Hume aapki details nahi mili. Please apna correct phone number ya Student ID check karein.');
      } else {
        setError('Kuch galat ho gaya. Please thodi der baad try karein.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-gold mb-4">
          Download Your Certificate
        </h1>
        <p className="text-brand-cream/60">
          Apna registered phone number ya Student ID enter karein apna official Nimu Academy certificate pane ke liye.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto mb-16 relative">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-gold to-transparent rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
          <div className="relative flex">
            <input
              type="text"
              placeholder="Phone number ya Student ID (e.g. STU-1234)"
              className="w-full bg-brand-dark/50 border border-brand-gold/20 rounded-l-2xl py-5 px-6 outline-none text-brand-cream focus:border-brand-gold/50 transition-all"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-gold text-brand-dark px-8 rounded-r-2xl font-bold hover:bg-brand-gold/90 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
                : <Search size={20} />}
              Search
            </button>
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-red-400 text-sm text-center flex items-center justify-center gap-2"
          >
            <AlertCircle size={14} /> {error}
          </motion.p>
        )}
      </form>

      {/* Result Section */}
      <AnimatePresence mode="wait">
        {student && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="bg-brand-dark/30 backdrop-blur-xl border border-brand-gold/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl -mr-32 -mt-32" />

            <div className="relative z-10 w-full">
              <div className="text-center mb-10">
                <div className="flex items-center gap-3 mb-4 justify-center">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full">
                    {student.completed ? 'Verification Passed' : 'In Progress'}
                  </span>
                  <span className="text-brand-cream/30 text-xs font-mono">ID: {student.student_id}</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-cream mb-4">
                  {student.student_name}
                </h2>
                <p className="text-lg md:text-xl text-brand-cream/60 font-light italic">
                  Professional certification in{' '}
                  <span className="text-brand-gold font-medium">{student.course_name}</span>
                </p>
              </div>

              {/* Eligibility Check */}
              {!student.approved || !student.completed ? (
                <div className="max-w-2xl mx-auto bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 flex items-start gap-4 text-left">
                  <AlertCircle className="text-yellow-500 shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="text-yellow-500 font-bold mb-1">Certificate Pending</h4>
                    <p className="text-brand-cream/50 text-sm leading-relaxed">
                      {!student.approved
                        ? 'Aapka admission abhi approve nahi hua hai. Please academy se contact karein.'
                        : 'Aapne abhi tak course complete nahi kiya hai. Course khatam hote hi certificate yaha available ho jayega.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="flex items-center justify-center gap-3 text-green-400 font-medium mb-8">
                    <FileCheck size={20} /> Your official certificate is generated below
                  </div>
                  <CertificateDownloader
                    studentName={student.student_name}
                    courseName={student.course_name}
                    completionDate={student.completion_date}
                    certificateId={student.certificate_id}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CertificateSearch;
