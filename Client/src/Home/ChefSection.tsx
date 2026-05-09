import React from 'react';
import { motion } from 'motion/react';
import { Instagram, Star, Award, Heart } from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';

const ChefSection = () => {
  return (
    <section id="chef" className="py-16 md:py-24 bg-brand-cream relative overflow-hidden">
      <div className="container mx-auto px-4">
        <SectionHeading 
          title="Meet Your Head Chef" 
          subtitle="Guided by passion, driven by excellence."
        />
        
        <div className="max-w-6xl mx-auto">
          <div className="bg-brand-dark rounded-[3rem] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl -mr-48 -mt-48" />
            
            <div className="grid md:grid-cols-2 items-center">
              <div className="h-[400px] md:h-[600px] relative">
                <img 
                  src="https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=1000" 
                  alt="Chef Muskan Naz" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-dark/20" />
              </div>
              
              <div className="p-8 md:p-16 space-y-8 relative z-10">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="inline-block px-4 py-1 bg-brand-gold/20 text-brand-gold rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                    Head Chef & Founder
                  </span>
                  <h3 className="text-4xl md:text-5xl font-serif text-brand-gold font-bold mb-6">Muskan Naz</h3>
                  <p className="text-brand-cream/80 text-lg leading-relaxed font-light mb-8 italic">
                    "Chef Muskan Naz is a professional baker with 5+ years of teaching experience. She has trained 500+ students and is the founder of Odisha's No.1 Cooking Class — Nimu Cooking Academy, Rourkela."
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-brand-cream/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                        <Star size={20} />
                      </div>
                      <span className="text-brand-cream font-medium">500+ Students</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                        <Award size={20} />
                      </div>
                      <span className="text-brand-cream font-medium">5+ Yrs Exp.</span>
                    </div>
                  </div>
                  
                  <div className="pt-10 flex items-center gap-6">
                    <a 
                      href="https://www.instagram.com/nimu.cooking/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-brand-gold hover:text-brand-gold-muted transition-colors font-bold uppercase tracking-widest text-sm"
                    >
                      <Instagram size={20} /> Follow on Instagram
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChefSection;
