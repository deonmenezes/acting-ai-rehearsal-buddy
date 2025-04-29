import React, { useState } from 'react';
import { Clapperboard, Menu, X, Video } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { AnimatePresence, motion } from 'framer-motion';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Function to check if a link is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-theater-gold/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <Clapperboard className="h-6 w-6 text-theater-gold" />
            <h1 className="text-xl font-bold text-theater-gold">AI Actor Rehearsal Buddy</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`transition duration-300 ${isActive('/') ? 'text-theater-gold font-medium' : 'text-gray-300 hover:text-theater-gold'}`}>Home</Link>
            <Link to="/how-it-works" className={`transition duration-300 ${isActive('/how-it-works') ? 'text-theater-gold font-medium' : 'text-gray-300 hover:text-theater-gold'}`}>How It Works</Link>
            <Link to="/scripts" className={`transition duration-300 ${isActive('/scripts') ? 'text-theater-gold font-medium' : 'text-gray-300 hover:text-theater-gold'}`}>Script Library</Link>
            <Link to="/facial-expression" className={`transition duration-300 ${isActive('/facial-expression') ? 'text-theater-gold font-medium' : 'text-gray-300 hover:text-theater-gold'}`}>
              <span className="flex items-center">
                <Video className="h-4 w-4 mr-1" />
                Facial Expressions
              </span>
            </Link>
            <Link to="/about" className={`transition duration-300 ${isActive('/about') ? 'text-theater-gold font-medium' : 'text-gray-300 hover:text-theater-gold'}`}>About</Link>
            <Link to="/get-started">
              <Button className="bg-theater-red hover:bg-theater-red/80 text-white font-medium shadow-lg shadow-theater-red/20">Get Started</Button>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-300 hover:text-theater-gold transition-colors duration-300 p-2 rounded-md hover:bg-theater-gold/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Navigation with Animation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-theater-gold/20 overflow-hidden"
            >
              <motion.nav 
                className="flex flex-col py-3"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
              >
                {[
                  { path: '/', label: 'Home' },
                  { path: '/how-it-works', label: 'How It Works' },
                  { path: '/scripts', label: 'Script Library' },
                  { path: '/facial-expression', label: 'Facial Expressions', icon: <Video className="h-4 w-4 mr-2" /> },
                  { path: '/about', label: 'About' },
                ].map((item) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link 
                      to={item.path} 
                      className={`flex items-center gap-2 py-3 px-4 my-1 rounded-md transition-all duration-300 ${
                        isActive(item.path) 
                          ? 'bg-theater-gold/10 border-l-4 border-theater-gold text-theater-gold font-medium' 
                          : 'text-gray-300 hover:bg-black/40 hover:text-theater-gold'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="px-3 pt-4"
                >
                  <Link 
                    to="/get-started"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block"
                  >
                    <Button 
                      className="bg-theater-red hover:bg-theater-red/80 text-white w-full py-6 rounded-md flex items-center justify-center font-medium shadow-lg shadow-theater-red/20 border border-theater-red/50"
                    >
                      Get Started
                    </Button>
                  </Link>
                </motion.div>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
