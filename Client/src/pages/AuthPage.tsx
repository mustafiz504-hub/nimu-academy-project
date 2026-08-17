import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, User, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Sparkles, RefreshCw, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import OtpInput from '../components/ui/OtpInput';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useGlobal } from '../context/GlobalContext';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'login' | 'signup';
type Step = 'form' | 'otp';

interface SignupState {
  name: string;
  email: string;
  password: string;
  termsAgreed: boolean;
  marketingOptIn: boolean;
}

interface LoginState {
  email: string;
  password: string;
}

interface OtpSession {
  maskedTarget: string;
  maskedEmail?: string;
  maskedPhone?: string;
  emailForVerify?: string;
  identifierForVerify?: string;
  channel?: 'email' | 'phone';
  purpose: 'signup' | 'login';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const nextPathForRole = (role?: string) => {
  if (role === 'superadmin') return '/superadmin/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/';
};

const RESEND_COOLDOWN = 60; // seconds

// ─── Main Component ───────────────────────────────────────────────────────────
const AuthPage = () => {
  const [tab, setTab] = useState<Tab>('login');
  const [step, setStep] = useState<Step>('form');

  // Signup form
  const [signup, setSignup] = useState<SignupState>({
    name: '',
    email: '',
    password: '',
    termsAgreed: false,
    marketingOptIn: false,
  });

  // Login form
  const [login, setLogin] = useState<LoginState>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpSession, setOtpSession] = useState<OtpSession | null>(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { signupInitiate, signupVerify, loginInitiate, loginVerify, resendOtp } = useGlobal();
  const navigate = useNavigate();

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => setCountdown((c) => c - 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [countdown]);

  const clearMessages = () => { setError(''); setNotice(''); };

  const resetOtp = () => {
    setOtpDigits(['', '', '', '', '', '']);
    clearMessages();
  };

  const startResendTimer = () => {
    setCountdown(RESEND_COOLDOWN);
  };

  // ── Tab change ──
  const switchTab = (t: Tab) => {
    setTab(t);
    setStep('form');
    resetOtp();
    setResendCount(0);
  };

  // ── SIGNUP: Step 1 — Form Submit ──────────────────────────────────────────
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!signup.name.trim()) return setError('Please enter your full name.');
    if (!signup.email.trim()) return setError('Please enter your email address.');
    if (!signup.password.trim() || signup.password.length < 6) return setError('Password must be at least 6 characters.');
    if (!signup.termsAgreed) return setError('Please agree to the Terms & Privacy Policy to continue.');

    setSubmitting(true);
    try {
      const res = await signupInitiate({
        name: signup.name.trim(),
        email: signup.email.trim(),
        password: signup.password.trim(),
        terms_agreed: signup.termsAgreed,
        marketing_opt_in: signup.marketingOptIn,
      });

      setOtpSession({
        maskedTarget: res.maskedEmail || '',
        maskedEmail: res.maskedEmail,
        maskedPhone: res.maskedPhone,
        emailForVerify: res.email || signup.email.trim(),
        purpose: 'signup',
      });
      resetOtp();
      startResendTimer();
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── LOGIN: Step 1 — Form Submit ───────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!login.email.trim()) return setError('Please enter your email address.');
    if (!login.password.trim()) return setError('Please enter your password.');

