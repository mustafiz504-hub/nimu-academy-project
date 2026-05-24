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
const AdminCertificatesPage = lazy(() => import('./pages/admin/AdminCertificatesPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const UserOrdersPage = lazy(() => import('./pages/user/UserOrdersPage'));
const UserEnrollmentsPage = lazy(() => import('./pages/user/UserEnrollmentsPage'));
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/SuperAdminDashboard'));
const CertificatePage = lazy(() => import('./pages/CertificatePage'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));

const PageSkeleton = () => (
  <div className="min-h-screen bg-brand-dark">
    <div className="h-1 bg-brand-gold animate-progress fixed top-0 left-0 z-[100]" />
    <div className="mx-auto max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
      <div className="h-8 w-48 rounded bg-brand-gold/5" />
      <div className="mt-8 space-y-4">
        <div className="h-32 rounded-2xl bg-white/5" />
        <div className="h-32 rounded-2xl bg-white/5" />
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
              <Route path="/admin/certificates" element={<AdminCertificatesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/user/orders" element={<UserOrdersPage />} />
              <Route path="/user/enrollments" element={<UserEnrollmentsPage />} />
              <Route path="/certificate" element={<CertificatePage />} />
              <Route path="/terms" element={<TermsOfUse />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/refund" element={<RefundPolicy />} />
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
