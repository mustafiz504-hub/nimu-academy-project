import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Clock, Calendar, CheckCircle2, User, BookOpen, GraduationCap, 
  ArrowLeft, ArrowRight, Phone, Mail, MapPin, Send, Star, 
  Award, ShieldCheck, Heart, AlertCircle
} from 'lucide-react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useGlobal } from '../context/GlobalContext';
import { api } from '../lib/api';

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { courses, user, refreshMyEnrollments } = useGlobal();
  const navigate = useNavigate();
  const location = useLocation();
  const course = useMemo(
    () => courses.find(c => String(c.id) === String(id)) ?? null,
    [courses, id]
  );
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [enrollmentForm, setEnrollmentForm] = useState({
    student_name: '',
    phone: '',
    email: '',
    city: '',
    batch_timing: '',
    mode: '',
    how_heard: 'Instagram',
    message: '',
  });

  const openEnrollment = React.useCallback(() => {
    if (!user) {
      navigate('/auth', { state: { returnTo: location.pathname, action: 'enroll' } });
      return;
    }
    setError('');
    setIsSuccess(false);
    setEnrollmentForm((prev) => ({
      ...prev,
      student_name: prev.student_name || user?.name || '',
      phone: prev.phone || user?.phone || '',
      email: prev.email || user?.email || '',
      batch_timing: prev.batch_timing || course?.batches?.[0] || '',
      mode: prev.mode || course?.mode || '',
    }));
    setShowEnrollModal(true);
  }, [user, navigate, location.pathname, course]);

  useEffect(() => {
    if (course) {
      if (location.state?.action === 'enroll' && user) {
        openEnrollment();
        // Clear state so it doesn't keep reopening on refresh
        navigate(location.pathname, { replace: true, state: {} });
      }
      window.scrollTo(0, 0);
    } else {
      navigate('/');
    }
  }, [course, navigate, location.state, location.pathname, user, openEnrollment]);

  if (!course) return null;

  const handlePayment = async () => {
    setSubmitting(true);
    setError('');

    try {
      const res = await new Promise((resolve) => {
        if ((window as any).Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!res) {
        setError('Razorpay SDK failed to load. Are you offline?');
        setSubmitting(false);
        return;
      }

      const token = localStorage.getItem('nimu_auth_token');
      const API_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000/api';
      
      // 1. Create order
      const orderRes = await fetch(`${API_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          course_id: course.id,
          enrollmentData: {
            student_name: user?.name,
            phone: user?.phone
          }
        })
      });
      
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || 'Could not create order');

      // 2. Open Razorpay Checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Nimu Academy',
        description: `Unlock ${orderData.course_name}`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          // 3. Verify Payment
          const verifyRes = await fetch(`${API_URL}/payments/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) throw new Error(verifyData.message || 'Verification failed');
          
          setIsSuccess(true);
          await refreshMyEnrollments();
          setTimeout(() => {
             setShowEnrollModal(false);
             navigate('/learn');
          }, 2000);
        },
        prefill: {
          name: orderData.user_name,
          email: orderData.user_email,
          contact: orderData.user_phone
        },
        theme: {
          color: '#ca8a04'
        }
      };

      const Razorpay = (window as any).Razorpay;
      const rzp1 = new Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        setError(response.error.description || 'Payment failed');
      });
      rzp1.open();

    } catch (err: any) {
      setError(err.message || 'Payment initiation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // openEnrollment is now defined above with useCallback

  return (
    <div className="min-h-screen bg-brand-cream">
      <Nav />
      
      {/* Hero Section */}
      <div className="relative pt-24 md:pt-32 pb-12 md:pb-20 overflow-hidden bg-brand-dark">
        <div className="absolute inset-0 opacity-20">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover blur-sm"
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark/90 to-brand-dark" />
        
        <div className="container mx-auto px-4 relative z-10">
          <Link 
            to="/" 
            onClick={(e) => {
              e.preventDefault();
              navigate('/', { state: { scrollTo: 'academy' } });
            }}
            className="inline-flex items-center text-brand-gold hover:text-brand-gold-muted transition-colors mb-8 group"
          >
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
                    <p className="text-lg text-brand-cream font-medium">Official Certificate</p>
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
                {(course.learn || []).map((item, i) => (
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
                      {(course.topics || []).map((topic, i) => (
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
                    <img
                      src="/chef-muskan.jpeg"
                      alt={course.instructor.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top"
                    />
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
                   <div className="text-4xl font-bold text-brand-dark">₹{course.price?.replace('₹', '')}</div>
                   <p className="text-brand-gold font-bold text-xs uppercase tracking-wider">EMI Options Available</p>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="p-4 bg-brand-light rounded-2xl border border-brand-gold/10">
                    <p className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-3">Available Batches</p>
                    <ul className="space-y-3">
                      {(course.batches || []).map((batch, i) => (
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

                <Button className="w-full shadow-xl" size="lg" onClick={openEnrollment}>
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
                <a href="tel:+919777240070" className="text-brand-dark font-bold hover:text-brand-gold transition-colors">
                  +91 9777240070
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <Modal 
        isOpen={showEnrollModal} 
        onClose={() => setShowEnrollModal(false)} 
        title="Enroll in Academy"
        maxWidth="max-w-md"
        headerClassName="bg-[#1a110a] text-brand-gold border-b border-white/5"
      >
        <div className="py-8 px-2 text-center">
          {isSuccess ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-brand-dark mb-2">Payment Successful!</h3>
              <p className="text-brand-brown/70 mb-6 max-w-[280px] mx-auto text-sm leading-relaxed">
                Welcome to {course.title}. You will be redirected to the Learn screen shortly.
              </p>
            </motion.div>
          ) : (
            <>
              <div className="w-20 h-20 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-gold/20">
                <Award size={32} />
              </div>
              
              <h3 className="text-2xl font-serif font-bold text-brand-dark mb-2">
                Unlock {course.title}
              </h3>
              
              <p className="text-brand-brown/70 mb-6 max-w-[280px] mx-auto text-sm leading-relaxed">
                Get full access to all premium video lessons, materials, and earn your certificate.
              </p>

              {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 text-left">
                  <AlertCircle size={16} className="shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <Button 
                  onClick={handlePayment} 
                  disabled={submitting}
                  className="w-full h-14 text-lg font-bold shadow-xl shadow-brand-gold/20 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Processing...' : (
                    <>
                      Pay ₹{Number(course.price).toLocaleString('en-IN')} <ArrowRight size={20} />
                    </>
                  )}
                </Button>
                
                <a 
                  href="https://wa.me/919777240070"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 text-brand-brown/60 hover:text-brand-dark font-medium transition-colors text-sm"
                >
                  <Phone size={16} /> Have questions? Contact Support
                </a>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CourseDetailPage;
