import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <Nav />
      
      <main className="flex-grow flex items-center justify-center p-4 pt-32 pb-20 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-gold/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-gold/5 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-brand-gold/20 rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-serif font-bold text-brand-gold mb-2">
                {showForgot ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-brand-cream/60">
                {showForgot 
                  ? 'Enter your email to receive a reset link' 
                  : isLogin ? 'Glad to see you again!' : 'Join our baking community today'}
              </p>
            </div>

            {/* Forms */}
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              {showForgot ? (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-brand-cream/80 ml-1">Registered Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold/50" size={18} />
                    <input
                      type="email"
                      placeholder="muskan@nimu.com"
                      className="w-full rounded-xl bg-white/5 border border-white/10 p-4 pl-10 text-white focus:border-brand-gold/50 focus:outline-none transition-all"
                    />
                  </div>
                  <Button variant="primary" className="w-full py-4 mt-6">
                    Send Reset Link
                  </Button>
                  <button 
                    onClick={() => setShowForgot(false)}
                    className="w-full text-center text-sm text-brand-cream/40 mt-4 flex items-center justify-center gap-2 hover:text-brand-gold transition-colors"
                  >
                    <ArrowLeft size={14} /> Back to Login
                  </button>
                </div>
              ) : (
                <>
                  {!isLogin && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-brand-cream/80 ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold/50" size={18} />
                        <input
                          type="text"
                          placeholder="Your Name"
                          className="w-full rounded-xl bg-white/5 border border-white/10 p-4 pl-10 text-white focus:border-brand-gold/50 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-brand-cream/80 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold/50" size={18} />
                      <input
                        type="email"
                        placeholder="email@example.com"
                        className="w-full rounded-xl bg-white/5 border border-white/10 p-4 pl-10 text-white focus:border-brand-gold/50 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-brand-cream/80 ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold/50" size={18} />
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          className="w-full rounded-xl bg-white/5 border border-white/10 p-4 pl-10 text-white focus:border-brand-gold/50 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-sm font-medium text-brand-cream/80">Password</label>
                      {isLogin && (
                        <button 
                          onClick={() => setShowForgot(true)}
                          type="button" 
                          className="text-xs text-brand-gold hover:underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold/50" size={18} />
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full rounded-xl bg-white/5 border border-white/10 p-4 pl-10 text-white focus:border-brand-gold/50 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <Button variant="primary" className="w-full py-4 mt-4 group">
                    <span className="flex items-center justify-center gap-2">
                      {isLogin ? 'Sign In' : 'Register Now'}
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </>
              )}
            </form>

            {!showForgot && (
              <div className="mt-8 text-center">
                <p className="text-brand-cream/40 text-sm">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-2 font-bold text-brand-gold hover:text-brand-gold/80 transition-colors"
                  >
                    {isLogin ? 'Sign Up' : 'Log In'}
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
