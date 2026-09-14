import React, { useState } from 'react';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  title: string;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({ isOpen, onClose, code, title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="code-export-modal-overlay" onClick={onClose}>
      <div className="code-export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="code-export-modal-header">
          <h3>{title}</h3>
          <button className="code-export-close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="code-export-modal-body">
          <div className="code-export-toolbar">
            <button className="btn-secondary" onClick={handleCopy}>
              <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <pre className="code-export-content">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
