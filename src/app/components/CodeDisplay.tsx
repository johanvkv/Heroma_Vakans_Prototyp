import React, { useState } from 'react';

interface CodeDisplayProps {
  markup: string;
  css: string;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({ markup, css }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="code-display">
      <div className="code-display-header">
        <button
          className="btn-tertiary code-expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
          {isExpanded ? 'Hide Code Examples' : 'Show Code Examples'}
        </button>
      </div>

      {isExpanded && (
        <div className="code-display-content-wrapper">
          <div className="code-display-section">
            <h4 className="code-display-title">Markup</h4>
            <pre className="code-display-content">
              <code>{markup}</code>
            </pre>
          </div>
          <div className="code-display-section">
            <h4 className="code-display-title">CSS</h4>
            <pre className="code-display-content">
              <code>{css}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
