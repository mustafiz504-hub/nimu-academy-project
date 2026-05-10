import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { api, ApiEnrollment } from '../../lib/api';
import { useGlobal } from '../../context/GlobalContext';

const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString('en-IN') : '-');

const UserEnrollmentsPage = () => {
  const { user, authLoading } = useGlobal();
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const loadEnrollments = async () => {
      setLoading(true);
      try {
        const response = await api.user.enrollments();
        setEnrollments(response.enrollments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Enrollments load nahi ho paye.');
      } finally {
        setLoading(false);
      }
    };
    loadEnrollments();
  }, [user]);

  if (authLoading) return <div className="min-h-screen bg-brand-cream pt-32 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark">
      <Nav />
      <main className="mx-auto max-w-5xl px-4 pt-32 pb-20">
        <h1 className="text-4xl font-serif font-bold">My Enrollments</h1>
        <p className="mt-2 text-brand-brown">Course requests linked to your account.</p>

        {!user ? (
          <div className="mt-8 rounded-2xl bg-white p-8 text-brand-brown">Please login to view your enrollments.</div>
        ) : (
          <div className="mt-8 grid gap-4">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="rounded-3xl border border-brand-gold/20 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-xl font-bold">
                      <BookOpen size={20} className="text-brand-gold" />
                      {enrollment.course_name || 'Course'}
                    </p>
                    <p className="mt-2 text-brand-brown">{enrollment.batch_timing || 'Batch timing pending'} - {enrollment.mode || 'Mode pending'}</p>
                    <p className="mt-1 text-sm text-brand-brown/70">Submitted on {formatDate(enrollment.created_at)}</p>
                  </div>
                  <span className="w-fit rounded-full bg-brand-gold/10 px-3 py-1 text-xs font-bold uppercase text-brand-gold">
                    {enrollment.status}
                  </span>
                </div>
              </div>
            ))}
            {!loading && enrollments.length === 0 && (
              <div className="rounded-2xl bg-white p-8 text-center text-brand-brown/60">No enrollments yet.</div>
            )}
            {loading && <div className="rounded-2xl bg-white p-8 text-center text-brand-brown/60">Loading enrollments...</div>}
            {error && <div className="rounded-2xl bg-red-50 p-5 text-red-700">{error}</div>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default UserEnrollmentsPage;
