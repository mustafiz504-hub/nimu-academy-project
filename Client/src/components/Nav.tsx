import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Instagram, LayoutDashboard, ShieldCheck, LogOut, Package, BookOpen, UserCircle } from 'lucide-react';
import logo from '../assets/image.png';
import AuthModal from './AuthModal';

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const mobileSidebarRef = useRef<HTMLElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Mock User for testing (change role to "user", "admin", or "superadmin")
  const mockUser = {
    name: "Muskan Naz",
    role: "superadmin",
    isLoggedIn: true
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Academy', href: '/course/1' },
    { name: 'About', href: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsDropdownOpen(false);
    if (isDropdownOpen) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleOutsideClick = (event: PointerEvent) => {
      if (!isOpen) return;
      const target = event.target as Node;
      if (mobileSidebarRef.current && !mobileSidebarRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mockUser.isLoggedIn) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-brand-dark/95 backdrop-blur-md text-brand-cream border-b border-brand-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="hidden md:flex items-center gap-3">
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
            
            {/* User Icon & Dropdown */}
            <div className="relative">
              <button 
                onClick={handleUserClick}
                className="hover:text-brand-gold transition-colors flex items-center gap-1"
              >
                <User size={20} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-56 rounded-2xl bg-brand-dark border border-brand-gold/20 shadow-2xl overflow-hidden py-2 z-[60]"
                  >
                    <div className="px-4 py-2 border-b border-white/5 mb-2">
                      <p className="text-xs text-brand-cream/40 uppercase tracking-widest font-bold">Account</p>
                      <p className="text-sm font-semibold text-brand-gold truncate">{mockUser.name}</p>
                    </div>

                    <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors">
                      <UserCircle size={18} className="text-brand-gold/70" /> My Profile
                    </button>
                    <button onClick={() => navigate('/user/orders')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors">
                      <Package size={18} className="text-brand-gold/70" /> My Orders
                    </button>
                    <button onClick={() => navigate('/user/enrollments')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors">
                      <BookOpen size={18} className="text-brand-gold/70" /> My Enrollments
                    </button>

                    {/* Admin Panel (Admin or Superadmin) */}
                    {(mockUser.role === 'admin' || mockUser.role === 'superadmin') && (
                      <>
                        <div className="h-px bg-white/10 my-1 mx-2" />
                        <button 
                          onClick={() => navigate('/admin/dashboard')} 
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-brand-gold font-bold hover:bg-brand-gold/10 transition-colors"
                        >
                          <LayoutDashboard size={18} /> Admin Panel
                        </button>
                      </>
                    )}

                    {/* Super Admin Panel */}
                    {mockUser.role === 'superadmin' && (
                      <button 
                        onClick={() => navigate('/superadmin/dashboard')} 
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#a855f7] font-bold hover:bg-purple-500/10 transition-colors"
                      >
                        <ShieldCheck size={18} /> Super Admin Panel
                      </button>
                    )}

                    <div className="h-px bg-white/10 my-1 mx-2" />
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      <LogOut size={18} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href="/#academy">
              <button className="bg-brand-gold text-brand-dark px-5 py-2 rounded-full text-sm font-semibold hover:bg-brand-gold-muted transition-colors">
                Book a Class
              </button>
            </a>
          </div>

          <div className="md:hidden flex w-full items-center justify-between">
            <div className="flex flex-1 items-center justify-start">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-brand-cream hover:text-brand-gold transition-transform active:scale-95"
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isOpen}
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
            <Link to="/" className="flex flex-1 items-center justify-center gap-2 font-serif text-2xl font-bold tracking-wider text-brand-gold">
              <span className="h-8 w-8 overflow-hidden rounded-full bg-brand-gold/10">
                <img src={logo} alt="Nimu Logo" className="h-full w-full object-cover" />
              </span>
              <span>
                NIMU
              </span>
            </Link>
            <div className="flex flex-1 items-center justify-end gap-4">
              <a 
                href="https://www.instagram.com/nimu.cooking/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-brand-cream hover:text-brand-gold"
              >
                <Instagram size={20} />
              </a>
              <Link to="/shop" className="text-brand-cream hover:text-brand-gold"><ShoppingCart size={20} /></Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <div className="md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
              aria-label="Close menu backdrop"
            >
              <motion.aside
                ref={mobileSidebarRef}
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                onClick={(e) => e.stopPropagation()}
                className="fixed left-0 top-0 z-[60] flex h-dvh w-[56vw] max-w-[240px] flex-col border-r border-brand-gold/25 bg-brand-dark text-brand-cream shadow-2xl"
              >
                <div className="flex h-20 items-center justify-end border-b border-brand-gold/15 px-5">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl bg-white/5 p-2 text-brand-gold hover:bg-white/10 transition-colors"
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-6">
                  <div className="space-y-2">
                    {navLinks.map(link => (
                      <Link
                        key={link.name}
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`block rounded-lg px-3 py-3 text-base font-semibold transition-colors ${isActive(link.href) ? 'bg-brand-gold/10 text-brand-gold' : 'hover:bg-white/5 hover:text-brand-gold'}`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-6 border-t border-brand-gold/15 pt-6">
                    {mockUser.isLoggedIn ? (
                      <>
                        <div className="mb-4 px-3">
                          <p className="text-xs uppercase tracking-widest text-brand-cream/45 font-bold">Account</p>
                          <p className="mt-1 truncate text-sm font-semibold text-brand-gold">{mockUser.name}</p>
                        </div>
                        <div className="space-y-2">
                          <button onClick={() => { setIsOpen(false); navigate('/profile'); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-base font-semibold hover:bg-white/5 hover:text-brand-gold transition-colors">
                            <UserCircle size={20} /> My Profile
                          </button>
                          <button onClick={() => { setIsOpen(false); navigate('/user/orders'); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-base font-semibold hover:bg-white/5 hover:text-brand-gold transition-colors">
                            <Package size={20} /> My Orders
                          </button>
                          <button onClick={() => { setIsOpen(false); navigate('/user/enrollments'); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-base font-semibold hover:bg-white/5 hover:text-brand-gold transition-colors">
                            <BookOpen size={20} /> My Enrollments
                          </button>
                          {(mockUser.role === 'admin' || mockUser.role === 'superadmin') && (
                            <button onClick={() => { setIsOpen(false); navigate('/admin/dashboard'); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-base font-bold text-brand-gold hover:bg-brand-gold/10 transition-colors">
                              <LayoutDashboard size={20} /> Admin Panel
                            </button>
                          )}
                          {mockUser.role === 'superadmin' && (
                            <button onClick={() => { setIsOpen(false); navigate('/superadmin/dashboard'); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-base font-bold text-[#a855f7] hover:bg-purple-500/10 transition-colors">
                              <ShieldCheck size={20} /> Super Admin Panel
                            </button>
                          )}
                          <button onClick={() => setIsOpen(false)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-base font-semibold text-red-400 hover:bg-red-500/10 transition-colors">
                            <LogOut size={20} /> Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          setIsAuthModalOpen(true);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-base font-semibold hover:bg-white/5 hover:text-brand-gold transition-colors"
                      >
                        <User size={20} /> Login / Sign Up
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t border-brand-gold/15 p-5">
                  <a href="/#academy" onClick={() => setIsOpen(false)} className="block w-full">
                    <button className="w-full rounded-lg bg-brand-gold py-4 font-bold text-brand-dark hover:bg-brand-gold-muted transition-colors">
                      Book a Class
                    </button>
                  </a>
                </div>
              </motion.aside>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Optimized Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </nav>
  );
};

export default Nav;
