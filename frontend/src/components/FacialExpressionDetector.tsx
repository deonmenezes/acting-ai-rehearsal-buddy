export interface ExpressionAnalysis {
  dominant: string;
  all: FacialExpressionResult[];
}

export interface FacialExpressionResult {
  expression: string;
  confidence: number;
}