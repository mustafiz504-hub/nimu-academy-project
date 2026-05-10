import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';

const Hero = () => {
  return (
    <div id="home" className="relative flex items-center justify-center min-h-screen overflow-hidden bg-brand-dark">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=1600"
          alt=""
          className="h-full w-full object-cover"
          decoding="async"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-brand-dark/70 transition-opacity duration-1000"></div>
      </div>
      <div className="container relative mx-auto px-4 z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-brand-cream font-serif font-bold text-5xl md:text-7xl leading-tight mb-6">
            Our <span className="text-brand-gold italic">Baking Academy</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-cream/80 max-w-2xl mx-auto font-light mb-10 leading-relaxed">
            Learn from Odisha's No.1 Cooking School — where passion meets professional training under the expert guidance of Chef Muskan Naz.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link to="/shop">
              <Button size="lg" className="px-12 py-4 text-lg shadow-2xl">
                Order Cakes
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-12 py-4 text-lg border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-dark transition-all"
              onClick={() => {
                const element = document.getElementById('academy');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Explore Our Courses
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
