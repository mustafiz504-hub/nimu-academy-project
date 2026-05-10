import React from 'react';
import { Star } from 'lucide-react';

const Testimonials = () => {
  return (
    <section className="py-24 bg-brand-dark text-brand-cream pt-24 pb-32">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-brand-gold mb-4">Student Success Stories</h2>
          <div className="w-24 h-1 bg-brand-gold mx-auto mb-6"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-brand-cream/5 p-8 rounded-2xl border border-brand-gold/20 relative">
            <div className="text-brand-gold flex mb-4">
              {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="currentColor" />)}
            </div>
            <p className="text-lg italic mb-6 leading-relaxed">
              "The online classes were easy to follow and very professional. The recorded sessions helped me practice at my own pace."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold font-bold text-xl mr-4">S</div>
              <div>
                <h4 className="font-semibold text-brand-gold">Sneha Kapoor</h4>
                <p className="text-sm text-brand-cream/60">Online Program Graduate</p>
              </div>
            </div>
          </div>

          <div className="bg-brand-cream/5 p-8 rounded-2xl border border-brand-gold/20 relative">
            <div className="text-brand-gold flex mb-4">
               {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="currentColor" />)}
            </div>
            <p className="text-lg italic mb-6 leading-relaxed">
              "I started my own home baking business immediately after completing the 6-week advanced decoration masterclass! Highly recommended."
            </p>
             <div className="flex items-center">
              <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold font-bold text-xl mr-4">R</div>
              <div>
                <h4 className="font-semibold text-brand-gold">Rina Sharma</h4>
                <p className="text-sm text-brand-cream/60">Advanced Course Graduate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
