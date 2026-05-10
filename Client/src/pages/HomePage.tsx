import React, { Suspense, lazy } from 'react';
import Nav from '../components/Nav';
import Hero from '../components/Hero';

const AcademyIntro = lazy(() => import('../components/AcademyIntro'));
const CourseSection = lazy(() => import('../components/CourseSection'));
const Testimonials = lazy(() => import('../components/Testimonials'));
const Footer = lazy(() => import('../components/Footer'));

const SectionSkeleton = ({ className = 'bg-brand-cream' }: { className?: string }) => (
  <section className={`py-16 md:py-24 ${className}`}>
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mb-10 h-8 w-56 animate-pulse rounded bg-brand-gold/20" />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="h-56 animate-pulse rounded-2xl bg-black/10" />
        <div className="h-56 animate-pulse rounded-2xl bg-black/10" />
        <div className="h-56 animate-pulse rounded-2xl bg-black/10" />
      </div>
    </div>
  </section>
);

const HomePage = () => {
  return (
    <>
      <Nav />
      <Hero />
      <Suspense fallback={<SectionSkeleton className="bg-brand-dark" />}>
        <AcademyIntro />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <CourseSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton className="bg-brand-dark" />}>
        <Testimonials />
      </Suspense>
      <Suspense fallback={<div className="h-48 bg-[#1a110a]" />}>
        <Footer />
      </Suspense>
    </>
  );
};

export default HomePage;
