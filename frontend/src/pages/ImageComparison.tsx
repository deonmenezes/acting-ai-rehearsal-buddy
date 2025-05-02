import React, { useState, useRef } from 'react';
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
  Upload, 
  RefreshCw, 
  Image as ImageIcon,
  AlertCircle,
  BarChart,
  FileUp,
  Trash2,
  Plus
} from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ImageData {
  imageBase64: string;
  name: string;
  originalFile: File;
  previewUrl: string;
}

interface ExpressionData {
  expression: string;
  confidence: number;
}

interface ComparisonResult {
  individualResults: {
    imageName: string;
    dominant: string;
    expressions: ExpressionData[];
  }[];
  expressionComparison: Record<string, { imageName: string; confidence: number }[]>;
  insights: string[];
  actorMap: Record<string, string>;
  timestamp: number;
}

export default function ImageComparisonPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newImages: ImageData[] = [];
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        
        newImages.push({
          imageBase64: base64String,
          name: file.name.split('.')[0], // Remove file extension for display name
          originalFile: file,
          previewUrl: URL.createObjectURL(file)
        });
        
        // If all files have been processed, update state
        if (newImages.length === files.length) {
          setImages(prev => [...prev, ...newImages]);
        }
      };
      
      reader.readAsDataURL(file);
    });
    
    // Clear input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].previewUrl); // Clean up URL object
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const clearAllImages = () => {
    // Clean up URL objects
    images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setComparisonResult(null);
  };

  const analyzeImages = async () => {
    if (images.length === 0) {
      setError("Please upload at least one image to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const payload = {
        images: images.map(img => ({
          imageBase64: img.imageBase64,
          name: img.name
        }))
      };

      const response = await fetch('http://localhost:5000/api/compare-facial-expressions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Comparison analysis result:', result);
      setComparisonResult(result);
    } catch (error) {
      console.error('Error analyzing images:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to get color for different expressions
  const getExpressionColor = (expression: string): string => {
    const colors: Record<string, string> = {
      happy: '#FFC107',
      sad: '#2196F3',
      angry: '#F44336', 
      fear: '#9C27B0',
      surprise: '#FF9800',
      disgust: '#4CAF50',
      neutral: '#607D8B'
    };
    
    const normalizedExpression = expression.toLowerCase();
    return colors[normalizedExpression] || '#607D8B';
  };

  return (
    <div className="min-h-screen bg-theater-gradient flex flex-col">
      <Header />
      
      <div className="flex-grow container mx-auto p-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6 text-theater-light">Actor Expression Comparison</h1>
        <p className="text-gray-300 mb-6">
          Upload images of actors to compare their facial expressions and emotional intensity.
          This tool helps you understand the nuances of different acting techniques and expressions.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Image Upload Card */}
          <Card className="overflow-hidden shadow-xl bg-black/40 border-purple-500/30 backdrop-blur-md md:col-span-1">
            <CardHeader className="bg-gradient-to-r from-purple-800/50 to-amber-700/50 p-4">
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <Upload className="h-5 w-5 mr-2 text-purple-400" />
                Upload Images
              </CardTitle>
              <CardDescription className="text-gray-300">
                Upload actor images for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
                id="image-upload"
              />
              
              <div className="grid gap-4">
                <Button
                  variant="outline"
                  className="bg-purple-500/20 border-purple-500 text-purple-400 hover:bg-purple-500/30 flex-1 h-24"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center">
                    <FileUp className="h-8 w-8 mb-2" />
                    <span>Select Images</span>
                  </div>
                </Button>
                
                {images.length > 0 && (
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-300">
                        Selected Images ({images.length})
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30"
                        onClick={clearAllImages}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Clear All
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {images.map((image, index) => (
                        <div
                          key={index}
                          className="relative rounded-md overflow-hidden border border-gray-700"
                        >
                          <img
                            src={image.previewUrl}
                            alt={image.name}
                            className="w-full h-32 object-cover"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 border-gray-600 text-gray-300 hover:bg-black/80"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <div className="bg-black/60 p-1 text-xs text-white truncate absolute bottom-0 w-full">
                            {image.name}
                          </div>
                        </div>
                      ))}
                      
                      {/* Upload more button */}
                      <Button
                        variant="outline"
                        className="h-32 border-dashed border-gray-600 bg-black/20 text-gray-400 hover:bg-black/30 hover:text-gray-300"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="flex flex-col items-center">
                          <Plus className="h-8 w-8 mb-1" />
                          <span>Add More</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                )}
                
                <Button
                  className="bg-amber-600 hover:bg-amber-700 text-white mt-4"
                  onClick={analyzeImages}
                  disabled={isAnalyzing || images.length === 0}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart className="mr-2 h-4 w-4" />
                      Analyze Expressions
                    </>
                  )}
                </Button>
              </div>
              
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/40 mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="overflow-hidden shadow-xl bg-black/40 border-purple-500/30 backdrop-blur-md md:col-span-2">
            <CardHeader className="bg-gradient-to-r from-purple-800/50 to-amber-700/50 p-4">
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-amber-400" />
                Expression Analysis
              </CardTitle>
              {comparisonResult && (
                <CardDescription className="text-gray-300">
                  Analysis of {comparisonResult.individualResults.length} images
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              {isAnalyzing ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="mx-auto h-12 w-12 mb-4 text-amber-400 animate-spin" />
                    <p className="text-gray-300">Analyzing {images.length} images...</p>
                  </div>
                </div>
              ) : comparisonResult ? (
                <div className="space-y-6">
                  {/* Individual Results */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {comparisonResult.individualResults.map((result, idx) => (
                      <Card key={idx} className="bg-black/20 border-purple-500/20">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-md text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="h-4 w-4 text-purple-400" />
                              <span>{comparisonResult.actorMap[result.imageName] || result.imageName}</span>
                            </div>
                            <span className="text-amber-400 text-sm font-normal">
                              {result.dominant}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-3 px-4 space-y-2">
                          {result.expressions.slice(0, 3).map((expr, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-300">{expr.expression}</span>
                                <span className="text-xs text-gray-300">
                                  {Math.round(expr.confidence * 100)}%
                                </span>
                              </div>
                              <Progress 
                                value={expr.confidence * 100} 
                                className="h-1.5 bg-gray-700"
                                style={{
                                  "--progress-foreground": getExpressionColor(expr.expression)
                                } as React.CSSProperties}
                              />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Comparison Results */}
                  <Card className="bg-black/20 border-amber-500/20">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-lg text-amber-400">Expression Comparison</CardTitle>
                    </CardHeader>
                    <CardContent className="py-3 px-4">
                      <h3 className="text-md font-medium text-white mb-3">Key Insights</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
                        {comparisonResult.insights.map((insight, i) => (
                          <li key={i}>{insight}</li>
                        ))}
                      </ul>
                      
                      <div className="mt-4">
                        <h3 className="text-md font-medium text-white mb-3">Expression Distribution</h3>
                        <div className="space-y-4">
                          {Object.entries(comparisonResult.expressionComparison)
                            .sort((a, b) => {
                              // Get highest confidence for each expression
                              const maxA = Math.max(...a[1].map(item => item.confidence));
                              const maxB = Math.max(...b[1].map(item => item.confidence));
                              return maxB - maxA;
                            })
                            .slice(0, 5)
                            .map(([expression, data]) => (
                              <div key={expression} className="space-y-2">
                                <h4 className="text-sm text-gray-200 font-medium">{expression}</h4>
                                <div className="space-y-2">
                                  {data.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <div className="w-24 text-xs text-gray-400 truncate">
                                        {comparisonResult.actorMap[item.imageName] || item.imageName}
                                      </div>
                                      <div className="flex-grow relative h-4 bg-black/50 rounded-full overflow-hidden">
                                        <div
                                          className="absolute top-0 left-0 h-full rounded-full"
                                          style={{
                                            width: `${item.confidence * 100}%`,
                                            backgroundColor: getExpressionColor(expression)
                                          }}
                                        />
                                      </div>
                                      <div className="w-10 text-xs text-gray-400 text-right">
                                        {Math.round(item.confidence * 100)}%
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 mb-2 opacity-20" />
                    <p className="mb-2">Upload images to compare actor expressions</p>
                    <p className="text-sm text-gray-500">The analysis will show emotional intensity, comparison between expressions, and acting insights</p>
                  </div>
                </div>
              )}
            </CardContent>
            {comparisonResult && (
              <CardFooter className="p-4 bg-black/20 border-t border-purple-500/20">
                <div className="text-xs text-gray-400">
                  Analysis completed at {new Date(comparisonResult.timestamp).toLocaleTimeString()}
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}