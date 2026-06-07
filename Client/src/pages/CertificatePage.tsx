import React, { useState, Suspense, lazy } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { Search, UserPlus } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';

const CertificateSearch = lazy(() => import('../components/CertificateSearch'));
const CertificateEnrollment = lazy(() => import('../components/CertificateEnrollment'));
const AdminCertificatesTable = lazy(() => import('../components/AdminCertificatesTable'));

const CertificatePage = () => {
  const { user } = useGlobal();
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

  return (
    <div className="min-h-screen bg-[#120a05] flex flex-col">
      <Nav />
      <main className="flex-grow pt-24 pb-20">
        <div className="w-full max-w-6xl mx-auto px-4">
          <Suspense fallback={<div className="h-96 flex items-center justify-center text-brand-gold animate-pulse font-serif text-2xl italic">Loading Verification System...</div>}>
            {/* CertificateSearch is centered in its own max-w-2xl wrapper */}
            <div className="w-full max-w-2xl mx-auto">
              <CertificateSearch />
            </div>
            {isAdmin && <AdminCertificatesTable />}
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CertificatePage;
