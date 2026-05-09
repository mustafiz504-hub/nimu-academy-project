import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'dark' | 'success' | 'outline';
  className?: string;
}

const Badge = ({ children, variant = 'gold', className = '' }: BadgeProps) => {
  const variants = {
    gold: 'bg-brand-gold/10 text-brand-gold border border-brand-gold/30',
    dark: 'bg-brand-dark text-brand-gold border border-brand-gold/10',
    success: 'bg-green-100 text-green-800 border border-green-200',
    outline: 'bg-transparent border border-brand-gold/30 text-brand-gold'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
