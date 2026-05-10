import React from 'react';
import { Instagram, Facebook, Twitter, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/image.png';

const Footer = () => {
  return (
    <footer id="footer" className="bg-[#1a110a] text-brand-cream/80 pt-20 pb-10 border-t border-brand-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-brand-gold/10 overflow-hidden flex items-center justify-center">
                  <img src={logo} alt="Nimu Logo" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
                <span className="font-serif text-2xl font-bold tracking-wider text-brand-gold uppercase">NIMU</span>
              </div>
            <p className="text-sm mb-6 leading-relaxed">
              Nimu Cooking Academy is Odisha's No.1 baking academy, committed to helping individuals become successful entrepreneurs, starting their earning journey from their own kitchens.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/nimu.cooking/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-brand-cream/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-dark transition-colors"><Instagram size={18} /></a>
              <a href="https://www.facebook.com/share/1KqsxGNfez/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-brand-cream/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-dark transition-colors"><Facebook size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-brand-cream/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-dark transition-colors"><Twitter size={18} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-brand-gold font-serif text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start">
                <MapPin size={18} className="mr-3 text-brand-gold shrink-0 mt-0.5" /> 
                Jhirpani, Rourkela 769042, Odisha
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-3 text-brand-gold shrink-0" />
                <a href="tel:+919777240070" className="hover:text-brand-gold transition-colors">9777240070</a>
              </li>
              <li className="flex items-center ml-7">
                <a href="tel:+918249517832" className="hover:text-brand-gold transition-colors">8249517832</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-brand-gold font-serif text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/#home" className="hover:text-brand-gold transition-colors">Home</a></li>
              <li><Link to="/about" className="hover:text-brand-gold transition-colors">About Us</Link></li>
              <li><a href="/course/basic-baking" className="hover:text-brand-gold transition-colors">Courses</a></li>
              <li><a href="/#footer" className="hover:text-brand-gold transition-colors">Contact Us</a></li>
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
          <p>&copy; 2026 by Nimu Cooking Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
