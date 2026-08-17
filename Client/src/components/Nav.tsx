import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Instagram, LayoutDashboard, ShieldCheck, LogOut, Package, BookOpen, UserCircle, ArrowRight, ChevronRight } from 'lucide-react';
import logo from '../assets/image.png';

import { useGlobal } from '../context/GlobalContext';

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const mobileSidebarRef = useRef<HTMLElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useGlobal();
  const isLoggedIn = Boolean(user);

  const navLinks = useMemo(() => [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Academy', href: '/course/1' },
    { name: 'Learn', href: '/learn' },
    { name: 'Certificate', href: '/certificate' },
    { name: 'About', href: '/about' },
  ], []);

  const isActive = useCallback((path: string) => {
    if (path === '/' && location.pathname === '/' && !location.hash) return true;
    if (path === '/#academy' && location.pathname === '/') return true;
    if (path !== '/' && path !== '/#academy' && location.pathname.startsWith(path)) return true;
    return false;
  }, [location.pathname, location.hash]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    setIsOpen(false);
    navigate('/');
  };

  return (
    <nav className="fixed w-full z-50 bg-brand-dark/95 backdrop-blur-md text-brand-cream border-b border-brand-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="hidden lg:flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-gold/10 overflow-hidden flex items-center justify-center">
               <img src={logo} alt="Nimu Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-wider text-brand-gold">NIMU</span>
            <span className="hidden xl:inline font-sans text-[10px] tracking-widest uppercase text-brand-cream/60 ml-2 border-l border-brand-cream/20 pl-3">
              Odisha's No.1 Cooking Class 
            </span>
          </Link>
          
          <div className="hidden lg:flex items-center space-x-5 xl:space-x-8">
            {navLinks.map(link => (
              <Link 
                key={link.name} 
                to={link.href} 
                className={`text-[13px] xl:text-sm font-medium transition-colors ${isActive(link.href) ? 'text-brand-gold' : 'hover:text-brand-gold'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            <a 
              href="https://www.instagram.com/nimu.cooking/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-brand-gold transition-colors"
            >
              <Instagram size={18} className="lg:w-5 lg:h-5" />
            </a>
            <Link to="/shop" className="hover:text-brand-gold transition-colors">
              <ShoppingCart size={18} className="lg:w-5 lg:h-5" />
            </Link>
            
            {/* User Icon & Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={handleUserClick}
                className="hover:text-brand-gold transition-colors flex items-center gap-1"
              >
                <User size={18} className="lg:w-5 lg:h-5" />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-60 rounded-2xl bg-brand-dark/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl z-[60]"
                  >
                    {isLoggedIn ? (
                      <>
                        <div className="px-5 py-4 border-b border-white/5 bg-white/5">
                          <p className="text-[10px] text-brand-gold uppercase tracking-[0.2em] font-black mb-1">Academy Member</p>
                          <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                        </div>

                        <div className="p-2 space-y-1">
                          <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-brand-cream/80 hover:bg-white/5 hover:text-brand-gold rounded-xl transition-all">
                            <UserCircle size={18} className="text-brand-gold/70" /> My Profile
                          </button>
                          <button onClick={() => navigate('/user/orders')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-brand-cream/80 hover:bg-white/5 hover:text-brand-gold rounded-xl transition-all">
                            <Package size={18} className="text-brand-gold/70" /> My Orders
                          </button>
                          {(user?.role === 'admin' || user?.role === 'superadmin') && (
                            <button onClick={() => navigate('/user/enrollments')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-brand-cream/80 hover:bg-white/5 hover:text-brand-gold rounded-xl transition-all">
                              <BookOpen size={18} className="text-brand-gold/70" /> My Enrollments
                            </button>
                          )}

                          {(user?.role === 'admin' || user?.role === 'superadmin') && (
                            <div className="pt-2 mt-2 border-t border-white/5">
                              <button 
                                onClick={() => navigate('/admin/dashboard')} 
                                className="w-full flex items-center justify-between px-4 py-3 text-sm text-brand-gold font-bold hover:bg-brand-gold/10 rounded-xl transition-all"
                              >
                                <span className="flex items-center gap-3"><LayoutDashboard size={18} /> Admin Panel</span>
                                <ArrowRight size={14} />
                              </button>
                            </div>
                          )}

                          <div className="h-px bg-white/5 my-2 mx-2" />
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                            <LogOut size={18} /> Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-3 space-y-2">
                        <div className="px-3 py-2">
                          <p className="text-[10px] text-brand-gold uppercase tracking-widest font-black mb-1">Welcome</p>
                          <p className="text-xs text-brand-cream/40 leading-relaxed font-medium">Join the academy to start your baking journey.</p>
                        </div>
                        <button 
                          onClick={() => { setIsDropdownOpen(false); navigate('/auth'); }}
                          className="w-full py-4 rounded-xl bg-brand-gold text-brand-dark font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          Sign In
                        </button>
                        <button 
                          onClick={() => { setIsDropdownOpen(false); navigate('/auth'); }}
                          className="w-full py-4 rounded-xl border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
                        >
                          Create Account
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                if (location.pathname === '/') {
                  const element = document.getElementById('academy');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                } else {
                  navigate('/', { state: { scrollTo: 'academy' } });
                }
              }}
              className="bg-brand-gold text-brand-dark px-5 py-2 rounded-full text-sm font-bold hover:bg-brand-gold-muted transition-all shadow-lg shadow-brand-gold/10 active:scale-95"
            >
              Book a Class
            </button>
          </div>

          <div className="lg:hidden flex w-full items-center justify-between">
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
          <div className="lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-[2px]"
              aria-label="Close menu backdrop"
            >
              <motion.aside
                ref={mobileSidebarRef}
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.15, ease: 'easeInOut' }}
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
                    {isLoggedIn ? (
                      <>
                        <div className="mb-4 px-3">
                          <p className="text-xs uppercase tracking-widest text-brand-cream/45 font-bold">Account</p>
                          <p className="mt-1 truncate text-sm font-semibold text-brand-gold">{user?.name}</p>
                        </div>
                        <div className="space-y-2">
                          <button onClick={() => { setIsOpen(false); navigate('/profile'); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-base font-semibold hover:bg-white/5 hover:text-brand-gold transition-colors">
                            <UserCircle size={20} /> My Profile
                          </button>
                          <button onClick={() => { setIsOpen(false); navigate('/user/orders'); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-base font-semibold hover:bg-white/5 hover:text-brand-gold transition-colors">
                            <Package size={20} /> My Orders
                          </button>
                          {(user?.role === 'admin' || user?.role === 'superadmin') && (
                            <button onClick={() => { setIsOpen(false); navigate('/user/enrollments'); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-base font-semibold hover:bg-white/5 hover:text-brand-gold transition-colors">
                              <BookOpen size={20} /> My Enrollments
                            </button>
                          )}
                          {(user?.role === 'admin' || user?.role === 'superadmin') && (
                            <button onClick={() => { setIsOpen(false); navigate('/admin/dashboard'); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-base font-bold text-brand-gold hover:bg-brand-gold/10 transition-colors">
                              <LayoutDashboard size={20} /> Admin Panel
                            </button>
                          )}
                          {user?.role === 'superadmin' && (
                            <button onClick={() => { setIsOpen(false); navigate('/superadmin/dashboard'); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-base font-bold text-[#a855f7] hover:bg-purple-500/10 transition-colors">
                              <ShieldCheck size={20} /> Super Admin Panel
                            </button>
                          )}
                          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-base font-semibold text-red-400 hover:bg-red-500/10 transition-colors">
                            <LogOut size={20} /> Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3 px-1">
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/auth');
                          }}
                          className="flex w-full items-center justify-between rounded-xl bg-brand-gold px-4 py-2.5 text-xs font-black uppercase tracking-widest text-brand-dark shadow-lg shadow-brand-gold/20 transition-all active:scale-[0.98] hover:bg-brand-gold/90"
                        >
                          <span className="flex items-center gap-2">
                            <User size={16} className="stroke-[2.5px]" /> 
                            Sign In
                          </span>
                          <ChevronRight size={16} />
                        </button>
                        
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/auth');
                          }}
                          className="flex w-full items-center justify-center rounded-xl border border-brand-gold/30 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-brand-gold hover:bg-brand-gold/10 transition-all"
                        >
                          Create Account
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-brand-gold/15 p-5">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsOpen(false);
                      if (location.pathname === '/') {
                        const element = document.getElementById('academy');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      } else {
                        navigate('/', { state: { scrollTo: 'academy' } });
                      }
                    }}
                    className="w-full rounded-lg bg-brand-gold py-4 font-bold text-brand-dark hover:bg-brand-gold-muted transition-colors"
                  >
                    Book a Class
                  </button>
                </div>
              </motion.aside>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Nav;
