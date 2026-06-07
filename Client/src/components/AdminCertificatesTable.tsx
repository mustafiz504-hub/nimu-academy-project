import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api, ApiStudent } from '../lib/api';
import { Search, Award, RefreshCw, X, Eye, Download, Loader2, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CertificateDownloader from './CertificateDownloader';

// ── Off-screen certificate renderer for bulk download ─────────────────────────
interface OffscreenCertProps {
  student: ApiStudent;
  onReady: (el: HTMLDivElement) => void;
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  } catch { return dateStr; }
};

// Generates and saves a single certificate PDF from a student object (headless)
const downloadCertificatePDF = async (student: ApiStudent): Promise<void> => {
  await document.fonts.ready;

  // Create a temporary off-screen container
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-99999px;top:0;width:1123px;height:794px;z-index:-1;';
  document.body.appendChild(container);

  // Build the certificate HTML
  container.innerHTML = `
    <div
      data-cert-root
      style="
        position:absolute;top:0;left:0;
        width:1123px;height:794px;
        background-image:url('/certificate-template1.jpeg');
        background-size:100% 100%;
        background-repeat:no-repeat;
      "
    >
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lora:wght@400;500;600;700&family=Poppins:wght@400;500;600&display=swap');
        .cert-name { font-family: 'Great Vibes', cursive; }
      </style>
      <div style="position:absolute;left:0;width:100%;display:flex;justify-content:center;top:290px;">
        <span class="cert-name" style="font-size:82px;color:#000;line-height:1;letter-spacing:0.01em;white-space:nowrap;">
          ${student.student_name}
        </span>
      </div>
      <div style="position:absolute;left:0;width:100%;display:flex;flex-direction:column;align-items:center;top:430px;font-family:'Lora',serif;color:#2a3f5f;text-align:center;line-height:1.55;">
        <p style="font-size:22px;font-weight:500;margin:0;">
          Has successfully completed <span style="font-weight:700;">${student.course_name}</span> course
        </p>
        <p style="font-size:22px;font-weight:500;margin:0;">
          conducted by <span style="font-weight:700;">nimu cooking academy</span>
        </p>
        <p style="font-size:20px;font-weight:700;margin:4px 0 0;">UDYAM-OD-30-0059753</p>
        <p style="font-size:20px;font-weight:700;margin:2px 0 0;">Fssai no:22026032000151</p>
      </div>
      <div style="position:absolute;bottom:73px;right:179px;font-size:15px;color:#3f5a73;font-weight:500;font-family:'Poppins',sans-serif;letter-spacing:0.03em;">
        ${formatDate(student.completion_date)}
      </div>
    </div>
  `;

  await new Promise(r => setTimeout(r, 300)); // let fonts paint

  const el = container.querySelector('[data-cert-root]') as HTMLElement;

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    width: 1123,
    height: 794,
    logging: false,
    onclone: (clonedDoc) => {
      const cloned = clonedDoc.querySelector('[data-cert-root]') as HTMLElement;
      if (cloned) { cloned.style.transform = 'none'; }
    }
  });

  const imgData = canvas.toDataURL('image/jpeg', 1.0);
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1123, 794] });
  pdf.addImage(imgData, 'JPEG', 0, 0, 1123, 794);
  pdf.save(`${student.student_name.replace(/\s+/g, '_')}_Certificate.pdf`);

  document.body.removeChild(container);
};

