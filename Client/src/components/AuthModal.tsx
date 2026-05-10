import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import Button from './ui/Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'signup' | 'forgot';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<AuthView>('login');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-brand-dark border border-brand-gold/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 rounded-full bg-white/5 p-2 text-brand-cream/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>

          {/* Scrollable Content Area */}
          <div className="flex-grow overflow-y-auto custom-scrollbar p-8">
            {/* Header */}
            <div className="mb-8 text-center pt-2">
              <h2 className="text-3xl font-serif font-bold text-brand-gold leading-tight">
                {view === 'forgot' ? 'Reset Password' : view === 'login' ? 'Welcome Back' : 'Join the Academy'}
              </h2>
              <p className="mt-2 text-brand-cream/60 text-sm">
                {view === 'forgot' 
                  ? 'Enter your email to receive a password reset link' 
                  : view === 'login' 
                    ? 'Sign in to access your professional baking dashboard' 
                    : 'Start your journey with Odisha\'s No.1 Cooking School'}
              </p>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {view === 'forgot' ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-brand-gold uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold/50" size={18} />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        className="w-full rounded-xl bg-white/5 border border-white/10 p-3 pl-10 text-white placeholder:text-white/20 focus:border-brand-gold/50 focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-all"
                      />
                    </div>
                  </div>
                  <Button variant="primary" className="w-full py-4 mt-2">
                    Send Link
                  </Button>
                  <button 
                    onClick={() => setView('login')}
                    className="w-full text-center text-sm text-brand-cream/40 flex items-center justify-center gap-2 hover:text-brand-gold transition-colors"
                  >
                    <ArrowLeft size={14} /> Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  {view === 'signup' && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-brand-gold uppercase tracking-wider ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold/50" size={18} />
                        <input
                          type="text"
                          placeholder="Chef Muskan"
                          className="w-full rounded-xl bg-white/5 border border-white/10 p-3 pl-10 text-white placeholder:text-white/20 focus:border-brand-gold/50 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-brand-gold uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold/50" size={18} />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        className="w-full rounded-xl bg-white/5 border border-white/10 p-3 pl-10 text-white placeholder:text-white/20 focus:border-brand-gold/50 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {view === 'signup' && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-brand-gold uppercase tracking-wider ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold/50" size={18} />
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          className="w-full rounded-xl bg-white/5 border border-white/10 p-3 pl-10 text-white placeholder:text-white/20 focus:border-brand-gold/50 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-xs font-semibold text-brand-gold uppercase tracking-wider">Password</label>
                      {view === 'login' && (
                        <button 
                          type="button" 
                          onClick={() => setView('forgot')}
                          className="text-[10px] uppercase font-bold tracking-widest text-brand-gold/60 hover:text-brand-gold"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold/50" size={18} />
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full rounded-xl bg-white/5 border border-white/10 p-3 pl-10 text-white placeholder:text-white/20 focus:border-brand-gold/50 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <Button variant="primary" className="w-full py-4 mt-4 group">
                    <span className="flex items-center justify-center gap-2">
                      {view === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </>
              )}
            </form>

            {/* Footer Toggle */}
            {view !== 'forgot' && (
              <div className="mt-8 text-center border-t border-white/5 pt-6">
                <p className="text-brand-cream/40 text-sm">
                  {view === 'login' ? "Don't have an account?" : 'Already have an account?'}
                  <button
                    onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                    className="ml-2 font-bold text-brand-gold hover:text-brand-gold/80 transition-colors"
                  >
                    {view === 'login' ? 'Sign Up' : 'Log In'}
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Bottom Accent */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-50" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
