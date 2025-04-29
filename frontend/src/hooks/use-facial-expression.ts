import { useState } from 'react';
import facialExpressionService from '../services/facialExpressionService';
import type { ExpressionAnalysis } from '../integrations/huggingface/types';

export function useFacialExpression() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExpressionAnalysis | null>(null);
  const [history, setHistory] = useState<ExpressionAnalysis[]>([]);
  
  const analyzeImage = async (imageBase64: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const analysis = await facialExpressionService.analyzeImage(imageBase64);
      setResult(analysis);
      setHistory(prev => [...prev, analysis]);
      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const clearHistory = () => {
    facialExpressionService.clearResults();
    setHistory([]);
  };
  
  return {
    loading,
    error,
    result,
    history,
    analyzeImage,
    clearHistory
  };
}