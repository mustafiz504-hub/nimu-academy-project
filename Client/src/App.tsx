import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Menu, X, ShoppingCart, User, ChevronRight, Star, CheckCircle, 
  Clock, MapPin, MonitorPlay, Calendar, Users, Award, BookOpen, 
  Instagram, Facebook, Twitter, ChefHat
} from 'lucide-react';

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Shop', href: '#shop' },
    { name: 'Academy', href: '#academy' },
    { name: 'About', href: '#about' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-brand-dark/95 backdrop-blur-md text-brand-cream border-b border-brand-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center text-brand-dark">
               <ChefHat size={24} />
            </div>
            <span className="font-serif text-2xl font-bold tracking-wider text-brand-gold">NIMU</span>
            <span className="hidden md:inline font-sans text-sm tracking-widest uppercase text-brand-cream/60 ml-2 border-l border-brand-cream/20 pl-3">
              Velvet Crumbs
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <a 
                key={link.name} 
                href={link.href} 
                className={`text-sm font-medium hover:text-brand-gold transition-colors ${link.name === 'Academy' ? 'text-brand-gold' : ''}`}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <button className="hover:text-brand-gold transition-colors"><ShoppingCart size={20} /></button>
            <button className="hover:text-brand-gold transition-colors"><User size={20} /></button>
            <button className="bg-brand-gold text-brand-dark px-5 py-2 rounded-full text-sm font-semibold hover:bg-brand-gold-muted transition-colors">
              Book a Class
            </button>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <button className="text-brand-cream hover:text-brand-gold"><ShoppingCart size={20} /></button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-brand-cream hover:text-brand-gold transition-transform active:scale-95">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div 
        initial={false}
        animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        className="md:hidden bg-brand-dark border-t border-brand-gold/20 overflow-hidden"
      >
        <div className="px-4 py-6 space-y-4">
          {navLinks.map(link => (
            <a 
              key={link.name}
              href={link.href} 
              onClick={() => setIsOpen(false)}
              className="block text-lg font-medium hover:text-brand-gold transition-colors"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 border-t border-brand-gold/10 flex flex-col gap-4">
            <button className="flex items-center gap-3 text-lg font-medium hover:text-brand-gold transition-colors">
              <User size={20} /> Profile
            </button>
            <button className="w-full bg-brand-gold text-brand-dark py-4 rounded-xl font-bold text-lg hover:bg-brand-gold-muted transition-colors">
              Book a Class
            </button>
          </div>
        </div>
      </motion.div>
    </nav>
  );
};

const Hero = () => {
  return (
    <div id="home" className="relative pt-20 pb-32 flex content-center items-center justify-center min-h-screen">
      <div className="absolute top-0 w-full h-full bg-center bg-cover"
           style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=2000')" }}>
        <span id="blackOverlay" className="w-full h-full absolute opacity-70 bg-brand-dark"></span>
      </div>
      <div className="container relative mx-auto px-4 z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-brand-cream font-serif font-bold text-5xl md:text-7xl leading-tight mb-6">
            Freshly Baked Delights & <br/> <span className="text-brand-gold">Professional Baking Classes</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-brand-cream/80 max-w-2xl mx-auto font-light mb-10">
            Order premium cakes, pastries, and desserts or join our expert-led baking courses online and offline at the renowned Velvet Crumbs Academy.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-brand-gold text-brand-dark px-8 py-4 rounded-full font-semibold text-lg hover:bg-brand-gold-muted transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              Order Cakes
            </button>
            <button className="bg-transparent border-2 border-brand-gold text-brand-gold px-8 py-4 rounded-full font-semibold text-lg hover:bg-brand-gold hover:text-brand-dark transition-all">
              Join Baking Classes
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const BakeryServices = () => {
  const categories = [
    { name: 'Birthday Cakes', image: 'https://images.unsplash.com/photo-1562777717-b6aff3453716?auto=format&fit=crop&q=80&w=600' },
    { name: 'Wedding Cakes', image: 'https://images.unsplash.com/photo-1535268647677-300df828ed78?auto=format&fit=crop&q=80&w=600' },
    { name: 'Cupcakes', image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&q=80&w=600' },
    { name: 'Pastries', image: 'https://images.unsplash.com/photo-1549590143-d5855148a9d5?auto=format&fit=crop&q=80&w=600' },
  ];

  return (
    <section id="shop" className="py-24 bg-brand-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-brand-dark mb-4">Our Bakery Services</h2>
          <div className="w-24 h-1 bg-brand-gold mx-auto mb-6"></div>
          <p className="text-brand-brown max-w-2xl mx-auto text-lg">Handcrafted with love, using only the finest ingredients.</p>
        </div>
        
        <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:overflow-x-visible md:snap-none md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 scrollbar-hide">
          {categories.map((cat, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              key={cat.name} 
              className="min-w-[80vw] sm:min-w-[45vw] md:min-w-0 snap-center shrink-0 group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl aspect-[4/5] mb-4">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10"></div>
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute bottom-6 left-0 right-0 text-center z-20">
                  <h3 className="text-2xl font-serif text-white mb-2">{cat.name}</h3>
                  <button className="text-brand-gold font-medium uppercase text-sm tracking-wider flex items-center justify-center w-full opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                    Explore <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <button className="text-brand-dark font-semibold border-b-2 border-brand-gold pb-1 hover:text-brand-gold transition-colors">
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

const AcademyIntro = () => {
  return (
    <section id="academy" className="py-24 bg-brand-dark text-brand-cream relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full text-brand-gold" fill="currentColor">
          <path d="M50 0 L100 50 L50 100 L0 50 Z" />
        </svg>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif text-brand-gold mb-6 leading-tight">
              Learn Baking From Professional Chefs
            </h2>
            <p className="text-lg text-brand-cream/80 mb-8 font-light leading-relaxed">
              Hands-on baking courses designed for hobby bakers, home bakers, and aspiring professionals. Turn your passion into a profession with the Velvet Crumbs Academy.
            </p>
            <ul className="space-y-4 mb-8">
              {['Professional Chef Trainers', 'Small Batch Sizes for Personal Attention', 'Fully Equipped AC Kitchen', 'Lifetime Community Access'].map((item, i) => (
                <li key={i} className="flex items-center text-brand-cream/90">
                  <CheckCircle className="text-brand-gold mr-3" size={20} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button className="bg-brand-gold text-brand-dark px-8 py-3 rounded-full font-semibold hover:bg-brand-cream transition-colors">
              Explore Our Courses
            </button>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 border-2 border-brand-gold/30 rounded-2xl transform rotate-3"></div>
            <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000" alt="Baking Class" className="relative rounded-2xl shadow-2xl object-cover h-[500px] w-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

const CourseSection = () => {
  const courses = [
    {
      title: "Basic Baking Course",
      duration: "4 Weeks",
      mode: "Online & Offline",
      price: "₹4,999",
      timing: "10 AM - 12 PM | 5 PM - 7 PM",
      topics: ["Cake Basics", "Frosting Techniques", "Cupcakes", "Cookies"],
      features: ["Certificate", "Recipe Notes", "Recorded Sessions"],
      image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Advanced Cake Decorating",
      duration: "6 Weeks",
      mode: "Offline Only",
      price: "₹9,999",
      timing: "Sat & Sun 11 AM - 3 PM",
      topics: ["Fondant Art", "Wedding Cake Design", "Tier Cakes", "Chocolate Garnishing"],
      features: ["Premium Tools Provided", "AC Classroom", "1-on-1 Mentorship"],
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Eggless Baking Program",
      duration: "3 Weeks",
      mode: "Online Only",
      price: "₹2,999",
      timing: "Daily 8 PM - 9:30 PM",
      topics: ["Eggless Sponges", "Healthy Alternatives", "Vegan Baking Basics"],
      features: ["Zoom Live Classes", "Lifetime Access", "WhatsApp Support"],
      image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=600"
    }
  ];

  return (
    <section className="py-24 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-brand-dark mb-4">Our Featured Courses</h2>
          <div className="w-24 h-1 bg-brand-gold mx-auto mb-6"></div>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:overflow-x-visible md:snap-none md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 scrollbar-hide">
          {courses.map((course, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="min-w-[85vw] sm:min-w-[60vw] md:min-w-0 snap-center shrink-0 bg-white rounded-3xl overflow-hidden shadow-xl border border-brand-gold/10 hover:shadow-2xl transition-shadow flex flex-col h-full"
            >
              <div className="relative h-48">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-brand-dark text-brand-gold px-3 py-1 rounded-full text-xs font-semibold">
                  {course.mode}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-serif text-brand-dark mb-3 leading-tight">{course.title}</h3>
                
                <div className="flex flex-wrap gap-3 mb-4 text-xs text-brand-brown">
                  <div className="flex items-center"><Clock size={14} className="mr-1 text-brand-gold"/> {course.duration}</div>
                  <div className="flex items-center"><Calendar size={14} className="mr-1 text-brand-gold"/> {course.timing}</div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-brand-dark mb-2">Topics Covered:</h4>
                  <ul className="text-xs text-brand-brown space-y-1">
                    {course.topics.map((topic, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-brand-gold mr-2">•</span> {topic}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-4 border-t border-brand-light flex items-center justify-between">
                  <div className="text-xl font-bold text-brand-dark">{course.price}</div>
                  <button className="bg-brand-gold text-brand-dark px-4 py-2 rounded-full font-medium text-sm hover:bg-brand-dark hover:text-brand-gold transition-colors">
                    Enroll Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Schedule = () => {
  const schedule = [
    { name: "Morning Batch", time: "10 AM - 12 PM", mode: "Offline", seats: 12 },
    { name: "Evening Batch", time: "5 PM - 7 PM", mode: "Offline", seats: 10 },
    { name: "Weekend Batch", time: "Sat - Sun 11 AM", mode: "Hybrid", seats: 15 },
    { name: "Online Live Batch", time: "8 PM - 9:30 PM", mode: "Online", seats: "Unlimited" },
  ];

  return (
    <section className="py-24 bg-brand-light">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-brand-dark mb-4">Class Schedule</h2>
          <div className="w-24 h-1 bg-brand-gold mx-auto mb-6"></div>
          <p className="text-brand-brown">Flexible timings tailored to fit your busy lifestyle.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-brand-gold/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-dark text-brand-gold">
                  <th className="p-5 font-semibold text-sm uppercase tracking-wider">Batch</th>
                  <th className="p-5 font-semibold text-sm uppercase tracking-wider">Timing</th>
                  <th className="p-5 font-semibold text-sm uppercase tracking-wider">Mode</th>
                  <th className="p-5 font-semibold text-sm uppercase tracking-wider">Seats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-light text-brand-dark">
                {schedule.map((row, i) => (
                  <tr key={i} className="hover:bg-brand-light/50 transition-colors">
                    <td className="p-5 font-medium">{row.name}</td>
                    <td className="p-5 text-brand-brown">{row.time}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        row.mode === 'Offline' ? 'bg-amber-100 text-amber-800' :
                        row.mode === 'Online' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {row.mode}
                      </span>
                    </td>
                    <td className="p-5 text-brand-brown">{row.seats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  return (
    <section className="py-24 bg-brand-dark text-brand-cream pt-24 pb-32">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-brand-gold mb-4">Student Success Stories</h2>
          <div className="w-24 h-1 bg-brand-gold mx-auto mb-6"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-brand-cream/5 p-8 rounded-2xl border border-brand-gold/20 relative">
            <div className="text-brand-gold flex mb-4">
              {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="currentColor" />)}
            </div>
            <p className="text-lg italic mb-6 leading-relaxed">
              "The online classes were easy to follow and very professional. The recorded sessions helped me practice at my own pace."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold font-bold text-xl mr-4">S</div>
              <div>
                <h4 className="font-semibold text-brand-gold">Sneha Kapoor</h4>
                <p className="text-sm text-brand-cream/60">Online Program Graduate</p>
              </div>
            </div>
          </div>

          <div className="bg-brand-cream/5 p-8 rounded-2xl border border-brand-gold/20 relative">
            <div className="text-brand-gold flex mb-4">
               {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="currentColor" />)}
            </div>
            <p className="text-lg italic mb-6 leading-relaxed">
              "I started my own home baking business immediately after completing the 6-week advanced decoration masterclass! Highly recommended."
            </p>
             <div className="flex items-center">
              <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold font-bold text-xl mr-4">R</div>
              <div>
                <h4 className="font-semibold text-brand-gold">Riya Sharma</h4>
                <p className="text-sm text-brand-cream/60">Advanced Course Graduate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const Footer = () => {
  return (
    <footer className="bg-[#1a110a] text-brand-cream/80 pt-20 pb-10 border-t border-brand-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center text-[#1a110a]">
                  <ChefHat size={24} />
                </div>
                <span className="font-serif text-2xl font-bold tracking-wider text-brand-gold">NIMU</span>
              </div>
            <p className="text-sm mb-6 leading-relaxed">
              Velvet Crumbs Baking Hub is a leading baking academy, committed to helping individuals become successful entrepreneurs, starting their earning journey from their own kitchens.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-brand-cream/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-dark transition-colors"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-brand-cream/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-dark transition-colors"><Facebook size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-brand-cream/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-dark transition-colors"><Twitter size={18} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-brand-gold font-serif text-lg mb-6">Head Office</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start"><MapPin size={18} className="mr-2 text-brand-gold shrink-0 mt-0.5" /> 435, 5th Cross Rd, HBR Layout 2nd Block, 1st Stage, HBR Layout, Bengaluru, Karnataka 560043</li>
            </ul>
          </div>

          <div>
            <h4 className="text-brand-gold font-serif text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-brand-gold transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-brand-gold transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-brand-gold transition-colors">Courses</a></li>
              <li><a href="#" className="hover:text-brand-gold transition-colors">Contact Us</a></li>
            </ul>
          </div>

           <div>
            <h4 className="text-brand-gold font-serif text-lg mb-6">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-brand-gold transition-colors">Terms of Use</a></li>
              <li><a href="#" className="hover:text-brand-gold transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-gold transition-colors">Refund Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-cream/10 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} by NIMU Bakery (Velvet Crumbs). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark font-sans selection:bg-brand-gold selection:text-brand-dark">
      <Nav />
      <Hero />
      <BakeryServices />
      <AcademyIntro />
      <CourseSection />
      <Schedule />
      <Testimonials />
      <Footer />
    </div>
  );
}
