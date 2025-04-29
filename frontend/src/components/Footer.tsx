import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Mail, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-theater-gold mb-4">AI Actor Rehearsal</h3>
            <p className="text-sm">
              Practice your acting skills with AI-powered feedback. Perfect for actors of all levels.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-theater-gold transition">Home</Link></li>
              <li><Link to="/how-it-works" className="hover:text-theater-gold transition">How It Works</Link></li>
              <li><Link to="/scripts" className="hover:text-theater-gold transition">Script Library</Link></li>
              <li><Link to="/about" className="hover:text-theater-gold transition">About Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-white mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="hover:text-theater-gold transition">FAQ</Link></li>
              <li><Link to="/privacy" className="hover:text-theater-gold transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-theater-gold transition">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-theater-gold transition">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-white mb-3">Connect</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-theater-gold transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-theater-gold transition">
                <Github size={20} />
              </a>
              <a href="mailto:info@aiactor.com" className="text-gray-400 hover:text-theater-gold transition">
                <Mail size={20} />
              </a>
            </div>
            <p className="text-xs">
              Subscribe to our newsletter for the latest updates.
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-800 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} AI Actor Rehearsal Buddy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;