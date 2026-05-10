import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Phone, ArrowRight, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useGlobal } from '../context/GlobalContext';

const nextPathForRole = (role?: string) => {
  if (role === 'superadmin') return '/superadmin/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/';
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useGlobal();
  const navigate = useNavigate();

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
    setNotice('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (showForgot) {
      setNotice('Password reset API server me available nahi hai. Admin se contact karein.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const user = isLogin
        ? await login(formData.email, formData.password)
        : await register({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          });

      navigate(nextPathForRole(user?.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col relative overflow-hidden selection:bg-brand-gold selection:text-brand-dark">
      <Nav />

      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-gold/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-gold/5 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-brand-gold/5 rounded-full blur-[100px]" />
      </div>

      <main className="flex-grow flex items-center justify-center p-4 pt-32 pb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg"
        >
          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            {/* Animated border glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-brand-gold/20"
              >
                <Sparkles size={12} /> Nimu Academy
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3 tracking-tight">
                {showForgot ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-brand-cream/40 font-medium">
                {showForgot
                  ? 'Enter your email to check reset availability'
                  : isLogin
                    ? 'Elevate your baking journey today.'
                    : 'Join our exclusive community of chefs'}
              </p>
            </div>

            {(error || notice) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`mb-8 flex items-start gap-4 rounded-2xl border p-4 text-sm ${
                  error
                    ? 'border-red-400/20 bg-red-400/5 text-red-200'
                    : 'border-brand-gold/20 bg-brand-gold/5 text-brand-gold'
                }`}
              >
                <AlertCircle size={20} className="mt-0.5 shrink-0" />
                <span className="leading-relaxed">{error || notice}</span>
              </motion.div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {showForgot ? (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-brand-cream/40 ml-1">Registered Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/30 group-focus-within:text-brand-gold transition-colors" size={20} />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="email@nimuacademy.com"
                      className="w-full rounded-2xl bg-white/5 border border-white/10 p-5 pl-12 text-white placeholder:text-white/10 focus:border-brand-gold/50 focus:bg-white/[0.08] focus:outline-none transition-all duration-300"
                    />
                  </div>
                  <Button type="submit" variant="primary" className="w-full py-5 mt-8 font-black uppercase tracking-widest shadow-2xl shadow-brand-gold/20">
                    Check Availability
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(false);
                      setNotice('');
                    }}
                    className="w-full text-center text-xs font-bold text-brand-cream/30 mt-6 flex items-center justify-center gap-2 hover:text-brand-gold transition-colors group"
                  >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Login flow
                  </button>
                </div>
              ) : (
                <>
                  {!isLogin && (
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-brand-cream/40 ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/30 group-focus-within:text-brand-gold transition-colors" size={20} />
                        <input
                          type="text"
                          required={!isLogin}
                          value={formData.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          placeholder="Muskan Naz"
                          className="w-full rounded-2xl bg-white/5 border border-white/10 p-5 pl-12 text-white placeholder:text-white/10 focus:border-brand-gold/50 focus:bg-white/[0.08] focus:outline-none transition-all duration-300"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-brand-cream/40 ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/30 group-focus-within:text-brand-gold transition-colors" size={20} />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="chef@example.com"
                        className="w-full rounded-2xl bg-white/5 border border-white/10 p-5 pl-12 text-white placeholder:text-white/10 focus:border-brand-gold/50 focus:bg-white/[0.08] focus:outline-none transition-all duration-300"
                      />
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-brand-cream/40 ml-1">Phone Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/30 group-focus-within:text-brand-gold transition-colors" size={20} />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          placeholder="+91 00000 00000"
                          className="w-full rounded-2xl bg-white/5 border border-white/10 p-5 pl-12 text-white placeholder:text-white/10 focus:border-brand-gold/50 focus:bg-white/[0.08] focus:outline-none transition-all duration-300"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-black uppercase tracking-widest text-brand-cream/40">Secure Password</label>
                      {isLogin && (
                        <button
                          onClick={() => setShowForgot(true)}
                          type="button"
                          className="text-[10px] font-black uppercase tracking-widest text-brand-gold/60 hover:text-brand-gold transition-colors"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/30 group-focus-within:text-brand-gold transition-colors" size={20} />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-2xl bg-white/5 border border-white/10 p-5 pl-12 text-white placeholder:text-white/10 focus:border-brand-gold/50 focus:bg-white/[0.08] focus:outline-none transition-all duration-300"
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="primary" disabled={submitting} className="w-full py-5 mt-6 group shadow-2xl shadow-brand-gold/20 font-black uppercase tracking-[0.2em] relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <span className="flex items-center justify-center gap-3 relative z-10">
                      {submitting ? 'Verifying...' : isLogin ? 'Access Account' : 'Initialize Membership'}
                      <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
                    </span>
                  </Button>
                </>
              )}
            </form>

            {!showForgot && (
              <div className="mt-10 text-center">
                <p className="text-brand-cream/30 text-xs font-bold tracking-wide">
                  {isLogin ? "DON'T HAVE AN ACCOUNT?" : 'ALREADY PART OF THE ACADEMY?'}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                    className="ml-3 font-black text-brand-gold hover:text-white transition-all duration-300 border-b border-brand-gold/30 hover:border-white"
                  >
                    {isLogin ? 'CREATE ONE' : 'LOGIN HERE'}
                  </button>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthPage;
