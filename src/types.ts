export interface AnalysisRequest {
  fen: string;
  depth: number;
}

export interface AnalysisResponse {
  evaluation: {
    type: string;
    value: number;
  };
  best_move: string;
  pv: string[];
  depth: number;
}

export interface ChessPosition {
  fen: string;
  isValid: boolean;
}

export interface MoveHistory {
  san: string;
  color: 'w' | 'b';
  fen: string;
}