import React from 'react';
import { Film, Mic, Star, ArrowRight, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-theater-gradient flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-theater-gold text-center mb-8">
            How It Works
          </h1>
          
          <p className="text-xl text-gray-300 text-center mb-16">
            Practice and improve your acting skills with AI-powered feedback in just a few simple steps.
          </p>
          
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row items-center mb-24">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
              <div className="theater-card p-6 inline-flex rounded-full mb-4">
                <Film className="h-10 w-10 text-theater-gold" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-theater-gold mb-4">
                1. Choose Your Scene
              </h2>
              <p className="text-gray-300 mb-4">
                Browse through our curated collection of iconic movie scenes across different genres. 
                Whether you want to try drama, comedy, or action, we've got scripts that showcase a 
                variety of acting techniques and emotions.
              </p>
              <p className="text-gray-300">
                Each script includes character information and context to help you understand 
                the scene better.
              </p>
            </div>
            <div className="md:w-1/2 theater-card p-6">
              <img 
                src="/placeholder.svg" 
                alt="Choose a script" 
                className="w-full rounded-lg shadow-glow-sm"
              />
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center mb-24">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pl-12">
              <div className="theater-card p-6 inline-flex rounded-full mb-4">
                <Mic className="h-10 w-10 text-theater-gold" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-theater-gold mb-4">
                2. Record Your Performance
              </h2>
              <p className="text-gray-300 mb-4">
                Once you've selected a scene, it's time to shine! The script will be displayed 
                with your lines highlighted. Simply click the record button and deliver your lines 
                with your best performance.
              </p>
              <p className="text-gray-300">
                You can record multiple takes until you're satisfied with your performance. 
                Our system will capture your audio for analysis.
              </p>
            </div>
            <div className="md:w-1/2 theater-card p-6">
              <img 
                src="/placeholder.svg" 
                alt="Record your performance" 
                className="w-full rounded-lg shadow-glow-sm"
              />
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col md:flex-row items-center mb-16">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
              <div className="theater-card p-6 inline-flex rounded-full mb-4">
                <Star className="h-10 w-10 text-theater-gold" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-theater-gold mb-4">
                3. Get AI Feedback
              </h2>
              <p className="text-gray-300 mb-4">
                After your performance, our advanced AI analyzes various aspects of your delivery 
                including emotion, pacing, clarity, and authenticity. Within seconds, you'll receive 
                detailed feedback on your performance.
              </p>
              <p className="text-gray-300">
                The analysis breaks down your strengths and areas for improvement, helping you 
                understand exactly how to enhance your acting skills.
              </p>
            </div>
            <div className="md:w-1/2 theater-card p-6">
              <img 
                src="/placeholder.svg" 
                alt="AI feedback" 
                className="w-full rounded-lg shadow-glow-sm"
              />
            </div>
          </div>
          
          {/* Benefits section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-theater-gold text-center mb-12">
              Why Practice With Us?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="theater-card p-6 flex flex-col items-center text-center">
                <div className="bg-theater-gold/10 p-4 rounded-full mb-4">
                  <Trophy className="h-8 w-8 text-theater-gold" />
                </div>
                <h3 className="text-xl font-semibold text-theater-gold mb-3">Improve Quickly</h3>
                <p className="text-gray-300">
                  Receive instant feedback and practice as much as you want, accelerating your growth as an actor.
                </p>
              </div>
              
              <div className="theater-card p-6 flex flex-col items-center text-center">
                <div className="bg-theater-gold/10 p-4 rounded-full mb-4">
                  <Film className="h-8 w-8 text-theater-gold" />
                </div>
                <h3 className="text-xl font-semibold text-theater-gold mb-3">Learn From Classics</h3>
                <p className="text-gray-300">
                  Practice with iconic scenes from cinema history, analyzing what made them powerful.
                </p>
              </div>
              
              <div className="theater-card p-6 flex flex-col items-center text-center">
                <div className="bg-theater-gold/10 p-4 rounded-full mb-4">
                  <Mic className="h-8 w-8 text-theater-gold" />
                </div>
                <h3 className="text-xl font-semibold text-theater-gold mb-3">Private Practice</h3>
                <p className="text-gray-300">
                  Perfect your craft in a judgment-free environment before performing for others.
                </p>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="text-center">
            <Button 
              className="bg-theater-red hover:bg-theater-red/80 text-white text-lg px-8 py-6"
              onClick={() => window.location.href = '/'}
            >
              Start Rehearsing Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HowItWorks;