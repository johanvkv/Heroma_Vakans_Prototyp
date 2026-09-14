import React, { useState, useEffect } from 'react';
import { Button } from 'devextreme-react/button';
import DataGrid, { Column } from 'devextreme-react/data-grid';
import { SkeletonLoader } from './SkeletonLoader';
import { Tooltip } from './Tooltip';
import { CardMenu } from './CardMenu';

export const VacationCard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'normal' | 'collapsed' | 'fullscreen'>('normal');

  const vacationData = [
    { typ: 'Betalda dagar', intjanat: 34.00, rest: 34.00 },
    { typ: 'Sparade dagar', intjanat: 30.00, rest: 30.00 },
    { typ: 'Extradag', intjanat: 0.00, rest: 0.00 },
    { typ: 'Obetalda dagar', intjanat: 0.00, rest: 0.00 },
    { typ: 'Betalda timmar', intjanat: 0.00, rest: 0.00 },
    { typ: 'Sparade timmar', intjanat: 0.00, rest: 0.00 },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <SkeletonLoader />;

  return (
    <div className={`card-container border-top-4 ${viewMode === 'fullscreen' ? 'card-fullscreen' : ''}`} data-wizard-target="vacation-card">
      <div className="card-content-wrapper">
        <div className="card-header-row card-header-row-bordered">
          <h3 className="card-title">
            Semestersaldo
            <span className="tooltip-wrapper">
              <i className="fa-solid fa-circle-info card-title-icon"></i>
              <Tooltip text="Visar din totala semesterbalans och sparade dagar" />
            </span>
          </h3>
          <CardMenu viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {viewMode !== 'collapsed' && (
          <div className="card-body">
            <div className="d-flex align-items-start justify-content-between mb-4">
              <div className="small">
                <p className="fw-bold text-foreground m-0">Totalt: 64,00 dagar</p>
                <p className="text-muted-foreground m-0">Varav spar: 30,00 dagar</p>
              </div>
              <span className="tooltip-wrapper">
                <Button text="Semesteröversikt person" icon="fa-solid fa-external-link" className="dx-btn-outline" />
                <Tooltip text="Navigerar dig till semesteröversikt-modulen" />
              </span>
            </div>

            <DataGrid
              dataSource={vacationData}
              showBorders={false}
              showColumnLines={false}
              showRowLines={true}
              hoverStateEnabled={false}
              columnAutoWidth={false}
              width="100%"
            >
              <Column dataField="typ" caption="Typ" alignment="left" />
              <Column dataField="intjanat" caption="Intjänat" alignment="right" width={80} format={{ type: 'fixedPoint', precision: 2 }} />
              <Column dataField="rest" caption="Rest" alignment="right" width={80} format={{ type: 'fixedPoint', precision: 2 }} />
            </DataGrid>
          </div>
        )}
      </div>
    </div>
  );
};
