import React from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { RefreshCcw, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

const RefundPolicy = () => {
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
              <RefreshCcw size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-cream mb-4">Refund Policy</h1>
            <p className="text-brand-cream/40 max-w-2xl mx-auto uppercase tracking-widest text-xs font-bold">
              Fair & Transparent Cancellation Guidelines.
            </p>
          </motion.div>

          <div className="space-y-12 text-brand-cream/70 leading-relaxed font-light">
            <section className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12">
              <h2 className="text-2xl font-serif font-bold text-brand-gold mb-6 flex items-center gap-3">
                <AlertTriangle size={24} /> 1. Academy Class Cancellations
              </h2>
              <p className="mb-4 text-sm">
                We understand that plans can change. Our goal is to be as flexible as possible:
              </p>
              <ul className="space-y-3 list-disc pl-5 text-sm">
                <li><strong>48 Hours Before:</strong> Full refund of the advance amount or easy reschedule to any future batch.</li>
                <li><strong>24-48 Hours Before:</strong> 50% refund or free reschedule to the next available batch.</li>
                <li><strong>Emergency Cases:</strong> If you have a genuine emergency, talk to us! We are happy to help you find a solution.</li>
              </ul>
            </section>

            <section className="p-8 md:p-12 border-l-2 border-brand-gold/20 ml-4 md:ml-8">
              <h2 className="text-2xl font-serif font-bold text-brand-cream mb-6">2. Cake & Bakery Orders</h2>
              <p className="mb-4 text-sm">Our bakery products are handcrafted for you:</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-white/[0.03] p-5 rounded-xl border border-white/5">
                  <h4 className="text-brand-gold font-bold text-sm mb-2">Easy Cancellation</h4>
                  <p className="text-xs">You can cancel or modify your order up to 24 hours before the scheduled delivery time.</p>
                </div>
                <div className="bg-white/[0.03] p-5 rounded-xl border border-white/5">
                  <h4 className="text-brand-gold font-bold text-sm mb-2">Quality Guarantee</h4>
                  <p className="text-xs">If you're not 100% happy with the quality or taste, please let us know. Your satisfaction is our priority.</p>
                </div>
              </div>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12">
              <h2 className="text-2xl font-serif font-bold text-brand-gold mb-6 flex items-center gap-3">
                <CheckCircle size={24} /> 3. Refund Process
              </h2>
              <p className="text-sm">
                Approved refunds will be processed within 5-7 working days and will be credited back to the original payment method used during the transaction.
              </p>
            </section>

            <section className="p-8 md:p-12 border-l-2 border-brand-gold/20 ml-4 md:ml-8 text-center md:text-left">
              <h2 className="text-2xl font-serif font-bold text-brand-gold mb-6 flex items-center justify-center md:justify-start gap-3">
                <HelpCircle size={24} /> Need Help?
              </h2>
              <p className="text-sm">
                If you have any questions regarding your refund or cancellation, please reach out to us at <span className="text-brand-gold">nimucooking@gmail.com</span> or call our support line.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
