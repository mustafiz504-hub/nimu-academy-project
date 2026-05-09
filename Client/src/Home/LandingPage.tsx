import React from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Hero from './Hero';
import AcademyIntro from './AcademyIntro';

import CourseSection from './CourseSection';

import Testimonials from './Testimonials';

const LandingPage = () => {
  return (
    <>
      <Nav />
      <Hero />
      <AcademyIntro />

      <CourseSection />

      <Testimonials />
      <Footer />
    </>
  );
};

export default LandingPage;
