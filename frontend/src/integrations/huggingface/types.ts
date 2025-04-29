export interface FacialExpressionResult {
  expression: string;
  confidence: number;
}

export interface ExpressionAnalysis {
  dominant: string;
  all: FacialExpressionResult[];
  timestamp: number;
}