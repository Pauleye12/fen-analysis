import React from 'react';
import clsx from 'clsx';

interface EvaluationBarProps {
  evaluation: number;
}

export function EvaluationBar({ evaluation }: EvaluationBarProps) {
  const percentage = Math.min(Math.max((evaluation + 5) / 10 * 100, 0), 100);
  
  return (
    <div className="w-4 h-96 bg-gray-200 rounded overflow-hidden">
      <div 
        className={clsx(
          "w-full transition-all duration-300",
          evaluation >= 0 ? "bg-blue-500" : "bg-black"
        )}
        style={{ 
          height: `${percentage}%`,
          marginTop: `${100 - percentage}%`
        }}
      />
    </div>
  );
}