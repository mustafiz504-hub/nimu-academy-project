import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { GlobalProvider } from './context/GlobalContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const Shop = lazy(() => import('./pages/Shop'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminEnrollments = lazy(() => import('./pages/admin/AdminEnrollments'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const UserOrdersPage = lazy(() => import('./pages/user/UserOrdersPage'));
const UserEnrollmentsPage = lazy(() => import('./pages/user/UserEnrollmentsPage'));
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/SuperAdminDashboard'));

const PageSkeleton = () => (
  <div className="min-h-screen bg-brand-dark text-brand-cream">
    <div className="fixed left-0 right-0 top-0 z-50 h-20 border-b border-brand-gold/20 bg-brand-dark/95" />
    <div className="mx-auto max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
      <div className="h-8 w-40 animate-pulse rounded bg-brand-gold/20" />
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="h-48 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-48 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-48 animate-pulse rounded-2xl bg-white/5" />
      </div>
    </div>
  </div>
);

function App() {
  return (
    <GlobalProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-brand-dark text-brand-cream font-sans selection:bg-brand-gold selection:text-brand-dark">
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/enrollments" element={<AdminEnrollments />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/gallery" element={<AdminGallery />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/user/orders" element={<UserOrdersPage />} />
              <Route path="/user/enrollments" element={<UserEnrollmentsPage />} />
              <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/course/:id" element={<CourseDetailPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </GlobalProvider>
  );
}

export default App;
