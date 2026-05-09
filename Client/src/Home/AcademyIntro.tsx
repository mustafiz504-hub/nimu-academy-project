import React from 'react';
import { CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const AcademyIntro = () => {
  return (
    <section id="academy" className="py-24 bg-brand-dark text-brand-cream relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full text-brand-gold" fill="currentColor">
          <path d="M50 0 L100 50 L50 100 L0 50 Z" />
        </svg>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif text-brand-gold mb-6 leading-tight">
              Learn Baking From Professional Chefs
            </h2>
            <p className="text-lg text-brand-cream/80 mb-8 font-light leading-relaxed">
              Hands-on baking courses designed for hobby bakers, home bakers, and aspiring professionals. Turn your passion into a profession with Nimu Cooking Academy.
            </p>
            <ul className="space-y-4 mb-8">
              {['Professional Chef Trainers', 'Small Batch Size for Personal Attention', 'Fully Equipped AC Kitchen', 'Lifetime Community Access'].map((item, i) => (
                <li key={i} className="flex items-center text-brand-cream/90">
                  <CheckCircle className="text-brand-gold mr-3" size={20} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button size="lg">
              Explore Our Courses
            </Button>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 border-2 border-brand-gold/30 rounded-2xl transform rotate-3"></div>
            <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000" alt="Baking Class" className="relative rounded-2xl shadow-2xl object-cover h-[500px] w-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AcademyIntro;
