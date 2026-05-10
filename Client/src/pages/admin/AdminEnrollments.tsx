import React from 'react';
import { BookOpen, Search, Download } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminEnrollments = () => {
  const enrollments = [
    { id: '#ENR-101', student: 'Muskan Naz', course: 'Basic Baking', batch: 'Weekend Morning', status: 'Confirmed', date: 'May 08, 2026' },
    { id: '#ENR-102', student: 'Sonia Das', course: 'Cake Decoration', batch: 'Weekday Evening', status: 'Pending', date: 'May 09, 2026' },
    { id: '#ENR-103', student: 'Anjali Jena', course: 'Pastry Mastery', batch: 'Weekend Morning', status: 'Completed', date: 'May 05, 2026' },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif font-bold text-white">Enrollment Management</h1>
        <button className="flex items-center gap-2 bg-brand-gold text-brand-dark px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-gold-muted transition-colors">
          <Download size={18} /> Export List
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-brand-cream/40 text-xs uppercase tracking-wider border-b border-white/5">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4">Batch Timing</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {enrollments.map((enr) => (
              <tr key={enr.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-brand-gold">{enr.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-white">{enr.student}</td>
                <td className="px-6 py-4 text-sm text-brand-cream/60">{enr.course}</td>
                <td className="px-6 py-4 text-sm text-brand-cream/40">{enr.batch}</td>
                <td className="px-6 py-4 text-sm text-brand-cream/40">{enr.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    enr.status === 'Completed' ? 'bg-green-500/10 text-green-400' :
                    enr.status === 'Confirmed' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {enr.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminEnrollments;
