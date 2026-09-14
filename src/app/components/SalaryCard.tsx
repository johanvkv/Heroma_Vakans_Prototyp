import React, { useState, useEffect } from 'react';
import { Button } from 'devextreme-react/button';
import { SkeletonLoader } from './SkeletonLoader';
import { Tooltip } from './Tooltip';
import { CardMenu } from './CardMenu';

export const SalaryCard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showSalaryDetails, setShowSalaryDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'normal' | 'collapsed' | 'fullscreen'>('normal');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <SkeletonLoader />;

  return (
    <div className={`card-container border-top-4 ${viewMode === 'fullscreen' ? 'card-fullscreen' : ''}`} data-wizard-target="salary-card">
      <div className="card-content-wrapper">
        <div className="card-header-row card-header-row-bordered">
          <h3 className="card-title">
            Lön
            <span className="tooltip-wrapper">
              <i className="fa-solid fa-circle-info card-title-icon"></i>
              <Tooltip text="Översikt av din lön och utbetalningsdatum" />
            </span>
          </h3>
          <CardMenu viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {viewMode !== 'collapsed' && (
          <div className="card-body">
            <div className="d-flex flex-column gap-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="fw-bold small text-foreground m-0">Nästa utbetalningsdatum: <span className="fw-normal">2026-02-25</span></p>
                </div>
                <span className="tooltip-wrapper">
                  <Button text="Löneuppgifter" icon="fa-solid fa-external-link" className="dx-btn-outline" />
                  <Tooltip text="Navigerar dig till löneuppgifter-modulen" />
                </span>
              </div>

              <div className="border-top-1 pt-4 d-flex align-items-center justify-content-between">
                <span className="fw-bold small">Löneuppgifter</span>
                <Button
                  text={showSalaryDetails ? 'Dölj lön' : 'Visa lön'}
                  icon={showSalaryDetails ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}
                  className="dx-btn-primary"
                  onClick={() => setShowSalaryDetails(!showSalaryDetails)}
                />
              </div>

              {showSalaryDetails && (
                <div className="salary-details-section">
                  <div className="salary-item">
                    <span className="salary-item-label">Aktuell nettolön</span>
                    <span className="salary-item-value">39 755,00 kr</span>
                  </div>
                  <div className="salary-item">
                    <span className="salary-item-label">Preliminär nettolön</span>
                    <span className="salary-item-value">40 007,00 kr</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
