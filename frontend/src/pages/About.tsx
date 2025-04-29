import React from 'react';
import { Award, Sparkles, Users, BookOpen } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-theater-gradient flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-theater-gold text-center mb-8">
            About Us
          </h1>
          
          <div className="theater-card p-8 mb-16">
            <p className="text-xl text-gray-300 leading-relaxed mb-6">
              AI Actor Rehearsal Buddy was created by a team of actors, directors, and AI engineers who wanted to make professional-quality acting practice accessible to everyone.
            </p>
            <p className="text-xl text-gray-300 leading-relaxed">
              Our mission is to help actors of all experience levels improve their craft through technology-assisted practice, building confidence and skill through immediate, constructive feedback.
            </p>
          </div>
          
          {/* Our Values */}
          <h2 className="text-3xl font-bold text-theater-gold text-center mb-12">
            Our Values
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="theater-card p-6">
              <div className="flex items-start mb-4">
                <div className="bg-theater-gold/10 p-3 rounded-full mr-4">
                  <Sparkles className="h-7 w-7 text-theater-gold" />
                </div>
                <h3 className="text-xl font-semibold text-theater-gold">Innovation in Art</h3>
              </div>
              <p className="text-gray-300">
                We believe technology can enhance artistic expression and learning, not replace it. Our AI tools are designed to support the human creative process.
              </p>
            </div>
            
            <div className="theater-card p-6">
              <div className="flex items-start mb-4">
                <div className="bg-theater-gold/10 p-3 rounded-full mr-4">
                  <Award className="h-7 w-7 text-theater-gold" />
                </div>
                <h3 className="text-xl font-semibold text-theater-gold">Performance Excellence</h3>
              </div>
              <p className="text-gray-300">
                We're committed to helping actors achieve their personal best through detailed feedback, analysis, and targeted practice opportunities.
              </p>
            </div>
            
            <div className="theater-card p-6">
              <div className="flex items-start mb-4">
                <div className="bg-theater-gold/10 p-3 rounded-full mr-4">
                  <Users className="h-7 w-7 text-theater-gold" />
                </div>
                <h3 className="text-xl font-semibold text-theater-gold">Inclusive Community</h3>
              </div>
              <p className="text-gray-300">
                Acting is for everyone. We strive to make our platform accessible to actors from all backgrounds, experience levels, and learning styles.
              </p>
            </div>
            
            <div className="theater-card p-6">
              <div className="flex items-start mb-4">
                <div className="bg-theater-gold/10 p-3 rounded-full mr-4">
                  <BookOpen className="h-7 w-7 text-theater-gold" />
                </div>
                <h3 className="text-xl font-semibold text-theater-gold">Continuous Learning</h3>
              </div>
              <p className="text-gray-300">
                Our AI models are constantly improving, learning from thousands of performances to provide better, more nuanced feedback with each update.
              </p>
            </div>
          </div>
          
          {/* Our Team */}
          <h2 className="text-3xl font-bold text-theater-gold text-center mb-12">
            Our Team
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="theater-card p-6 text-center">
              <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/placeholder.svg" alt="Team member" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-theater-gold mb-2">Sarah Johnson</h3>
              <p className="text-gray-400 mb-3">Founder & Theater Director</p>
              <p className="text-gray-300 text-sm">
                20+ years in professional theater with a passion for actor development and coaching.
              </p>
            </div>
            
            <div className="theater-card p-6 text-center">
              <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/placeholder.svg" alt="Team member" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-theater-gold mb-2">Michael Chen</h3>
              <p className="text-gray-400 mb-3">AI Engineer & Actor</p>
              <p className="text-gray-300 text-sm">
                Combines technical expertise in machine learning with a background in stage and film acting.
              </p>
            </div>
            
            <div className="theater-card p-6 text-center">
              <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                <img src="/placeholder.svg" alt="Team member" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-theater-gold mb-2">Alex Rodriguez</h3>
              <p className="text-gray-400 mb-3">Voice & Performance Coach</p>
              <p className="text-gray-300 text-sm">
                Specializes in vocal technique and emotional expression for stage and screen actors.
              </p>
            </div>
          </div>
          
          {/* Contact Section */}
          <div className="theater-card p-8 text-center">
            <h2 className="text-2xl font-bold text-theater-gold mb-6">Get In Touch</h2>
            <p className="text-gray-300 mb-6">
              Have questions or feedback? We'd love to hear from you!
            </p>
            <p className="text-gray-300">
              <span className="text-theater-gold">Email:</span> contact@aiactor.com
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;