
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import ScriptSelection from '@/components/ScriptSelection';
import Script from '@/components/Script';
import PerformanceResult from '@/components/PerformanceResult';
import voiceRecorder from '@/services/voiceRecorder';
import performanceAnalysisService from '@/services/performanceAnalysisService';
import { scriptData } from '@/data/scriptData';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Film, Star } from 'lucide-react';

const Index = () => {
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
    <div className="min-h-screen bg-theater-gradient">
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        {!selectedScriptId ? (
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
            
            <Button 
              className="bg-theater-red hover:bg-theater-red/80 text-white"
              onClick={() => handleSelectScript(scriptData[0].id)}
            >
              Get Started
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ScriptSelection
                scripts={scriptData}
                selectedScript={selectedScriptId}
                onSelectScript={handleSelectScript}
              />
              
              {audioUrl && (
                <div className="theater-card p-4 mt-4">
                  <h3 className="text-lg font-semibold text-theater-gold mb-2">Last Recording</h3>
                  <audio src={audioUrl} controls className="w-full" />
                </div>
              )}
              
              <PerformanceResult
                overallScore={performanceResults?.overallScore || 0}
                categories={performanceResults?.categories || []}
                visible={showResults}
              />
            </div>
            
            <div className="lg:col-span-2">
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
            </div>
          </div>
        )}
      </main>
      <Toaster />
    </div>
  );
};

export default Index;
