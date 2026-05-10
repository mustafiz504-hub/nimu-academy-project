import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, Download, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { api, ApiEnrollment } from '../../lib/api';

const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];

const statusClass = (status: string) => {
  if (status === 'completed') return 'bg-green-500/10 text-green-400';
  if (status === 'confirmed') return 'bg-blue-500/10 text-blue-400';
  if (status === 'cancelled') return 'bg-red-500/10 text-red-400';
  return 'bg-yellow-500/10 text-yellow-400';
};

const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString('en-IN') : '-');

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const loadEnrollments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.admin.enrollments();
      setEnrollments(response.enrollments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enrollments load nahi ho paye.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  const filteredEnrollments = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return enrollments.filter((enrollment) =>
      [enrollment.student_name, enrollment.course_name, enrollment.phone, enrollment.email, String(enrollment.id), enrollment.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [enrollments, searchQuery]);

  const updateStatus = async (id: number, status: string) => {
    setSavingId(id);
    setError('');
    try {
      const response = await api.admin.updateEnrollmentStatus(id, status);
      setEnrollments((prev) => prev.map((item) => (item.id === id ? { ...item, status: response.enrollment.status } : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update nahi ho paya.');
    } finally {
      setSavingId(null);
    }
  };

  const deleteEnrollment = async (id: number) => {
    if (!window.confirm('Delete this enrollment?')) return;
    setSavingId(id);
    setError('');
    try {
      await api.enrollments.delete(id);
      setEnrollments((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enrollment delete nahi ho paya.');
    } finally {
      setSavingId(null);
    }
  };

  const exportCsv = () => {
    const rows = filteredEnrollments.map((item) => [
      item.id,
      item.student_name,
      item.phone,
      item.email || '',
      item.course_name || '',
      item.batch_timing || '',
      item.mode || '',
      item.status,
      formatDate(item.created_at),
    ]);
    const csv = [['ID', 'Student', 'Phone', 'Email', 'Course', 'Batch', 'Mode', 'Status', 'Date'], ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'enrollments.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Enrollment Management</h1>
          <p className="text-brand-cream/40 mt-1">Course requests from the backend</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cream/40" size={18} />
            <input
              type="text"
              placeholder="Search enrollments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:border-brand-gold/50 outline-none text-sm"
            />
          </div>
          <button onClick={loadEnrollments} className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm hover:bg-white/10 transition-colors">
            <RefreshCw size={18} /> Refresh
          </button>
          <button onClick={exportCsv} className="flex items-center justify-center gap-2 bg-brand-gold text-brand-dark px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-gold-muted transition-colors">
            <Download size={18} /> Export List
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-red-200">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-brand-cream/40 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Batch Timing</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEnrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-brand-gold">#ENR-{enrollment.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-white">
                    <div>{enrollment.student_name}</div>
                    <div className="text-xs text-brand-cream/35">{enrollment.city || '-'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-cream/60">
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-brand-gold" />
                      {enrollment.course_name || 'Course'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-cream/40">{enrollment.batch_timing || '-'}</td>
                  <td className="px-6 py-4 text-sm text-brand-cream/60">
                    <div>{enrollment.phone}</div>
                    <div className="text-xs text-brand-cream/35">{enrollment.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-cream/40">{formatDate(enrollment.created_at)}</td>
                  <td className="px-6 py-4">
                    <select
                      value={enrollment.status}
                      disabled={savingId === enrollment.id}
                      onChange={(e) => updateStatus(enrollment.id, e.target.value)}
                      className={`rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider outline-none ${statusClass(enrollment.status)} bg-brand-dark`}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteEnrollment(enrollment.id)}
                      disabled={savingId === enrollment.id}
                      className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                      aria-label="Delete enrollment"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredEnrollments.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-brand-cream/40">No enrollments found.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-brand-cream/40">Loading enrollments...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEnrollments;
