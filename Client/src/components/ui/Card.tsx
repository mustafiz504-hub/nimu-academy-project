import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

const Card = ({ children, className = '', hoverable = true }: CardProps) => {
  return (
    <div className={`bg-white rounded-3xl overflow-hidden shadow-xl border border-brand-gold/10 transition-all duration-500 ${hoverable ? 'hover:shadow-2xl hover:-translate-y-1' : ''} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative h-64 overflow-hidden ${className}`}>{children}</div>
);

export const CardContent = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 flex flex-col ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`mt-auto pt-4 border-t border-brand-light flex items-center justify-between ${className}`}>{children}</div>
);

export default Card;
