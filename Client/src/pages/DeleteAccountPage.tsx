import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trash2, AlertTriangle, CheckCircle, ShieldCheck, Clock, FileText, UserCheck, LogIn, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useGlobal } from '../context/GlobalContext';
import { api } from '../lib/api';

const DeleteAccountPage = () => {
  const { user, logout } = useGlobal();
  const navigate = useNavigate();

  // Instant deletion state for logged-in user
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deletedSuccess, setDeletedSuccess] = useState(false);

  // Offline form state for unauthenticated users (required by Google Play policy)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    reason: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInstantDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await api.user.deleteAccount();
      await logout();
      setDeletedSuccess(true);
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      alert('Please provide your registered email address.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.user.submitDeletionRequest(formData);
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col selection:bg-brand-gold selection:text-brand-dark">
      <Nav />
      <main className="flex-grow pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-500/10 text-red-400 mb-6 border border-red-500/20">
              <Trash2 size={32} />
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-cream mb-4">
              Nimu Cooking - Account &amp; Data Deletion
            </h1>
            <p className="text-brand-cream/60 max-w-2xl mx-auto text-sm leading-relaxed">
              We respect your right to privacy and control over your personal information. 
              You can instantly delete your account below, or request deletion without logging in.
            </p>
          </motion.div>

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* SECTION 1: INSTANT 1-CLICK DELETION FOR LOGGED-IN USERS */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {user ? (
            <motion.section 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-12 bg-gradient-to-br from-red-950/40 via-white/5 to-white/5 border-2 border-red-500/30 rounded-[2rem] p-6 md:p-10 shadow-2xl backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 text-red-400 mb-4">
                <UserCheck size={26} />
                <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                  Active Session Detected
                </span>
              </div>

              {deletedSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle size={56} className="text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-serif font-bold text-brand-cream mb-2">Account Permanently Deleted</h3>
                  <p className="text-sm text-brand-cream/70 max-w-md mx-auto mb-6">
                    Your account and associated profile data have been permanently erased from our database.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-gold text-brand-dark font-bold text-sm hover:brightness-110 transition-all"
                  >
                    Return to Homepage
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                    <div>
                      <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-cream">
                        Logged in as: <span className="text-brand-gold">{user.name || 'Student'}</span>
                      </h2>
                      <p className="text-sm text-brand-cream/60 mt-1">
                        Registered Email: <strong className="text-brand-cream/80">{user.email}</strong>
                      </p>
                      {user.role && (
                        <p className="text-xs text-brand-cream/40 mt-0.5 uppercase tracking-wider">
                          Account Role: {user.role}
                        </p>
                      )}
                    </div>

                    {!confirmDelete && (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-lg shadow-red-950/50 flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} />
                        Delete This Account Now
                      </button>
                    )}
                  </div>

                  {confirmDelete && (
                    <div className="mt-6 pt-2 space-y-4">
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                        <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-red-200/90 leading-relaxed">
                          <strong>Warning:</strong> Deleting your account will immediately remove your enrollment records, course progress, and saved certificates. You will not be able to recover this account.
                        </div>
                      </div>

                      {deleteError && (
                        <div className="p-3 rounded-lg bg-red-500/20 text-red-300 text-xs">
                          {deleteError}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        <button
                          disabled={deleting}
                          onClick={handleInstantDelete}
                          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-sm transition-all flex items-center gap-2"
                        >
                          {deleting ? 'Deleting Account...' : 'Yes, Permanently Delete My Account'}
                        </button>
                        <button
                          disabled={deleting}
                          onClick={() => setConfirmDelete(false)}
                          className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-brand-cream text-sm transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.section>
          ) : (
            /* Quick Login Prompt for Logged-Out Users */
            <div className="mb-12 p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <LogIn size={24} className="text-brand-gold shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-brand-cream">Have your login details?</h3>
                  <p className="text-xs text-brand-cream/60">Log in to immediately delete your account with 1 click without filling out any forms.</p>
                </div>
              </div>
              <Link
                to="/auth"
                className="shrink-0 px-5 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-gold-muted text-brand-dark font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
              >
                Log In First <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Policy Information Boxes (Required for Google Play Review) */}
          <div className="space-y-8 text-brand-cream/80 leading-relaxed font-light">
            {/* Step-by-Step Instructions */}
            <section className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-10">
              <h2 className="text-2xl font-serif font-bold text-brand-gold mb-6 flex items-center gap-3">
                <FileText size={24} /> Account Deletion Policy &amp; Steps
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-gold block mb-2">Method 1</span>
                  <h3 className="text-lg font-bold text-brand-cream mb-2">In the Mobile App</h3>
                  <ol className="text-sm space-y-2 list-decimal pl-4 text-brand-cream/70">
                    <li>Open the <strong>Nimu Cooking</strong> mobile application.</li>
                    <li>Go to your <strong>Profile</strong> tab.</li>
                    <li>Tap on <strong>Delete Account &amp; Data</strong>.</li>
                    <li>Confirm the prompt to erase your account immediately.</li>
                  </ol>
                </div>

                <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-gold block mb-2">Method 2</span>
                  <h3 className="text-lg font-bold text-brand-cream mb-2">Web / Uninstalled App</h3>
                  <p className="text-sm text-brand-cream/70 mb-3">
                    If you uninstalled the mobile app, you can log in on this page above for instant deletion, or submit the offline request form below:
                  </p>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Support Email:</strong>{' '}
                      <a href="mailto:privacy@nimuacademy.com" className="text-brand-gold hover:underline">
                        privacy@nimuacademy.com
                      </a>
                    </p>
                    <p>
                      <strong>Support Phone:</strong>{' '}
                      <a href="tel:+919777240070" className="text-brand-gold hover:underline">
                        +91 9777240070
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* What Data is Deleted vs Retained */}
            <div className="grid gap-8 md:grid-cols-2">
              <section className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8">
                <h2 className="text-xl font-serif font-bold text-red-400 mb-4 flex items-center gap-2">
                  <Trash2 size={20} /> Data That Will Be Deleted
                </h2>
                <p className="text-xs text-brand-cream/60 mb-4">
                  Upon processing your request, the following data is permanently removed:
                </p>
                <ul className="text-sm space-y-2 list-disc pl-5 text-brand-cream/70">
                  <li>Your user profile (Name, Email ID, Phone number, Avatar).</li>
                  <li>Login credentials, passwords, and authentication tokens.</li>
                  <li>Course enrollment histories and video watch progress.</li>
                  <li>Certificates of completion associated with your account.</li>
                  <li>App preferences, notification settings, and device push tokens.</li>
                </ul>
              </section>

              <section className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8">
                <h2 className="text-xl font-serif font-bold text-brand-gold mb-4 flex items-center gap-2">
                  <ShieldCheck size={20} /> Data Retained &amp; Legal Compliance
                </h2>
                <p className="text-xs text-brand-cream/60 mb-4">
                  Certain data cannot be erased immediately due to statutory obligations:
                </p>
                <ul className="text-sm space-y-2 list-disc pl-5 text-brand-cream/70">
                  <li>
                    <strong>Financial &amp; Tax Records:</strong> Invoices, payment transaction IDs (via Razorpay), and billing receipts are retained for up to 7 years to comply with Indian GST and accounting laws.
                  </li>
                  <li>
                    <strong>Security &amp; Fraud Prevention:</strong> Anonymized audit logs may be held temporarily to prevent abuse.
                  </li>
                </ul>
              </section>
            </div>

            {/* Timeline */}
            <section className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 flex items-start gap-4">
              <Clock size={28} className="text-brand-gold shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-brand-cream mb-1">Processing Timeline</h3>
                <p className="text-sm text-brand-cream/70">
                  In-app and logged-in account deletions are <strong>instantaneous</strong>. Offline web/email requests are verified and completely processed within <strong>30 calendar days</strong>.
                </p>
              </div>
            </section>

            {/* Offline Request Form (Strictly required by Google Play for unauthenticated users) */}
            <section className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-10">
              <h2 className="text-2xl font-serif font-bold text-brand-gold mb-2">
                Offline Account Deletion Request
              </h2>
              <p className="text-sm text-brand-cream/60 mb-8">
                If you cannot log in or have uninstalled the app, submit your registered email below to request account deletion.
              </p>

              {submitted ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
                  <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
                  <h4 className="text-xl font-bold text-brand-cream mb-2">Request Received</h4>
                  <p className="text-sm text-brand-cream/70 max-w-md mx-auto">
                    Your request to delete account data for <strong>{formData.email || formData.phone}</strong> has been logged. Our administrative team will verify and process the deletion within 30 days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-brand-cream/60 font-medium mb-2">
                        Registered Email Address <span className="text-brand-gold">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="student@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream placeholder:text-brand-cream/20 focus:outline-none focus:border-brand-gold/60"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-brand-cream/60 font-medium mb-2">
                        Registered Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="9777240070"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream placeholder:text-brand-cream/20 focus:outline-none focus:border-brand-gold/60"
                      />
                    </div>
                  </div>

                  {submitError && (
                    <div className="p-3 rounded-lg bg-red-500/20 text-red-300 text-xs">
                      {submitError}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium text-sm transition-colors shadow-lg shadow-red-900/20"
                    >
                      {submitting ? 'Submitting Request...' : 'Submit Deletion Request'}
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>

          {/* Contact Footer Note */}
          <div className="mt-16 pt-8 border-t border-white/10 text-center text-sm text-brand-cream/40">
            <p>
              Developer: <strong>Nimu Cooking Academy</strong> • Rourkela, Odisha, India
            </p>
            <p className="mt-1">
              Questions regarding privacy &amp; data? Contact{' '}
              <a href="mailto:privacy@nimuacademy.com" className="text-brand-gold hover:underline">
                privacy@nimuacademy.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeleteAccountPage;
