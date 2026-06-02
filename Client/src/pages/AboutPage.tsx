import React from 'react';
import { motion } from 'motion/react';
import { Target, Award, Users, Heart } from 'lucide-react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SectionHeading from '../components/ui/SectionHeading';

const AboutPage = () => {
  const values = [
    { icon: <Target size={24} />, title: "Our Mission", desc: "Har student ko itna skilled banana ki woh apna khud ka baking business shuru kar sake." },
    { icon: <Award size={24} />, title: "Excellence", desc: "Professional techniques and premium ingredients for the perfect result." },
    { icon: <Users size={24} />, title: "Community", desc: "Lifetime access to our baking community for ongoing support." },
  ];

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      <Nav />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading 
            title="Our Story" 
            subtitle="The Journey of Nimu Cooking Academy"
          />

          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-3xl font-serif text-brand-dark mb-6 leading-tight">
                Chef Muskan Naz ke ek simple sapne se hui shuruaat.
              </h3>
              <p className="text-lg text-brand-brown leading-relaxed font-light mb-8">
                Nimu Cooking Academy, Rourkela (Odisha) ka No.1 cooking school hai. Hamara maksad sirf baking sikhana nahi, balki students ko independent banana hai. 
                Aaj 200+ students hamare saath jud kar apna career bana chuke hain.
              </p>
              
              <div className="space-y-6">
                {values.map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-brand-gold/10 shadow-sm">
                    <div className="text-brand-gold shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="font-serif font-bold text-brand-dark">{item.title}</h4>
                      <p className="text-sm text-brand-brown">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-4 border-2 border-brand-gold/20 rounded-[3rem] transform rotate-3"></div>
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl aspect-[4/5]">
                <img 
                  src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200" 
                  alt="Chef Muskan Naz" 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-brand-dark to-transparent text-white">
                   <h4 className="text-2xl font-serif font-bold text-brand-gold">Muskan Naz</h4>
                   <p className="text-sm opacity-80 uppercase tracking-widest font-bold">Founder & Head Chef</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
