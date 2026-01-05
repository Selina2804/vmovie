// src/components/ContinueWatching/ProgressBar.js
import React from 'react';

const ProgressBar = ({ percentage, currentTime, duration, showText = false }) => {
  const clampedPercentage = Math.min(Math.max(percentage || 0, 0), 100);

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-bg">
        <div 
          className="progress-bar-fill"
          style={{ width: `${clampedPercentage}%` }}
        >
          {showText && (
            <span className="progress-bar-text">{clampedPercentage}%</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;