import React, { useState, Suspense, lazy } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { Search, UserPlus } from 'lucide-react';

const CertificateSearch = lazy(() => import('../components/CertificateSearch'));
const CertificateEnrollment = lazy(() => import('../components/CertificateEnrollment'));

const CertificatePage = () => {
  return (
    <div className="min-h-screen bg-[#120a05] flex flex-col">
      <Nav />
      <main className="flex-grow pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Suspense fallback={<div className="h-96 flex items-center justify-center text-brand-gold animate-pulse font-serif text-2xl italic">Loading Verification System...</div>}>
            <CertificateSearch />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CertificatePage;
