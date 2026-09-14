import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { GridData, GridColumn, DroppedComponent } from './pageBuilderTypes';

// ── Default data ──────────────────────────────────────────────────────────────

export const DEFAULT_GRID_DATA: GridData = {
  columns: [
    { dataField: 'col0', caption: 'Name' },
    { dataField: 'col1', caption: 'ID Number' },
    { dataField: 'col2', caption: 'Amount' },
  ],
  data: [
    { id: 1, col0: 'John Smith',  col1: '123ABC', col2: '1,234.00' },
    { id: 2, col0: 'Jane Smith',  col1: '456ABC', col2: '2,345.00' },
    { id: 3, col0: 'John Doe',    col1: '789ABC', col2: '3,456.00' },
  ],
};

// ── Inline-edit cell ──────────────────────────────────────────────────────────

const EditableCell: React.FC<{
  value: string;
  onCommit: (val: string) => void;
  isHeader?: boolean;
}> = ({ value, onCommit, isHeader }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onCommit(draft);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="pb-grid-cell-input"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(value); setEditing(false); }
          e.stopPropagation();
        }}
        onClick={e => e.stopPropagation()}
      />
    );
  }

  return (
    <span
      className={`pb-grid-cell-text${isHeader ? ' pb-grid-header-text' : ''}`}
      title="Click to edit"
      onClick={e => { e.stopPropagation(); setEditing(true); }}
    >
      {value || <span className="pb-grid-cell-placeholder">{isHeader ? 'Column name' : 'Empty'}</span>}
    </span>
  );
};

// ── Extract icon class name from a dragged icon element ──────────────────────
// Icon items carry a component like <i className="fa-solid fa-house" />
// We extract just the icon name part (e.g. "house") for storage.
const extractIconName = (component: React.ReactElement): string => {
  const cls: string = component?.props?.className || '';
  const match = cls.match(/fa-([a-z0-9-]+)(?:\s|$)/g);
  // Skip "fa-solid", "fa-regular" etc. — take the last token
  if (match) {
    const names = match.map(m => m.trim().replace('fa-', ''));
    const icon = names.find(n => !['solid', 'regular', 'light', 'duotone', 'brands'].includes(n));
    if (icon) return icon;
  }
  return 'circle';
};

// ── Compact action button renderer ────────────────────────────────────────────

const ActionButton: React.FC<{ btn: DroppedComponent }> = ({ btn }) => {
  // Icon-only button
  if (btn.type === 'icon') {
    return (
      <button className="btn-tertiary pb-grid-action-btn pb-grid-action-icon-btn" title={btn.name}>
        <i className={`fa-solid fa-${btn.buttonIcon || 'circle'}`}></i>
      </button>
    );
  }
  const cls = btn.type === 'secondary-button' ? 'btn-secondary' : btn.type === 'tertiary-button' ? 'btn-tertiary' : 'btn-primary';
  return (
    <button className={`${cls} pb-grid-action-btn`} title={btn.buttonText || 'Action'}>
      {btn.buttonIcon && btn.buttonIconPosition === 'left' && (
        <i className={`fa-solid fa-${btn.buttonIcon}`}></i>
      )}
      {btn.buttonText && btn.type !== 'tertiary-button' && <span>{btn.buttonText}</span>}
      {btn.buttonIcon && btn.buttonIconPosition === 'right' && (
        <i className={`fa-solid fa-${btn.buttonIcon}`}></i>
      )}
      {!btn.buttonText && !btn.buttonIcon && <i className="fa-solid fa-ellipsis-vertical"></i>}
    </button>
  );
};

// ── Action column drop zone ───────────────────────────────────────────────────

