import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Clock, Calendar, CheckCircle2, User, BookOpen, GraduationCap, 
  ArrowLeft, ArrowRight, Phone, Mail, MapPin, Send, Star, 
  Award, ShieldCheck, Heart
} from 'lucide-react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { courses, Course } from '../data/courses';

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const foundCourse = courses.find(c => c.id === id);
    if (foundCourse) {
      setCourse(foundCourse);
      window.scrollTo(0, 0);
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  if (!course) return null;

  return (
    <div className="min-h-screen bg-brand-cream">
      <Nav />
      
      {/* Hero Section */}
      <div className="relative pt-24 md:pt-32 pb-12 md:pb-20 overflow-hidden bg-brand-dark">
        <div className="absolute inset-0 opacity-20">
          <img src={course.image} alt={course.title} className="w-full h-full object-cover blur-sm" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark/90 to-brand-dark" />
        
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/#academy" className="inline-flex items-center text-brand-gold hover:text-brand-gold-muted transition-colors mb-8 group">
            <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
            Back Home
          </Link>
          
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge variant="gold" className="px-4 py-1 text-sm font-bold uppercase tracking-wider">{course.mode}</Badge>
                <Badge variant="outline" className="text-brand-cream border-brand-cream/30 px-4 py-1 text-sm font-bold uppercase tracking-wider">{course.duration}</Badge>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-serif text-brand-gold font-bold mb-6 leading-tight">
                {course.title}
              </h1>
              <p className="text-lg md:text-xl text-brand-cream/80 max-w-2xl font-light leading-relaxed mb-10">
                Join our expert-led program and master the art of baking with professional techniques and hands-on guidance.
              </p>
              
              <div className="flex flex-wrap gap-4 md:gap-8 py-6 border-y border-brand-cream/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                    <Clock size={20} className="md:size-24" />
                  </div>
                  <div>
                    <p className="text-[10px] text-brand-gold uppercase tracking-widest font-bold">Duration</p>
                    <p className="text-base md:text-lg text-brand-cream font-medium">{course.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-gold uppercase tracking-widest font-bold">Timings</p>
                    <p className="text-lg text-brand-cream font-medium">{course.timing}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-gold uppercase tracking-widest font-bold">Certification</p>
                    <p className="text-lg text-brand-cream font-medium">Industry Recognized</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid lg:grid-cols-3 gap-10 lg:gap-16">
          <div className="lg:col-span-2 space-y-12 md:space-y-16">
            {/* Learning Outcomes */}
            <section>
              <h2 className="text-3xl font-serif text-brand-dark font-bold mb-8 flex items-center gap-3">
                <CheckCircle2 className="text-brand-gold" size={32} />
                What You Will Learn
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {course.learn.map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-brand-gold/10 hover:border-brand-gold/30 transition-colors"
                  >
                    <div className="mt-1 bg-brand-gold/10 p-1 rounded-full text-brand-gold">
                      <CheckCircle2 size={16} />
                    </div>
                    <p className="text-brand-brown font-medium leading-relaxed">{item}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Syllabus */}
            <section>
              <h2 className="text-3xl font-serif text-brand-dark font-bold mb-8 flex items-center gap-3">
                <BookOpen className="text-brand-gold" size={32} />
                Full Syllabus
              </h2>
              <div className="bg-white rounded-3xl p-8 border border-brand-gold/10 shadow-sm">
                <div className="grid sm:grid-cols-2 gap-y-6 gap-x-12">
                  {course.topics.map((topic, i) => (
                    <div key={topic} className="flex items-center gap-4 group">
                      <span className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold font-bold text-sm group-hover:bg-brand-gold group-hover:text-brand-dark transition-colors">
                        {i + 1}
                      </span>
                      <span className="text-brand-brown font-semibold text-lg">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Instructor */}
            <section>
              <h2 className="text-3xl font-serif text-brand-dark font-bold mb-8 flex items-center gap-3">
                <User className="text-brand-gold" size={32} />
                Meet Your Instructor
              </h2>
              <div className="bg-brand-dark text-brand-cream rounded-3xl p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-2xl border-2 border-brand-gold/30">
                    <img src="https://images.unsplash.com/photo-1577214224216-754688737563?auto=format&fit=crop&q=80&w=600" alt={course.instructor.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <Badge variant="gold" className="mb-4">Professional Chef</Badge>
                    <h3 className="text-3xl font-serif font-bold text-brand-gold mb-4">{course.instructor.name}</h3>
                    <p className="text-lg text-brand-cream/80 leading-relaxed font-light italic">
                      "{course.instructor.bio}"
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar / Enrollment Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-8">
              <div className="bg-white rounded-3xl p-8 border-2 border-brand-gold/20 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/10 rounded-full -mr-10 -mt-10" />
                
                <h4 className="text-brand-gold font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                   <Star size={16} /> Course Enrollment
                </h4>
                
                <div className="mb-8">
                   <div className="text-4xl font-bold text-brand-dark mb-1">{course.price}</div>
                   <p className="text-brand-gold font-bold text-xs uppercase tracking-wider">EMI Options Available</p>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="p-4 bg-brand-light rounded-2xl border border-brand-gold/10">
                    <p className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-3">Available Batches</p>
                    <ul className="space-y-3">
                      {course.batches.map((batch, i) => (
                        <li key={i} className="text-sm text-brand-dark flex items-center gap-3 font-medium">
                          <div className="w-1.5 h-1.5 bg-brand-gold rounded-full" /> {batch}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { icon: <ShieldCheck size={18}/>, text: 'Hands-on training' },
                      { icon: <GraduationCap size={18}/>, text: 'Certification included' },
                      { icon: <Heart size={18}/>, text: 'Lifetime community access' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-brand-brown text-sm font-medium">
                        <span className="text-brand-gold">{item.icon}</span>
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full shadow-xl" size="lg" onClick={() => setShowEnrollModal(true)}>
                  Enroll Now <ArrowRight className="ml-2" />
                </Button>
                
                <p className="text-center text-[10px] text-brand-brown/50 mt-4 uppercase tracking-tighter">
                  Limited seats available for each batch.
                </p>
              </div>

              {/* Help Box */}
              <div className="bg-brand-gold/10 rounded-3xl p-6 border border-brand-gold/20">
                <p className="text-brand-dark font-bold text-sm mb-2 flex items-center gap-2">
                  <Phone size={16} className="text-brand-gold" /> Need help?
                </p>
                <p className="text-brand-brown text-sm font-light mb-4">
                  Have questions about the syllabus or timings? Talk to our counselor.
                </p>
                <a href="tel:+910000000000" className="text-brand-dark font-bold hover:text-brand-gold transition-colors">
                  +91 00000 00000
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Reuse Enrollment Form Modal */}
      <Modal 
        isOpen={showEnrollModal} 
        onClose={() => {
          setShowEnrollModal(false);
          setIsSuccess(false);
        }} 
        title={isSuccess ? "Success!" : `Enroll in ${course.title}`}
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
                Thank you! Your enrollment request for <span className="font-bold text-brand-gold">{course.title}</span> has been received.<br/>
                Chef <span className="font-bold">Muskan Naz's</span> team will contact you within 24 hours to confirm your admission.
              </p>
            </div>
            <Button className="w-full" onClick={() => setShowEnrollModal(false)}>
              Back to Course Details
            </Button>
          </div>
        ) : (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setIsSuccess(true);
            }}
            className="space-y-5"
          >
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
              <input readOnly value={course.title} className="w-full bg-brand-gold/5 border border-brand-gold/20 rounded-xl py-3 px-4 focus:outline-none text-brand-dark text-sm font-semibold" />
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
    </div>
  );
};

export default CourseDetailPage;
