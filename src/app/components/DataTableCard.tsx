import React, { useState } from 'react';
import DataGrid, { Column, Paging, Pager } from 'devextreme-react/data-grid';
import { SearchDropdown } from './SearchDropdown';
import { CardMenu } from './CardMenu';

const dataSource = Array.from({ length: 50 }, (_, i) => ({
  id: `ORD-${1000 + i}`,
  customer: `Customer ${String.fromCharCode(65 + (i % 26))}`,
  status: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Pending' : 'Closed',
  date: new Date(2024, i % 12, (i % 28) + 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  amount: (Math.random() * 10000).toFixed(2),
  percentage: `${(Math.random() * 100).toFixed(1)}%`,
  region: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)],
}));

const dropdownOptions = [
  { id: '1', label: 'All Customers', section: 'Filters' },
  { id: '2', label: 'Active Orders', subtitle: 'Filters/Active Orders', section: 'Filters' },
  { id: '3', label: 'Pending Orders', subtitle: 'Filters/Pending Orders', section: 'Filters' },
  { id: '4', label: 'Closed Orders', subtitle: 'Filters/Closed Orders', section: 'Filters' },
  { id: '5', label: 'North Region', subtitle: 'Regions/North', section: 'Regions' },
  { id: '6', label: 'South Region', subtitle: 'Regions/South', section: 'Regions' },
  { id: '7', label: 'East Region', subtitle: 'Regions/East', section: 'Regions' },
  { id: '8', label: 'West Region', subtitle: 'Regions/West', section: 'Regions' },
];

export const DataTableCard = () => {
  const [viewMode, setViewMode] = useState<'normal' | 'collapsed' | 'fullscreen'>('normal');

  const onCellPrepared = (e: any) => {
    if (e.rowType === 'data' && e.column.dataField === 'customer') {
      e.cellElement.classList.add('link-column');
    }
  };

  return (
    <div className={`card-container border-top-4 ${viewMode === 'fullscreen' ? 'card-fullscreen' : ''}`}>
      <div className="card-content-wrapper">
        <div className="card-header-row card-header-row-bordered">
          <h3 className="card-title">Data Overview</h3>
          <CardMenu viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {viewMode !== 'collapsed' && (
          <div className="card-body">
            <div className="d-flex justify-content-end mb-3">
              <div className="search-dropdown-wrapper">
                <SearchDropdown
                  options={dropdownOptions}
                  placeholder="Search filters..."
                  onSelect={(option) => console.log('Selected:', option)}
                />
              </div>
            </div>

            <DataGrid
              dataSource={dataSource}
              showBorders={false}
              rowAlternationEnabled={true}
              columnAutoWidth={true}
              hoverStateEnabled={true}
              onCellPrepared={onCellPrepared}
              className="data-table-grid"
            >
              <Paging defaultPageSize={10} />
              <Pager showPageSizeSelector={true} allowedPageSizes={[5, 10, 20, 50]} showInfo={true} displayMode="full" />
              <Column dataField="customer" caption="Customer" alignment="left" />
              <Column dataField="id" caption="Order ID" alignment="left" width={120} />
              <Column dataField="status" caption="Status" alignment="left" width={100} />
              <Column dataField="region" caption="Region" alignment="left" width={100} />
              <Column dataField="date" caption="Date" alignment="left" width={130} />
              <Column dataField="amount" caption="Amount ($)" alignment="right" width={120} />
              <Column dataField="percentage" caption="Percentage" alignment="right" width={120} />
            </DataGrid>
          </div>
        )}
      </div>
    </div>
  );
};
