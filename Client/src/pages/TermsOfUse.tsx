import React from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { FileText, Shield, Scale, Clock } from 'lucide-react';

const TermsOfUse = () => {
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
              <Scale size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-cream mb-4">Terms of Use</h1>
            <p className="text-brand-cream/40 max-w-2xl mx-auto uppercase tracking-widest text-xs font-bold">
              Last Updated: May 2026 • Nimu Cooking Academy
            </p>
          </motion.div>

          <div className="space-y-12 text-brand-cream/70 leading-relaxed font-light">
            <section className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12">
              <h2 className="text-2xl font-serif font-bold text-brand-gold mb-6 flex items-center gap-3">
                <FileText size={24} /> 1. Acceptance of Terms
              </h2>
              <p className="mb-4">
                By accessing and using the Nimu Cooking Academy website and services, you agree to comply with and be bound by these Terms of Use. If you do not agree, please refrain from using our platform.
              </p>
              <p>
                Our services are intended for individuals who are passionate about baking and cooking. By enrolling in any course, you confirm that you are at least 18 years old or have parental consent.
              </p>
            </section>

            <section className="p-8 md:p-12 border-l-2 border-brand-gold/20 ml-4 md:ml-8">
              <h2 className="text-2xl font-serif font-bold text-brand-cream mb-6">2. Course Enrollment & Fees</h2>
              <ul className="space-y-4 list-disc pl-5">
                <li>All course fees must be paid in full at the time of enrollment unless otherwise stated.</li>
                <li>Enrollment is non-transferable between students.</li>
                <li>Nimu Academy reserves the right to change course content, timings, or instructors without prior notice to improve the learning experience.</li>
              </ul>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12">
              <h2 className="text-2xl font-serif font-bold text-brand-gold mb-6 flex items-center gap-3">
                <Shield size={24} /> 3. Intellectual Property
              </h2>
              <p className="mb-4">
                All recipes, course materials, videos, and documentation provided by Nimu Cooking Academy are the exclusive intellectual property of the academy and Chef Muskan Naz.
              </p>
              <div className="bg-brand-gold/10 border border-brand-gold/20 p-6 rounded-xl text-brand-gold text-sm font-medium">
                Warning: Sharing, selling, or distributing our proprietary recipes or study materials without written permission is strictly prohibited and may lead to legal action.
              </div>
            </section>

            <section className="p-8 md:p-12 border-l-2 border-brand-gold/20 ml-4 md:ml-8">
              <h2 className="text-2xl font-serif font-bold text-brand-cream mb-6">4. Attendance & Certification</h2>
              <p className="mb-4">
                Certificates are only issued to students who maintain a minimum of 80% attendance and successfully complete all practical assignments required for the specific course.
              </p>
              <p>
                Verification of certificates can be performed online through our official portal using the provided Student ID or Certificate ID.
              </p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12">
              <h2 className="text-2xl font-serif font-bold text-brand-gold mb-6 flex items-center gap-3">
                <Clock size={24} /> 5. Cancellation & Refunds
              </h2>
              <p>
                Please refer to our <span className="text-brand-gold underline underline-offset-4">Refund Policy</span> for detailed information regarding cancellations. Generally, once a course has started, fees are non-refundable.
              </p>
            </section>
          </div>

          <div className="mt-20 pt-12 border-t border-white/10 text-center">
            <p className="text-brand-cream/30 text-sm italic">
              If you have any questions regarding these terms, please contact us at <span className="text-brand-gold/60">nimu.academy@gmail.com</span>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfUse;
