import React, { useState } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './ui/Button';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const AcademyIntro = () => {
  const [currentImage, setCurrentImage] = useState(0);

  const stats = [
    { label: "Students Trained", value: "500+" },
    { label: "Years Experience", value: "5+" },
    { label: "Industry Recognized", value: "Certificate" },
    { label: "Batch Size", value: "Max 15" }
  ];

  const features = [
    "AC Equipped Kitchen",
    "Online + Offline Classes Available",
    "Personal attention from Chef Muskan Naz",
    "Industry Recognized Certificate",
    "Lifetime Community Access"
  ];

  const images = [
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1605807646983-377bc5a76493?auto=format&fit=crop&q=80&w=1200"
  ];

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section id="about-academy" className="py-16 md:py-24 bg-brand-dark text-brand-cream relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full text-brand-gold" fill="currentColor">
          <path d="M50 0 L100 50 L50 100 L0 50 Z" />
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-brand-gold font-serif text-sm uppercase tracking-widest mb-4">About Our Academy</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-brand-cream mb-8 leading-tight">
              Nimu Cooking Academy, Rourkela
            </h3>
            <p className="text-lg text-brand-cream/80 mb-10 font-light leading-relaxed">
              Nimu Cooking Academy is located in Rourkela, where Chef Muskan Naz personally trains students in professional baking. From beginner to advanced, all courses are available with hands-on guidance.
            </p>
            
            <div className="space-y-4 mb-10">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
                    <CheckCircle size={14} />
                  </div>
                  <span className="text-brand-cream/90 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <Link to="/course/basic-baking">
              <Button size="lg" className="px-10">
                Join Now
              </Button>
            </Link>
          </div>
          
          <div className="relative group">
             <div className="absolute -inset-4 border-2 border-brand-gold/20 rounded-3xl transform -rotate-3 transition-transform group-hover:rotate-0 duration-700"></div>
             <div className="relative rounded-3xl shadow-2xl overflow-hidden h-[450px] md:h-[550px] w-full bg-brand-light/5">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={currentImage}
                    src={images[currentImage]} 
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    alt={`Academy Gallery ${currentImage + 1}`} 
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 z-20">
                  <button 
                    onClick={prevImage}
                    className="w-12 h-12 rounded-full bg-brand-dark/40 backdrop-blur-md text-brand-gold border border-brand-gold/20 flex items-center justify-center hover:bg-brand-gold hover:text-brand-dark transition-all transform hover:scale-110"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="w-12 h-12 rounded-full bg-brand-dark/40 backdrop-blur-md text-brand-gold border border-brand-gold/20 flex items-center justify-center hover:bg-brand-gold hover:text-brand-dark transition-all transform hover:scale-110"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>

                {/* Progress Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                   {images.map((_, i) => (
                     <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImage ? 'w-8 bg-brand-gold' : 'w-2 bg-brand-cream/30'}`}
                     />
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-brand-gold/5 border border-brand-gold/10 p-8 rounded-2xl text-center hover:bg-brand-gold/10 transition-colors group">
              <div className="text-3xl font-serif text-brand-gold font-bold mb-2 group-hover:scale-110 transition-transform">{stat.value}</div>
              <div className="text-xs text-brand-cream/60 uppercase tracking-widest font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AcademyIntro;
