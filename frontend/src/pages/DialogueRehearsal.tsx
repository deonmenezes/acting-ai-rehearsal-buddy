import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  Mic, 
  MicOff, 
  Film, 
  AlertCircle, 
  RefreshCw, 
  Camera,
  BarChart,
  GitCompare as CompareIcon,
  Video as VideoIcon,
  Rewind,
  Sparkles,
  ThumbsUp,
  Download
} from "lucide-react";
import { motion } from 'framer-motion';
import PerformanceResult from "@/components/PerformanceResult";
import { scriptData } from "@/data/scriptData";
import voiceRecorderService, { RecordingResult, AudioAnalysisResult } from "@/services/voiceRecorder";
import { useFacialExpression } from "@/hooks/use-facial-expression";
import { ExpressionAnalysis } from "@/integrations/huggingface/types";

export default function DialogueRehearsalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [script, setScript] = useState(scriptData.find(s => s.id === id) || scriptData.find(s => s.id === 'don-dialogue-1'));
  
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recordedVideoRef = useRef<HTMLVideoElement | null>(null);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingResult, setRecordingResult] = useState<RecordingResult | null>(null);
  const [audioAnalysis, setAudioAnalysis] = useState<AudioAnalysisResult | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("perform");
  
  // Video recording state
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  // Facial expression state
  const { loading: facialLoading, error: facialError, result: facialResult, analyzeImage } = useFacialExpression();
  
  // Capture interval for facial expressions
  const [captureInterval, setCaptureInterval] = useState<number | null>(null);
  
  // Recommended movies
  const [recommendations, setRecommendations] = useState<{title: string, reason: string, match: number}[]>([
    { 
      title: "The Godfather", 
      reason: "Similar intense delivery and powerful presence", 
      match: 89 
    },
    { 
      title: "Sholay", 
      reason: "Iconic dialogue delivery style similar to Don", 
      match: 84 
    },
    { 
      title: "Deewar", 
      reason: "Features similar dramatic monologues", 
      match: 78 
    }
  ]);
  
  // Make sure we have a script
  useEffect(() => {
    if (!script) {
      navigate('/');
    }
  }, [script, navigate]);
  
  // Initialize microphone
  useEffect(() => {
    voiceRecorderService.initialize();
    
    return () => {
      voiceRecorderService.cleanUp();
      if (captureInterval) {
        clearInterval(captureInterval);
      }
      
      // Clean up video recording resources
      if (mediaRecorder) {
        mediaRecorder.ondataavailable = null;
        mediaRecorder.onstop = null;
      }
      
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, []);

  // Function to toggle reference video playback
  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };
  
  // Function to capture facial expressions
  const captureImage = () => {
    if (userVideoRef.current && canvasRef.current) {
      const video = userVideoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        const imageBase64 = canvas.toDataURL('image/jpeg');
        
        // Analyze the image
        analyzeImage(imageBase64);
      }
    }
  };
  
  // Start recording audio, video, and facial expressions
  const startRecording = async () => {
    try {
      // Start the reference video if it exists
      if (videoRef.current && script?.videoUrl) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
        setIsVideoPlaying(true);
      }
      
      // Start audio recording
      const success = voiceRecorderService.startRecording();
      if (!success) {
        throw new Error('Failed to start recording');
      }
      
      // Clear previous recordings
      setRecordedChunks([]);
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
        setVideoUrl(null);
      }
      
      // Start webcam and facial expression capture
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' },
          audio: true
        });
        
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
          
          // Set up video recording
          const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
          
          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              setRecordedChunks(prev => [...prev, event.data]);
            }
          };
          
          recorder.onstop = () => {
            const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(videoBlob);
            setVideoUrl(url);
            setRecordedBlob(videoBlob);
            
            if (recordedVideoRef.current) {
              recordedVideoRef.current.src = url;
            }
          };
          
          setMediaRecorder(recorder);
          recorder.start();
          
          // Start capturing facial expressions every 2 seconds
          const interval = window.setInterval(() => {
            captureImage();
          }, 2000);
          setCaptureInterval(interval);
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
      
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };
  
  // Stop recording and analyze performance
  const stopRecording = async () => {
    try {
      // Stop video
      if (videoRef.current) {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
      
      // Stop facial expression capture
      if (captureInterval) {
        clearInterval(captureInterval);
        setCaptureInterval(null);
      }
      
      // Stop video recording
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      
      // Stop webcam
      if (userVideoRef.current && userVideoRef.current.srcObject) {
        const stream = userVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        userVideoRef.current.srcObject = null;
      }
      
      // Stop audio recording and analyze
      const result = await voiceRecorderService.stopRecording();
      setRecordingResult(result);
      
      const analysis = await voiceRecorderService.analyzeAudio(result);
      setAudioAnalysis(analysis);
      
      setIsRecording(false);
      
      // Switch to results tab automatically
      setActiveTab("results");
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
    }
  };
  
  // Download recorded video
  const downloadVideo = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${script?.title || 'don-dialogue'}-recording.webm`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    }
  };
  
  // Generate combined score categories based on audio and facial analysis
  const generateScoreCategories = () => {
    if (!audioAnalysis) return [];
    
    const categories = [
      {
        name: "Emotional Delivery",
        score: audioAnalysis.emotionalDelivery,
        feedback: facialResult?.dominant === "Angry" || facialResult?.dominant === "Intense" 
          ? "Excellent intensity in your delivery that matches the passionate tone of the original."
          : "Try to add more emotional intensity to match the original dialogue's passion."
      },
      {
        name: "Clarity",
        score: audioAnalysis.clarity,
        feedback: "Your pronunciation was clear and articulate."
      },
      {
        name: "Pacing",
        score: audioAnalysis.pacing,
        feedback: "The rhythm of your delivery was natural and engaging."
      },
      {
        name: "Facial Expression",
        score: facialResult ? (facialResult.dominant === "Angry" || facialResult.dominant === "Intense" ? 85 : 70) : 65,
        feedback: facialResult 
          ? `Your dominant expression was ${facialResult.dominant}. The original performance had intense expressions.`
          : "We couldn't analyze your facial expression. Try in better lighting."
      },
      {
        name: "Character Authenticity",
        score: Math.round((audioAnalysis.emotionalDelivery + audioAnalysis.clarity) / 2),
        feedback: "Your portrayal captured some of the character's essence."
      }
    ];
    
    return categories;
  };
  
  if (!script) {
    return (
      <div className="min-h-screen bg-theater-gradient flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-white">Loading script data...</div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-theater-gradient flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto p-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-2 text-theater-light">{script.title}</h1>
        <p className="text-gray-300 mb-6">
          <span className="text-amber-400">{script.movie}</span> ({script.year}) - 
          Character: <span className="text-purple-400">{script.character}</span>
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="perform" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <Mic className="mr-2 h-4 w-4" />
              Perform
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <BarChart className="mr-2 h-4 w-4" />
              Results
            </TabsTrigger>
            <TabsTrigger value="compare" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              <CompareIcon className="mr-2 h-4 w-4" />
              Compare & Recommend
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="perform" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reference Video */}
              <Card className="overflow-hidden shadow-xl bg-black/40 border-amber-500/30 backdrop-blur-md">
                <CardHeader className="bg-gradient-to-r from-amber-900/50 to-amber-700/30 p-4">
                  <CardTitle className="text-xl font-bold text-white flex items-center">
                    <Film className="h-5 w-5 mr-2 text-amber-400" />
                    Reference Performance
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Watch the original performance to study the delivery
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {script.videoUrl ? (
                    <div className="relative rounded-lg overflow-hidden border-2 border-amber-500/30">
                      <video 
                        ref={videoRef} 
                        src={script.videoUrl}
                        className="w-full h-auto"
                        onEnded={() => setIsVideoPlaying(false)}
                        controls
                      />
                      
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          className="bg-black/60 hover:bg-black/80"
                          onClick={toggleVideoPlay}
                        >
                          {isVideoPlaying ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Play
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-400 border-2 border-amber-500/10 rounded-lg">
                      <div className="text-center">
                        <Film className="mx-auto h-12 w-12 mb-2 opacity-20" />
                        <p>No reference video available</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2 p-3 bg-black/30 rounded-lg border border-amber-500/20">
                    <h3 className="font-medium text-amber-400">Dialogue:</h3>
                    <div className="space-y-2">
                      {script.lines.map((line) => (
                        <div 
                          key={line.id} 
                          className={`p-2 rounded ${
                            line.isUserCharacter 
                              ? "bg-amber-500/10 border border-amber-500/30" 
                              : "bg-gray-800/30"
                          }`}
                        >
                          <span className={line.isUserCharacter ? "text-amber-400" : "text-gray-300"}>
                            <strong>{line.character}:</strong> {line.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Your performance */}
              <Card className="overflow-hidden shadow-xl bg-black/40 border-purple-500/30 backdrop-blur-md">
                <CardHeader className="bg-gradient-to-r from-purple-800/50 to-purple-600/30 p-4">
                  <CardTitle className="text-xl font-bold text-white flex items-center">
                    <Camera className="h-5 w-5 mr-2 text-purple-400" />
                    Your Performance
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Record yourself performing the dialogue
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="relative rounded-lg overflow-hidden border-2 border-purple-500/30 min-h-[200px] flex items-center justify-center">
                    {isRecording ? (
                      <video 
                        ref={userVideoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-auto"
                      />
                    ) : videoUrl ? (
                      <div className="w-full">
                        <video 
                          ref={recordedVideoRef} 
                          src={videoUrl} 
                          controls 
                          className="w-full mb-2"
                          autoPlay
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">
                            Recording completed: {recordingResult?.duration.toFixed(1)}s
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                            onClick={downloadVideo}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download Video
                          </Button>
                        </div>
                      </div>
                    ) : recordingResult ? (
                      <div className="p-4 text-center">
                        <div className="mb-3">
                          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-400 mb-2">
                            <ThumbsUp className="h-6 w-6" />
                          </span>
                          <h3 className="text-xl font-medium text-white">Recording Complete!</h3>
                          <p className="text-gray-400 text-sm mt-1">Duration: {recordingResult.duration.toFixed(1)}s</p>
                        </div>
                        
                        <audio 
                          src={recordingResult.audioUrl} 
                          controls 
                          className="w-full mb-2"
                        />
                        
                        <p className="text-gray-400 text-sm">
                          Go to the Results tab to see your performance analysis
                        </p>
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <Camera className="mx-auto h-12 w-12 mb-3 text-purple-400/50" />
                        <p className="text-gray-300 mb-3">Ready to record your performance</p>
                        <p className="text-gray-400 text-sm">
                          Press "Start Recording" when you're ready to begin
                        </p>
                      </div>
                    )}
                    
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {facialLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <RefreshCw className="w-10 h-10 text-purple-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {isRecording ? (
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={stopRecording}
                      >
                        <MicOff className="mr-2 h-5 w-5" />
                        Stop Recording
                      </Button>
                    ) : (
                      <Button 
                        variant="default" 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={startRecording}
                        disabled={isRecording}
                      >
                        <Mic className="mr-2 h-5 w-5" />
                        Start Recording
                      </Button>
                    )}
                  </div>
                  
                  {facialError && (
                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/40">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-400">
                        {facialError}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="bg-purple-950/20 p-4 border-t border-purple-500/20">
                  <div className="text-sm text-gray-400">
                    <p>
                      <span className="text-purple-400">Tip:</span> Try to match the emotional intensity 
                      and delivery style of the original performance.
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6">
            {audioAnalysis ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <PerformanceResult 
                    overallScore={audioAnalysis.overallScore}
                    categories={generateScoreCategories()}
                    visible={true}
                  />
                </div>
                
                <Card className="overflow-hidden shadow-xl bg-black/40 border-amber-500/30 backdrop-blur-md">
                  <CardHeader className="bg-gradient-to-r from-amber-900/50 to-amber-700/30 p-4">
                    <CardTitle className="text-lg font-bold text-white flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-amber-400" />
                      Performance Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4 text-sm">
                      <p className="text-gray-300">
                        Your performance of "{script.title}" captured {audioAnalysis.overallScore >= 75 ? "many" : "some"} elements of the original delivery.
                      </p>
                      
                      <div className="p-3 border border-amber-500/30 rounded-lg bg-amber-950/20">
                        <h4 className="font-medium text-amber-400 mb-2">Strengths:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-gray-300">
                          {audioAnalysis.clarity >= 75 && (
                            <li>Excellent clarity and pronunciation</li>
                          )}
                          {audioAnalysis.emotionalDelivery >= 75 && (
                            <li>Strong emotional intensity that matches the character</li>
                          )}
                          {audioAnalysis.pacing >= 75 && (
                            <li>Good pacing and rhythm in your delivery</li>
                          )}
                          {facialResult?.dominant === "Angry" || facialResult?.dominant === "Intense" ? (
                            <li>Your facial expressions conveyed the intensity needed for this role</li>
                          ) : null}
                        </ul>
                      </div>
                      
                      <div className="p-3 border border-purple-500/30 rounded-lg bg-purple-950/20">
                        <h4 className="font-medium text-purple-400 mb-2">Areas to Improve:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-gray-300">
                          {audioAnalysis.clarity < 75 && (
                            <li>Work on clarity and articulation</li>
                          )}
                          {audioAnalysis.emotionalDelivery < 75 && (
                            <li>Add more emotional depth to your delivery</li>
                          )}
                          {audioAnalysis.pacing < 75 && (
                            <li>Adjust your pacing to create more impact</li>
                          )}
                          {!(facialResult?.dominant === "Angry" || facialResult?.dominant === "Intense") && (
                            <li>Try to incorporate more intensity in your facial expressions</li>
                          )}
                        </ul>
                      </div>
                      
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          className="w-full bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                          onClick={() => setActiveTab("perform")}
                        >
                          <Rewind className="mr-2 h-4 w-4" />
                          Try Again
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <VideoIcon className="mx-auto h-12 w-12 mb-4 text-gray-500 opacity-30" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">No Performance Recorded Yet</h3>
                <p className="text-gray-400 mb-6">Record your performance in the "Perform" tab to see results</p>
                
                <Button
                  variant="outline"
                  className="bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                  onClick={() => setActiveTab("perform")}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Go to Perform Tab
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="compare" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <Card className="overflow-hidden shadow-xl bg-black/40 border-blue-500/30 backdrop-blur-md">
                  <CardHeader className="bg-gradient-to-r from-blue-900/50 to-blue-600/30 p-4">
                    <CardTitle className="text-xl font-bold text-white flex items-center">
                      <CompareIcon className="h-5 w-5 mr-2 text-blue-400" />
                      Performance Comparison
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      See how your performance compares to the original
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    {audioAnalysis ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-lg font-medium text-amber-400 mb-3">Original Performance</h3>
                            <div className="space-y-3">
                              <div className="p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                                <h4 className="text-sm font-medium text-amber-400 mb-1">Delivery Style</h4>
                                <p className="text-sm text-gray-300">Intense, commanding, and powerful with emphasis on key words</p>
                              </div>
                              
                              <div className="p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                                <h4 className="text-sm font-medium text-amber-400 mb-1">Emotional Tone</h4>
                                <p className="text-sm text-gray-300">Confident, assertive with underlying threat</p>
                              </div>
                              
                              <div className="p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                                <h4 className="text-sm font-medium text-amber-400 mb-1">Facial Expression</h4>
                                <p className="text-sm text-gray-300">Intense gaze, slight smirk, minimal movement</p>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-medium text-purple-400 mb-3">Your Performance</h3>
                            <div className="space-y-3">
                              <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                                <h4 className="text-sm font-medium text-purple-400 mb-1">Delivery Style</h4>
                                <p className="text-sm text-gray-300">
                                  {audioAnalysis.clarity >= 75 
                                    ? "Clear and well-articulated with good emphasis" 
                                    : "Could use more clarity and emphasis on key words"}
                                </p>
                              </div>
                              
                              <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                                <h4 className="text-sm font-medium text-purple-400 mb-1">Emotional Tone</h4>
                                <p className="text-sm text-gray-300">
                                  {audioAnalysis.emotionalDelivery >= 75 
                                    ? "Good emotional intensity and confidence" 
                                    : "Could benefit from more emotional depth and confidence"}
                                </p>
                              </div>
                              
                              <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                                <h4 className="text-sm font-medium text-purple-400 mb-1">Facial Expression</h4>
                                <p className="text-sm text-gray-300">
                                  {facialResult
                                    ? `Primarily ${facialResult.dominant} expression, ${
                                        facialResult.dominant === "Angry" || facialResult.dominant === "Intense"
                                          ? "which matches the intense nature of the dialogue"
                                          : "which could be more intense to match the dialogue"
                                      }`
                                    : "No facial expression data available"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                          <h3 className="text-lg font-medium text-blue-400 mb-3">Key Takeaways</h3>
                          <ul className="list-disc pl-5 space-y-2 text-gray-300">
                            <li>
                              {audioAnalysis.overallScore >= 80 
                                ? "Your delivery captured the essence of the original performance effectively"
                                : "Try to incorporate more of the original's commanding presence"}
                            </li>
                            <li>
                              {audioAnalysis.emotionalDelivery >= 75 
                                ? "Your emotional delivery was effective and engaging"
                                : "Focus on building more emotional intensity in your delivery"}
                            </li>
                            <li>
                              {facialResult?.dominant === "Angry" || facialResult?.dominant === "Intense"
                                ? "Your facial expressions effectively conveyed the intensity needed"
                                : "Work on matching your facial expressions to the emotional tone of the dialogue"}
                            </li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CompareIcon className="mx-auto h-12 w-12 mb-4 text-gray-500 opacity-30" />
                        <h3 className="text-xl font-medium text-gray-300 mb-2">No Performance to Compare</h3>
                        <p className="text-gray-400 mb-6">Record your performance in the "Perform" tab to enable comparison</p>
                        
                        <Button
                          variant="outline"
                          className="bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                          onClick={() => setActiveTab("perform")}
                        >
                          <Mic className="mr-2 h-4 w-4" />
                          Go to Perform Tab
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2">
                <Card className="overflow-hidden shadow-xl bg-black/40 border-green-500/30 backdrop-blur-md">
                  <CardHeader className="bg-gradient-to-r from-green-900/50 to-green-600/30 p-4">
                    <CardTitle className="text-xl font-bold text-white flex items-center">
                      <Film className="h-5 w-5 mr-2 text-green-400" />
                      Movie Recommendations
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Based on your performance style
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {recommendations.map((movie, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.2, duration: 0.5 }}
                          className="p-3 border border-green-500/30 rounded-lg bg-green-900/10 hover:bg-green-900/20 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-green-400">{movie.title}</h4>
                              <p className="text-sm text-gray-300 mt-1">{movie.reason}</p>
                            </div>
                            <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                              {movie.match}% match
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {!audioAnalysis && (
                        <div className="text-center py-4">
                          <p className="text-gray-400 text-sm">
                            Record a performance to get personalized movie recommendations
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}