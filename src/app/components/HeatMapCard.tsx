import React, { useState } from 'react';

interface HeatMapData {
  category: string;
  central: string;
  east: string;
  south: string;
  west: string;
  centralLevel: number;
  eastLevel: number;
  southLevel: number;
  westLevel: number;
}

const heatMapData: HeatMapData[] = [
  {
    category: 'Mobile phones',
    central: '$4,400',
    east: '$4,620',
    south: '$2,500',
    west: '$2,804',
    centralLevel: 5,
    eastLevel: 5,
    southLevel: 3,
    westLevel: 3,
  },
  {
    category: 'Laptops & Tablets',
    central: '$2,100',
    east: '$2,350',
    south: '$2,380',
    west: '$1,204',
    centralLevel: 3,
    eastLevel: 3,
    southLevel: 3,
    westLevel: 2,
  },
  {
    category: 'Wearable devices',
    central: '$2,030',
    east: '$3,102',
    south: '$2,420',
    west: '$3,820',
    centralLevel: 3,
    eastLevel: 4,
    southLevel: 1,
    westLevel: 4,
  },
  {
    category: 'Home appliances',
    central: '$2,500',
    east: '$2,920',
    south: '$4,912',
    west: '$2,210',
    centralLevel: 3,
    eastLevel: 3,
    southLevel: 5,
    westLevel: 3,
  },
  {
    category: 'Audio & Headphones',
    central: '$2,730',
    east: '$1,960',
    south: '$2,790',
    west: '$4,231',
    centralLevel: 1,
    eastLevel: 2,
    southLevel: 3,
    westLevel: 5,
  },
  {
    category: 'Computer accessories',
    central: '$2,420',
    east: '$2,212',
    south: '$2,030',
    west: '$2,520',
    centralLevel: 3,
    eastLevel: 3,
    southLevel: 3,
    westLevel: 3,
  },
];

export const HeatMapCard = () => {
  const [viewMode, setViewMode] = useState<'normal' | 'minimized' | 'fullscreen'>('normal');

  const handleMinimize = () => {
    setViewMode('minimized');
  };

  const handleFullscreen = () => {
    if (viewMode === 'fullscreen') {
      setViewMode('normal');
    } else {
      setViewMode('fullscreen');
    }
  };

  const getCellClass = (level: number) => {
    switch (level) {
      case 1:
        return 'heatmap-cell-level-1';
      case 2:
        return 'heatmap-cell-level-2';
      case 3:
        return 'heatmap-cell-level-3';
      case 4:
        return 'heatmap-cell-level-4';
      case 5:
        return 'heatmap-cell-level-5';
      default:
        return 'heatmap-cell-level-1';
    }
  };

  return (
    <div className={`card-container ${viewMode === 'fullscreen' ? 'card-fullscreen' : ''}`}>
      {/* Card Header */}
      <div className="card-header">
        <h3 className="card-title">Q1 Regional electronic</h3>
      </div>

      {/* Card Content */}
      {viewMode !== 'minimized' && (
        <></>
      )}
    </div>
  );
};