// ── Main Component ─────────────────────────────────────────────────────────────
const AdminCertificatesTable = () => {
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<ApiStudent | null>(null);

  // ── Checkbox state ──────────────────────────────────────────────────────────
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const cancelBulkRef = useRef(false);

  const fetchCertificates = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);
    try {
      const { students: allStudents } = await api.students.list();
      const certStudents = allStudents.filter(s => s.completed && s.certificate_id);
      setStudents(certStudents);
      setCheckedIds(new Set()); // reset selection on refresh
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCertificates(); }, [fetchCertificates]);

  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.student_name.toLowerCase().includes(q) ||
      s.certificate_id.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
  });

  // ── Universal checkbox logic ────────────────────────────────────────────────
  const allFilteredChecked =
    filteredStudents.length > 0 &&
    filteredStudents.every(s => checkedIds.has(s.id));
  const someChecked = filteredStudents.some(s => checkedIds.has(s.id));

  const toggleAll = () => {
    if (allFilteredChecked) {
      // Uncheck all filtered
      setCheckedIds(prev => {
        const next = new Set(prev);
        filteredStudents.forEach(s => next.delete(s.id));
        return next;
      });
    } else {
      // Check all filtered
      setCheckedIds(prev => {
        const next = new Set(prev);
        filteredStudents.forEach(s => next.add(s.id));
        return next;
      });
    }
  };

  const toggleOne = (id: number) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Bulk Download ───────────────────────────────────────────────────────────
  const handleBulkDownload = async () => {
    const toDownload = filteredStudents.filter(s => checkedIds.has(s.id));
    if (toDownload.length === 0) return;

    setBulkDownloading(true);
    cancelBulkRef.current = false; // reset cancel flag
    setBulkProgress({ current: 0, total: toDownload.length });

    for (let i = 0; i < toDownload.length; i++) {
      if (cancelBulkRef.current) {
        break;
      }
      setBulkProgress({ current: i + 1, total: toDownload.length });
      try {
        await downloadCertificatePDF(toDownload[i]);
        // Sleep for 400ms, checking for cancel periodically to abort instantly
        for (let delay = 0; delay < 400; delay += 50) {
          if (cancelBulkRef.current) break;
          await new Promise(r => setTimeout(r, 50));
        }
      } catch (err) {
        console.error(`Failed for ${toDownload[i].student_name}:`, err);
      }
    }

    setBulkDownloading(false);
    setBulkProgress({ current: 0, total: 0 });
  };

  const selectedCount = filteredStudents.filter(s => checkedIds.has(s.id)).length;

  return (
    <div className="w-full mt-4 mb-8">
      {/* Table Container */}
      <div className="relative bg-[#1a0f07] border border-brand-gold/15 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 relative z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Award className="text-brand-gold shrink-0" size={20} />
              <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-brand-gold leading-tight">
                All Student Certificates ({loading ? '...' : students.length})
              </h2>
              {refreshing && (
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold bg-brand-gold/15 px-2 py-0.5 rounded-full animate-pulse">
                  Syncing...
                </span>
              )}
            </div>
            <p className="hidden sm:block text-xs text-brand-cream/50 mt-1">
              View and download certificates of all graduated students.
            </p>
          </div>

          <div className="flex items-center gap-3 mr-auto sm:ml-0 md:self-auto">
            {/* Bulk Download Button */}
            <AnimatePresence>
              {selectedCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  onClick={handleBulkDownload}
                  disabled={bulkDownloading}
                  className="flex items-center gap-2 bg-brand-gold text-brand-dark px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-brand-gold/90 transition-all active:scale-95 disabled:opacity-70 shadow-lg shadow-brand-gold/20"
                >
                  {bulkDownloading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      {bulkProgress.current}/{bulkProgress.total}
                    </>
                  ) : (
                    <>
                      <Download size={15} />
                      Download {selectedCount} Certificate{selectedCount > 1 ? 's' : ''}
                    </>
                  )}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Refresh */}
            <button
              onClick={() => fetchCertificates(true)}
              disabled={refreshing}
              className="bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold p-2.5 rounded-xl border border-brand-gold/20 transition-all active:scale-95 disabled:opacity-50"
              title="Refresh list"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Bulk Download Progress Bar */}
        <AnimatePresence>
          {bulkDownloading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 relative z-10"
            >
              <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-2xl px-5 py-3 flex items-center gap-4">
                <Loader2 size={16} className="text-brand-gold animate-spin shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-brand-gold mb-1.5">
                    Downloading certificate {bulkProgress.current} of {bulkProgress.total}...
                  </p>
                  <div className="w-full h-1.5 bg-brand-gold/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-brand-gold rounded-full"
                      animate={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
                <span className="text-xs font-black text-brand-gold/70 shrink-0">
                  {Math.round((bulkProgress.current / bulkProgress.total) * 100)}%
                </span>
                <button
                  onClick={() => {
                    cancelBulkRef.current = true;
                  }}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shrink-0"
                  title="Cancel Download"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Input */}
        <div className="relative mb-6 z-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cream/40" size={18} />
          <input
            type="text"
            placeholder="Search by student name or NIMU Certificate ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#120a05] border border-brand-gold/20 rounded-2xl py-3.5 pl-12 pr-4 outline-none text-brand-cream text-sm focus:border-brand-gold/50 transition-all placeholder:text-brand-cream/30"
          />
        </div>



        {/* ── Mobile card list (< md) ───────────────────────────────── */}
        <div className="md:hidden space-y-2 z-10 relative max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-brand-gold/20">
          {/* Mobile select-all bar */}
          {filteredStudents.length > 0 && !loading && (
            <div className="sticky top-0 bg-[#1a0f07] z-20 flex items-center gap-3 px-1 py-2.5 mb-2 border-b border-brand-gold/10">
              <button
                onClick={toggleAll}
                className="flex items-center gap-2 text-xs font-bold text-brand-gold"
              >
                <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  allFilteredChecked ? 'bg-brand-gold border-brand-gold'
                  : someChecked ? 'bg-brand-gold/30 border-brand-gold'
                  : 'border-brand-gold/30'
                }`}>
                  {allFilteredChecked && (
                    <svg viewBox="0 0 10 8" className="w-3 h-3" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4l2.5 2.5L9 1" stroke="#1a0f07" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {someChecked && !allFilteredChecked && <span className="w-2.5 h-0.5 bg-brand-gold rounded-full block" />}
                </span>
                Select All
              </button>
            </div>
          )}

          {loading ? (
            [...Array(3)].map((_, idx) => (
              <div key={idx} className="animate-pulse bg-brand-dark/20 border border-brand-gold/10 rounded-2xl p-4 flex gap-3">
                <div className="h-5 w-5 bg-white/10 rounded-md shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-white/10 rounded" />
                  <div className="h-3 w-24 bg-white/10 rounded" />
                  <div className="h-3 w-40 bg-white/10 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-white/10 rounded-xl" />
                  <div className="h-8 w-8 bg-white/10 rounded-xl" />
                </div>
              </div>
            ))
          ) : filteredStudents.length === 0 ? (
            <div className="py-10 text-center text-brand-cream/40 italic text-sm">
              {searchQuery ? 'No certificates match your search.' : 'No certificates found.'}
            </div>
          ) : (
            filteredStudents.map((student, idx) => {
              const isChecked = checkedIds.has(student.id);
              return (
                <div
                  key={student.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
                    isChecked
                      ? 'bg-brand-gold/[0.06] border-brand-gold/20'
                      : 'bg-brand-dark/20 border-brand-gold/10'
                  }`}
                >
                  {/* Checkbox */}
                  <button onClick={() => toggleOne(student.id)} className="shrink-0">
                    <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      isChecked
                        ? 'bg-brand-gold border-brand-gold shadow-md shadow-brand-gold/20'
                        : 'border-brand-gold/25'
                    }`}>
                      {isChecked && (
                        <svg viewBox="0 0 10 8" className="w-3 h-3" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 4l2.5 2.5L9 1" stroke="#1a0f07" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-cream text-sm truncate">{student.student_name}</p>
                    <p className="font-mono text-brand-gold text-[11px] mt-0.5">{student.certificate_id}</p>
                    <p className="text-brand-cream/50 text-xs mt-0.5 truncate">{student.course_name}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      title="View"
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-brand-gold/10 border border-brand-gold/20 text-brand-gold active:scale-90 transition-all"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => downloadCertificatePDF(student)}
                      title="Download"
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 active:scale-90 transition-all"
                    >
                      <Download size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Desktop table (md+) ──────────────────────────────────── */}
        <div className="hidden md:block overflow-x-auto overflow-y-auto max-h-[60vh] rounded-2xl border border-brand-gold/10 bg-brand-dark/20 z-10 relative scrollbar-thin scrollbar-thumb-brand-gold/20">
          <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr className="text-xs font-black uppercase tracking-wider text-brand-gold/80">
                <th className="px-4 py-4 w-12 text-center sticky top-0 bg-[#1a0f07] border-b border-brand-gold/10 z-20">
                  <button
                    onClick={toggleAll}
                    disabled={loading || filteredStudents.length === 0}
                    title={allFilteredChecked ? 'Uncheck all' : 'Check all'}
                    className="group flex items-center justify-center w-full disabled:opacity-30"
                  >
                    <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      allFilteredChecked ? 'bg-brand-gold border-brand-gold'
                      : someChecked ? 'bg-brand-gold/30 border-brand-gold'
                      : 'border-brand-gold/30 group-hover:border-brand-gold/60 bg-transparent'
                    }`}>
                      {allFilteredChecked && (
                        <svg viewBox="0 0 10 8" className="w-3 h-3 fill-brand-dark" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {someChecked && !allFilteredChecked && <span className="w-2.5 h-0.5 bg-brand-gold rounded-full block" />}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-4 w-10 text-center sticky top-0 bg-[#1a0f07] border-b border-brand-gold/10 z-20">#</th>
                <th className="px-6 py-4 sticky top-0 bg-[#1a0f07] border-b border-brand-gold/10 z-20">Student Name</th>
                <th className="px-6 py-4 sticky top-0 bg-[#1a0f07] border-b border-brand-gold/10 z-20">NIMU ID</th>
                <th className="px-6 py-4 sticky top-0 bg-[#1a0f07] border-b border-brand-gold/10 z-20">Course Name</th>
                <th className="px-6 py-4 text-center sticky top-0 bg-[#1a0f07] border-b border-brand-gold/10 z-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/5 text-sm">
              {loading ? (
                [...Array(3)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-4 py-4"><div className="h-5 w-5 bg-white/10 rounded-md mx-auto" /></td>
                    <td className="px-4 py-4 text-center"><div className="h-4 w-4 bg-white/10 rounded mx-auto" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-white/10 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-white/10 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-48 bg-white/10 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-24 bg-white/10 rounded-lg mx-auto" /></td>
                  </tr>
                ))
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-brand-cream/40 italic">
                    {searchQuery ? 'No certificates match your search query.' : 'No student certificates found in the database.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const isChecked = checkedIds.has(student.id);
                  return (
                    <tr
                      key={student.id}
                      className={`transition-colors group ${isChecked ? 'bg-brand-gold/[0.04]' : 'hover:bg-brand-gold/[0.02]'}`}
                    >
                      <td className="px-4 py-4 text-center">
                        <button onClick={() => toggleOne(student.id)} className="group/cb flex items-center justify-center w-full">
                          <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-brand-gold border-brand-gold shadow-md shadow-brand-gold/20'
                              : 'border-brand-gold/25 group-hover/cb:border-brand-gold/60 bg-transparent'
                          }`}>
                            {isChecked && (
                              <svg viewBox="0 0 10 8" className="w-3 h-3" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 4l2.5 2.5L9 1" stroke="#1a0f07" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center font-mono text-brand-gold/60">{idx + 1}</td>
                      <td className="px-6 py-4 font-semibold text-brand-cream">{student.student_name}</td>
                      <td className="px-6 py-4 font-mono text-brand-gold text-xs">{student.certificate_id}</td>
                      <td className="px-6 py-4 text-brand-cream/75">{student.course_name}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            title="View Certificate"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-brand-gold/10 border border-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-brand-dark transition-all active:scale-90 shadow-sm"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => downloadCertificatePDF(student)}
                            title="Download Certificate PDF"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-all active:scale-90 shadow-sm"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificate Viewer Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            {/* Premium backdrop with deep blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Modal — premium dark-gold theme, responsive flex column */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              className="relative flex flex-col bg-gradient-to-b from-[#1c1108] to-[#0c0703] border border-brand-gold/30 rounded-[2.5rem] w-full max-w-5xl shadow-[0_0_50px_rgba(212,175,55,0.15)] z-10 overflow-hidden"
              style={{ maxHeight: 'calc(100vh - 1.5rem)' }}
            >
              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 md:px-8 md:py-4.5 border-b border-brand-gold/15 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold">
                    <Award size={20} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-brand-gold/60">
                      Verified Academic Credential
                    </span>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-white leading-tight mt-0.5">
                      {selectedStudent.student_name}
                    </h3>
                    <p className="text-[10px] text-brand-cream/40 font-mono tracking-wider mt-0.5">
                      ID: {selectedStudent.certificate_id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="flex-shrink-0 text-brand-cream/40 hover:text-white bg-white/5 hover:bg-white/10 p-2.5 rounded-full transition-all active:scale-90"
                  title="Close Preview"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Certificate Canvas Area */}
              <div className="flex-1 min-h-0 bg-[#0c0703] p-3 md:p-4 flex flex-col justify-center overflow-hidden">
                <CertificateDownloader
                  studentName={selectedStudent.student_name}
                  courseName={selectedStudent.course_name}
                  completionDate={selectedStudent.completion_date}
                  certificateId={selectedStudent.certificate_id}
                  isInModal={true}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCertificatesTable;
