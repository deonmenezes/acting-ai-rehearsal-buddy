import React, { useRef, useState, useEffect } from 'react';
import { useFacialExpression } from '../hooks/use-facial-expression';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Camera, 
  RefreshCw, 
  PauseCircle, 
  PlayCircle, 
  AlertCircle 
} from "lucide-react";

export default function FacialExpressionPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureInterval, setCaptureInterval] = useState<number | null>(null);
  const { loading, error, result, history, analyzeImage } = useFacialExpression();
  
  // Initialize webcam
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
    
    // Cleanup
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (captureInterval) {
        clearInterval(captureInterval);
      }
    };
  }, []);
  
  // Function to capture image from webcam
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
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
  
  // Toggle continuous capture
  const toggleCapture = () => {
    if (isCapturing) {
      // Stop capturing
      if (captureInterval) {
        clearInterval(captureInterval);
        setCaptureInterval(null);
      }
    } else {
      // Start capturing every 2 seconds
      const interval = window.setInterval(() => {
        captureImage();
      }, 2000);
      setCaptureInterval(interval);
    }
    
    setIsCapturing(!isCapturing);
  };
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 text-theater-light">Facial Expression Analysis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden shadow-xl bg-black/40 border-purple-500/30 backdrop-blur-md">
          <CardHeader className="bg-gradient-to-r from-purple-800/50 to-amber-700/50 p-4">
            <CardTitle className="text-xl font-bold text-white">
              Camera Feed
            </CardTitle>
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
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="bg-amber-500/20 border-amber-500 text-amber-400 hover:bg-amber-500/30 flex-1"
                onClick={captureImage}
                disabled={loading}
              >
                <Camera className="mr-2 h-5 w-5" />
                Capture
              </Button>
              <Button 
                variant="outline" 
                className={`${
                  isCapturing 
                    ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30" 
                    : "bg-purple-500/20 border-purple-500 text-purple-400 hover:bg-purple-500/30"
                } transition-all duration-300`}
                onClick={toggleCapture}
              >
                {isCapturing ? (
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
            
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/40">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-400">
                  {error}
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
                  <p className="text-sm text-gray-300">Dominant Expression</p>
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
                  className="p-3 border border-purple-500/30 rounded-lg bg-black/30 hover:bg-purple-900/20 transition-colors"
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
  );
}