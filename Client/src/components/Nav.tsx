import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Instagram } from 'lucide-react';
import logo from '../assets/image.png';
import AuthModal from './AuthModal';

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Academy', href: '/course/basic-baking' },
    { name: 'About', href: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed w-full z-50 bg-brand-dark/95 backdrop-blur-md text-brand-cream border-b border-brand-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-gold/10 overflow-hidden flex items-center justify-center">
               <img src={logo} alt="Nimu Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-wider text-brand-gold">NIMU</span>
            <span className="hidden lg:inline font-sans text-[10px] tracking-widest uppercase text-brand-cream/60 ml-2 border-l border-brand-cream/20 pl-3">
              Odisha's No.1 Cooking Class – Learn • Cook • Grow
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link 
                key={link.name} 
                to={link.href} 
                className={`text-sm font-medium transition-colors ${isActive(link.href) ? 'text-brand-gold' : 'hover:text-brand-gold'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <a 
              href="https://www.instagram.com/nimu.cooking/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-brand-gold transition-colors"
            >
              <Instagram size={20} />
            </a>
            <Link to="/shop" className="hover:text-brand-gold transition-colors"><ShoppingCart size={20} /></Link>
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="hover:text-brand-gold transition-colors"
            >
              <User size={20} />
            </button>
            <a href="/#academy">
              <button className="bg-brand-gold text-brand-dark px-5 py-2 rounded-full text-sm font-semibold hover:bg-brand-gold-muted transition-colors">
                Book a Class
              </button>
            </a>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <a 
              href="https://www.instagram.com/nimu.cooking/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-brand-cream hover:text-brand-gold"
            >
              <Instagram size={20} />
            </a>
            <Link to="/shop" className="text-brand-cream hover:text-brand-gold"><ShoppingCart size={20} /></Link>
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="text-brand-cream hover:text-brand-gold"
            >
              <User size={20} />
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-brand-cream hover:text-brand-gold transition-transform active:scale-95">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div 
        initial={false}
        animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        className="md:hidden bg-brand-dark border-t border-brand-gold/20 overflow-hidden"
      >
        <div className="px-4 py-6 space-y-4">
          {navLinks.map(link => (
            <Link 
              key={link.name}
              to={link.href} 
              onClick={() => setIsOpen(false)}
              className={`block text-lg font-medium transition-colors ${isActive(link.href) ? 'text-brand-gold' : 'hover:text-brand-gold'}`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-brand-gold/10 flex flex-col gap-4">
            <button 
              onClick={() => {
                setIsOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-3 text-lg font-medium hover:text-brand-gold transition-colors"
            >
              <User size={20} /> Profile
            </button>
            <a href="/#academy" onClick={() => setIsOpen(false)} className="w-full">
              <button className="w-full bg-brand-gold text-brand-dark py-4 rounded-xl font-bold text-lg hover:bg-brand-gold-muted transition-colors">
                Book a Class
              </button>
            </a>
          </div>
        </div>
      </motion.div>

      {/* Optimized Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </nav>
  );
};

export default Nav;
