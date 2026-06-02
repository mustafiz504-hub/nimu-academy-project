import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Clock, Calendar, CheckCircle2, User, BookOpen, Phone, Mail, MapPin, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import Card, { CardHeader, CardContent, CardFooter } from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import SectionHeading from './ui/SectionHeading';
import Modal from './ui/Modal';
import { Course, useGlobal } from '../context/GlobalContext';
import { useNavigate } from 'react-router-dom';

const CourseSection = () => {
  const { courses } = useGlobal();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const handleEnrollClick = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    setSelectedCourse(course);
    setShowEnrollModal(true);
  };

  const handleCardClick = (courseId: number | string) => {
    navigate(`/course/${courseId}`);
  };

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <section id="academy" className="py-16 md:py-24 bg-brand-cream scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-2 md:mb-8">
          <SectionHeading title="Our Featured Courses" className="mb-0 text-center md:text-left" />
        </div>
        
        <div className="relative group">
          {/* Mobile Swipe Hint - Centered and very close to cards */}
          <div className="md:hidden absolute -top-1 left-1/2 -translate-x-1/2 flex gap-2 z-10 w-full justify-center">
             <div className="text-[10px] uppercase tracking-widest text-brand-gold/40 font-bold flex items-center gap-1.5 animate-pulse">
               <ChevronLeft size={10} /> Swipe to explore <ChevronRight size={10} />
             </div>
          </div>

          <motion.div 
            ref={scrollRef}
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="flex overflow-x-auto overflow-y-hidden gap-6 px-4 md:px-8 scrollbar-hide snap-x snap-mandatory w-fit mx-auto max-w-full pt-4 pb-10 overscroll-x-contain"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
          {courses.map((course, idx) => (
            <motion.div
              variants={itemVariants}
              key={idx}
              className="flex-shrink-0 snap-start w-[65vw] sm:w-[320px] md:w-[340px] transition-transform duration-300 hover:-translate-y-2"
            >
              <div onClick={() => handleCardClick(course.id)} className="cursor-pointer h-full group/course">
                <Card className="w-full h-full flex flex-col border-brand-gold/10 group-hover/course:border-brand-gold/40 transition-colors">
                  <CardHeader>
                    <img
                      src={course.image}
                      alt={course.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/course:scale-110"
                    />
                    <Badge className="absolute top-4 right-4" variant="dark">
                      {course.mode}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-lg md:text-xl font-serif text-brand-dark mb-2 leading-tight group-hover/course:text-brand-gold transition-colors">{course.title}</h3>
                    <div className="flex flex-wrap gap-3 mb-3 text-xs text-brand-brown">
                      <div className="flex items-center"><Clock size={14} className="mr-1 text-brand-gold"/> {course.duration}</div>
                      <div className="flex items-center"><Calendar size={14} className="mr-1 text-brand-gold"/> {course.timing}</div>
                    </div>
                    <div className="mb-3">
                      <h4 className="font-semibold text-sm text-brand-dark mb-1.5 flex items-center gap-2">
                        <BookOpen size={14} className="text-brand-gold"/> Topics Covered:
                      </h4>
                      <ul className="text-xs text-brand-brown space-y-1">
                        {course.topics.slice(0, 3).map((topic, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-brand-gold mr-2">•</span> {topic}
                          </li>
                        ))}
                        {course.topics.length > 3 && <li className="text-brand-gold font-medium ml-4">+ more</li>}
                      </ul>
                    </div>
                    <CardFooter className="px-0 pb-0 pt-3 border-t-0">
                      <div className="text-xl font-bold text-brand-dark">₹{course.price?.replace('₹', '')}</div>
                      <Button size="sm" onClick={(e) => handleEnrollClick(e, course)}>
                        Enroll Now
                      </Button>
                    </CardFooter>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
          </motion.div>
        </div>
      </div>

      {/* Contact Options Modal */}
      <Modal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        title="Enroll in Academy"
        maxWidth="max-w-md"
      >
        <div className="py-6 text-center">
          <div className="w-20 h-20 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-6">
            <Phone size={40} />
          </div>
          <h3 className="text-2xl font-serif font-bold text-brand-dark mb-2">Join {selectedCourse?.title}</h3>
          <p className="text-brand-brown mb-8 px-4">
            Talk to Chef <span className="font-bold">Muskan Naz's</span> team to confirm your seat and batch timings.
          </p>

          <div className="grid gap-4">
            <a 
              href="tel:+919777240070" 
              className="flex items-center justify-center gap-3 w-full bg-brand-dark text-brand-gold py-4 rounded-2xl font-bold hover:bg-brand-dark/90 transition-all shadow-lg group"
            >
              <Phone size={20} className="group-hover:animate-bounce" /> Call Now: +91 97772 40070
            </a>
            
            <a 
              href="https://wa.me/919777240070" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold hover:bg-[#25D366]/90 transition-all shadow-lg group"
            >
              <Send size={20} className="group-hover:translate-x-1 transition-transform" /> WhatsApp Us
            </a>
          </div>
          
          <p className="mt-6 text-[10px] text-brand-brown/40 uppercase tracking-widest">
            Available 8 AM - 10 PM IST
          </p>
        </div>
      </Modal>
    </section>
  );
};

export default CourseSection;
