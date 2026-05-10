import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Calendar, CheckCircle2, User, BookOpen, Phone, Mail, MapPin, Send } from 'lucide-react';
import Card, { CardHeader, CardContent, CardFooter } from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import SectionHeading from './ui/SectionHeading';
import Modal from './ui/Modal';
import { courses, Course } from '../data/courses';
import { useNavigate } from 'react-router-dom';

const CourseSection = () => {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleEnrollClick = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    setSelectedCourse(course);
    setShowEnrollModal(true);
  };

  const handleCardClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <section id="academy" className="py-16 md:py-24 bg-brand-cream scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Our Featured Courses" />
        <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:overflow-x-visible md:snap-none md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 scrollbar-hide">
          {courses.map((course, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx}
              className="min-w-[85vw] sm:min-w-[60vw] md:min-w-0 snap-center shrink-0 h-full"
            >
              <div onClick={() => handleCardClick(course.id)} className="cursor-pointer h-full group">
                <Card className="h-full flex flex-col border-brand-gold/10 group-hover:border-brand-gold/40 transition-colors">
                  <CardHeader>
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <Badge className="absolute top-4 right-4" variant="dark">
                      {course.mode}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-xl font-serif text-brand-dark mb-3 leading-tight group-hover:text-brand-gold transition-colors">{course.title}</h3>
                    <div className="flex flex-wrap gap-3 mb-4 text-xs text-brand-brown">
                      <div className="flex items-center"><Clock size={14} className="mr-1 text-brand-gold"/> {course.duration}</div>
                      <div className="flex items-center"><Calendar size={14} className="mr-1 text-brand-gold"/> {course.timing}</div>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm text-brand-dark mb-2 flex items-center gap-2">
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
                    <CardFooter className="px-0 pb-0 border-t-0">
                      <div className="text-xl font-bold text-brand-dark">{course.price}</div>
                      <Button size="sm" onClick={(e) => handleEnrollClick(e, course)}>
                        Enroll Now
                      </Button>
                    </CardFooter>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Enrollment Form Modal */}
      <Modal
        isOpen={showEnrollModal}
        onClose={() => { setShowEnrollModal(false); setIsSuccess(false); }}
        title={isSuccess ? "Success!" : `Enroll in ${selectedCourse?.title}`}
        maxWidth="max-w-2xl"
      >
        {isSuccess ? (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={48} />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold text-brand-dark mb-2">Registration Received!</h3>
              <p className="text-brand-brown leading-relaxed">
                Thank you! Your enrollment request for <span className="font-bold text-brand-gold">{selectedCourse?.title}</span> has been received.<br/>
                Chef <span className="font-bold">Muskan Naz's</span> team will contact you within 24 hours to confirm your admission.
              </p>
            </div>
            <Button className="w-full" onClick={() => setShowEnrollModal(false)}>Back to Courses</Button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setIsSuccess(true); }} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-brown ml-1">Student Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={18} />
                  <input required type="text" placeholder="Your Full Name" className="w-full bg-brand-light border border-brand-gold/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-brand-gold transition-colors text-brand-dark text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-brown ml-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={18} />
                  <input required type="tel" placeholder="10 Digit Number" className="w-full bg-brand-light border border-brand-gold/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-brand-gold transition-colors text-brand-dark text-sm" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-brown ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={18} />
                  <input type="email" placeholder="Optional" className="w-full bg-brand-light border border-brand-gold/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-brand-gold transition-colors text-brand-dark text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-brown ml-1">City / Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={18} />
                  <input required type="text" placeholder="Your City" className="w-full bg-brand-light border border-brand-gold/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-brand-gold transition-colors text-brand-dark text-sm" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-brown ml-1">Course Name</label>
              <input readOnly value={selectedCourse?.title || ''} className="w-full bg-brand-gold/5 border border-brand-gold/20 rounded-xl py-3 px-4 focus:outline-none text-brand-dark text-sm font-semibold" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-brown ml-1">Preferred Batch *</label>
                <select required className="w-full bg-brand-light border border-brand-gold/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-gold transition-colors text-brand-dark text-sm appearance-none cursor-pointer">
                  <option value="">Select a Batch</option>
                  <option>Morning Batch - 10 AM to 12 PM</option>
                  <option>Evening Batch - 5 PM to 7 PM</option>
                  <option>Weekend Batch - Sat-Sun 11 AM</option>
                  <option>Online Live Batch - 8 PM to 9:30 PM</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-brown ml-1">Mode Preference *</label>
                <div className="flex gap-4 p-2 bg-brand-light rounded-xl border border-brand-gold/10 h-[46px] items-center px-4">
                  {['Online', 'Offline', 'Hybrid'].map(m => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer text-xs font-medium text-brand-dark">
                      <input required type="radio" name="mode" value={m} className="accent-brand-gold w-4 h-4" /> {m}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-brown ml-1">How did you hear about us?</label>
              <select className="w-full bg-brand-light border border-brand-gold/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-gold transition-colors text-brand-dark text-sm appearance-none cursor-pointer">
                <option value="">Select Option</option>
                <option>Instagram</option>
                <option>Friend / Referral</option>
                <option>Google Search</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-brown ml-1">Message / Query (Optional)</label>
              <textarea rows={3} placeholder="Any specific requirements?" className="w-full bg-brand-light border border-brand-gold/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-gold transition-colors text-brand-dark text-sm resize-none" />
            </div>
            <Button type="submit" className="w-full mt-2">
              Enroll Now <Send size={18} className="ml-2"/>
            </Button>
          </form>
        )}
      </Modal>
    </section>
  );
};

export default CourseSection;
