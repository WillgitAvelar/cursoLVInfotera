import React from 'react';

const ProgressBar = ({ progress, height = '8px', showPercentage = true, animated = true }) => {
  return (
    <div className="w-full">
      <div 
        className="w-full bg-gray-900 rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className={`h-full bg-gradient-to-r from-lime-400 to-lime-500 transition-all duration-500 ease-out ${
            animated ? 'animate-pulse-slow' : ''
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {showPercentage && (
        <p className="text-lime-400 text-sm mt-1 text-right font-medium">
          {progress.toFixed(0)}%
        </p>
      )}
    </div>
  );
};

export default ProgressBar;