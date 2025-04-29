import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Star, Award, TrendingUp, Zap, BarChart3 } from "lucide-react";
import { motion } from 'framer-motion';

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

  const getScoreColorClass = (score: number) => {
    if (score >= 90) return "from-green-500 to-emerald-600";
    if (score >= 75) return "from-blue-500 to-cyan-600";
    if (score >= 60) return "from-yellow-500 to-amber-600";
    return "from-red-500 to-pink-600";
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 90) return "bg-green-500/20 text-green-400 border border-green-500/30";
    if (score >= 75) return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    if (score >= 60) return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border border-red-500/30";
  };

  const getStars = (score: number) => {
    const fullStars = Math.floor(score / 20);
    const result = [];
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        result.push(
          <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
        );
      } else {
        result.push(
          <Star key={i} className="h-5 w-5 text-gray-600" />
        );
      }
    }
    
    return result;
  };

  const getCategoryIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "emotion":
      case "emotional delivery":
        return <Zap className="h-5 w-5 text-pink-400 mr-2" />;
      case "clarity":
      case "pronunciation":
        return <Award className="h-5 w-5 text-blue-400 mr-2" />;
      case "timing":
      case "pacing":
        return <TrendingUp className="h-5 w-5 text-green-400 mr-2" />;
      default:
        return <BarChart3 className="h-5 w-5 text-purple-400 mr-2" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="backdrop-blur-md bg-black/40 border border-purple-500/30 rounded-xl overflow-hidden shadow-xl"
    >
      <div className="bg-gradient-to-r from-purple-800/50 to-amber-700/50 p-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Award className="h-5 w-5 mr-2 text-amber-400" />
          Performance Results
        </h2>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center justify-center mb-2">
          <div className="relative w-32 h-32 mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 to-amber-600/20"></div>
            <div className="absolute inset-[6px] rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                  {overallScore}%
                </div>
                <div className="flex justify-center mt-1">
                  {getStars(overallScore)}
                </div>
              </div>
            </div>
            <div
              className={`absolute top-0 left-0 w-32 h-32 rounded-full bg-gradient-to-r ${getScoreColorClass(overallScore)}`}
              style={{
                clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin(2 * Math.PI * overallScore / 100)}% ${50 - 50 * Math.cos(2 * Math.PI * overallScore / 100)}%, ${overallScore >= 75 ? `${50 + 50 * Math.sin(2 * Math.PI * 0.75)}% ${50 - 50 * Math.cos(2 * Math.PI * 0.75)}%` : ''}, ${overallScore >= 50 ? '100% 50%' : ''}, ${overallScore >= 25 ? `${50 + 50 * Math.sin(2 * Math.PI * 0.25)}% ${50 - 50 * Math.cos(2 * Math.PI * 0.25)}%` : ''})`,
              }}
            ></div>
          </div>
          <h3 className="text-lg font-medium text-white">Overall Score</h3>
        </div>
        
        <div className="space-y-6">
          {categories.map((category) => (
            <motion.div 
              key={category.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-200 flex items-center">
                  {getCategoryIcon(category.name)}
                  {category.name}
                </span>
                <span className={`${getScoreBadgeClass(category.score)} px-3 py-1 rounded-full text-sm font-medium`}>
                  {category.score}%
                </span>
              </div>
              <Progress 
                value={category.score} 
                className="h-2 bg-gray-800/50" 
                indicatorClassName={`bg-gradient-to-r ${getScoreColorClass(category.score)}`}
              />
              <p className="text-sm text-gray-400 italic">{category.feedback}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceResult;
