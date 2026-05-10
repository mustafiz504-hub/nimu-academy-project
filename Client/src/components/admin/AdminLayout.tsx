import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigate } from 'react-router-dom';
import { useGlobal } from '../../context/GlobalContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, authLoading } = useGlobal();

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isSidebarOpen]);

  if (authLoading) {
    return <div className="min-h-screen bg-[#0a0a0a] p-8 text-brand-gold">Loading admin session...</div>;
  }

  if (!user || !['admin', 'superadmin'].includes(user.role)) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-brand-cream font-sans selection:bg-brand-gold selection:text-brand-dark">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-brand-dark/95 backdrop-blur-md border-b border-white/10 z-[60] flex items-center justify-center px-6">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute left-5 p-2 text-brand-gold hover:text-brand-gold-muted transition-opacity duration-300 active:scale-95 ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          aria-label="Open admin menu"
          aria-expanded={isSidebarOpen}
        >
          <Menu size={22} />
        </button>
        <div className="font-serif text-xl font-bold tracking-wider text-brand-gold">NIMU</div>
        <div className="absolute right-6 text-[10px] uppercase font-sans tracking-widest text-brand-cream/40">Admin</div>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[70] lg:hidden"
          />
        )}
      </AnimatePresence>

      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-grow p-4 md:p-8 pt-20 lg:pt-8 overflow-x-hidden overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
