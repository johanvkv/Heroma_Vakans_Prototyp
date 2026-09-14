import React from 'react';

export const ProgressBarChart = () => {
  const progress = 60; // 3 of 5 = 60%

  return (
    <div className="chart-card">
      <div className="progress-chart-container">
        <div className="progress-chart-value">3 of 5</div>
        <div className="progress-chart-label">Internal signoff</div>
        <div className="progress-bar-wrapper">
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
