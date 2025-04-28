
interface AnalysisResult {
  overallScore: number;
  categories: {
    name: string;
    score: number;
    feedback: string;
  }[];
}

// This is a mock service that would be replaced with actual AI analysis in a real implementation
class PerformanceAnalysisService {
  analyzePerformance(audioBlob: Blob, scriptText: string): Promise<AnalysisResult> {
    // In a real implementation, this would send the audio and script text to an API
    // and get back a detailed analysis
    
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // Generate random scores for demo purposes
        const emotionScore = Math.floor(Math.random() * 30) + 70; // 70-100
        const pronunciationScore = Math.floor(Math.random() * 40) + 60; // 60-100
        const accuracyScore = Math.floor(Math.random() * 30) + 70; // 70-100
        const paceScore = Math.floor(Math.random() * 25) + 75; // 75-100
        
        const overallScore = Math.floor(
          (emotionScore + pronunciationScore + accuracyScore + paceScore) / 4
        );
        
        // Generate feedback based on scores
        const emotionFeedback = emotionScore >= 90
          ? "Excellent emotional delivery! You captured the character's feelings perfectly."
          : emotionScore >= 75
          ? "Good emotional range. Try emphasizing key emotional moments more."
          : "Try to connect more with the character's emotions.";
          
        const pronunciationFeedback = pronunciationScore >= 90
          ? "Crystal clear pronunciation. Every word was distinct."
          : pronunciationScore >= 75
          ? "Good pronunciation. Work on a few difficult words."
          : "Focus on clearer articulation of certain words.";
          
        const accuracyFeedback = accuracyScore >= 90
          ? "Perfect line delivery. You didn't miss a word."
          : accuracyScore >= 75
          ? "Good accuracy. A few minor word changes."
          : "Review the script more closely. Several words were changed.";
          
        const paceFeedback = paceScore >= 90
          ? "Perfect pacing. Your timing enhanced the performance."
          : paceScore >= 75
          ? "Good rhythm overall. Some lines could use better pacing."
          : "Work on your timing. Some lines were rushed.";
        
        resolve({
          overallScore,
          categories: [
            { name: "Emotional Expression", score: emotionScore, feedback: emotionFeedback },
            { name: "Pronunciation & Clarity", score: pronunciationScore, feedback: pronunciationFeedback },
            { name: "Script Accuracy", score: accuracyScore, feedback: accuracyFeedback },
            { name: "Pacing & Timing", score: paceScore, feedback: paceFeedback }
          ]
        });
      }, 1500);
    });
  }
}

export default new PerformanceAnalysisService();
