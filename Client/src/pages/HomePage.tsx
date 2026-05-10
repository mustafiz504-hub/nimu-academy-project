import React from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import AcademyIntro from '../components/AcademyIntro';
import CourseSection from '../components/CourseSection';
import Testimonials from '../components/Testimonials';

const HomePage = () => {
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

export default HomePage;
