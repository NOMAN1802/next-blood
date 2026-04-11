import React from 'react';
import { Link } from 'react-router-dom';
import FoundationLogo from '@/components/FoundationLogo';
import { Github, Twitter, Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 pt-12 md:pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-6 sm:col-span-2 lg:col-span-1">
            <FoundationLogo />
            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
              A Smarter Way To Donate Blood. Innovix Next Blood connects donors with patients in real-time, making blood donation accessible, transparent, and efficient for everyone.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <a href="https://www.facebook.com/share/17dC85pTa5/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:bg-red-600 hover:text-white transition-all duration-300 touch-manipulation" aria-label="Facebook">
                <Facebook size={18} />
              </a>

              <a href="https://www.instagram.com/nextbloodbd" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:bg-red-600 hover:text-white transition-all duration-300 touch-manipulation" aria-label="Instagram">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:pl-4">
            <h4 className="text-white font-bold mb-4 md:mb-6 text-base">Quick Links</h4>
            <ul className="space-y-3 md:space-y-4">
              <li>
                <Link to="/" className="text-neutral-400 hover:text-red-500 transition-colors text-sm py-1 block w-fit touch-manipulation">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-neutral-400 hover:text-red-500 transition-colors text-sm py-1 block w-fit touch-manipulation">About Us</Link>
              </li>
              <li>
                <Link to="/search" className="text-neutral-400 hover:text-red-500 transition-colors text-sm py-1 block w-fit touch-manipulation">Find Blood</Link>
              </li>
              <li>
                <Link to="/register" className="text-neutral-400 hover:text-red-500 transition-colors text-sm py-1 block w-fit touch-manipulation">Register as Donor</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-4 md:mb-6 text-base">Support</h4>
            <ul className="space-y-3 md:space-y-4">
              <li>
                <Link to="/privacy" className="text-neutral-400 hover:text-red-500 transition-colors text-sm py-1 block w-fit touch-manipulation">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="text-neutral-400 hover:text-red-500 transition-colors text-sm py-1 block w-fit touch-manipulation">Terms of Service</Link>
              </li>
              <li>
                <Link to="/founder" className="text-neutral-400 hover:text-red-500 transition-colors text-sm py-1 block w-fit touch-manipulation">Founder Info</Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-neutral-400 hover:text-red-500 transition-colors text-sm py-1 block w-fit touch-manipulation">Admin Portal</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="text-white font-bold mb-4 md:mb-6 text-base">Contact Us</h4>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex items-start gap-3 text-neutral-400 text-sm">
                <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span className="break-words">Jashore 7400, Bangladesh.</span>
              </li>
              <li className="flex items-center gap-3 text-neutral-400 text-sm break-all">
                <Mail className="w-5 h-5 text-red-500 shrink-0" />
                <span>nextbloodbd@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 text-neutral-400 text-sm">
                <Phone className="w-5 h-5 text-red-500 shrink-0" />
                <span>01753503305</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-900 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-xs md:text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Joy Dutta | Powered by Modern Innovix
          </p>
          <div className="flex items-center gap-6">
            <span className="text-neutral-600 text-xs text-center md:text-right">Developed with ❤️ for Humanity</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;