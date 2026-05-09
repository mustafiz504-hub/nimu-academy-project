import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const Hero = () => {
  return (
    <div id="home" className="relative pt-20 pb-32 flex content-center items-center justify-center min-h-screen">
      <div className="absolute top-0 w-full h-full bg-center bg-cover"
           style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=2000')" }}>
        <span id="blackOverlay" className="w-full h-full absolute opacity-70 bg-brand-dark"></span>
      </div>
      <div className="container relative mx-auto px-4 z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-brand-cream font-serif font-bold text-5xl md:text-7xl leading-tight mb-6">
            Freshly Baked Delights & <br/> <span className="text-brand-gold">Professional Baking Classes</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-brand-cream/80 max-w-2xl mx-auto font-light mb-10">
            Order premium cakes, pastries & desserts or join our expert-led baking courses online and offline at the renowned Nimu Cooking Academy, Rourkela.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/shop">
              <Button size="lg" className="px-8">
                Order Cakes
              </Button>
            </Link>
            <a href="/#academy">
              <Button variant="outline" size="lg" className="px-8">
                Join Baking Classes
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
