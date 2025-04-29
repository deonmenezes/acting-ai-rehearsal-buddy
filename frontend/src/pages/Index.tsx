import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScriptSelection from '@/components/ScriptSelection';
import { Button } from '@/components/ui/button';
import { Film, Star, Mic } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-theater-gradient flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto my-8 text-center">
          <Film className="mx-auto h-16 w-16 text-theater-gold animate-pulse-gold mb-4" />
          <h1 className="text-3xl font-bold text-theater-gold mb-4">Welcome to AI Actor Rehearsal</h1>
          <p className="text-gray-300 mb-8">
            Practice famous movie scenes and improve your acting skills with AI-powered feedback.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="theater-card p-6 flex flex-col items-center">
              <Star className="h-8 w-8 text-theater-gold mb-2" />
              <h3 className="text-theater-gold font-semibold mb-2">Choose a Scene</h3>
              <p className="text-sm text-gray-400 text-center">
                Select from famous movie scenes across different genres
              </p>
            </div>
            
            <div className="theater-card p-6 flex flex-col items-center">
              <Mic className="h-8 w-8 text-theater-gold mb-2" />
              <h3 className="text-theater-gold font-semibold mb-2">Record Your Lines</h3>
              <p className="text-sm text-gray-400 text-center">
                Record yourself playing iconic characters
              </p>
            </div>
            
            <div className="theater-card p-6 flex flex-col items-center">
              <Star className="h-8 w-8 text-theater-gold mb-2" />
              <h3 className="text-theater-gold font-semibold mb-2">Get AI Feedback</h3>
              <p className="text-sm text-gray-400 text-center">
                Receive detailed analysis and scoring of your performance
              </p>
            </div>
          </div>
          
          <Link to="/get-started">
            <Button className="bg-theater-red hover:bg-theater-red/80 text-white mb-12">
              Get Started
            </Button>
          </Link>
        </div>
        
        {/* Script Selection Cards */}
        <ScriptSelection className="mt-8 mb-12" />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