const ActionColumnDropZone: React.FC<{
  children: DroppedComponent[];
  onDrop: (btn: DroppedComponent) => void;
  onRemove: (id: string) => void;
}> = ({ children, onDrop, onRemove }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT_EXAMPLE',
    drop: (item: { type: string; name: string; component: React.ReactElement }, monitor) => {
      if (monitor.didDrop()) return;
      const isBtn = item.type === 'button' || item.type === 'secondary-button' || item.type === 'tertiary-button';
      const isIcon = item.type === 'icon';
      if (!isBtn && !isIcon) return;
      if (isIcon) {
        onDrop({
          id: `icon-${Date.now()}`,
          type: 'icon',
          name: item.name,
          component: item.component,
          buttonIcon: extractIconName(item.component),
          buttonText: undefined,
          buttonIconPosition: undefined,
        });
      } else {
        onDrop({
          id: `${item.type}-${Date.now()}`,
          type: item.type,
          name: item.name,
          component: item.component,
          buttonText: 'Action',
          buttonIcon: undefined,
          buttonIconPosition: undefined,
        });
      }
    },
    collect: m => ({ isOver: !!m.isOver({ shallow: true }) }),
  }), [onDrop]);

  return (
    <div
      ref={drop}
      className={`pb-grid-action-dropzone${isOver ? ' pb-grid-action-dropzone--over' : ''}`}
    >
      {children.length === 0 ? (
        <span className="pb-grid-action-dropzone-hint">
          <i className="fa-solid fa-arrow-down"></i> Drop buttons or icons
        </span>
      ) : (
        <div className="pb-grid-action-btns">
          {children.map(btn => (
            <div key={btn.id} className="pb-grid-action-btn-wrap">
              <ActionButton btn={btn} />
              <button
                className="pb-grid-action-btn-remove"
                title="Remove"
                onClick={e => { e.stopPropagation(); onRemove(btn.id); }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

interface PageBuilderDataGridProps {
  gridData: GridData;
  onChange: (updated: GridData) => void;
  hasActionsColumn?: boolean;
  actionColumnChildren?: DroppedComponent[];
  onActionColumnChildrenChange?: (children: DroppedComponent[]) => void;
}

export const PageBuilderDataGrid: React.FC<PageBuilderDataGridProps> = ({
  gridData,
  onChange,
  hasActionsColumn = false,
  actionColumnChildren = [],
  onActionColumnChildrenChange,
}) => {
  const { columns, data } = gridData;

  // ── Column mutations ──
  const updateCaption = useCallback((colIdx: number, caption: string) => {
    onChange({ ...gridData, columns: columns.map((c, i) => i === colIdx ? { ...c, caption } : c) });
  }, [columns, gridData, onChange]);

  const addColumn = useCallback(() => {
    const field = `col${Date.now()}`;
    onChange({
      columns: [...columns, { dataField: field, caption: `Column ${columns.length + 1}` }],
      data: data.map(row => ({ ...row, [field]: '' })),
    });
  }, [columns, data, gridData, onChange]);

  const removeColumn = useCallback((colIdx: number) => {
    if (columns.length <= 1) return;
    const field = columns[colIdx].dataField;
    onChange({
      columns: columns.filter((_, i) => i !== colIdx),
      data: data.map(row => { const r = { ...row }; delete r[field]; return r; }),
    });
  }, [columns, data, gridData, onChange]);

  // ── Row mutations ──
  const updateCell = useCallback((rowIdx: number, field: string, value: string) => {
    onChange({ ...gridData, data: data.map((row, i) => i === rowIdx ? { ...row, [field]: value } : row) });
  }, [data, gridData, onChange]);

  const addRow = useCallback(() => {
    const newRow: any = { id: Date.now() };
    columns.forEach(c => { newRow[c.dataField] = ''; });
    onChange({ ...gridData, data: [...data, newRow] });
  }, [columns, data, gridData, onChange]);

  const removeRow = useCallback((rowIdx: number) => {
    onChange({ ...gridData, data: data.filter((_, i) => i !== rowIdx) });
  }, [data, gridData, onChange]);

  // ── Action column mutations ──
  const addActionBtn = useCallback((btn: DroppedComponent) => {
    onActionColumnChildrenChange?.([...actionColumnChildren, btn]);
  }, [actionColumnChildren, onActionColumnChildrenChange]);

  const removeActionBtn = useCallback((id: string) => {
    onActionColumnChildrenChange?.(actionColumnChildren.filter(b => b.id !== id));
  }, [actionColumnChildren, onActionColumnChildrenChange]);

  return (
    <div className="pb-grid-editor">

      <table className="pb-grid-table">
        <thead>
          <tr className="pb-grid-header-row">
            {columns.map((col, ci) => (
              <th key={col.dataField} className="pb-grid-th">
                <div className="pb-grid-th-inner">
                  <EditableCell
                    value={col.caption}
                    isHeader
                    onCommit={val => updateCaption(ci, val)}
                  />
                  {columns.length > 1 && (
                    <button
                      className="pb-grid-col-remove"
                      title="Remove column"
                      onClick={e => { e.stopPropagation(); removeColumn(ci); }}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </div>
              </th>
            ))}

            {/* add-column button */}
            <th className="pb-grid-th pb-grid-th-add">
              <button className="pb-grid-add-col-btn" title="Add column" onClick={addColumn}>
                <i className="fa-solid fa-plus"></i>
              </button>
            </th>

            {/* actions column header */}
            {hasActionsColumn && (
              <th className="pb-grid-th pb-grid-th-actions-col">
                <span className="pb-grid-header-text">Actions</span>
              </th>
            )}

            {/* row-remove spacer */}
            <th className="pb-grid-th pb-grid-th-row-remove" />
          </tr>
        </thead>

        <tbody>
          {data.map((row, ri) => (
            <tr key={row.id ?? ri} className="pb-grid-row">
              {columns.map(col => (
                <td key={col.dataField} className="pb-grid-td">
                  <EditableCell
                    value={String(row[col.dataField] ?? '')}
                    onCommit={val => updateCell(ri, col.dataField, val)}
                  />
                </td>
              ))}

              {/* empty cell under add-column header */}
              <td className="pb-grid-td" />

              {/* actions column cells */}
              {hasActionsColumn && (
                <td className="pb-grid-td pb-grid-td-actions-col">
                  {ri === 0 && onActionColumnChildrenChange ? (
                    // First row shows the drop zone for configuration
                    <ActionColumnDropZone
                      children={actionColumnChildren}
                      onDrop={addActionBtn}
                      onRemove={removeActionBtn}
                    />
                  ) : (
                    // Other rows show the buttons (or three dots placeholder)
                    <div className="pb-grid-action-btns">
                      {actionColumnChildren.length === 0 ? (
                        <button className="btn-tertiary pb-grid-action-btn">
                          <i className="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                      ) : (
                        actionColumnChildren.map(btn => (
                          <ActionButton key={btn.id} btn={btn} />
                        ))
                      )}
                    </div>
                  )}
                </td>
              )}

              {/* row remove */}
              <td className="pb-grid-td pb-grid-td-row-remove">
                <button
                  className="pb-grid-row-remove"
                  title="Remove row"
                  onClick={e => { e.stopPropagation(); removeRow(ri); }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td
              colSpan={columns.length + 2 + (hasActionsColumn ? 1 : 0)}
              className="pb-grid-add-row-cell"
            >
              <button className="pb-grid-add-row-btn" onClick={addRow}>
                <i className="fa-solid fa-plus"></i>
                Add row
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
