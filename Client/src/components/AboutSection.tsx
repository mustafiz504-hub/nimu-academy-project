import React from 'react';
import { motion } from 'motion/react';
import { Phone, MapPin, Instagram, CheckCircle2, Heart, Target } from 'lucide-react';
import SectionHeading from './ui/SectionHeading';
import Button from './ui/Button';

const AboutSection = () => {
  const stats = [
    { label: "Students Trained", value: "200+" },
    { label: "Years Experience", value: "5+" },
    { label: "Recipes Taught", value: "100+" },
    { label: "Success Stories", value: "50+" }
  ];

  return (
    <section id="about" className="py-16 md:py-24 bg-brand-cream relative overflow-hidden">
      <div className="container mx-auto px-4">
        <SectionHeading 
          title="About Nimu Cooking Academy" 
          subtitle="Our Story, Our Mission"
        />

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-serif text-brand-dark mb-6 leading-tight">Nimu Cooking Academy ki shuruaat Chef Muskan Naz ke ek simple sapne se hui — har ghar mein ek skilled baker ho.</h3>
            <p className="text-lg text-brand-brown leading-relaxed font-light mb-8">
              Rourkela, Odisha mein shuru hue is academy ne aaj 200+ students ko professionally trained kiya hai. Hamara focus sirf baking sikhana nahi, balki students ko itna confident banana hai ki woh apni khud ki pehchaan bana sakein.
            </p>
            
            <div className="bg-brand-dark text-brand-cream p-8 rounded-3xl relative overflow-hidden group mb-8">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Target size={120} />
               </div>
               <h4 className="text-brand-gold font-serif text-xl mb-4 flex items-center gap-2">
                 <Target size={24} /> Our Mission
               </h4>
               <p className="text-lg italic font-light leading-relaxed relative z-10">
                 "Har student ko itna skilled banana ki woh apna khud ka baking business shuru kar sake."
                 <span className="block mt-4 text-brand-gold font-bold not-italic">— Muskan Naz, Founder</span>
               </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-brand-gold/10"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
              <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                 <img src="https://images.unsplash.com/photo-1577214224216-754688737563?auto=format&fit=crop&q=80&w=400" alt="Muskan Naz" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-2xl font-serif text-brand-dark font-bold">Muskan Naz</h4>
                <p className="text-brand-gold font-bold text-sm uppercase tracking-widest">Professional Chef & Founder</p>
                <div className="flex items-center gap-2 text-brand-brown mt-2">
                   <Phone size={14} className="text-brand-gold" />
                   <span className="font-semibold text-sm">9777240070</span>
                </div>
              </div>
            </div>
            <p className="text-brand-brown leading-relaxed mb-8">
              Chef Muskan Naz has 5+ years of professional baking and teaching experience. Her mission is to make every student skilled enough to start their own baking business.
            </p>
            <div className="grid grid-cols-2 gap-4">
               {stats.map((stat, i) => (
                 <div key={i} className="p-4 bg-brand-light rounded-2xl border border-brand-gold/5">
                    <div className="text-2xl font-serif text-brand-dark font-bold">{stat.value}</div>
                    <div className="text-[10px] text-brand-gold uppercase tracking-widest font-bold">{stat.label}</div>
                 </div>
               ))}
            </div>
          </motion.div>
        </div>

        {/* Contact Section */}
        <div id="contact" className="bg-brand-dark rounded-[3rem] overflow-hidden">
          <div className="grid md:grid-cols-2">
             <div className="p-8 md:p-16 space-y-10">
                <div>
                   <h3 className="text-4xl font-serif text-brand-gold font-bold mb-4">Get In Touch</h3>
                   <p className="text-brand-cream/60">We are open for admissions. Visit us or call to book your slot.</p>
                </div>
                
                <div className="space-y-6">
                   <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0">
                         <MapPin size={24} />
                      </div>
                      <div>
                         <p className="text-brand-gold font-bold text-xs uppercase tracking-widest mb-1">Visit Us</p>
                         <p className="text-brand-cream/90 font-medium">Jhirpani, Rourkela 769042, Odisha</p>
                      </div>
                   </div>
                   
                   <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0">
                         <Phone size={24} />
                      </div>
                      <div>
                         <p className="text-brand-gold font-bold text-xs uppercase tracking-widest mb-1">Call Us</p>
                         <p className="text-brand-cream/90 font-medium text-lg leading-none">9777240070</p>
                         <p className="text-brand-cream/60 text-sm mt-2">Alternate: 8249517832</p>
                      </div>
                   </div>

                   <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0">
                         <Instagram size={24} />
                      </div>
                      <div>
                         <p className="text-brand-gold font-bold text-xs uppercase tracking-widest mb-1">Instagram</p>
                         <a href="https://www.instagram.com/nimu.cooking/" target="_blank" rel="noopener noreferrer" className="text-brand-cream/90 font-medium hover:text-brand-gold transition-colors">@nimu.cooking</a>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="bg-brand-gold/5 p-8 md:p-16 flex flex-col justify-center items-center text-center space-y-8 border-l border-brand-gold/10">
                <div className="w-24 h-24 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold mb-4 animate-pulse">
                   <CheckCircle2 size={48} />
                </div>
                <div>
                   <h4 className="text-3xl font-serif text-brand-gold font-bold mb-2">Admissions Open Now</h4>
                   <p className="text-brand-cream/70 max-w-xs mx-auto">Limited slots available for the upcoming batches. Don't wait to start your journey!</p>
                </div>
                <a href="#academy">
                   <Button size="lg" className="px-12">Book a Class</Button>
                </a>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
