import React from 'react';

export const ProgressGaugeChart = () => {
  const percentage = 50;

  // Calculate the rotation for the arc (180 degrees for semi-circle)
  // At 50%, we want half of the semi-circle filled
  const rotation = (percentage / 100) * 180;

  return (
    <div className="chart-card">
      <div className="gauge-chart-container">
        <div className="gauge-donut">
          {/* Background gray semi-circle */}
          <svg className="gauge-svg" viewBox="0 0 159 159">
            <path
              d="M 79.5 79.5 m -59.5 0 a 59.5 59.5 0 0 1 119 0"
              fill="none"
              stroke="#efefef"
              strokeWidth="20"
            />
          </svg>
          {/* Foreground purple semi-circle */}
          <svg className="gauge-svg gauge-svg-foreground" viewBox="0 0 159 159">
            <path
              d="M 79.5 79.5 m -59.5 0 a 59.5 59.5 0 0 1 119 0"
              fill="none"
              stroke="#5236ab"
              strokeWidth="20"
              strokeDasharray={`${(rotation / 180) * 187} 187`}
              strokeLinecap="butt"
            />
          </svg>
          {/* Center text */}
          <div className="gauge-text">
            <span>{percentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