    setSubmitting(true);
    try {
      const res = await loginInitiate({ email: login.email.trim(), password: login.password.trim() });

      setOtpSession({
        maskedTarget: res.maskedTarget || '',
        channel: res.channel,
        identifierForVerify: res.identifier || login.email.trim(),
        purpose: 'login',
      });
      resetOtp();
      startResendTimer();
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── OTP: Verify ───────────────────────────────────────────────────────────
  const handleOtpVerify = async () => {
    const code = otpDigits.join('');
    if (code.length < 6) return;
    clearMessages();
    setSubmitting(true);

    try {
      let user;
      if (otpSession?.purpose === 'signup') {
        user = await signupVerify({
          email: otpSession.emailForVerify!,
          otp: code,
        });
      } else {
        user = await loginVerify({
          identifier: otpSession!.identifierForVerify!,
          otp: code,
        });
      }
      navigate(nextPathForRole(user?.role));
    } catch (err: any) {
      setError(err.message || 'Incorrect OTP. Please try again.');
      setOtpDigits(['', '', '', '', '', '']);
    } finally {
      setSubmitting(false);
    }
  };

  // ── OTP: Resend ───────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0 || resendCount >= 3) return;
    clearMessages();

    try {
      const identifier = otpSession?.purpose === 'signup'
        ? (otpSession.emailForVerify || '')
        : (otpSession?.identifierForVerify || '');

      await resendOtp({ identifier, purpose: otpSession!.purpose });
      setResendCount((c) => c + 1);
      startResendTimer();
      resetOtp();
      setNotice('A new code has been sent!');
    } catch (err: any) {
      setError(err.message || 'Could not resend OTP.');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  const isOtpComplete = otpDigits.every((d) => d !== '');
  const canResend = countdown === 0 && resendCount < 3;

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col relative overflow-hidden selection:bg-brand-gold selection:text-brand-dark">
      <Nav />

      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-gold/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-gold/5 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] right-[5%] w-[20%] h-[20%] bg-brand-gold/5 rounded-full blur-[100px]" />
      </div>

      <main className="flex-grow flex items-center justify-center p-4 pt-28 pb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg"
        >
          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* ── Header ── */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-[10px] font-black uppercase tracking-[0.2em] mb-5 border border-brand-gold/20">
                <Sparkles size={12} /> Nimu Academy
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step === 'otp' ? 'otp-header' : tab}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.25 }}
                >
                  {step === 'otp' ? (
                    <>
                      <div className="flex justify-center mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
                          <Shield size={28} className="text-brand-gold" />
                        </div>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2 tracking-tight">
                        Enter Your Code
                      </h1>
                      <p className="text-brand-cream/40 text-sm">
                        {otpSession?.purpose === 'signup' ? (
                          <>Code sent to <strong className="text-brand-cream/60">{otpSession.maskedEmail}</strong>{otpSession.maskedPhone ? <> and <strong className="text-brand-cream/60">{otpSession.maskedPhone}</strong></> : null}</>
                        ) : (
                          <>Code sent to <strong className="text-brand-cream/60">{otpSession?.maskedTarget}</strong></>
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2 tracking-tight">
                        {tab === 'login' ? 'Welcome Back' : 'Join Academy'}
                      </h1>
                      <p className="text-brand-cream/40 text-sm">
                        {tab === 'login' ? 'Sign in with your email and password to receive a one-time code.' : 'Create your account in seconds.'}
                      </p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Tab Switcher (only on form step) ── */}
            {step === 'form' && (
              <div className="flex rounded-2xl bg-white/5 border border-white/10 p-1 mb-8">
                {(['login', 'signup'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => switchTab(t)}
                    className={`
                      flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300
                      ${tab === t ? 'bg-brand-gold text-brand-dark shadow-lg' : 'text-brand-cream/40 hover:text-brand-cream/70'}
                    `}
                  >
                    {t === 'login' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>
            )}

            {/* ── Error / Notice Banner ── */}
            <AnimatePresence>
              {(error || notice) && (
                <motion.div
                  key={error ? 'error' : 'notice'}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm overflow-hidden ${
                    error
                      ? 'border-red-400/20 bg-red-400/5 text-red-300'
                      : 'border-brand-gold/20 bg-brand-gold/5 text-brand-gold'
                  }`}
                >
                  {error ? <AlertCircle size={18} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
                  <span className="leading-relaxed">{error || notice}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── STEP: FORM ── */}
            <AnimatePresence mode="wait">
              {step === 'form' && (
                <motion.div
                  key={`form-${tab}`}
                  initial={{ opacity: 0, x: tab === 'signup' ? 30 : -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: tab === 'signup' ? -30 : 30 }}
                  transition={{ duration: 0.3 }}
                >
                  {tab === 'signup' ? (
                    /* ── SIGNUP FORM ── */
                    <form className="space-y-5" onSubmit={handleSignupSubmit}>
                      {/* Name */}
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-brand-cream/40 ml-1">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/30 group-focus-within:text-brand-gold transition-colors" size={18} />
                          <input
                            id="signup-name"
                            type="text"
                            required
                            value={signup.name}
                            onChange={(e) => { setSignup((s) => ({ ...s, name: e.target.value })); clearMessages(); }}
                            placeholder="Muskan Naz"
                            className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 pl-12 text-white placeholder:text-white/10 focus:border-brand-gold/50 focus:bg-white/[0.08] focus:outline-none transition-all duration-300 text-sm"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-brand-cream/40 ml-1">Email Address</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/30 group-focus-within:text-brand-gold transition-colors" size={18} />
                          <input
                            id="signup-email"
                            type="email"
                            required
                            value={signup.email}
                            onChange={(e) => { setSignup((s) => ({ ...s, email: e.target.value })); clearMessages(); }}
                            placeholder="chef@example.com"
                            className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 pl-12 text-white placeholder:text-white/10 focus:border-brand-gold/50 focus:bg-white/[0.08] focus:outline-none transition-all duration-300 text-sm"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-brand-cream/40 ml-1">Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/30 group-focus-within:text-brand-gold transition-colors" size={18} />
                          <input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={signup.password}
                            onChange={(e) => { setSignup((s) => ({ ...s, password: e.target.value })); clearMessages(); }}
                            placeholder="Set a password (min 6 chars)"
                            className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 pl-12 pr-12 text-white placeholder:text-white/10 focus:border-brand-gold/50 focus:bg-white/[0.08] focus:outline-none transition-all duration-300 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gold/30 hover:text-brand-gold transition-colors"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Checkboxes */}
                      <div className="space-y-3 pt-1">
                        <label id="terms-label" className="flex items-start gap-3 cursor-pointer group">
                          <div
                            onClick={() => setSignup((s) => ({ ...s, termsAgreed: !s.termsAgreed }))}
                            className={`
                              mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 cursor-pointer
                              ${signup.termsAgreed ? 'bg-brand-gold border-brand-gold' : 'border-white/20 bg-white/5 group-hover:border-brand-gold/50'}
                            `}
                          >
                            {signup.termsAgreed && <CheckCircle2 size={12} className="text-brand-dark" />}
                          </div>
                          <span className="text-xs text-brand-cream/40 leading-relaxed group-hover:text-brand-cream/60 transition-colors">
                            I have read and agree to the{' '}
                            <a href="/terms" target="_blank" className="text-brand-gold hover:underline">Terms of Service</a>{' '}
                            and{' '}
                            <a href="/privacy" target="_blank" className="text-brand-gold hover:underline">Privacy Policy</a>
                            <span className="text-red-400 ml-1">*</span>
                          </span>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer group">
                          <div
                            onClick={() => setSignup((s) => ({ ...s, marketingOptIn: !s.marketingOptIn }))}
                            className={`
                              mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 cursor-pointer
                              ${signup.marketingOptIn ? 'bg-brand-gold border-brand-gold' : 'border-white/20 bg-white/5 group-hover:border-brand-gold/50'}
                            `}
                          >
                            {signup.marketingOptIn && <CheckCircle2 size={12} className="text-brand-dark" />}
                          </div>
                          <span className="text-xs text-brand-cream/40 leading-relaxed group-hover:text-brand-cream/60 transition-colors">
                            I agree to receive product updates, offers and course announcements from Nimu Academy.
                          </span>
                        </label>
                      </div>

                      <Button
                        id="signup-submit-btn"
                        type="submit"
                        variant="primary"
                        disabled={submitting || !signup.termsAgreed}
                        className="w-full py-4 mt-2 font-black uppercase tracking-[0.15em] shadow-2xl shadow-brand-gold/20 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <span className="flex items-center justify-center gap-3 relative z-10">
                          {submitting ? 'Sending Code...' : 'Get Started'}
                          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </span>
                      </Button>

                      <p className="text-center text-xs text-brand-cream/30 pt-1">
                        Already have an account?{' '}
                        <button type="button" onClick={() => switchTab('login')} className="font-black text-brand-gold hover:text-white transition-colors">
                          Sign In
                        </button>
                      </p>
                    </form>
                  ) : (
                    /* ── LOGIN FORM ── */
                    <form className="space-y-5" onSubmit={handleLoginSubmit}>
                      <div className="space-y-4">
                        {/* Email */}
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-brand-cream/40 ml-1">Email Address</label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/30 group-focus-within:text-brand-gold transition-colors">
                              <Mail size={18} />
                            </div>
                            <input
                              id="login-email"
                              type="email"
                              required
                              value={login.email}
                              onChange={(e) => { setLogin((l) => ({ ...l, email: e.target.value })); clearMessages(); }}
                              placeholder="email@example.com"
                              className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 pl-12 text-white placeholder:text-white/10 focus:border-brand-gold/50 focus:bg-white/[0.08] focus:outline-none transition-all duration-300 text-sm"
                              autoCapitalize="none"
                              autoCorrect="off"
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-brand-cream/40 ml-1">Password</label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/30 group-focus-within:text-brand-gold transition-colors" size={18} />
                            <input
                              id="login-password"
                              type={showPassword ? "text" : "password"}
                              required
                              value={login.password}
                              onChange={(e) => { setLogin((l) => ({ ...l, password: e.target.value })); clearMessages(); }}
                              placeholder="Enter your password"
                              className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 pl-12 pr-12 text-white placeholder:text-white/10 focus:border-brand-gold/50 focus:bg-white/[0.08] focus:outline-none transition-all duration-300 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gold/30 hover:text-brand-gold transition-colors"
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <Button
                        id="login-submit-btn"
                        type="submit"
                        variant="primary"
                        disabled={submitting || !login.email.trim() || !login.password.trim()}
                        className="w-full py-4 mt-2 font-black uppercase tracking-[0.15em] shadow-2xl shadow-brand-gold/20 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <span className="flex items-center justify-center gap-3 relative z-10">
                          {submitting ? 'Sending Code...' : 'Login securely'}
                          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </span>
                      </Button>

                      <p className="text-center text-xs text-brand-cream/30">
                        New to Nimu Academy?{' '}
                        <button type="button" onClick={() => switchTab('signup')} className="font-black text-brand-gold hover:text-white transition-colors">
                          Create Account
                        </button>
                      </p>
                    </form>
                  )}
                </motion.div>
              )}

              {/* ── STEP: OTP ── */}
              {step === 'otp' && (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-6"
                >
                  {/* OTP Boxes */}
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-brand-cream/40 text-center block">
                      Enter 6-Digit Code
                    </label>
                    <OtpInput
                      value={otpDigits}
                      onChange={setOtpDigits}
                      disabled={submitting}
                      autoFocus
                    />
                  </div>

                  {/* Verify Button */}
                  <Button
                    id="otp-verify-btn"
                    type="button"
                    variant="primary"
                    onClick={handleOtpVerify}
                    disabled={!isOtpComplete || submitting}
                    className="w-full py-4 font-black uppercase tracking-[0.15em] shadow-2xl shadow-brand-gold/20 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <span className="flex items-center justify-center gap-3 relative z-10">
                      {submitting ? 'Verifying...' : 'Verify & Continue'}
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>

                  {/* Resend Section */}
                  <div className="text-center space-y-1">
                    {countdown > 0 ? (
                      <p className="text-xs text-brand-cream/30">
                        Resend code in <span className="text-brand-gold font-bold">{countdown}s</span>
                      </p>
                    ) : resendCount >= 3 ? (
                      <p className="text-xs text-brand-cream/30">Maximum resends reached. Please restart.</p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        className="flex items-center gap-2 text-xs font-bold text-brand-gold/70 hover:text-brand-gold transition-colors mx-auto"
                      >
                        <RefreshCw size={12} />
                        Resend Code
                      </button>
                    )}
                  </div>

                  {/* Back Button */}
                  <button
                    type="button"
                    onClick={() => { setStep('form'); resetOtp(); setResendCount(0); }}
                    className="flex items-center gap-2 text-xs font-bold text-brand-cream/30 hover:text-brand-gold transition-colors mx-auto"
                  >
                    <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
                    Back to {tab === 'signup' ? 'Signup' : 'Login'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthPage;
