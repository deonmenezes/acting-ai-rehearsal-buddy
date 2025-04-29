import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScriptSelection from '@/components/ScriptSelection';
import Script from '@/components/Script';
import PerformanceResult from '@/components/PerformanceResult';
import voiceRecorder from '@/services/voiceRecorder';
import performanceAnalysisService from '@/services/performanceAnalysisService';
import { scriptData } from '@/data/scriptData';
import { Toaster } from '@/components/ui/toaster';
import { motion } from 'framer-motion';

const GetStarted = () => {
  const { toast } = useToast();
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [performanceResults, setPerformanceResults] = useState<{
    overallScore: number;
    categories: {
      name: string;
      score: number;
      feedback: string;
    }[];
  } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const selectedScript = scriptData.find(script => script.id === selectedScriptId);

  useEffect(() => {
    // Auto-select the first script when the page loads
    if (!selectedScriptId && scriptData.length > 0) {
      handleSelectScript(scriptData[0].id);
    }
    
    // Set up recorder callbacks
    voiceRecorder.onStatusChange((status) => {
      setIsRecording(status === 'recording');
    });

    voiceRecorder.onRecordingComplete((audioBlob) => {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      if (selectedScript && selectedScript.lines[currentLineIndex]) {
        const currentLine = selectedScript.lines[currentLineIndex];
        
        // Analyze the recorded performance
        performanceAnalysisService
          .analyzePerformance(audioBlob, currentLine.text)
          .then((results) => {
            setPerformanceResults(results);
            setShowResults(true);
            
            // Move to next line if available
            if (currentLineIndex < selectedScript.lines.length - 1) {
              const nextActorLineIndex = findNextActorLine(currentLineIndex + 1);
              setCurrentLineIndex(nextActorLineIndex);
            }
          });
      }
    });

    return () => {
      voiceRecorder.cleanUp();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [selectedScriptId, currentLineIndex]);

  const findNextActorLine = (startIndex: number) => {
    if (!selectedScript) return startIndex;
    
    for (let i = startIndex; i < selectedScript.lines.length; i++) {
      if (selectedScript.lines[i].isUserCharacter) {
        return i;
      }
    }
    
    return startIndex;
  };

  const handleStartRecording = async () => {
    const success = await voiceRecorder.startRecording();
    
    if (!success) {
      toast({
        title: "Could not access microphone",
        description: "Please make sure you have granted microphone permissions.",
        variant: "destructive",
      });
    } else {
      setShowResults(false);
      toast({
        title: "Recording started",
        description: "Speak your line now...",
      });
    }
  };

  const handleStopRecording = () => {
    voiceRecorder.stopRecording();
    toast({
      title: "Recording stopped",
      description: "Analyzing your performance...",
    });
  };

  const handleSelectScript = (scriptId: string) => {
    setSelectedScriptId(scriptId);
    setCurrentLineIndex(0);
    setShowResults(false);
    setPerformanceResults(null);
    
    // Find the first actor line
    const script = scriptData.find(s => s.id === scriptId);
    if (script) {
      const firstActorLineIndex = script.lines.findIndex(line => line.isUserCharacter);
      if (firstActorLineIndex !== -1) {
        setCurrentLineIndex(firstActorLineIndex);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10 bg-repeat"></div>
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">
              Rehearse Your Scene
            </h1>
            <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto">
              Perfect your performance with instant AI feedback. Select a script, record your lines, and get detailed analysis on your delivery.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="backdrop-blur-md bg-black/40 border border-purple-500/30 rounded-xl overflow-hidden shadow-xl"
                >
                  <div className="bg-gradient-to-r from-purple-800/50 to-amber-700/50 p-4">
                    <h2 className="text-xl font-bold text-white">Select Your Script</h2>
                  </div>
                  <div className="p-4">
                    <ScriptSelection
                      scripts={scriptData}
                      selectedScript={selectedScriptId}
                      onSelectScript={handleSelectScript}
                    />
                  </div>
                </motion.div>
                
                {audioUrl && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="backdrop-blur-md bg-black/40 border border-purple-500/30 rounded-xl overflow-hidden shadow-xl"
                  >
                    <div className="bg-gradient-to-r from-purple-800/50 to-amber-700/50 p-4">
                      <h2 className="text-xl font-bold text-white">Your Recording</h2>
                    </div>
                    <div className="p-4">
                      <audio src={audioUrl} controls className="w-full rounded-lg" />
                    </div>
                  </motion.div>
                )}
                
                <PerformanceResult
                  overallScore={performanceResults?.overallScore || 0}
                  categories={performanceResults?.categories || []}
                  visible={showResults}
                />
              </div>
              
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {selectedScript && (
                    <Script
                      lines={selectedScript.lines}
                      currentLineIndex={currentLineIndex}
                      isRecording={isRecording}
                      onStartRecording={handleStartRecording}
                      onStopRecording={handleStopRecording}
                      characterName={selectedScript.character}
                    />
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </main>
        
        <Footer />
        <Toaster />
      </div>
    </div>
  );
};

export default GetStarted;