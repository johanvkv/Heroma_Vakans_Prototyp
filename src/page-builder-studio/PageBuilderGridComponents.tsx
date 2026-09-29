import React from 'react';
import { useDrop } from 'react-dnd';
import { DroppedComponent } from './pageBuilderTypes';
import { extractTextContent, getDefaultTextContent } from './pageBuilderHelpers';
import DataGrid, { Column, Paging, Scrolling, MasterDetail, ColumnChooser } from 'devextreme-react/data-grid';

// Grid sample data
export const pageBuilderGridData = [
  { id: 1, link: 'Name', subLink: 'ID: 001234', name: 'John Smith', idNumber: '123ABC', amount: '1,234,567.89', percentage: 13.67 },
  { id: 2, link: 'Name', subLink: 'ID: 002345', name: 'Jane Smith', idNumber: '456ABC', amount: '1,234,567.89', percentage: 59.00 },
  { id: 3, link: 'Name', subLink: 'ID: 003456', name: 'John Doe',   idNumber: '789ABC', amount: '1,234,567.89', percentage: 47.25 },
  { id: 4, link: 'Name', subLink: 'ID: 004567', name: 'Jane Doe',   idNumber: '123DEF', amount: '1,234,567.89', percentage: 99.99 },
];

// Grid cell renderers
export const PageBuilderGridLinkCell = ({ value }: { value?: string }) => (
  <span className="datagrid-link-cell">{value ?? ''}</span>
);

export const PageBuilderGridActionsCell = ({ data }: { data: any }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return (
    <div className="datagrid-actions-cell" ref={ref}>
      <button className="datagrid-actions-button" onClick={() => setOpen(o => !o)}>
        <i className="fa-solid fa-ellipsis"></i>
      </button>
      {open && (
        <div className="dropdown-list datagrid-actions-flyout">
          <div className="dropdown-list-item" onClick={() => setOpen(false)}>Edit</div>
          <div className="dropdown-list-item" onClick={() => setOpen(false)}>View details</div>
          <div className="dropdown-list-item" onClick={() => setOpen(false)}>Delete</div>
        </div>
      )}
    </div>
  );
};

export const PageBuilderGridDetailView = ({ data }: { data: any }) => {
  const rowData = data?.data;
  if (!rowData) return null;
  return (
    <div className="datagrid-detail-view">
      <div><span className="datagrid-detail-label">Name</span><span>{rowData.name}</span></div>
      <div><span className="datagrid-detail-label">ID Number</span><span>{rowData.idNumber}</span></div>
      <div><span className="datagrid-detail-label">Amount</span><span>${rowData.amount}</span></div>
      <div><span className="datagrid-detail-label">Percentage</span><span>{rowData.percentage}%</span></div>
    </div>
  );
};

export interface GridDetailContextValue {
  gridId: string;
  detailChildrenByRow: { [rowKey: string]: DroppedComponent[] };
  addComponentToRow: (gridId: string, rowKey: string, component: DroppedComponent) => void;
  removeComponentFromRow: (gridId: string, rowKey: string, componentId: string) => void;
  isPreview?: boolean;
}

export const GridDetailContext = React.createContext<GridDetailContextValue | null>(null);

// Per-row drop zone — knows which row it belongs to via rowKey.
export const GridDetailRowDropZone: React.FC<{
  gridId: string;
  rowKey: string;
  addComponentToRow: (gridId: string, rowKey: string, component: DroppedComponent) => void;
}> = ({ gridId, rowKey, addComponentToRow }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT_EXAMPLE',
    drop: (item: { type: string; name: string; component: React.ReactElement; gridFeatures?: any; inputFieldType?: string; inputFieldWidth?: number }, monitor) => {
      if (monitor.didDrop()) return;
      const textContent = item.type.startsWith('text-')
        ? (extractTextContent(item.component) || getDefaultTextContent(item.type))
        : undefined;

      const alertVariant = item.type.startsWith('alert-') ? item.type.replace('alert-', '') as 'info' | 'warning' | 'error' | 'success' : undefined;

      addComponentToRow(gridId, rowKey, {
        id: `${item.type}-${Date.now()}`,
        type: item.type,
        name: item.name,
        component: item.component,
        buttonText: (item.type === 'button' || item.type === 'secondary-button' || item.type === 'tertiary-button') ? 'Button' : undefined,
        textContent,
        detailChildrenByRow: item.type === 'datagrid-expandable' ? {} : undefined,
        gridData: item.type === 'datagrid' ? { columns: [], data: [] } : undefined,
        alertVariant,
        alertMessage: alertVariant ? `This is ${item.type.replace('alert-', '')} alert` : undefined,
        showAlertLink: false,
        alignment: undefined,
        gridFeatures: item.gridFeatures,
        inputType: item.type === 'input-field' ? (item.inputFieldType || 'text') : undefined,
        inputWidth: item.type === 'input-field' ? (item.inputFieldWidth || 270) : undefined,
      });
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver({ shallow: true }) }),
  }), [gridId, rowKey, addComponentToRow]);

  return (
    <div ref={drop} className={`grid-detail-drop-zone${isOver ? ' grid-detail-drop-zone-over' : ''}`}>
      <i className="fa-solid fa-arrow-down"></i>
      <span>Drop any component here — grids, inputs, buttons…</span>
    </div>
  );
};

