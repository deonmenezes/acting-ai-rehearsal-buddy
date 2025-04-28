
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface ScoreCategory {
  name: string;
  score: number;
  feedback: string;
}

interface PerformanceResultProps {
  overallScore: number;
  categories: ScoreCategory[];
  visible: boolean;
}

const PerformanceResult: React.FC<PerformanceResultProps> = ({
  overallScore,
  categories,
  visible
}) => {
  if (!visible) return null;

  const getScoreClass = (score: number) => {
    if (score >= 90) return "score-excellent";
    if (score >= 75) return "score-good";
    if (score >= 60) return "score-average";
    return "score-poor";
  };

  const getStars = (score: number) => {
    const fullStars = Math.floor(score / 20);
    const result = [];
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        result.push(
          <Star key={i} className="h-5 w-5 fill-theater-gold text-theater-gold" />
        );
      } else {
        result.push(
          <Star key={i} className="h-5 w-5 text-gray-500" />
        );
      }
    }
    
    return result;
  };

  return (
    <Card className="theater-card">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold text-theater-gold mb-4">Performance Results</h2>
        
        <div className="flex items-center justify-between mb-6">
          <div className="text-2xl font-bold">
            Overall Score: 
            <span className={getScoreClass(overallScore)}> {overallScore}%</span>
          </div>
          <div className="flex">
            {getStars(overallScore)}
          </div>
        </div>
        
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-200">{category.name}</span>
                <span className={getScoreClass(category.score)}>
                  {category.score}%
                </span>
              </div>
              <Progress value={category.score} className="h-2 bg-gray-700" />
              <p className="text-sm text-gray-400">{category.feedback}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceResult;
