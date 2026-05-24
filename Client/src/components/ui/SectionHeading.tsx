import React from 'react';
import { motion } from 'motion/react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  dark?: boolean;
  className?: string;
}

const SectionHeading = ({ title, subtitle, dark = false, className = '' }: SectionHeadingProps) => {
  return (
    <div className={`text-center mb-10 md:mb-16 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className={`text-3xl md:text-5xl lg:text-6xl font-serif mb-4 ${dark ? 'text-brand-gold' : 'text-brand-dark'}`}>
          {title}
        </h2>
        <div className="w-20 md:w-24 h-1 bg-brand-gold mx-auto mb-6 md:mb-8"></div>
        {subtitle && (
          <p className={`max-w-2xl mx-auto text-base md:text-lg ${dark ? 'text-brand-cream/80' : 'text-brand-brown'}`}>
            {subtitle}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default SectionHeading;
