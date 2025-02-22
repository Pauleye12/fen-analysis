import type { AnalysisResponse } from "../types";
// import { ChevronRight } from 'lucide-react';

interface AnalysisPanelProps {
  analysis: AnalysisResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function AnalysisPanel({
  analysis,
  isLoading,
  error,
}: AnalysisPanelProps) {
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded">
        <p>{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-4 py-1 ">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 flex  py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className=" flex">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-4 text-blue-600">
        Position will be analyzed automatically after each move.
      </div>
    );
  }

  // const evaluationText = analysis.evaluation.type === 'mate'
  //   ? `Mate in ${Math.abs(analysis.evaluation.value)}`
  //   : (analysis.evaluation.value / 100).toFixed(2);

  return (
    <div className="px-4 py-2 flex items-center gap-y-3 gap-6 flex-wrap  justify-between ">
      <div className="flex items-center space-x-2">
        <span className="font-medium text-blue-600">CP:</span>
        <span
          className={
            analysis.evaluation.value >= 0 ? "text-blue-600" : "text-gray-800"
          }
        >
          {analysis.evaluation.value >= 0 ? "+" : ""}
          {analysis.evaluation.value}
        </span>
      </div>
      <div className="font-medium text-blue-600">
        Depth: <span className="font-normal">{analysis.depth}</span>{" "}
      </div>
      <div>
        <h3 className="font-medium  text-blue-600 ">
          Best move: <span className="font-normal">{analysis.best_move}</span>{" "}
        </h3>
        {/* <div className="space-y-1">
          {analysis.pv.map((move, index) => (
            <div key={index} className="flex items-center text-sm">
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span>{move}</span>
            </div>
          ))} 
        </div> */}
      </div>
    </div>
  );
}
