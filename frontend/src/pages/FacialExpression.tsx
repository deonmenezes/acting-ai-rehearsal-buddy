import React, { useRef, useState, useEffect } from 'react';
import { useFacialExpression } from '../hooks/use-facial-expression';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Camera, 
  RefreshCw, 
  PauseCircle, 
  PlayCircle, 
  AlertCircle,
  Save,
  Video,
  BarChart,
  CameraOff,
  Clock,
  Mic,
  MicOff,
  Volume2,
  Smile,
  Trophy,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import voiceRecorder, { RecordingResult, AudioEmotionResult } from '@/services/voiceRecorder';

// Array of available expressions for the game
const AVAILABLE_EXPRESSIONS = ['happy', 'sad', 'angry'];

// Points configuration
const POINTS_CONFIG = {
  correct: 10,
  wrong: -5,
  timeBonus: 5,
};

export default function FacialExpressionPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureInterval, setCaptureInterval] = useState<number | null>(null);
  const { loading, error, result, history, analyzeImage } = useFacialExpression();
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordedFrames, setRecordedFrames] = useState<{imageBase64: string, timestamp: number}[]>([]);
  const [isAnalyzingBatch, setIsAnalyzingBatch] = useState(false);
  const [batchAnalysisError, setBatchAnalysisError] = useState<string | null>(null);
  const [summaryAnalysis, setSummaryAnalysis] = useState<{
    dominantExpression: string;
    allExpressions: {expression: string, averageConfidence: number}[];
    timeline?: {timestamp: number, dominant: string, confidences: Record<string, number>}[];
    totalFrames: number;
  } | null>(null);
  
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [audioAnalysisResult, setAudioAnalysisResult] = useState<AudioEmotionResult | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  
  // New state variables for expression matching game
  const [selectedExpression, setSelectedExpression] = useState<string | null>(null);
  const [userScore, setUserScore] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [gameDuration, setGameDuration] = useState(10000); // 10 seconds
  const [isGameActive, setIsGameActive] = useState(false);
  const [currentExpressionIndex, setCurrentExpressionIndex] = useState(0);
  const [userFeedback, setUserFeedback] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(10); // 10 seconds per expression
  const [gameFeedback, setGameFeedback] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [gameTimer, setGameTimer] = useState<number | null>(null);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showNextButton, setShowNextButton] = useState(false);
  const [isManualCaptureMode, setIsManualCaptureMode] = useState(false);
  
  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };
    
    setupCamera();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (captureInterval) {
        clearInterval(captureInterval);
      }
      
      setRecordedFrames([]);
    };
  }, []);
  
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageBase64 = canvas.toDataURL('image/jpeg');
        
        analyzeImage(imageBase64);
        
        if (isRecording) {
          setRecordedFrames(prev => [...prev, {
            imageBase64,
            timestamp: Date.now()
          }]);
        }
      }
    }
  };
  
  const toggleCapture = () => {
    if (isCapturing) {
      if (captureInterval) {
        clearInterval(captureInterval);
        setCaptureInterval(null);
      }
    } else {
      const interval = window.setInterval(() => {
        captureImage();
      }, 2000);
      setCaptureInterval(interval);
    }
    
    setIsCapturing(!isCapturing);
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (captureInterval) {
        clearInterval(captureInterval);
        setCaptureInterval(null);
      }
      setIsCapturing(false);
      
      if (recordedFrames.length > 0) {
        analyzeBatch();
      }
    } else {
      setIsRecording(true);
      setRecordedFrames([]);
      setSummaryAnalysis(null);
      
      const interval = window.setInterval(() => {
        captureImage();
      }, 1000);
      setCaptureInterval(interval);
      setIsCapturing(true);
    }
  };
  
  const analyzeBatch = async () => {
    if (recordedFrames.length === 0) {
      setBatchAnalysisError("No frames to analyze");
      return;
    }
    
    setIsAnalyzingBatch(true);
    setBatchAnalysisError(null);
    
    try {
      console.log(`Analyzing ${recordedFrames.length} frames...`);
      
      const response = await fetch('http://localhost:5000/api/analyze-facial-expressions-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frames: recordedFrames })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Batch analysis result:', result);
      
      setSummaryAnalysis(result);
    } catch (error) {
      console.error('Error analyzing batch:', error);
      setBatchAnalysisError(error instanceof Error ? error.message : 'Unknown error');
      
      generateFallbackAnalysis();
    } finally {
      setIsAnalyzingBatch(false);
    }
  };
  
  const generateFallbackAnalysis = () => {
    if (history.length === 0) return;
    
    const expressionMap: Record<string, {count: number, totalConfidence: number}> = {};
    
    history.forEach(item => {
      item.all.forEach(expr => {
        if (!expressionMap[expr.expression]) {
          expressionMap[expr.expression] = { count: 0, totalConfidence: 0 };
        }
        expressionMap[expr.expression].count += 1;
        expressionMap[expr.expression].totalConfidence += expr.confidence;
      });
    });
    
    const expressionAverages = Object.keys(expressionMap).map(expression => {
      const data = expressionMap[expression];
      return {
        expression,
        averageConfidence: data.totalConfidence / data.count
      };
    });
    
    expressionAverages.sort((a, b) => b.averageConfidence - a.averageConfidence);
    
    const dominantExpression = expressionAverages.length > 0 
      ? expressionAverages[0].expression 
      : "Unknown";
    
    setSummaryAnalysis({
      dominantExpression,
      allExpressions: expressionAverages,
      totalFrames: history.length
    });
  };
  
  const startAudioRecording = async () => {
    setIsAudioRecording(true);
    setRecordedAudio(null);
    setAudioAnalysisResult(null);
    
    try {
      await voiceRecorder.startRecording();
    } catch (error) {
      console.error('Error starting audio recording:', error);
      setIsAudioRecording(false);
    }
  };
  
  const stopAudioRecording = async () => {
    setIsAudioRecording(false);
    
    try {
      const result = await voiceRecorder.stopRecording();
      setRecordedAudio(result.audioBlob);
      
      // Analyze audio in the background
      analyzeAudio(result);
    } catch (error) {
      console.error('Error stopping audio recording:', error);
    }
  };
  
  const toggleAudioRecording = async () => {
    if (isAudioRecording) {
      await stopAudioRecording();
    } else {
      await startAudioRecording();
    }
  };
  
  const analyzeAudio = async (recording: RecordingResult) => {
    try {
      const result = await voiceRecorder.analyzeAudioEmotion(recording);
      setAudioAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing audio:', error);
    }
  };
  
  useEffect(() => {
    // Initialize voice recorder
    const initAudio = async () => {
      await voiceRecorder.initialize();
    };
    
    initAudio();
    
    return () => {
      voiceRecorder.cleanUp();
    };
  }, []);
  
  // New functions for the expression matching game
  const startGame = () => {
    setIsGameActive(true);
    setUserScore(0);
    setCurrentExpressionIndex(0);
    setConsecutiveCorrect(0);
    setGameStartTime(Date.now());
    setTimeRemaining(10);
    setGameFeedback({message: 'Match your expression to the target!', type: 'info'});
    
    // Start the game timer
    const timer = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up for this expression
          evaluateExpression(true);
          return 10; // Reset timer
        }
        return prev - 1;
      });
    }, 1000);
    
    setGameTimer(timer);
    
    // Only start auto-capturing if not in manual mode
    if (!isManualCaptureMode) {
      if (!isCapturing) {
        const interval = window.setInterval(() => {
          captureImage();
        }, 1000);
        setCaptureInterval(interval);
        setIsCapturing(true);
      }
    } else {
      // For manual mode, just make sure we have a starting capture
      captureImage();
    }
  };
  
  const stopGame = () => {
    setIsGameActive(false);
    setGameFeedback(null);
    
    if (gameTimer) {
      clearInterval(gameTimer);
      setGameTimer(null);
    }
    
    // Save high score if applicable
    if (userScore > highScore) {
      setHighScore(userScore);
    }
    
    // Stop capturing if we started for the game
    if (captureInterval) {
      clearInterval(captureInterval);
      setCaptureInterval(null);
      setIsCapturing(false);
    }
  };
  
  const evaluateExpression = (timeUp: boolean = false) => {
    if (!result || !isGameActive) return;
    
    const targetExpression = AVAILABLE_EXPRESSIONS[currentExpressionIndex];
    const userExpression = result.dominant.toLowerCase();
    const isCorrect = userExpression === targetExpression;
    
    let scoreChange = 0;
    let message = '';
    
    if (isCorrect) {
      // User matched expression correctly
      scoreChange = POINTS_CONFIG.correct;
      message = `Great job! +${scoreChange} points`;
      
      // Bonus for consecutive correct expressions
      const newConsecutiveCorrect = consecutiveCorrect + 1;
      if (newConsecutiveCorrect > 1) {
        const bonus = Math.min(newConsecutiveCorrect * 2, 10); // Cap bonus at 10
        scoreChange += bonus;
        message = `Excellent! Streak x${newConsecutiveCorrect}! +${scoreChange} points`;
      }
      
      // Bonus for time remaining
      if (timeRemaining > 5) {
        const timeBonus = POINTS_CONFIG.timeBonus;
        scoreChange += timeBonus;
        message += ` (includes ${timeBonus} time bonus)`;
      }
      
      setConsecutiveCorrect(newConsecutiveCorrect);
      
      // Set a flag to show the Next button
      setShowNextButton(true);
    } else {
      // User didn't match expression
      if (timeUp) {
        scoreChange = 0;
        message = "Time's up!";
      } else {
        scoreChange = POINTS_CONFIG.wrong;
        message = `Try again! ${scoreChange} points`;
      }
      setConsecutiveCorrect(0);
      setShowNextButton(false);
    }
    
    setUserScore(prev => prev + scoreChange);
    setGameFeedback({
      message: message,
      type: isCorrect ? 'success' : 'error'
    });
    
    // Move to next expression or end game only if timeUp or if Next button is clicked
    if (timeUp) {
      moveToNextExpression(scoreChange);
    }
  };
  
  const moveToNextExpression = (scoreChange: number) => {
    const nextIndex = currentExpressionIndex + 1;
    if (nextIndex < AVAILABLE_EXPRESSIONS.length) {
      setCurrentExpressionIndex(nextIndex);
      setTimeRemaining(10); // Reset timer for next expression
      setShowNextButton(false);
    } else {
      // End of game
      stopGame();
      setGameFeedback({
        message: `Game over! Final score: ${userScore + scoreChange}`,
        type: 'info'
      });
    }
  };
  
  // Clean up game timers on unmount
  useEffect(() => {
    return () => {
      if (gameTimer) {
        clearInterval(gameTimer);
      }
    };
  }, [gameTimer]);
  
  return (
    <div className="min-h-screen bg-theater-gradient flex flex-col">
      <Header />
      
      <div className="flex-grow container mx-auto p-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6 text-theater-light">Facial Expression Analysis</h1>
        
        {/* Expression Matching Game Card */}
        <Card className="overflow-hidden shadow-xl bg-black/40 border-purple-500/30 backdrop-blur-md mb-6">
          <CardHeader className="bg-gradient-to-r from-green-800/50 to-amber-700/50 p-4">
            <CardTitle className="text-xl font-bold text-white flex items-center">
              <Smile className="h-5 w-5 mr-2 text-green-400" />
              Expression Matching Game
              {isGameActive && (
                <span className="ml-auto flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-amber-400" />
                  <span className={`font-bold ${timeRemaining <= 3 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                    {timeRemaining}s
                  </span>
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-gray-300">
              Match your facial expressions to the target images
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Score Display */}
            <div className="flex justify-between mb-4">
              <div className="bg-black/30 rounded-lg px-4 py-2 border border-green-500/30">
                <div className="text-xs text-gray-400">Current Score</div>
                <div className="text-2xl font-bold text-green-400">{userScore}</div>
              </div>
              <div className="bg-black/30 rounded-lg px-4 py-2 border border-amber-500/30">
                <div className="text-xs text-gray-400">High Score</div>
                <div className="text-2xl font-bold text-amber-400">{highScore}</div>
              </div>
              {consecutiveCorrect > 0 && (
                <div className="bg-black/30 rounded-lg px-4 py-2 border border-purple-500/30">
                  <div className="text-xs text-gray-400">Streak</div>
                  <div className="text-2xl font-bold text-purple-400">{consecutiveCorrect}x</div>
                </div>
              )}
            </div>
            
            {/* Game Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Expression */}
              <div className="space-y-2">
                <h3 className="text-sm text-gray-300 font-medium">Target Expression</h3>
                <div className="aspect-square bg-black/20 rounded-lg border-2 border-amber-500/50 flex items-center justify-center overflow-hidden">
                  {isGameActive ? (
                    <img 
                      src={`/movie expressions/${AVAILABLE_EXPRESSIONS[currentExpressionIndex]}.png`}
                      alt={`Target ${AVAILABLE_EXPRESSIONS[currentExpressionIndex]} expression`}
                      className="max-w-full max-h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Smile className="mx-auto h-16 w-16 text-gray-500/50 mb-2" />
                      <p className="text-gray-400">Press Start to play</p>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  {isGameActive && (
                    <div className="text-lg font-bold text-amber-400 uppercase tracking-wider">
                      {AVAILABLE_EXPRESSIONS[currentExpressionIndex]}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Your Expression */}
              <div className="space-y-2">
                <h3 className="text-sm text-gray-300 font-medium">Your Expression</h3>
                <div className="aspect-square bg-black/20 rounded-lg border-2 border-green-500/50 flex items-center justify-center overflow-hidden">
                  {(result && isGameActive) ? (
                    <div className="relative w-full h-full">
                      <div 
                        className="absolute inset-0 flex items-center justify-center text-center"
                        style={{
                          backgroundColor: AVAILABLE_EXPRESSIONS[currentExpressionIndex] === result.dominant.toLowerCase() 
                            ? 'rgba(34, 197, 94, 0.2)'  // green success background
                            : 'rgba(239, 68, 68, 0.2)'  // red error background
                        }}
                      >
                        <div>
                          <div className="text-xl font-bold text-white">{result.dominant}</div>
                          <div className="text-sm text-gray-300">{Math.round(result.all[0]?.confidence * 100)}% confidence</div>
                        </div>
                      </div>
                      {/* Canvas could go here to render face landmarks if you want to add them later */}
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <CameraOff className="mx-auto h-16 w-16 text-gray-500/50 mb-2" />
                      <p className="text-gray-400">Waiting for camera detection...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Feedback Area */}
            {gameFeedback && (
              <div className={`p-3 rounded-lg text-center ${
                gameFeedback.type === 'success' 
                  ? 'bg-green-900/30 border border-green-500/30 text-green-400' 
                  : gameFeedback.type === 'error'
                    ? 'bg-red-900/30 border border-red-500/30 text-red-400'
                    : 'bg-blue-900/30 border border-blue-500/30 text-blue-400'
              }`}>
                <div className="flex items-center justify-center">
                  {gameFeedback.type === 'success' && <ThumbsUp className="h-5 w-5 mr-2" />}
                  {gameFeedback.type === 'error' && <ThumbsDown className="h-5 w-5 mr-2" />}
                  {gameFeedback.type === 'info' && <Trophy className="h-5 w-5 mr-2" />}
                  <span>{gameFeedback.message}</span>
                </div>
              </div>
            )}
            
            {/* Game Controls */}
            <div className="flex justify-center pt-2">
              {!isGameActive ? (
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-green-600 to-amber-600 hover:from-green-700 hover:to-amber-700 text-white font-bold py-2 px-8 rounded-full shadow-lg"
                  onClick={startGame}
                  disabled={!videoRef.current || !videoRef.current.srcObject}
                >
                  <Trophy className="mr-2 h-5 w-5" />
                  Start Game
                </Button>
              ) : (
                <>
                  <Button
                    variant="destructive"
                    className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold py-2 px-8 rounded-full shadow-lg"
                    onClick={stopGame}
                  >
                    <CameraOff className="mr-2 h-5 w-5" />
                    Stop Game
                  </Button>
                  
                  {showNextButton && (
                    <Button
                      variant="default"
                      className="ml-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-2 px-8 rounded-full shadow-lg animate-pulse"
                      onClick={() => moveToNextExpression(0)}
                    >
                      <Smile className="mr-2 h-5 w-5" />
                      Next Expression
                    </Button>
                  )}
                </>
              )}
              
              {isGameActive && !showNextButton && (
                <Button
                  variant="outline"
                  className="ml-2 bg-amber-500/20 border-amber-500 text-amber-400 hover:bg-amber-500/30"
                  onClick={() => evaluateExpression()}
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Check Expression
                </Button>
              )}
              
              {isGameActive && isManualCaptureMode && !showNextButton && (
                <Button
                  variant="outline"
                  className="ml-2 bg-blue-500/20 border-blue-500 text-blue-400 hover:bg-blue-500/30"
                  onClick={() => captureImage()}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Capture Expression
                </Button>
              )}
            </div>
            
            {/* Instructions */}
            {!isGameActive && (
              <div className="text-sm text-gray-400 mt-4">
                <div className="mb-3 p-3 bg-black/20 rounded-lg border border-amber-500/20">
                  <p className="font-medium text-amber-400 mb-2">Game Mode:</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex-1 ${!isManualCaptureMode ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-black/30'}`}
                      onClick={() => setIsManualCaptureMode(false)}
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Automatic Capture
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex-1 ${isManualCaptureMode ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-black/30'}`}
                      onClick={() => setIsManualCaptureMode(true)}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Manual Capture
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    {isManualCaptureMode 
                      ? "Manual mode: Press 'Capture Expression' button to evaluate your expression when you're ready." 
                      : "Automatic mode: Your expression will be continuously analyzed as you play."}
                  </p>
                </div>
                <p className="font-medium text-gray-300 mb-1">How to play:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Press "Start Game" to begin</li>
                  <li>Try to match the facial expression shown in the target image</li>
                  <li>You have 10 seconds per expression</li>
                  <li>Earn points for matching expressions correctly (+{POINTS_CONFIG.correct} points)</li>
                  <li>Get time bonuses for quick matches (+{POINTS_CONFIG.timeBonus} points)</li>
                  <li>Lose points for incorrect attempts ({POINTS_CONFIG.wrong} points)</li>
                  <li>Build consecutive correct answers for bonus points</li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="overflow-hidden shadow-xl bg-black/40 border-purple-500/30 backdrop-blur-md">
            <CardHeader className="bg-gradient-to-r from-purple-800/50 to-amber-700/50 p-4">
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <Camera className="h-5 w-5 mr-2 text-purple-400" />
                Camera Feed
                {isRecording && (
                  <span className="ml-auto animate-pulse flex items-center text-red-400">
                    <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                    Recording
                  </span>
                )}
              </CardTitle>
              {isRecording && (
                <CardDescription className="text-gray-300">
                  Recording frames: {recordedFrames.length}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="relative rounded-lg overflow-hidden border-2 border-purple-500/30">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-auto"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <RefreshCw className="w-10 h-10 text-amber-400 animate-spin" />
                  </div>
                )}
                
                {isRecording && (
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-red-400" />
                    {Math.floor(recordedFrames.length)}s
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="bg-amber-500/20 border-amber-500 text-amber-400 hover:bg-amber-500/30 flex-1"
                  onClick={captureImage}
                  disabled={loading || isAnalyzingBatch}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Capture
                </Button>
                <Button 
                  variant="outline" 
                  className={`${
                    isCapturing && !isRecording
                      ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30" 
                      : "bg-purple-500/20 border-purple-500 text-purple-400 hover:bg-purple-500/30"
                  } transition-all duration-300`}
                  onClick={toggleCapture}
                  disabled={isRecording || isAnalyzingBatch}
                >
                  {isCapturing && !isRecording ? (
                    <>
                      <PauseCircle className="mr-2 h-5 w-5" />
                      Stop Auto
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Start Auto
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className={`${
                    isRecording 
                      ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30" 
                      : "bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30"
                  } transition-all duration-300 flex-1`}
                  onClick={toggleRecording}
                  disabled={isAnalyzingBatch}
                >
                  {isRecording ? (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Stop & Analyze ({recordedFrames.length} frames)
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-5 w-5" />
                      Record Session
                    </>
                  )}
                </Button>
              </div>
              
              {(error || batchAnalysisError) && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/40">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-400">
                    {error || batchAnalysisError}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden shadow-xl bg-black/40 border-purple-500/30 backdrop-blur-md">
            <CardHeader className="bg-gradient-to-r from-purple-800/50 to-amber-700/50 p-4">
              <CardTitle className="text-xl font-bold text-white">
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {result ? (
                <div className="space-y-4">
                  <div className="text-center p-2 bg-gradient-to-r from-purple-900/50 to-amber-900/50 rounded-lg border border-purple-500/30">
                    <h3 className="text-2xl font-bold text-amber-400">
                      {result.dominant}
                    </h3>
                    <p className="text-sm text-gray-300">Current Expression</p>
                  </div>
                  
                  <div className="space-y-3">
                    {result.all.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">{item.expression}</span>
                          <span className="text-sm text-gray-300">
                            {Math.round(item.confidence * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={item.confidence * 100} 
                          className="h-2 bg-gray-700"
                          style={{
                            "--progress-foreground": index === 0 ? "hsl(38, 92%, 50%)" : "hsl(271, 91%, 65%, 0.7)"
                          } as React.CSSProperties}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-400 text-right">
                    Analyzed at: {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ) : isAnalyzingBatch ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="mx-auto h-12 w-12 mb-4 text-amber-400 animate-spin" />
                    <p className="text-gray-300">Analyzing {recordedFrames.length} frames...</p>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Camera className="mx-auto h-12 w-12 mb-2 opacity-20" />
                    <p>Capture an image to see expression analysis</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-6 overflow-hidden shadow-xl bg-black/40 border-purple-500/30 backdrop-blur-md">
          <CardHeader className="bg-gradient-to-r from-purple-800/50 to-blue-700/50 p-4">
            <CardTitle className="text-xl font-bold text-white flex items-center">
              <Volume2 className="h-5 w-5 mr-2 text-blue-400" />
              Audio Analysis
              {isAudioRecording && (
                <span className="ml-auto animate-pulse flex items-center text-red-400">
                  <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                  Recording Audio
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-gray-300">
              Record audio to analyze speech emotion
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className={`${
                  isAudioRecording 
                    ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30" 
                    : "bg-blue-500/20 border-blue-500 text-blue-400 hover:bg-blue-500/30"
                } transition-all duration-300 flex-1`}
                onClick={toggleAudioRecording}
              >
                {isAudioRecording ? (
                  <>
                    <MicOff className="mr-2 h-5 w-5" />
                    Stop Audio Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5" />
                    Start Audio Recording
                  </>
                )}
              </Button>
            </div>
            
            {audioAnalysisResult && (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-white mb-2">Audio Emotion Analysis</h3>
                <div className="overflow-hidden rounded-lg border border-blue-500/30">
                  <table className="min-w-full divide-y divide-blue-500/30">
                    <thead className="bg-blue-900/30">
                      <tr>
                        <th 
                          scope="col" 
                          className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider"
                        >
                          Detected Emotion
                        </th>
                        <th 
                          scope="col" 
                          className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider"
                        >
                          Confidence
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-black/30 divide-y divide-blue-500/10">
                      <tr>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-400">
                          {audioAnalysisResult.dominant}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2 flex-grow">
                              <div 
                                className="bg-blue-500 h-2.5 rounded-full" 
                                style={{
                                  width: `${audioAnalysisResult.confidence * 100}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-xs w-12 text-right">
                              {Math.round(audioAnalysisResult.confidence * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 p-3 bg-black/20 rounded-lg border border-blue-500/20">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">Audio Analysis Insights</h4>
                  <p className="text-sm text-gray-300">
                    Your voice tone expressed primarily <span className="text-blue-400 font-medium">{audioAnalysisResult.dominant}</span> emotions.
                    {audioAnalysisResult.dominant === "Happy" && " Try to maintain this positive energy throughout your performance."}
                    {audioAnalysisResult.dominant === "Sad" && " This conveys melancholy well, consider if this matches your intended emotion."}
                    {audioAnalysisResult.dominant === "Angry" && " Your voice effectively communicated intensity and passion."}
                    {audioAnalysisResult.dominant === "Neutral" && " Consider adding more emotional variation to your delivery."}
                  </p>
                </div>
              </div>
            )}
            
            {!audioAnalysisResult && !isAudioRecording && (
              <div className="h-40 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Volume2 className="mx-auto h-12 w-12 mb-2 opacity-20" />
                  <p>Record audio to see emotion analysis</p>
                </div>
              </div>
            )}
            
            {isAudioRecording && (
              <div className="h-40 flex items-center justify-center">
                <div className="text-center">
                  <div className="flex justify-center space-x-1 mb-4">
                    <div className="w-2 h-8 bg-blue-500 animate-pulse rounded-full" style={{animationDelay: "0s"}}></div>
                    <div className="w-2 h-12 bg-blue-500 animate-pulse rounded-full" style={{animationDelay: "0.2s"}}></div>
                    <div className="w-2 h-10 bg-blue-500 animate-pulse rounded-full" style={{animationDelay: "0.4s"}}></div>
                    <div className="w-2 h-16 bg-blue-500 animate-pulse rounded-full" style={{animationDelay: "0.6s"}}></div>
                    <div className="w-2 h-8 bg-blue-500 animate-pulse rounded-full" style={{animationDelay: "0.8s"}}></div>
                    <div className="w-2 h-12 bg-blue-500 animate-pulse rounded-full" style={{animationDelay: "1.0s"}}></div>
                  </div>
                  <p className="text-blue-400">Recording audio...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {summaryAnalysis && (
          <Card className="mt-6 overflow-hidden shadow-xl bg-black/40 border-purple-500/30 backdrop-blur-md">
            <CardHeader className="bg-gradient-to-r from-purple-800/50 to-amber-700/50 p-4">
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-amber-400" />
                Session Analysis Summary
              </CardTitle>
              <CardDescription className="text-gray-300">
                Analysis of {summaryAnalysis.totalFrames} frames
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-purple-900/50 to-amber-900/50 rounded-lg border border-purple-500/30">
                <h3 className="text-2xl font-bold text-amber-400">
                  {summaryAnalysis.dominantExpression}
                </h3>
                <p className="text-sm text-gray-300">Overall Dominant Expression</p>
              </div>
              
              <div className="space-y-3">
                {summaryAnalysis.allExpressions.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">{item.expression}</span>
                      <span className="text-sm text-gray-300">
                        {Math.round(item.averageConfidence * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={item.averageConfidence * 100} 
                      className="h-2 bg-gray-700"
                      style={{
                        "--progress-foreground": index === 0 ? "hsl(38, 92%, 50%)" : "hsl(271, 91%, 65%, 0.7)"
                      } as React.CSSProperties}
                    />
                  </div>
                ))}
              </div>
              
              {summaryAnalysis.timeline && summaryAnalysis.timeline.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-purple-400 mb-2">Expression Timeline</h4>
                  <div className="h-12 bg-black/30 border border-purple-500/30 rounded-lg p-1 flex items-center">
                    {summaryAnalysis.timeline.map((point, index) => {
                      const emotion = point.dominant;
                      const color = getEmotionColor(emotion);
                      return (
                        <div 
                          key={index}
                          className="h-full" 
                          style={{
                            width: `${100 / summaryAnalysis.timeline!.length}%`,
                            backgroundColor: color,
                            opacity: 0.7
                          }}
                          title={`${emotion} at ${new Date(point.timestamp).toLocaleTimeString()}`}
                        />
                      );
                    })}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Timeline shows expression changes over time (hover for details)
                  </div>
                </div>
              )}
              
              <div className="p-4 bg-black/20 rounded-lg border border-purple-500/20">
                <h4 className="text-sm font-medium text-amber-400 mb-2">Analysis Insights</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
                  <li>
                    Your dominant expression was <span className="text-amber-400">{summaryAnalysis.dominantExpression}</span>
                  </li>
                  {summaryAnalysis.allExpressions.length > 1 && (
                    <li>
                      Secondary expression: <span className="text-purple-400">
                        {summaryAnalysis.allExpressions[1]?.expression} 
                        ({Math.round(summaryAnalysis.allExpressions[1]?.averageConfidence * 100)}%)
                      </span>
                    </li>
                  )}
                  {summaryAnalysis.timeline && (
                    <li>
                      Your expressions were {getExpressionVarietyDescription(summaryAnalysis.timeline)} 
                      during this session
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="p-4 bg-black/20 border-t border-purple-500/20">
              <div className="text-sm text-gray-400">
                DeepFace analysis completed at {new Date().toLocaleTimeString()}
              </div>
            </CardFooter>
          </Card>
        )}
        
        {history.length > 0 && (
          <Card className="mt-6 overflow-hidden shadow-xl bg-black/40 border-purple-500/30 backdrop-blur-md">
            <CardHeader className="bg-gradient-to-r from-purple-800/50 to-amber-700/50 p-4">
              <CardTitle className="text-xl font-bold text-white">
                Expression History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {history.slice().reverse().map((item, index) => (
                  <div 
                    key={index} 
                    className={`p-3 border rounded-lg bg-black/30 hover:bg-purple-900/20 transition-colors ${
                      isRecording && recordedFrames.length > 0 && 
                      item.timestamp >= recordedFrames[0].timestamp ? 
                      'border-green-500/30' : 'border-purple-500/30'
                    }`}
                  >
                    <div className="font-bold text-amber-400">{item.dominant}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Footer />
    </div>
  );
}

function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    happy: '#FFC107',
    sad: '#2196F3',
    angry: '#F44336', 
    fear: '#9C27B0',
    surprise: '#FF9800',
    disgust: '#4CAF50',
    neutral: '#607D8B'
  };
  
  const normalizedEmotion = emotion.toLowerCase();
  return colors[normalizedEmotion] || '#607D8B';
}

function getExpressionVarietyDescription(timeline: {dominant: string}[]): string {
  const uniqueExpressions = new Set(timeline.map(t => t.dominant.toLowerCase()));
  
  if (uniqueExpressions.size === 1) return 'very consistent';
  if (uniqueExpressions.size === 2) return 'fairly consistent';
  if (uniqueExpressions.size <= 3) return 'somewhat varied';
  return 'highly varied';
}