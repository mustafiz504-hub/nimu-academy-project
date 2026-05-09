import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, UtensilsCrossed } from 'lucide-react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      <Nav />
      
      <main className="flex-grow flex items-center justify-center pt-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="text-[12rem] font-serif font-bold text-brand-gold/10 leading-none select-none">
                  404
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-24 h-24 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold animate-bounce">
                      <UtensilsCrossed size={48} />
                   </div>
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-6">
              Oops! Page Not Found
            </h1>
            <p className="text-lg text-brand-brown mb-10 max-w-md mx-auto leading-relaxed">
              It seems the page you are looking for has been moved or doesn't exist. Maybe it went into the oven for too long?
            </p>
            
            <Link to="/">
              <Button size="lg" className="px-10 flex items-center gap-2 mx-auto shadow-xl hover:shadow-2xl transition-all">
                <Home size={20} /> Back to Home
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
