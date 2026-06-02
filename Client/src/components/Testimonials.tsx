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

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto h-full">
          <div className="bg-brand-cream/5 p-6 rounded-2xl border border-brand-gold/20 relative flex flex-col h-full">
            <div className="text-brand-gold flex mb-4">
              {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="currentColor" />)}
            </div>
            <p className="text-base italic mb-6 leading-relaxed flex-grow text-brand-cream/90 font-light">
              "The online classes were easy to follow and very professional. The recorded sessions helped me practice at my own pace."
            </p>
            <div className="flex items-center mt-auto">
              <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold font-bold text-xl mr-4">M</div>
              <div>
                <h4 className="font-medium text-brand-gold">Manisha Ekka</h4>
                <p className="text-sm text-brand-cream/60">Professional Baking</p>
              </div>
            </div>
          </div>

          <div className="bg-brand-cream/5 p-6 rounded-2xl border border-brand-gold/20 relative flex flex-col h-full">
            <div className="text-brand-gold flex mb-4">
               {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="currentColor" />)}
            </div>
            <p className="text-base italic mb-6 leading-relaxed flex-grow text-brand-cream/90 font-light">
              "Nimu Cooking Academy completely transformed my baking journey. The Professional Baking course was so detailed, and their continuous support helped me master complex recipes with ease!"
            </p>
             <div className="flex items-center mt-auto">
              <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold font-bold text-xl mr-4">U</div>
              <div>
                <h4 className="font-medium text-brand-gold">Urmila Sahoo</h4>
                <p className="text-sm text-brand-cream/60">Professional Baking</p>
              </div>
            </div>
          </div>

          <div className="bg-brand-cream/5 p-6 rounded-2xl border border-brand-gold/20 relative flex flex-col h-full">
            <div className="text-brand-gold flex mb-4">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} fill="currentColor" />)}
            </div>
            <p className="text-base italic mb-6 leading-relaxed flex-grow text-brand-cream/90 font-light">
              "The classes are incredibly hands-on. The chefs give personal attention, and I've learned techniques I never thought I could master!"
            </p>
            <div className="flex items-center mt-auto">
              <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold font-bold text-xl mr-4">A</div>
              <div>
                <h4 className="font-medium text-brand-gold">Anjali Sharma</h4>
                <p className="text-sm text-brand-cream/60">Professional Baking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