// Stable module-level component used as DevExtreme MasterDetail content.
// DevExtreme passes { data: { data: rowData, key: rowKey } } as props.
export const GridBuilderDetailContent: React.FC<{ data?: any }> = ({ data }) => {
  const ctx = React.useContext(GridDetailContext);
  if (!ctx) return null;

  // Identify this specific row — DevExtreme MasterDetail wraps data as { data: rowData, key }
  // data.data is the row record; data.key may be an object reference, so prefer id
  const rowKey = String(data?.data?.id ?? data?.key ?? 'row');
  const rowChildren = ctx.detailChildrenByRow[rowKey] || [];

  return (
    <div className="grid-detail-master-content">
      {rowChildren.length > 0 && (
        <div className="grid-detail-children-list">
          {rowChildren.map((child) => {
            let renderedChild = child.component;

            // Render nested expandable grids
            if (child.type === 'datagrid-expandable') {
              renderedChild = (
                <ExpandableGridWithDropZone
                  gridId={child.id}
                  detailChildrenByRow={child.detailChildrenByRow || {}}
                  addComponentToRow={(gId, rk, comp) => {
                    // This is a nested grid, we don't have direct access to the parent callbacks
                    // The component will be added but won't persist - this would need deeper integration
                    console.warn('Nested grid in detail row - persistence not yet implemented');
                  }}
                  removeComponentFromRow={(gId, rk, cId) => {
                    console.warn('Nested grid in detail row - persistence not yet implemented');
                  }}
                  isPreview={ctx.isPreview}
                />
              );
            }

            return (
              <div key={child.id} className="grid-detail-child-item">
                {!ctx.isPreview && (
                  <button
                    className="remove-component-btn grid-detail-item-remove"
                    onClick={() => ctx.removeComponentFromRow(ctx.gridId, rowKey, child.id)}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
                {renderedChild}
              </div>
            );
          })}
        </div>
      )}
      {!ctx.isPreview && (
        <GridDetailRowDropZone
          gridId={ctx.gridId}
          rowKey={rowKey}
          addComponentToRow={ctx.addComponentToRow}
        />
      )}
    </div>
  );
};

// Reusable live DataGrid + context provider for expandable grids anywhere in the tree
export const ExpandableGridWithDropZone: React.FC<{
  gridId: string;
  detailChildrenByRow: { [rowKey: string]: DroppedComponent[] };
  addComponentToRow: (gridId: string, rowKey: string, component: DroppedComponent) => void;
  removeComponentFromRow: (gridId: string, rowKey: string, componentId: string) => void;
  isPreview?: boolean;
}> = ({ gridId, detailChildrenByRow, addComponentToRow, removeComponentFromRow, isPreview }) => (
  <GridDetailContext.Provider value={{ gridId, detailChildrenByRow, addComponentToRow, removeComponentFromRow, isPreview }}>
    <DataGrid
      keyExpr="id"
      dataSource={pageBuilderGridData}
      showBorders={false}
      showColumnLines={false}
      showRowLines={true}
      hoverStateEnabled={true}
      rowAlternationEnabled={true}
      columnAutoWidth={true}
    >
      <Column dataField="link" caption="Link" />
      <Column dataField="name" caption="Name" />
      <Column dataField="idNumber" caption="ID Number" />
      <Column dataField="amount" caption="$ Amount" alignment="right" />
      <MasterDetail enabled={true} component={GridBuilderDetailContent} />
      <ColumnChooser enabled={true} mode="select" />
      <Scrolling mode="standard" />
      <Paging enabled={false} />
    </DataGrid>
  </GridDetailContext.Provider>
);
