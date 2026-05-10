import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Button from './ui/Button';
import SectionHeading from './ui/SectionHeading';
import weddingCakeImg from '../assets/_sweetpeeps_14050219_171053089.jpg.jpeg';

const BakeryServices = () => {
  const categories = [
    { name: 'Birthday Cakes', image: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&q=80&w=600' },
    { name: 'Wedding Cakes', image: weddingCakeImg },
    { name: 'Cupcakes', image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=600' },
    { name: 'Pastries', image: 'https://images.unsplash.com/photo-1549590143-d5855148a9d5?auto=format&fit=crop&q=80&w=600' },
  ];

  return (
    <section id="shop" className="py-12 md:py-24 bg-brand-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Our Bakery Services" subtitle="Handcrafted with love, using only the finest ingredients." />
        <div className="relative group">
          <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:overflow-x-visible md:snap-none md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pb-6 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 scrollbar-hide">
            {categories.map((cat, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                key={cat.name}
                className="min-w-[260px] w-[70vw] md:w-auto md:min-w-0 snap-center shrink-0 group/card cursor-pointer"
              >
                <Link to="/shop">
                  <div className="relative overflow-hidden rounded-3xl aspect-[4/5] max-h-[400px] md:max-h-none mb-4 shadow-lg">
                    <div className="absolute inset-0 bg-brand-dark/20 group-hover/card:bg-brand-dark/40 transition-colors z-10"></div>
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <h3 className="text-xl md:text-2xl font-serif text-white mb-1 drop-shadow-md">{cat.name}</h3>
                      <div className="text-brand-gold font-medium uppercase text-[10px] md:text-sm tracking-widest flex items-center group-hover/card:translate-x-1 transition-all duration-500">
                        Explore <ChevronRight size={14} className="ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="mt-8 md:mt-16 text-center">
          <Link to="/shop">
            <Button variant="outline" className="border-brand-gold text-brand-dark hover:bg-brand-gold">View All Products</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BakeryServices;
