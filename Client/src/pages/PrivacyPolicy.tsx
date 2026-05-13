import React from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { ShieldCheck, Eye, Lock, Database } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col selection:bg-brand-gold selection:text-brand-dark">
      <Nav />
      <main className="flex-grow pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-brand-gold/10 text-brand-gold mb-6">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-cream mb-4">Privacy Policy</h1>
            <p className="text-brand-cream/40 max-w-2xl mx-auto uppercase tracking-widest text-xs font-bold">
              Effective Date: May 2026 • Your Data, Protected.
            </p>
          </motion.div>

          <div className="space-y-12 text-brand-cream/70 leading-relaxed font-light">
            <section className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12">
              <h2 className="text-2xl font-serif font-bold text-brand-gold mb-6 flex items-center gap-3">
                <Eye size={24} /> 1. Information We Collect
              </h2>
              <p className="mb-4">
                At Nimu Cooking Academy, we respect your privacy. We collect only the necessary information to provide our services, including:
              </p>
              <ul className="space-y-3 list-disc pl-5 text-sm">
                <li>Personal details (Name, Email, Phone Number) provided during enrollment.</li>
                <li>Payment information (handled securely through third-party processors).</li>
                <li>Course progress and attendance records.</li>
              </ul>
            </section>

            <section className="p-8 md:p-12 border-l-2 border-brand-gold/20 ml-4 md:ml-8">
              <h2 className="text-2xl font-serif font-bold text-brand-cream mb-6">2. How We Use Your Data</h2>
              <p className="mb-4">Your information is used for:</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-white/[0.03] p-5 rounded-xl border border-white/5">
                  <h4 className="text-brand-gold font-bold text-sm mb-2">Service Delivery</h4>
                  <p className="text-xs">To manage your enrollments, issue certificates, and communicate about classes.</p>
                </div>
                <div className="bg-white/[0.03] p-5 rounded-xl border border-white/5">
                  <h4 className="text-brand-gold font-bold text-sm mb-2">Internal Support</h4>
                  <p className="text-xs">To provide customer support and improve our curriculum based on feedback.</p>
                </div>
              </div>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12">
              <h2 className="text-2xl font-serif font-bold text-brand-gold mb-6 flex items-center gap-3">
                <Lock size={24} /> 3. Data Security
              </h2>
              <p className="mb-4">
                We implement strict security measures to protect your data from unauthorized access. Your account information is encrypted, and we never store full credit card details on our servers.
              </p>
              <p>
                Access to student data is limited to authorized academy staff only for administrative purposes.
              </p>
            </section>

            <section className="p-8 md:p-12 border-l-2 border-brand-gold/20 ml-4 md:ml-8">
              <h2 className="text-2xl font-serif font-bold text-brand-cream mb-6">4. Third-Party Sharing</h2>
              <p>
                We do NOT sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted partners who assist us in operating our website and conducting our business, as long as those parties agree to keep this information confidential.
              </p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 text-center">
              <h2 className="text-2xl font-serif font-bold text-brand-gold mb-6 flex items-center justify-center gap-3">
                <Database size={24} /> 5. Data Retention
              </h2>
              <p>
                We retain your information for as long as your account is active or as needed to provide you services (like certificate verification). You may request to delete your account at any time.
              </p>
            </section>
          </div>

          <div className="mt-20 pt-12 border-t border-white/10 text-center">
            <p className="text-brand-cream/30 text-sm italic">
              Privacy concerns? Reach out to our Data Protection Officer at <span className="text-brand-gold/60">privacy@nimuacademy.com</span>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
