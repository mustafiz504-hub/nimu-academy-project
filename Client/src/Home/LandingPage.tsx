import React from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Hero from './Hero';
import BakeryServices from './BakeryServices';
import AcademyIntro from './AcademyIntro';
import CourseSection from './CourseSection';
import Schedule from './Schedule';
import Testimonials from './Testimonials';

const LandingPage = () => {
  return (
    <>
      <Nav />
      <Hero />
      <BakeryServices />
      <AcademyIntro />
      <CourseSection />
      <Schedule />
      <Testimonials />
      <Footer />
    </>
  );
};

export default LandingPage;
