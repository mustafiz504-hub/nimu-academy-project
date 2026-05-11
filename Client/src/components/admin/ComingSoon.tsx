import React from 'react';
import { motion } from 'motion/react';
import { Construction, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ComingSoonProps {
  title: string;
  description: string;
}

const ComingSoon = ({ title, description }: ComingSoonProps) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mb-12"
      >
        <div className="absolute inset-0 bg-brand-gold/20 rounded-full blur-[100px] animate-pulse" />
        <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full bg-brand-dark border-4 border-brand-gold/20 flex items-center justify-center overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-gold/10 to-transparent" />
          <Construction size={64} className="text-brand-gold animate-bounce" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border-2 border-dashed border-brand-gold/10 rounded-full"
          />
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-4 -right-4 p-3 bg-brand-gold rounded-2xl text-brand-dark shadow-xl shadow-brand-gold/20"
        >
          <Sparkles size={24} />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl"
      >
        <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 tracking-tight">
          {title} <span className="text-brand-gold">Coming Soon</span>
        </h2>
        <p className="text-xl text-brand-cream/60 mb-10 leading-relaxed font-light">
          {description} We're working hard to bring you a premium management experience. Stay tuned for updates!
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-brand-gold text-sm font-bold uppercase tracking-widest">
            <Clock size={18} /> Estimated Arrival: Q3 2026
          </div>
          <Link 
            to="/admin/dashboard" 
            className="flex items-center gap-2 px-8 py-3 bg-brand-gold text-brand-dark rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-gold/20"
          >
            Back to Dashboard <ArrowRight size={18} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ComingSoon;
