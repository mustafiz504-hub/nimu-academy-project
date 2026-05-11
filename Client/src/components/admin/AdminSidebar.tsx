import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  BookOpen, 
  Package, 
  LogOut,
  ChevronRight,
  Home,
  X,
  GraduationCap,
  ShieldCheck,
  Users
} from 'lucide-react';
import { useGlobal } from '../../context/GlobalContext';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useGlobal();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    // Only show Superadmin Dashboard & Admin Management to superadmins
    ...(user?.role === 'superadmin' ? [
      { name: 'Super Dashboard', icon: ShieldCheck, path: '/superadmin/dashboard' },
      { name: 'Manage Admins', icon: Users, path: '/admin/users' }
    ] : []),
    { name: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
    { name: 'Enrollments', icon: GraduationCap, path: '/admin/enrollments' },
    { name: 'Products', icon: Package, path: '/admin/products' },
    { name: 'Courses', icon: BookOpen, path: '/admin/courses' },
  ];

  const handleLogout = async () => {
    await logout();
    onClose?.();
    navigate('/');
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-[80] w-[56vw] max-w-[240px] bg-[#180d07] border-r border-brand-gold/10 transform transition-transform duration-300 ease-in-out lg:relative lg:w-64 lg:max-w-none lg:translate-x-0 flex flex-col shadow-2xl lg:shadow-none
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Mobile Close Button */}
      <button 
        onClick={onClose}
        className="lg:hidden absolute left-4 top-4 rounded-lg bg-white/5 p-2 text-brand-gold hover:bg-white/10 transition-colors active:scale-95"
        aria-label="Close admin menu"
      >
        <X size={18} />
      </button>

      {/* Logo removed from here */}

      <div className="px-3 lg:px-4 mb-5 mt-16 lg:mt-8">
        <Link 
          to="/" 
          className="flex items-center gap-2.5 lg:gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 lg:px-4 py-3 text-xs lg:text-sm font-semibold text-brand-cream/65 hover:text-brand-gold hover:bg-white/5 transition-all"
          onClick={onClose}
        >
          <Home size={17} className="shrink-0" />
          <span className="truncate">Back to Website</span>
        </Link>
      </div>

      <nav className="flex-grow px-3 lg:px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`group flex items-center justify-between rounded-lg px-3 lg:px-4 py-3 transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-gold text-brand-dark shadow-lg shadow-brand-gold/15' 
                  : 'text-brand-cream/65 hover:bg-white/5 hover:text-brand-gold'
              }`}
            >
              <div className="flex min-w-0 items-center gap-2.5 lg:gap-3">
                <item.icon size={18} className="shrink-0" />
                <span className="truncate text-xs lg:text-sm font-semibold">{item.name}</span>
              </div>
              <ChevronRight size={15} className={`shrink-0 transition-transform ${isActive ? 'rotate-90' : 'opacity-45 group-hover:translate-x-1 group-hover:opacity-100'}`} />
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-brand-gold/10 p-3 lg:p-4">
        <button onClick={handleLogout} className="flex w-full items-center gap-2.5 lg:gap-3 rounded-lg px-3 lg:px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut size={18} className="shrink-0" />
          <span className="truncate text-xs lg:text-sm font-semibold">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
