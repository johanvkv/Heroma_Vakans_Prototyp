import React, { useState, useEffect } from 'react';
import { SkeletonLoader } from './SkeletonLoader';
import { Alert } from './Alert';
import { Tooltip } from './Tooltip';
import { CardMenu } from './CardMenu';

export const PersonalCasesCard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'normal' | 'collapsed' | 'fullscreen'>('normal');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const ongoingCases = [
    { id: 1, title: 'Semesteransökan 2024', date: '2024-03-10', status: 'Väntar på godkännande' },
  ];

  if (isLoading) return <SkeletonLoader />;

  return (
    <div className={`card-container border-top-4 ${viewMode === 'fullscreen' ? 'card-fullscreen' : ''}`} data-wizard-target="personal-cases-card">
      <div className="card-content-wrapper">
        <div className="card-header-row card-header-row-bordered">
          <h3 className="card-title">
            <span className="position-relative">
              <span className="cursor-pointer" onClick={() => setShowDropdown(!showDropdown)}>
                Att göra
              </span>
              {showDropdown && (
                <div className="card-dropdown">
                  <div className="card-dropdown-item" onClick={() => setShowDropdown(false)}>Att göra</div>
                  <div className="card-dropdown-item" onClick={() => setShowDropdown(false)}>Mina personliga ärenden</div>
                  <div className="card-dropdown-item" onClick={() => setShowDropdown(false)}>Arkiverade ärenden</div>
                </div>
              )}
            </span>
            <span className="tooltip-wrapper">
              <i className="fa-solid fa-circle-info card-title-icon"></i>
              <Tooltip text="Hantera och spåra dina personliga ärenden" />
            </span>
          </h3>
          <CardMenu viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {viewMode !== 'collapsed' && (
          <div className="card-body">
            <div className="mb-3">
              <Alert variant="info" message="Hej! Vädret idag ser toppen ut." />
            </div>

            <div className="position-relative mb-4">
              <input type="text" placeholder="Sök..." className="form-control-custom" />
              <i className="fa-solid fa-search input-icon"></i>
            </div>

            <div className="border-top-1">
              <div className="list-item cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <span className="small text-foreground">Mina pågående ärenden</span>
                <div className="d-flex align-items-center gap-3">
                  <span className="badge-custom">{ongoingCases.length}</span>
                  <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-muted-foreground`}></i>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="mt-3">
                {ongoingCases.map((caseItem) => (
                  <div key={caseItem.id} className="list-item">
                    <span className="text-foreground">{caseItem.title}</span>
                    <div className="d-flex align-items-center gap-3">
                      <span className="text-muted-foreground">{caseItem.date}</span>
                      <span className="badge-custom">{caseItem.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
