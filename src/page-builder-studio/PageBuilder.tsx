import React, { useState, useCallback, useEffect } from 'react';
import { DroppedComponent, StepperData, StepperStep, GridColumn, GridData, AccordionSection, TreeRowItem, TabSection, SchedulerEvent } from './pageBuilderTypes';
import { buildExportCode } from './pageBuilderExport';
import { copyFramesToClipboard } from './figmaFrameExport';
import { getPageLocations, getMenuNameById } from '../data/menu';
import { serializeComponents, deserializeComponents } from './pageBuilderSerialize';
import { useDrag, useDrop } from 'react-dnd';
import DataGrid, { Column, Paging, Scrolling, MasterDetail, ColumnChooser, Selection, SearchPanel } from 'devextreme-react/data-grid';
import TreeList, { Column as TreeColumn, Paging as TreePaging, Scrolling as TreeScrolling } from 'devextreme-react/tree-list';
import TextBox from 'devextreme-react/text-box';
import TextArea from 'devextreme-react/text-area';
import DateBox from 'devextreme-react/date-box';
import SelectBox from 'devextreme-react/select-box';
import Scheduler, { View as SchedulerView } from 'devextreme-react/scheduler';
import { NavigationSidebar } from '../app/components/NavigationSidebar';
import { Spacer } from '../app/components/Spacer';
import { SidebarContentLayout } from '../app/components/SidebarContentLayout';
import { Alert } from '../app/components/Alert';
import { extractTextContent, getDefaultTextContent, DEFAULT_ACCORDION_SECTIONS, DEFAULT_TAB_SECTIONS, DEFAULT_STEPPER_STEPS, DEFAULT_SCHEDULER_EVENTS } from './pageBuilderHelpers';
import { PageBuilderDataGrid, DEFAULT_GRID_DATA } from './PageBuilderDataGrid';
import { EditableComponent, CardInStepDropZone } from './PageBuilderEditableComponents';
import { pageBuilderGridData, PageBuilderGridLinkCell, PageBuilderGridActionsCell, PageBuilderGridDetailView, ExpandableGridWithDropZone } from './PageBuilderGridComponents';
import { AccordionWithContext } from './PageBuilderAccordionContext';
import { TabsWithContext } from './PageBuilderTabsContext';

// Stable TreeList editor (defined at module level so React never remounts it on parent re-renders)
const PbTreeListEditor: React.FC<{
  component: DroppedComponent;
  updateComponent?: (id: string, updates: Partial<DroppedComponent>) => void;
  colSize?: number;
  updateColSize?: (id: string, size: number) => void;
  removeComponent?: (id: string) => void;
  showToolbar?: boolean;
}> = ({ component, colSize, updateColSize, removeComponent, updateComponent, showToolbar = true }) => {
  const [rows, setRows] = useState<TreeRowItem[]>(
    component.treeData && component.treeData.length > 0
      ? component.treeData
      : [
          { id: 1, parentId: null, name: 'Row 1' },
          { id: 2, parentId: null, name: 'Row 2' },
          { id: 3, parentId: 2,    name: 'Child of Row 2' },
        ]
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addingChildOf, setAddingChildOf] = useState<number | null>(null);
  const [newRowName, setNewRowName] = useState('');

  const nextId = () => Math.max(0, ...rows.map(r => r.id)) + 1;

  const save = (updated: TreeRowItem[]) => {
    setRows(updated);
    if (updateComponent) updateComponent(component.id, { treeData: updated });
  };

  const commitEdit = () => {
    if (editingId === null) return;
    save(rows.map(r => r.id === editingId ? { ...r, name: editValue } : r));
    setEditingId(null);
  };

  const addRow = () => {
    const name = newRowName.trim() || 'New Row';
    save([...rows, { id: nextId(), parentId: null, name }]);
    setNewRowName('');
  };

  const addChildRow = (parentId: number) => {
    const name = newRowName.trim() || 'New Child Row';
    save([...rows, { id: nextId(), parentId, name }]);
    setNewRowName('');
    setAddingChildOf(null);
  };

  const removeRow = (id: number) => {
    const idsToRemove = new Set<number>();
    const collect = (pid: number) => {
      idsToRemove.add(pid);
      rows.filter(r => r.parentId === pid).forEach(r => collect(r.id));
    };
    collect(id);
    save(rows.filter(r => !idsToRemove.has(r.id)));
  };

  return (
    <div>
      {showToolbar && updateColSize && removeComponent && (
        <div className="accordion-builder-toolbar">
          <select
            className="dropped-component-size-select"
            value={colSize ?? 12}
            onChange={(e) => updateColSize(component.id, parseInt(e.target.value))}
            onClick={(e) => e.stopPropagation()}
          >
            <option value={12}>Full Width (12)</option>
            <option value={6}>Half (6)</option>
            <option value={4}>Third (4)</option>
            <option value={3}>Quarter (3)</option>
            <option value={8}>Two Thirds (8)</option>
            <option value={9}>Three Quarters (9)</option>
          </select>
          <button className="remove-component-btn" onClick={() => removeComponent(component.id)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      <TreeList
        dataSource={rows}
        keyExpr="id"
        parentIdExpr="parentId"
        rootValue={null}
        showBorders={false}
        showColumnLines={false}
        showRowLines={true}
        hoverStateEnabled={true}
        style={{ width: '100%' }}
      >
        <TreeColumn
          dataField="name"
          caption="Name"
          cellRender={(cellData: any) => {
            const rowId = cellData.data.id;
            return editingId === rowId ? (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input
                  className="page-builder-input"
                  value={editValue}
                  autoFocus
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null); }}
                  style={{ flex: 1, padding: '2px 6px' }}
                />
                <button className="pb-treelist-action-btn" onClick={commitEdit}><i className="fa-solid fa-check"></i></button>
                <button className="pb-treelist-action-btn" onClick={() => setEditingId(null)}><i className="fa-solid fa-xmark"></i></button>
              </div>
            ) : (
              <span style={{ cursor: 'default' }}>{cellData.data.name}</span>
            );
          }}
        />
        <TreeColumn
          caption=""
          width={110}
          allowSorting={false}
          cellRender={(cellData: any) => {
            const rowId = cellData.data.id;
            return (
              <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                <button
                  className="pb-treelist-action-btn"
                  title="Edit row"
                  onClick={() => { setEditingId(rowId); setEditValue(cellData.data.name); setAddingChildOf(null); }}
                ><i className="fa-solid fa-pen"></i></button>
                <button
                  className="pb-treelist-action-btn"
                  title="Add child row"
                  onClick={() => { setAddingChildOf(rowId); setNewRowName(''); setEditingId(null); }}
                ><i className="fa-solid fa-arrow-turn-down"></i></button>
                <button
                  className="pb-treelist-action-btn pb-treelist-action-btn--danger"
                  title="Remove row"
                  onClick={() => removeRow(rowId)}
                ><i className="fa-solid fa-trash"></i></button>
              </div>
            );
          }}
        />
        <TreeScrolling mode="standard" />
        <TreePaging enabled={false} />
      </TreeList>

      {addingChildOf !== null && (
        <div className="pb-treelist-add-row">
          <span className="pb-treelist-add-label">
            <i className="fa-solid fa-arrow-turn-down"></i>
            Child of: <strong>{rows.find(r => r.id === addingChildOf)?.name}</strong>
          </span>
          <input
            className="page-builder-input"
            placeholder="Child row name"
            value={newRowName}
            autoFocus
            onChange={e => setNewRowName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addChildRow(addingChildOf!); if (e.key === 'Escape') setAddingChildOf(null); }}
            style={{ flex: 1 }}
          />
          <button className="pb-treelist-action-btn" onClick={() => addChildRow(addingChildOf!)}><i className="fa-solid fa-check"></i></button>
          <button className="pb-treelist-action-btn" onClick={() => setAddingChildOf(null)}><i className="fa-solid fa-xmark"></i></button>
        </div>
      )}

      <div className="pb-treelist-add-row">
        <input
          className="page-builder-input"
          placeholder="New root row name"
          value={addingChildOf === null ? newRowName : ''}
          onChange={e => setNewRowName(e.target.value)}
          onFocus={() => setAddingChildOf(null)}
          onKeyDown={e => { if (e.key === 'Enter') addRow(); }}
          style={{ flex: 1 }}
        />
        <button className="page-builder-create-btn" onClick={addRow} style={{ padding: '6px 12px' }}>
          <i className="fa-solid fa-plus"></i> Add Row
        </button>
      </div>
    </div>
  );
};


interface PageLocation {
  id: string;
  name: string;
  children?: PageLocation[];
}

const DraggableCardChild: React.FC<{
  child: DroppedComponent;
  index: number;
  cardId: string;
  allChildren: DroppedComponent[];
  removeComponentFromCard: (cardId: string, componentId: string) => void;
  updateComponentInCard: (cardId: string, componentId: string, updates: Partial<DroppedComponent>) => void;
  moveComponentInCard: (cardId: string, dragIndex: number, hoverIndex: number) => void;
  addComponentToRowInCard: (cardId: string, gridId: string, rowKey: string, component: DroppedComponent) => void;
  removeComponentFromRowInCard: (cardId: string, gridId: string, rowKey: string, componentId: string) => void;
  tabsActiveStates: { [tabsId: string]: number };
  setActiveTab: (tabsId: string, index: number) => void;
}> = ({ child, index, cardId, allChildren, removeComponentFromCard, updateComponentInCard, moveComponentInCard, addComponentToRowInCard, removeComponentFromRowInCard, tabsActiveStates, setActiveTab }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CARD_CHILD',
    item: { index, cardId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [index, cardId]);

  const [, drop] = useDrop(() => ({
    accept: 'CARD_CHILD',
    hover: (item: { index: number; cardId: string }) => {
      if (item.cardId !== cardId) {
        return; // Only allow reordering within the same card
      }
      if (item.index !== index) {
        moveComponentInCard(cardId, item.index, index);
        item.index = index;
      }
    },
  }), [index, cardId, moveComponentInCard]);

  const removeBtn = (
    <button className="remove-component-btn" onClick={() => removeComponentFromCard(cardId, child.id)}>
      <i className="fa-solid fa-xmark"></i>
    </button>
  );

  if (child.type === 'treelist') {
    return (
      <div
        ref={(node) => drag(drop(node))}
        className="card-child-component"
        style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
      >
        {removeBtn}
        <PbTreeListEditor
          component={child}
          updateComponent={(id, updates) => updateComponentInCard(cardId, id, updates)}
          showToolbar={false}
        />
      </div>
    );
  }

  if (child.type === 'datagrid') {
    return (
      <div
        ref={(node) => drag(drop(node))}
        className="card-child-component col-md-12"
        style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
      >
        {removeBtn}
        <PageBuilderDataGrid
          gridData={child.gridData || DEFAULT_GRID_DATA}
          onChange={updated => updateComponentInCard(cardId, child.id, { gridData: updated })}
          hasActionsColumn={!!child.gridFeatures?.actions}
          actionColumnChildren={child.actionColumnChildren || []}
          onActionColumnChildrenChange={children => updateComponentInCard(cardId, child.id, { actionColumnChildren: children })}
        />
      </div>
    );
  }

  if (child.type === 'datagrid-expandable') {
    return (
      <div
        ref={(node) => drag(drop(node))}
        className="card-child-component"
        style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move', padding: 0, overflow: 'hidden' }}
      >
        {removeBtn}
        <ExpandableGridWithDropZone
          gridId={child.id}
          detailChildrenByRow={child.detailChildrenByRow || {}}
          addComponentToRow={(gId, rowKey, comp) => addComponentToRowInCard(cardId, gId, rowKey, comp)}
          removeComponentFromRow={(gId, rowKey, compId) => removeComponentFromRowInCard(cardId, gId, rowKey, compId)}
        />
      </div>
    );
  }

  if (child.type === 'accordion') {
    const currentSections = child.accordionSections || DEFAULT_ACCORDION_SECTIONS.map(s => ({ ...s, children: [] }));
    return (
      <div
        ref={(node) => drag(drop(node))}
        className="card-child-component"
        style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
      >
        {removeBtn}
        <AccordionWithContext
          accordionId={child.id}
          sections={currentSections}
          isPreview={false}
          updateSectionTitle={(_accordionId, sectionId, title) => {
            const newSections = currentSections.map(s => s.id === sectionId ? { ...s, title } : s);
            updateComponentInCard(cardId, child.id, { accordionSections: newSections });
          }}
          addComponentToSection={(_accordionId, sectionId, newChild) => {
            const newSections = currentSections.map(s => s.id === sectionId ? { ...s, children: [...s.children, newChild] } : s);
            updateComponentInCard(cardId, child.id, { accordionSections: newSections });
          }}
          removeComponentFromSection={(_accordionId, sectionId, componentId) => {
            const newSections = currentSections.map(s => s.id === sectionId ? { ...s, children: s.children.filter(ch => ch.id !== componentId) } : s);
            updateComponentInCard(cardId, child.id, { accordionSections: newSections });
          }}
          updateComponentInSection={(_accordionId, sectionId, componentId, updates) => {
            const newSections = currentSections.map(s => s.id === sectionId ? { ...s, children: s.children.map(ch => ch.id === componentId ? { ...ch, ...updates } : ch) } : s);
            updateComponentInCard(cardId, child.id, { accordionSections: newSections });
          }}
        />
      </div>
    );
  }

  if (child.type === 'tabs' || child.type === 'tabs-icons') {
    const currentSections = child.tabSections || DEFAULT_TAB_SECTIONS.map(t => ({ ...t, children: [] }));
    return (
      <div
        ref={(node) => drag(drop(node))}
        className="card-child-component"
        style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
      >
        {removeBtn}
        <TabsWithContext
          tabsId={child.id}
          sections={currentSections}
          activeTab={tabsActiveStates[child.id] || 0}
          isPreview={false}
          setActiveTab={(_, index) => setActiveTab(child.id, index)}
          updateTabTitle={(_tabsId, tabId, title) => {
            const newSections = currentSections.map(t => t.id === tabId ? { ...t, title } : t);
            updateComponentInCard(cardId, child.id, { tabSections: newSections });
          }}
          addTab={(_tabsId) => {
            const newTabNumber = currentSections.length + 1;
            const newTab: TabSection = { id: `t${Date.now()}`, title: `Tab ${newTabNumber}`, children: [] };
            updateComponentInCard(cardId, child.id, { tabSections: [...currentSections, newTab] });
          }}
          removeTab={(_tabsId, tabId) => {
            const newSections = currentSections.filter(t => t.id !== tabId);
            if (newSections.length > 0) {
              updateComponentInCard(cardId, child.id, { tabSections: newSections });
            }
          }}
          addComponentToTab={(_tabsId, tabId, newChild) => {
            const newSections = currentSections.map(t => t.id === tabId ? { ...t, children: [...t.children, newChild] } : t);
            updateComponentInCard(cardId, child.id, { tabSections: newSections });
          }}
          removeComponentFromTab={(_tabsId, tabId, componentId) => {
            const newSections = currentSections.map(t => t.id === tabId ? { ...t, children: t.children.filter(ch => ch.id !== componentId) } : t);
            updateComponentInCard(cardId, child.id, { tabSections: newSections });
          }}
          updateComponentInTab={(_tabsId, tabId, componentId, updates) => {
            const newSections = currentSections.map(t => t.id === tabId ? { ...t, children: t.children.map(ch => ch.id === componentId ? { ...ch, ...updates } : ch) } : t);
            updateComponentInCard(cardId, child.id, { tabSections: newSections });
          }}
        />
      </div>
    );
  }

  // Handle nested cards with width selector and their own dropzone
  if (child.type === 'card') {
    const colSize = child.colSize || 12;
    return (
      <div
        ref={(node) => drag(drop(node))}
        className="card-child-component"
        style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move', padding: 0 }}
      >
        {removeBtn}
        <div className="card-standard">
          <div className="card-header-wrapper">
            <h2 className="card-title-standard">{child.title || 'Card Title'}</h2>
            <div className="card-header-actions">
              <select
                className="dropped-component-size-select"
                value={colSize}
                onChange={(e) => {
                  const newSize = parseInt(e.target.value);
                  updateComponentInCard(cardId, child.id, { colSize: newSize });
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <option value={12}>Full Width (12)</option>
                <option value={6}>Half (6)</option>
                <option value={4}>Third (4)</option>
                <option value={3}>Quarter (3)</option>
                <option value={8}>Two Thirds (8)</option>
                <option value={9}>Three Quarters (9)</option>
              </select>
            </div>
          </div>
          <div className="card-body-standard">
            <CardDropZone
              cardId={child.id}
              children={child.children || []}
              addComponentToCard={(nestedCardId, component) => {
                const updatedNestedCard = {
                  ...child,
                  children: [...(child.children || []), component]
                };
                updateComponentInCard(cardId, child.id, updatedNestedCard);
              }}
              removeComponentFromCard={(nestedCardId, componentId) => {
                const updatedNestedCard = {
                  ...child,
                  children: (child.children || []).filter(c => c.id !== componentId)
                };
                updateComponentInCard(cardId, child.id, updatedNestedCard);
              }}
              updateComponentInCard={(nestedCardId, componentId, updates) => {
                const updatedNestedCard = {
                  ...child,
                  children: (child.children || []).map(c => c.id === componentId ? { ...c, ...updates } : c)
                };
                updateComponentInCard(cardId, child.id, updatedNestedCard);
              }}
              moveComponentInCard={(nestedCardId, dragIndex, hoverIndex) => {
                const newChildren = [...(child.children || [])];
                const [removed] = newChildren.splice(dragIndex, 1);
                newChildren.splice(hoverIndex, 0, removed);
                updateComponentInCard(cardId, child.id, { children: newChildren });
              }}
              addComponentToRowInCard={addComponentToRowInCard}
              removeComponentFromRowInCard={removeComponentFromRowInCard}
              tabsActiveStates={tabsActiveStates}
              setActiveTab={setActiveTab}
            />
          </div>
        </div>
      </div>
    );
  }

  const isBtn = child.type === 'button' || child.type === 'secondary-button' ||
    child.type === 'tertiary-button' || child.type.startsWith('segmented-');

  if (isBtn) {
    const prevIsBtn = index > 0 && (() => { const p = allChildren[index - 1]; return p.type === 'button' || p.type === 'secondary-button' || p.type === 'tertiary-button' || p.type.startsWith('segmented-'); })();
    return (
      <div
        ref={(node) => drag(drop(node))}
        key={child.id}
        className={prevIsBtn ? 'col-auto' : 'col-auto ms-auto'}
        style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move', paddingTop: '4px', position: 'relative' }}
      >
        {removeBtn}
        <EditableComponent
          component={child}
          updateComponent={(id, updates) => updateComponentInCard(cardId, id, updates)}
        />
      </div>
    );
  }

  if (child.type === 'sidebar') {
    return (
      <div
        ref={(node) => drag(drop(node))}
        key={child.id}
        className="card-child-component col-md-12"
        style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
      >
        {removeBtn}
        <SidebarContentLayout
          isPreview={false}
          contentByMenuItem={child.sidebarContent || {}}
          selectedMenuItem={child.selectedMenuItem}
          navData={child.sidebarNavData}
          onContentChange={(menuItemId, content) => {
            updateComponentInCard(cardId, child.id, {
              sidebarContent: { ...(child.sidebarContent || {}), [menuItemId]: content },
            });
          }}
          onMenuItemSelect={(menuItemId) => {
            updateComponentInCard(cardId, child.id, { selectedMenuItem: menuItemId });
          }}
          onNavDataChange={(navData) => {
            updateComponentInCard(cardId, child.id, { sidebarNavData: navData });
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={(node) => drag(drop(node))}
      key={child.id}
      className="card-child-component col-md-12"
      style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
    >
      {removeBtn}
      <EditableComponent
        component={child}
        updateComponent={(id, updates) => updateComponentInCard(cardId, id, updates)}
      />
    </div>
  );
};

const CardDropZone: React.FC<{
  cardId: string;
  children: DroppedComponent[];
  addComponentToCard: (cardId: string, component: DroppedComponent) => void;
  removeComponentFromCard: (cardId: string, componentId: string) => void;
  updateComponentInCard: (cardId: string, componentId: string, updates: Partial<DroppedComponent>) => void;
  moveComponentInCard: (cardId: string, dragIndex: number, hoverIndex: number) => void;
  addComponentToRowInCard: (cardId: string, gridId: string, rowKey: string, component: DroppedComponent) => void;
  removeComponentFromRowInCard: (cardId: string, gridId: string, rowKey: string, componentId: string) => void;
  tabsActiveStates: { [tabsId: string]: number };
  setActiveTab: (tabsId: string, index: number) => void;
}> = ({ cardId, children, addComponentToCard, removeComponentFromCard, updateComponentInCard, moveComponentInCard, addComponentToRowInCard, removeComponentFromRowInCard, tabsActiveStates, setActiveTab }) => {
  const [, drop] = useDrop(() => ({
    accept: 'COMPONENT_EXAMPLE',
    drop: (item: { type: string; name: string; component: React.ReactElement; gridFeatures?: any; inputFieldType?: string; inputFieldWidth?: number }, monitor) => {
      // Only handle if this is the direct target
      if (monitor.didDrop()) {
        return;
      }

      const textContent = item.type.startsWith('text-')
        ? (extractTextContent(item.component) || getDefaultTextContent(item.type))
        : undefined;

      const alertVariant = item.type.startsWith('alert-') ? item.type.replace('alert-', '') as 'info' | 'warning' | 'error' | 'success' : undefined;

      const newComponent: DroppedComponent = {
        id: `${item.type}-${Date.now()}`,
        type: item.type,
        name: item.name,
        component: item.component,
        buttonText: (item.type === 'button' || item.type === 'secondary-button' || item.type === 'tertiary-button') ? 'Button' : undefined,
        textContent,
        accordionSections: item.type === 'accordion' ? DEFAULT_ACCORDION_SECTIONS.map(s => ({ ...s, children: [] })) : undefined,
        tabSections: (item.type === 'tabs' || item.type === 'tabs-icons') ? DEFAULT_TAB_SECTIONS.map(t => ({ ...t, children: [] })) : undefined,
        alignment: undefined,
        gridFeatures: item.gridFeatures,
        colSize: (item.type === 'card' || item.type === 'block') ? 12 : undefined,
        children: (item.type === 'card' || item.type === 'block') ? [] : undefined,
        headerLeftChildren: (item.type === 'card' || item.type === 'block') ? [] : undefined,
        headerRightChildren: (item.type === 'card' || item.type === 'block') ? [] : undefined,
        title: item.type === 'card' ? 'Card Title' : undefined,
        detailChildrenByRow: item.type === 'datagrid-expandable' ? {} : undefined,
        gridData: (item.type === 'datagrid' || item.type === 'datagrid-expandable') ? { ...DEFAULT_GRID_DATA, columns: DEFAULT_GRID_DATA.columns.map(c => ({ ...c })), data: DEFAULT_GRID_DATA.data.map(r => ({ ...r })) } : undefined,
        alertVariant,
        alertMessage: alertVariant ? `This is ${item.type.replace('alert-', '')} alert` : undefined,
        showAlertLink: false,
        inputType: item.type === 'input-field' ? (item.inputFieldType || 'text') as DroppedComponent['inputType'] : undefined,
        inputWidth: item.type === 'input-field' ? (item.inputFieldWidth || 270) : undefined,
        sidebarContent: item.type === 'sidebar' ? {} : undefined,
        selectedMenuItem: item.type === 'sidebar' ? '2-2' : undefined,
      };
      addComponentToCard(cardId, newComponent);
    },
  }), [cardId, addComponentToCard]);

  return (
    <div ref={drop} className="card-drop-zone">
      {children.length === 0 ? (
        <div className="card-drop-placeholder">
          <i className="fa-solid fa-arrow-down"></i>
          <p>Drop components here</p>
        </div>
      ) : (
        <div className="card-dropped-components row g-0">
          {children.map((child, index) => (
            <DraggableCardChild
              key={child.id}
              child={child}
              index={index}
              cardId={cardId}
              allChildren={children}
              removeComponentFromCard={removeComponentFromCard}
              updateComponentInCard={updateComponentInCard}
              moveComponentInCard={moveComponentInCard}
              addComponentToRowInCard={addComponentToRowInCard}
              removeComponentFromRowInCard={removeComponentFromRowInCard}
              tabsActiveStates={tabsActiveStates}
              setActiveTab={setActiveTab}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const DraggableCardHeaderChild: React.FC<{
  child: DroppedComponent;
  index: number;
  cardId: string;
  alignment: 'left' | 'right';
  removeComponentFromCardHeader: (cardId: string, componentId: string, alignment: 'left' | 'right') => void;
  updateComponentInCardHeader: (cardId: string, componentId: string, updates: Partial<DroppedComponent>, alignment: 'left' | 'right') => void;
  moveComponentInCardHeader: (cardId: string, dragIndex: number, hoverIndex: number, alignment: 'left' | 'right') => void;
  moveComponentBetweenAlignments: (cardId: string, componentId: string, fromAlignment: 'left' | 'right', toAlignment: 'left' | 'right') => void;
}> = ({ child, index, cardId, alignment, removeComponentFromCardHeader, updateComponentInCardHeader, moveComponentInCardHeader, moveComponentBetweenAlignments }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CARD_HEADER_CHILD',
    item: { index, cardId, alignment, componentId: child.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [index, cardId, alignment, child.id]);

  const [, drop] = useDrop(() => ({
    accept: 'CARD_HEADER_CHILD',
    hover: (item: { index: number; cardId: string; alignment: 'left' | 'right'; componentId: string }) => {
      if (item.cardId !== cardId) {
        return;
      }

      // If dragging to different alignment, move component
      if (item.alignment !== alignment) {
        moveComponentBetweenAlignments(cardId, item.componentId, item.alignment, alignment);
        item.alignment = alignment;
        item.index = index;
      } else if (item.index !== index) {
        // Same alignment, just reorder
        moveComponentInCardHeader(cardId, item.index, index, alignment);
        item.index = index;
      }
    },
  }), [index, cardId, alignment, moveComponentInCardHeader, moveComponentBetweenAlignments]);

  return (
    <div
      ref={(node) => drag(drop(node))}
      key={child.id}
      className="card-header-child-component"
      style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
    >
      <button
        className="remove-component-btn"
        onClick={() => removeComponentFromCardHeader(cardId, child.id, alignment)}
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
      <EditableComponent
        component={child}
        updateComponent={(id, updates) => updateComponentInCardHeader(cardId, id, updates, alignment)}
      />
    </div>
  );
};

const CardHeaderDropZone: React.FC<{
  cardId: string;
  leftChildren: DroppedComponent[];
  rightChildren: DroppedComponent[];
  addComponentToCardHeader: (cardId: string, component: DroppedComponent, alignment: 'left' | 'right') => void;
  removeComponentFromCardHeader: (cardId: string, componentId: string, alignment: 'left' | 'right') => void;
  updateComponentInCardHeader: (cardId: string, componentId: string, updates: Partial<DroppedComponent>, alignment: 'left' | 'right') => void;
  moveComponentInCardHeader: (cardId: string, dragIndex: number, hoverIndex: number, alignment: 'left' | 'right') => void;
  moveComponentBetweenAlignments: (cardId: string, componentId: string, fromAlignment: 'left' | 'right', toAlignment: 'left' | 'right') => void;
}> = ({ cardId, leftChildren, rightChildren, addComponentToCardHeader, removeComponentFromCardHeader, updateComponentInCardHeader, moveComponentInCardHeader, moveComponentBetweenAlignments }) => {

  const [, dropLeft] = useDrop(() => ({
    accept: ['COMPONENT_EXAMPLE', 'CARD_HEADER_CHILD'],
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) {
        return;
      }

      if (item.type) {
        // New component from sidebar
        const textContent = item.type.startsWith('text-')
          ? (extractTextContent(item.component) || getDefaultTextContent(item.type))
          : undefined;

        const newComponent: DroppedComponent = {
          id: `${item.type}-${Date.now()}`,
          type: item.type,
          name: item.name,
          component: item.component,
          buttonText: (item.type === 'button' || item.type === 'secondary-button' || item.type === 'tertiary-button') ? 'Button' : undefined,
          textContent,
          alignment: undefined,
        gridFeatures: item.gridFeatures,
          inputType: item.type === 'input-field' ? (item.inputFieldType || 'text') : undefined,
          inputWidth: item.type === 'input-field' ? (item.inputFieldWidth || 270) : undefined,
        };
        addComponentToCardHeader(cardId, newComponent, 'left');
      } else if (item.componentId && item.alignment === 'right') {
        // Moving from right to left
        moveComponentBetweenAlignments(cardId, item.componentId, 'right', 'left');
      }
    },
  }), [cardId, addComponentToCardHeader, moveComponentBetweenAlignments]);

  const [, dropRight] = useDrop(() => ({
    accept: ['COMPONENT_EXAMPLE', 'CARD_HEADER_CHILD'],
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) {
        return;
      }

      if (item.type) {
        // New component from sidebar
        const textContent = item.type.startsWith('text-')
          ? (extractTextContent(item.component) || getDefaultTextContent(item.type))
          : undefined;

        const newComponent: DroppedComponent = {
          id: `${item.type}-${Date.now()}`,
          type: item.type,
          name: item.name,
          component: item.component,
          buttonText: (item.type === 'button' || item.type === 'secondary-button' || item.type === 'tertiary-button') ? 'Button' : undefined,
          textContent,
          alignment: undefined,
        gridFeatures: item.gridFeatures,
          inputType: item.type === 'input-field' ? (item.inputFieldType || 'text') : undefined,
          inputWidth: item.type === 'input-field' ? (item.inputFieldWidth || 270) : undefined,
        };
        addComponentToCardHeader(cardId, newComponent, 'right');
      } else if (item.componentId && item.alignment === 'left') {
        // Moving from left to right
        moveComponentBetweenAlignments(cardId, item.componentId, 'left', 'right');
      }
    },
  }), [cardId, addComponentToCardHeader, moveComponentBetweenAlignments]);

  const hasAnyChildren = leftChildren.length > 0 || rightChildren.length > 0;

  return (
    <div className="card-header-drop-zones-wrapper">
      <div ref={dropLeft} className={`card-header-drop-zone card-header-drop-zone-left ${leftChildren.length > 0 ? 'has-children' : ''}`}>
        {leftChildren.length === 0 && !hasAnyChildren ? (
          <div className="card-header-drop-placeholder">
            <i className="fa-solid fa-arrow-down"></i>
            <span>Drop here</span>
          </div>
        ) : (
          <div className="card-header-dropped-components">
            {leftChildren.map((child, index) => (
              <DraggableCardHeaderChild
                key={child.id}
                child={child}
                index={index}
                cardId={cardId}
                alignment="left"
                removeComponentFromCardHeader={removeComponentFromCardHeader}
                updateComponentInCardHeader={updateComponentInCardHeader}
                moveComponentInCardHeader={moveComponentInCardHeader}
                moveComponentBetweenAlignments={moveComponentBetweenAlignments}
              />
            ))}
          </div>
        )}
      </div>

      {hasAnyChildren && (
        <div ref={dropRight} className={`card-header-drop-zone card-header-drop-zone-right ${rightChildren.length > 0 ? 'has-children' : ''}`}>
          {rightChildren.length === 0 ? (
            <div className="card-header-drop-placeholder">
              <i className="fa-solid fa-arrow-down"></i>
              <span>Drop here</span>
            </div>
          ) : (
            <div className="card-header-dropped-components">
              {rightChildren.map((child, index) => (
                <DraggableCardHeaderChild
                  key={child.id}
                  child={child}
                  index={index}
                  cardId={cardId}
                  alignment="right"
                  removeComponentFromCardHeader={removeComponentFromCardHeader}
                  updateComponentInCardHeader={updateComponentInCardHeader}
                  moveComponentInCardHeader={moveComponentInCardHeader}
                  moveComponentBetweenAlignments={moveComponentBetweenAlignments}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Inline-editable step label ───────────────────────────────────────────────
const EditableStepLabel: React.FC<{
  label: string;
  onCommit: (val: string) => void;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}> = ({ label, onCommit, isActive, isCompleted, onClick }) => {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(label);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => { setDraft(label); }, [label]);
  React.useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== label) onCommit(trimmed);
    else setDraft(label);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="stepper-label-input"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(label); setEditing(false); }
          e.stopPropagation();
        }}
        onClick={e => e.stopPropagation()}
      />
    );
  }

  const cls = `stepper-horizontal-title${isCompleted ? ' stepper-horizontal-label-completed' : ''}${isActive ? ' stepper-horizontal-label-active' : ''}`;
  return (
    <span
      className={cls}
      title="Click to edit label"
      onClick={e => { e.stopPropagation(); onClick(); setEditing(true); }}
    >
      {label}
    </span>
  );
};

const DroppedComponentItem: React.FC<{
  component: DroppedComponent;
  index: number;
  moveComponent: (dragIndex: number, hoverIndex: number) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<DroppedComponent>) => void;
  updateColSize: (id: string, size: number) => void;
  addComponentToCard: (cardId: string, component: DroppedComponent) => void;
  removeComponentFromCard: (cardId: string, componentId: string) => void;
  addComponentToCardHeader: (cardId: string, component: DroppedComponent, alignment: 'left' | 'right') => void;
  removeComponentFromCardHeader: (cardId: string, componentId: string, alignment: 'left' | 'right') => void;
  updateCardTitle: (id: string, title: string) => void;
  updateComponentInCard: (cardId: string, componentId: string, updates: Partial<DroppedComponent>) => void;
  updateComponentInCardHeader: (cardId: string, componentId: string, updates: Partial<DroppedComponent>, alignment: 'left' | 'right') => void;
  moveComponentInCard: (cardId: string, dragIndex: number, hoverIndex: number) => void;
  moveComponentInCardHeader: (cardId: string, dragIndex: number, hoverIndex: number, alignment: 'left' | 'right') => void;
  moveComponentBetweenAlignments: (cardId: string, componentId: string, fromAlignment: 'left' | 'right', toAlignment: 'left' | 'right') => void;
  addComponentToRow: (gridId: string, rowKey: string, component: DroppedComponent) => void;
  removeComponentFromRow: (gridId: string, rowKey: string, componentId: string) => void;
  addComponentToRowInCard: (cardId: string, gridId: string, rowKey: string, component: DroppedComponent) => void;
  removeComponentFromRowInCard: (cardId: string, gridId: string, rowKey: string, componentId: string) => void;
  updateAccordionSectionTitle: (accordionId: string, sectionId: string, title: string) => void;
  addComponentToAccordionSection: (accordionId: string, sectionId: string, component: DroppedComponent) => void;
  removeComponentFromAccordionSection: (accordionId: string, sectionId: string, componentId: string) => void;
  updateComponentInAccordionSection: (accordionId: string, sectionId: string, componentId: string, updates: Partial<DroppedComponent>) => void;
  addComponentToRowInAccordionSection: (accordionId: string, sectionId: string, gridId: string, rowKey: string, component: DroppedComponent) => void;
  removeComponentFromRowInAccordionSection: (accordionId: string, sectionId: string, gridId: string, rowKey: string, componentId: string) => void;
  tabsActiveStates: { [tabsId: string]: number };
  setActiveTab: (tabsId: string, index: number) => void;
  updateTabTitle: (tabsId: string, tabId: string, title: string) => void;
  updateTabIcon?: (tabsId: string, tabId: string, icon: string | undefined) => void;
  addTab: (tabsId: string) => void;
  removeTab: (tabsId: string, tabId: string) => void;
  addComponentToTab: (tabsId: string, tabId: string, component: DroppedComponent) => void;
  removeComponentFromTab: (tabsId: string, tabId: string, componentId: string) => void;
  updateComponentInTab: (tabsId: string, tabId: string, componentId: string, updates: Partial<DroppedComponent>) => void;
  addComponentToCardInTab?: (tabsId: string, tabId: string, cardId: string, component: DroppedComponent) => void;
  removeComponentFromCardInTab?: (tabsId: string, tabId: string, cardId: string, componentId: string) => void;
  updateComponentInCardInTab?: (tabsId: string, tabId: string, cardId: string, componentId: string, updates: Partial<DroppedComponent>) => void;
  addComponentToRowInTab: (tabsId: string, tabId: string, gridId: string, rowKey: string, component: DroppedComponent) => void;
  removeComponentFromRowInTab: (tabsId: string, tabId: string, gridId: string, rowKey: string, componentId: string) => void;
  updateAccordionSectionTitleInTab: (tabsId: string, tabId: string, accordionId: string, sectionId: string, title: string) => void;
  addComponentToAccordionSectionInTab: (tabsId: string, tabId: string, accordionId: string, sectionId: string, component: DroppedComponent) => void;
  removeComponentFromAccordionSectionInTab: (tabsId: string, tabId: string, accordionId: string, sectionId: string, componentId: string) => void;
  updateComponentInAccordionSectionInTab: (tabsId: string, tabId: string, accordionId: string, sectionId: string, componentId: string, updates: Partial<DroppedComponent>) => void;
  addComponentToRowInAccordionSectionInTab: (tabsId: string, tabId: string, accordionId: string, sectionId: string, gridId: string, rowKey: string, component: DroppedComponent) => void;
  removeComponentFromRowInAccordionSectionInTab: (tabsId: string, tabId: string, accordionId: string, sectionId: string, gridId: string, rowKey: string, componentId: string) => void;
  stepperActiveStates: { [stepperId: string]: number };
  setActiveStep: (stepperId: string, index: number) => void;
  addStepToStepper: (stepperId: string) => void;
  removeStepFromStepper: (stepperId: string, stepId: string) => void;
  updateStepLabel: (stepperId: string, stepId: string, label: string) => void;
  addComponentToStep: (stepperId: string, stepId: string, component: DroppedComponent) => void;
  removeComponentFromStep: (stepperId: string, stepId: string, componentId: string) => void;
  updateComponentInStep: (stepperId: string, stepId: string, componentId: string, updates: Partial<DroppedComponent>) => void;
  updateColSizeInStep: (stepperId: string, stepId: string, componentId: string, size: number) => void;
  updateCardTitleInStep: (stepperId: string, stepId: string, cardId: string, title: string) => void;
  addComponentToCardInStep: (stepperId: string, stepId: string, cardId: string, component: DroppedComponent) => void;
  removeComponentFromCardInStep: (stepperId: string, stepId: string, cardId: string, componentId: string) => void;
  updateAccordionSectionTitleInStep: (stepperId: string, stepId: string, accordionId: string, sectionId: string, title: string) => void;
  addComponentToAccordionSectionInStep: (stepperId: string, stepId: string, accordionId: string, sectionId: string, component: DroppedComponent) => void;
  removeComponentFromAccordionSectionInStep: (stepperId: string, stepId: string, accordionId: string, sectionId: string, componentId: string) => void;
  updateComponentInAccordionSectionInStep: (stepperId: string, stepId: string, accordionId: string, sectionId: string, componentId: string, updates: Partial<DroppedComponent>) => void;
  addComponentToRowInAccordionSectionInStep: (stepperId: string, stepId: string, accordionId: string, sectionId: string, gridId: string, rowKey: string, component: DroppedComponent) => void;
  removeComponentFromRowInAccordionSectionInStep: (stepperId: string, stepId: string, accordionId: string, sectionId: string, gridId: string, rowKey: string, componentId: string) => void;
  setActiveTabInStep: (stepperId: string, stepId: string, tabsId: string, index: number) => void;
  updateTabTitleInStep: (stepperId: string, stepId: string, tabsId: string, tabId: string, title: string) => void;
  addTabInStep: (stepperId: string, stepId: string, tabsId: string) => void;
  removeTabInStep: (stepperId: string, stepId: string, tabsId: string, tabId: string) => void;
  addComponentToTabInStep: (stepperId: string, stepId: string, tabsId: string, tabId: string, component: DroppedComponent) => void;
  removeComponentFromTabInStep: (stepperId: string, stepId: string, tabsId: string, tabId: string, componentId: string) => void;
  updateComponentInTabInStep: (stepperId: string, stepId: string, tabsId: string, tabId: string, componentId: string, updates: Partial<DroppedComponent>) => void;
  addComponentToRowInTabInStep: (stepperId: string, stepId: string, tabsId: string, tabId: string, gridId: string, rowKey: string, component: DroppedComponent) => void;
  removeComponentFromRowInTabInStep: (stepperId: string, stepId: string, tabsId: string, tabId: string, gridId: string, rowKey: string, componentId: string) => void;
  updateAccordionSectionTitleInTabInStep: (stepperId: string, stepId: string, tabsId: string, tabId: string, accordionId: string, sectionId: string, title: string) => void;
  addComponentToAccordionSectionInTabInStep: (stepperId: string, stepId: string, tabsId: string, tabId: string, accordionId: string, sectionId: string, component: DroppedComponent) => void;
  removeComponentFromAccordionSectionInTabInStep: (stepperId: string, stepId: string, tabsId: string, tabId: string, accordionId: string, sectionId: string, componentId: string) => void;
  updateComponentInAccordionSectionInTabInStep: (stepperId: string, stepId: string, tabsId: string, tabId: string, accordionId: string, sectionId: string, componentId: string, updates: Partial<DroppedComponent>) => void;
  addComponentToRowInAccordionSectionInTabInStep: (stepperId: string, stepId: string, tabsId: string, tabId: string, accordionId: string, sectionId: string, gridId: string, rowKey: string, component: DroppedComponent) => void;
  removeComponentFromRowInAccordionSectionInTabInStep: (stepperId: string, stepId: string, tabsId: string, tabId: string, accordionId: string, sectionId: string, gridId: string, rowKey: string, componentId: string) => void;
  addComponentToRowInStep: (stepperId: string, stepId: string, gridId: string, rowKey: string, component: DroppedComponent) => void;
  removeComponentFromRowInStep: (stepperId: string, stepId: string, gridId: string, rowKey: string, componentId: string) => void;
  updateSidebarContent?: (sidebarId: string, menuItemId: string, content: DroppedComponent[]) => void;
  updateSidebarSelectedMenuItem?: (sidebarId: string, menuItemId: string) => void;
  updateSidebarNavData?: (sidebarId: string, navData: any[]) => void;
  addCardToSidebar?: (sidebarId: string, menuItemId: string, card: DroppedComponent) => void;
  removeCardFromSidebar?: (sidebarId: string, menuItemId: string, cardId: string) => void;
  isFirstInButtonGroup?: boolean;
}> = ({ component, index, moveComponent, removeComponent, updateComponent, updateColSize, addComponentToCard, removeComponentFromCard, addComponentToCardHeader, removeComponentFromCardHeader, updateCardTitle, updateComponentInCard, updateComponentInCardHeader, moveComponentInCard, moveComponentInCardHeader, moveComponentBetweenAlignments, addComponentToRow, removeComponentFromRow, addComponentToRowInCard, removeComponentFromRowInCard, updateAccordionSectionTitle, addComponentToAccordionSection, removeComponentFromAccordionSection, updateComponentInAccordionSection, addComponentToRowInAccordionSection, removeComponentFromRowInAccordionSection, tabsActiveStates, setActiveTab, updateTabTitle, updateTabIcon, addTab, removeTab, addComponentToTab, removeComponentFromTab, updateComponentInTab, addComponentToCardInTab, removeComponentFromCardInTab, updateComponentInCardInTab, addComponentToRowInTab, removeComponentFromRowInTab, updateAccordionSectionTitleInTab, addComponentToAccordionSectionInTab, removeComponentFromAccordionSectionInTab, updateComponentInAccordionSectionInTab, addComponentToRowInAccordionSectionInTab, removeComponentFromRowInAccordionSectionInTab, stepperActiveStates, setActiveStep, addStepToStepper, removeStepFromStepper, updateStepLabel, addComponentToStep, removeComponentFromStep, updateComponentInStep, updateColSizeInStep, updateCardTitleInStep, addComponentToCardInStep, removeComponentFromCardInStep, updateAccordionSectionTitleInStep, addComponentToAccordionSectionInStep, removeComponentFromAccordionSectionInStep, updateComponentInAccordionSectionInStep, addComponentToRowInAccordionSectionInStep, removeComponentFromRowInAccordionSectionInStep, setActiveTabInStep, updateTabTitleInStep, addTabInStep, removeTabInStep, addComponentToTabInStep, removeComponentFromTabInStep, updateComponentInTabInStep, addComponentToRowInTabInStep, removeComponentFromRowInTabInStep, updateAccordionSectionTitleInTabInStep, addComponentToAccordionSectionInTabInStep, removeComponentFromAccordionSectionInTabInStep, updateComponentInAccordionSectionInTabInStep, addComponentToRowInAccordionSectionInTabInStep, removeComponentFromRowInAccordionSectionInTabInStep, addComponentToRowInStep, removeComponentFromRowInStep, updateSidebarContent, updateSidebarSelectedMenuItem, updateSidebarNavData, addCardToSidebar, removeCardFromSidebar, isFirstInButtonGroup }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(component.title || 'Card Title');

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'DROPPED_COMPONENT',
    item: { index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [index]);

  const [, drop] = useDrop(() => ({
    accept: 'DROPPED_COMPONENT',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveComponent(item.index, index);
        item.index = index;
      }
    },
  }), [index, moveComponent]);

  const isCard = component.type === 'card' || component.type === 'block';
  const isBlock = component.type === 'block';
  const colSize = component.colSize || 12;

  const handleTitleClick = () => {
    if (isCard) {
      setIsEditingTitle(true);
    }
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    updateCardTitle(component.id, editedTitle);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
      updateCardTitle(component.id, editedTitle);
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setEditedTitle(component.title || 'Card Title');
    }
  };

  // For cards, integrate controls directly into the card
  if (isCard) {
    return (
      <div className={`col-md-${colSize}`}>
        <div
          ref={(node) => drag(drop(node))}
          className={`${isBlock ? 'block-standard' : 'card-standard'} page-builder-card`}
          style={{ opacity: isDragging ? 0.5 : 1 }}
        >
          <div className={isBlock ? 'block-header-wrapper' : 'card-header-wrapper'}>
            {!isBlock && (isEditingTitle ? (
              <input
                type="text"
                className="card-title-editable"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h2
                className="card-title-standard card-title-clickable"
                onClick={handleTitleClick}
                title="Click to edit"
              >
                {component.title || 'Card Title'}
              </h2>
            ))}
            <CardHeaderDropZone
              cardId={component.id}
              leftChildren={component.headerLeftChildren || []}
              rightChildren={component.headerRightChildren || []}
              addComponentToCardHeader={addComponentToCardHeader}
              removeComponentFromCardHeader={removeComponentFromCardHeader}
              updateComponentInCardHeader={updateComponentInCardHeader}
              moveComponentInCardHeader={moveComponentInCardHeader}
              moveComponentBetweenAlignments={moveComponentBetweenAlignments}
            />
            <div className="card-header-actions">
              <select
                className="dropped-component-size-select"
                value={colSize}
                onChange={(e) => updateColSize(component.id, parseInt(e.target.value))}
                onClick={(e) => e.stopPropagation()}
              >
                <option value={12}>Full Width (12)</option>
                <option value={6}>Half (6)</option>
                <option value={4}>Third (4)</option>
                <option value={3}>Quarter (3)</option>
                <option value={8}>Two Thirds (8)</option>
                <option value={9}>Three Quarters (9)</option>
              </select>
              <button
                className="remove-component-btn"
                onClick={() => removeComponent(component.id)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
          <div className="card-body-standard">
            <CardDropZone
              cardId={component.id}
              children={component.children || []}
              addComponentToCard={addComponentToCard}
              removeComponentFromCard={removeComponentFromCard}
              updateComponentInCard={updateComponentInCard}
              moveComponentInCard={moveComponentInCard}
              addComponentToRowInCard={addComponentToRowInCard}
              removeComponentFromRowInCard={removeComponentFromRowInCard}
              tabsActiveStates={tabsActiveStates}
              setActiveTab={setActiveTab}
            />
          </div>
        </div>
      </div>
    );
  }

  // Expandable datagrid — live DataGrid with MasterDetail driven by GridDetailContext
  if (component.type === 'datagrid-expandable') {
    return (
      <div className={`col-md-${colSize}`}>
        <div
          ref={(node) => drag(drop(node))}
          style={{ opacity: isDragging ? 0.5 : 1, position: 'relative', marginBottom: '16px' }}
        >
          <button className="remove-component-btn component-remove-btn" onClick={() => removeComponent(component.id)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
          <ExpandableGridWithDropZone
            gridId={component.id}
            detailChildrenByRow={component.detailChildrenByRow || {}}
            addComponentToRow={addComponentToRow}
            removeComponentFromRow={removeComponentFromRow}
          />
        </div>
      </div>
    );
  }

  // Accordion — live, with editable titles and drop zones per section
  if (component.type === 'accordion') {
    return (
      <div className={`col-md-${colSize}`}>
        <div
          ref={(node) => drag(drop(node))}
          style={{ opacity: isDragging ? 0.5 : 1, position: 'relative' }}
        >
          <div className="accordion-builder-toolbar">
            <select
              className="dropped-component-size-select"
              value={colSize}
              onChange={(e) => updateColSize(component.id, parseInt(e.target.value))}
              onClick={(e) => e.stopPropagation()}
            >
              <option value={12}>Full Width (12)</option>
              <option value={6}>Half (6)</option>
              <option value={4}>Third (4)</option>
              <option value={3}>Quarter (3)</option>
              <option value={8}>Two Thirds (8)</option>
              <option value={9}>Three Quarters (9)</option>
            </select>
            <button
              className="remove-component-btn"
              onClick={() => removeComponent(component.id)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <AccordionWithContext
            accordionId={component.id}
            sections={component.accordionSections || DEFAULT_ACCORDION_SECTIONS}
            updateSectionTitle={updateAccordionSectionTitle}
            addComponentToSection={addComponentToAccordionSection}
            removeComponentFromSection={removeComponentFromAccordionSection}
            updateComponentInSection={updateComponentInAccordionSection}
            addComponentToRowInSection={addComponentToRowInAccordionSection}
            removeComponentFromRowInSection={removeComponentFromRowInAccordionSection}
          />
        </div>
      </div>
    );
  }

  // Tabs — live, with editable titles and drop zones per tab
  if (component.type === 'tabs' || component.type === 'tabs-icons') {
    return (
      <div className={`col-md-${colSize}`}>
        <div
          ref={(node) => drag(drop(node))}
          style={{ opacity: isDragging ? 0.5 : 1, position: 'relative' }}
        >
          <div className="accordion-builder-toolbar">
            <select
              className="dropped-component-size-select"
              value={colSize}
              onChange={(e) => updateColSize(component.id, parseInt(e.target.value))}
              onClick={(e) => e.stopPropagation()}
            >
              <option value={12}>Full Width (12)</option>
              <option value={6}>Half (6)</option>
              <option value={4}>Third (4)</option>
              <option value={3}>Quarter (3)</option>
              <option value={8}>Two Thirds (8)</option>
              <option value={9}>Three Quarters (9)</option>
            </select>
            <button
              className="remove-component-btn"
              onClick={() => removeComponent(component.id)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <TabsWithContext
            tabsId={component.id}
            sections={component.tabSections || DEFAULT_TAB_SECTIONS}
            activeTab={tabsActiveStates[component.id] || 0}
            setActiveTab={setActiveTab}
            updateTabTitle={updateTabTitle}
            updateTabIcon={updateTabIcon}
            addTab={addTab}
            removeTab={removeTab}
            addComponentToTab={addComponentToTab}
            removeComponentFromTab={removeComponentFromTab}
            updateComponentInTab={updateComponentInTab}
            addComponentToCardInTab={addComponentToCardInTab}
            removeComponentFromCardInTab={removeComponentFromCardInTab}
            updateComponentInCardInTab={updateComponentInCardInTab}
            addComponentToRowInTab={addComponentToRowInTab}
            removeComponentFromRowInTab={removeComponentFromRowInTab}
            updateAccordionSectionTitleInTab={updateAccordionSectionTitleInTab}
            addComponentToAccordionSectionInTab={addComponentToAccordionSectionInTab}
            removeComponentFromAccordionSectionInTab={removeComponentFromAccordionSectionInTab}
            updateComponentInAccordionSectionInTab={updateComponentInAccordionSectionInTab}
            addComponentToRowInAccordionSectionInTab={addComponentToRowInAccordionSectionInTab}
            removeComponentFromRowInAccordionSectionInTab={removeComponentFromRowInAccordionSectionInTab}
          />
        </div>
      </div>
    );
  }

  // Stepper — interactive with clickable steps and drop zones
  if (component.type === 'stepper' || component.type === 'verticalstepper') {
    const steps = component.stepperSteps || DEFAULT_STEPPER_STEPS;
    const activeStep = stepperActiveStates[component.id] || 0;
    const isVertical = component.type === 'verticalstepper';

    const StepDropZone: React.FC<{ stepId: string }> = ({ stepId }) => {
      const [{ isOver }, drop] = useDrop(() => ({
        accept: 'COMPONENT_EXAMPLE',
        drop: (item: { type: string; name: string; component: React.ReactElement; gridFeatures?: any; inputFieldType?: string; inputFieldWidth?: number }, monitor) => {
          if (monitor.didDrop()) return;
          const textContent = item.type.startsWith('text-')
            ? (extractTextContent(item.component) || getDefaultTextContent(item.type))
            : undefined;
          const alertVariant = item.type.startsWith('alert-') ? item.type.replace('alert-', '') as 'info' | 'warning' | 'error' | 'success' : undefined;
          addComponentToStep(component.id, stepId, {
            id: `${item.type}-${Date.now()}`,
            type: item.type,
            name: item.name,
            component: item.component,
            buttonText: (item.type === 'button' || item.type === 'secondary-button' || item.type === 'tertiary-button') ? 'Button' : undefined,
            textContent,
            accordionSections: item.type === 'accordion' ? DEFAULT_ACCORDION_SECTIONS.map(s => ({ ...s, children: [] })) : undefined,
            tabSections: (item.type === 'tabs' || item.type === 'tabs-icons') ? DEFAULT_TAB_SECTIONS.map(t => ({ ...t, children: [] })) : undefined,
            stepperSteps: (item.type === 'stepper' || item.type === 'verticalstepper') ? DEFAULT_STEPPER_STEPS.map(s => ({ ...s, children: [] })) : undefined,
            detailChildrenByRow: item.type === 'datagrid-expandable' ? {} : undefined,
        gridData: (item.type === 'datagrid' || item.type === 'datagrid-expandable') ? { ...DEFAULT_GRID_DATA, columns: DEFAULT_GRID_DATA.columns.map(c => ({ ...c })), data: DEFAULT_GRID_DATA.data.map(r => ({ ...r })) } : undefined,
            children: (item.type === 'card' || item.type === 'block') ? [] : undefined,
            title: item.type === 'card' ? 'Card Title' : undefined,
            colSize: (item.type === 'card' || item.type === 'block') ? 12 : undefined,
            alignment: undefined,
            gridFeatures: item.gridFeatures,
            alertVariant,
            alertMessage: alertVariant ? `This is ${item.type.replace('alert-', '')} alert` : undefined,
            showAlertLink: false,
            inputType: item.type === 'input-field' ? (item.inputFieldType || 'text') : undefined,
            inputWidth: item.type === 'input-field' ? (item.inputFieldWidth || 270) : undefined,
            treeData: item.type === 'treelist' ? [{ id: 1, parentId: null, name: 'Row 1' }, { id: 2, parentId: null, name: 'Row 2' }, { id: 3, parentId: 2, name: 'Child of Row 2' }] : undefined,
            sidebarContent: item.type === 'sidebar' ? {} : undefined,
            selectedMenuItem: item.type === 'sidebar' ? '2-2' : undefined,
          });
        },
        collect: (monitor) => ({ isOver: !!monitor.isOver({ shallow: true }) }),
      }), [stepId]);

      const step = steps.find(s => s.id === stepId);

      return (
        <div ref={drop} className={`stepper-container-drop-zone ${isOver ? 'stepper-drop-zone-over' : ''}`} style={{ minHeight: '100px', padding: '16px', border: isOver ? '2px dashed var(--primary-color)' : '2px dashed transparent', backgroundColor: isOver ? '#f0f8ff' : 'transparent', transition: 'all 0.2s' }}>
          {step && step.children.length > 0 ? (
            <div className="row g-3">
              {step.children.map((child) => {
                // Render cards with full functionality
                if (child.type === 'card') {
                  const cardColSize = child.colSize || 12;
                  return (
                    <div key={child.id} className={`col-md-${cardColSize}`} style={{ position: 'relative' }}>
                      <button
                        className="accordion-child-remove"
                        onClick={() => removeComponentFromStep(component.id, stepId, child.id)}
                        style={{ position: 'absolute', top: '4px', right: '4px', zIndex: 15 }}
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                      <select
                        className="dropped-component-size-select"
                        value={cardColSize}
                        onChange={(e) => updateColSizeInStep(component.id, stepId, child.id, parseInt(e.target.value))}
                        onClick={(e) => e.stopPropagation()}
                        style={{ position: 'absolute', top: '4px', left: '4px', zIndex: 10 }}
                      >
                        <option value={12}>Full Width (12)</option>
                        <option value={6}>Half (6)</option>
                        <option value={4}>Third (4)</option>
                        <option value={3}>Quarter (3)</option>
                        <option value={8}>Two Thirds (8)</option>
                        <option value={9}>Three Quarters (9)</option>
                      </select>
                      <div className="card-standard">
                        <div className="card-header-wrapper">
                          <h2 className="card-title-standard">{child.title || 'Card Title'}</h2>
                        </div>
                        <CardInStepDropZone
                          cardId={child.id}
                          cardChildren={child.children || []}
                          addChild={(comp) => addComponentToCardInStep(component.id, stepId, child.id, comp)}
                          removeChild={(childId) => removeComponentFromCardInStep(component.id, stepId, child.id, childId)}
                          updateChild={(childId, updates) => updateComponentInStep(component.id, stepId, child.id, {
                            children: (child.children || []).map(ch => ch.id === childId ? { ...ch, ...updates } : ch)
                          })}
                        />
                      </div>
                    </div>
                  );
                }

                // Render accordions with dropzones
                if (child.type === 'accordion') {
                  return (
                    <div key={child.id} className="col-md-12" style={{ position: 'relative' }}>
                      <button
                        className="accordion-child-remove"
                        onClick={() => removeComponentFromStep(component.id, stepId, child.id)}
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                      <AccordionWithContext
                        accordionId={child.id}
                        sections={child.accordionSections || DEFAULT_ACCORDION_SECTIONS}
                        isPreview={false}
                        updateSectionTitle={(accordionId, sectionId, title) =>
                          updateAccordionSectionTitleInStep(component.id, stepId, accordionId, sectionId, title)
                        }
                        addComponentToSection={(accordionId, sectionId, comp) =>
                          addComponentToAccordionSectionInStep(component.id, stepId, accordionId, sectionId, comp)
                        }
                        removeComponentFromSection={(accordionId, sectionId, componentId) =>
                          removeComponentFromAccordionSectionInStep(component.id, stepId, accordionId, sectionId, componentId)
                        }
                        updateComponentInSection={(accordionId, sectionId, componentId, updates) =>
                          updateComponentInAccordionSectionInStep(component.id, stepId, accordionId, sectionId, componentId, updates)
                        }
                        addComponentToRowInSection={(accordionId, sectionId, gridId, rowKey, comp) =>
                          addComponentToRowInAccordionSectionInStep(component.id, stepId, accordionId, sectionId, gridId, rowKey, comp)
                        }
                        removeComponentFromRowInSection={(accordionId, sectionId, gridId, rowKey, componentId) =>
                          removeComponentFromRowInAccordionSectionInStep(component.id, stepId, accordionId, sectionId, gridId, rowKey, componentId)
                        }
                      />
                    </div>
                  );
                }

                // Render tabs with dropzones
                if (child.type === 'tabs' || child.type === 'tabs-icons') {
                  return (
                    <div key={child.id} className="col-md-12" style={{ position: 'relative' }}>
                      <button
                        className="accordion-child-remove"
                        onClick={() => removeComponentFromStep(component.id, stepId, child.id)}
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                      <TabsWithContext
                        tabsId={child.id}
                        sections={child.tabSections || DEFAULT_TAB_SECTIONS}
                        activeTab={tabsActiveStates[child.id] || 0}
                        isPreview={false}
                        setActiveTab={(tabsId, index) =>
                          setActiveTabInStep(component.id, stepId, tabsId, index)
                        }
                        updateTabTitle={(tabsId, tabId, title) =>
                          updateTabTitleInStep(component.id, stepId, tabsId, tabId, title)
                        }
                        addTab={(tabsId) =>
                          addTabInStep(component.id, stepId, tabsId)
                        }
                        removeTab={(tabsId, tabId) =>
                          removeTabInStep(component.id, stepId, tabsId, tabId)
                        }
                        addComponentToTab={(tabsId, tabId, comp) =>
                          addComponentToTabInStep(component.id, stepId, tabsId, tabId, comp)
                        }
                        removeComponentFromTab={(tabsId, tabId, componentId) =>
                          removeComponentFromTabInStep(component.id, stepId, tabsId, tabId, componentId)
                        }
                        updateComponentInTab={(tabsId, tabId, componentId, updates) =>
                          updateComponentInTabInStep(component.id, stepId, tabsId, tabId, componentId, updates)
                        }
                        addComponentToRowInTab={(tabsId, tabId, gridId, rowKey, comp) =>
                          addComponentToRowInTabInStep(component.id, stepId, tabsId, tabId, gridId, rowKey, comp)
                        }
                        removeComponentFromRowInTab={(tabsId, tabId, gridId, rowKey, componentId) =>
                          removeComponentFromRowInTabInStep(component.id, stepId, tabsId, tabId, gridId, rowKey, componentId)
                        }
                        updateAccordionSectionTitleInTab={(tabsId, tabId, accordionId, sectionId, title) =>
                          updateAccordionSectionTitleInTabInStep(component.id, stepId, tabsId, tabId, accordionId, sectionId, title)
                        }
                        addComponentToAccordionSectionInTab={(tabsId, tabId, accordionId, sectionId, comp) =>
                          addComponentToAccordionSectionInTabInStep(component.id, stepId, tabsId, tabId, accordionId, sectionId, comp)
                        }
                        removeComponentFromAccordionSectionInTab={(tabsId, tabId, accordionId, sectionId, componentId) =>
                          removeComponentFromAccordionSectionInTabInStep(component.id, stepId, tabsId, tabId, accordionId, sectionId, componentId)
                        }
                        updateComponentInAccordionSectionInTab={(tabsId, tabId, accordionId, sectionId, componentId, updates) =>
                          updateComponentInAccordionSectionInTabInStep(component.id, stepId, tabsId, tabId, accordionId, sectionId, componentId, updates)
                        }
                        addComponentToRowInAccordionSectionInTab={(tabsId, tabId, accordionId, sectionId, gridId, rowKey, comp) =>
                          addComponentToRowInAccordionSectionInTabInStep(component.id, stepId, tabsId, tabId, accordionId, sectionId, gridId, rowKey, comp)
                        }
                        removeComponentFromRowInAccordionSectionInTab={(tabsId, tabId, accordionId, sectionId, gridId, rowKey, componentId) =>
                          removeComponentFromRowInAccordionSectionInTabInStep(component.id, stepId, tabsId, tabId, accordionId, sectionId, gridId, rowKey, componentId)
                        }
                      />
                    </div>
                  );
                }

                // Render expandable grids with dropzones
                if (child.type === 'datagrid-expandable') {
                  return (
                    <div key={child.id} className="col-md-12" style={{ position: 'relative', padding: 0 }}>
                      <button
                        className="accordion-child-remove"
                        onClick={() => removeComponentFromStep(component.id, stepId, child.id)}
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                      <ExpandableGridWithDropZone
                        gridId={child.id}
                        detailChildrenByRow={child.detailChildrenByRow || {}}
                        addComponentToRow={(gridId, rowKey, comp) =>
                          addComponentToRowInStep(component.id, stepId, gridId, rowKey, comp)
                        }
                        removeComponentFromRow={(gridId, rowKey, componentId) =>
                          removeComponentFromRowInStep(component.id, stepId, gridId, rowKey, componentId)
                        }
                        isPreview={false}
                      />
                    </div>
                  );
                }

                // Render text and button components with editing
                const isTextComponent = child.type.startsWith('text-');
                const isStepBtn = child.type === 'button' || child.type === 'secondary-button' ||
                  child.type === 'tertiary-button' || child.type.startsWith('segmented-');
                const removeStepChild = (
                  <button className="accordion-child-remove" onClick={() => removeComponentFromStep(component.id, stepId, child.id)}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                );

                if (child.type === 'treelist') {
                  return (
                    <div key={child.id} className="col-md-12" style={{ position: 'relative' }}>
                      {removeStepChild}
                      <PbTreeListEditor
                        component={child}
                        colSize={child.colSize || 12}
                        updateComponent={(id, updates) => updateComponentInStep(component.id, stepId, id, updates)}
                        updateColSize={(id, size) => updateColSizeInStep(component.id, stepId, id, size)}
                        removeComponent={(id) => removeComponentFromStep(component.id, stepId, id)}
                      />
                    </div>
                  );
                }

                if (child.type === 'input-field') {
                  const t = child.inputType || 'text';
                  return (
                    <div key={child.id} className={`col-md-${child.colSize || 4}`} style={{ position: 'relative' }}>
                      {removeStepChild}
                      <div className="pb-input-outlined">
                        {t === 'textarea' && <TextArea placeholder="Label" stylingMode="outlined" readOnly />}
                        {t === 'dropdown' && <SelectBox placeholder="Label" stylingMode="outlined" />}
                        {(t === 'date' || t === 'time') && <DateBox type={t} placeholder="Label" stylingMode="outlined" />}
                        {(t === 'text' || t === 'search') && <TextBox placeholder={t === 'search' ? 'Search...' : 'Label'} stylingMode="outlined" readOnly />}
                      </div>
                    </div>
                  );
                }

                if (child.type === 'datagrid' || child.type === 'datagrid-expandable') {
                  return (
                    <div key={child.id} className={`col-md-${child.colSize || 12}`} style={{ position: 'relative' }}>
                      {removeStepChild}
                      <PageBuilderDataGrid
                        gridData={child.gridData || DEFAULT_GRID_DATA}
                        onChange={updated => updateComponentInStep(component.id, stepId, child.id, { gridData: updated })}
                        hasActionsColumn={!!child.gridFeatures?.actions}
                        actionColumnChildren={child.actionColumnChildren || []}
                        onActionColumnChildrenChange={children => updateComponentInStep(component.id, stepId, child.id, { actionColumnChildren: children })}
                      />
                    </div>
                  );
                }

                if (child.type.startsWith('alert-') && child.alertVariant) {
                  return (
                    <div key={child.id} className="col-md-12" style={{ position: 'relative' }}>
                      {removeStepChild}
                      <Alert variant={child.alertVariant} message={child.alertMessage || `This is ${child.alertVariant} alert`} showLink={child.showAlertLink} isEditable={true} onMessageChange={(msg) => updateComponentInStep(component.id, stepId, child.id, { alertMessage: msg })} onClose={() => removeComponentFromStep(component.id, stepId, child.id)} dismissible={false} />
                    </div>
                  );
                }

                if (child.type === 'sidebar') {
                  return (
                    <div key={child.id} className="col-md-12" style={{ position: 'relative' }}>
                      {removeStepChild}
                      <SidebarContentLayout
                        isPreview={false}
                        contentByMenuItem={child.sidebarContent || {}}
                        selectedMenuItem={child.selectedMenuItem}
                        navData={child.sidebarNavData}
                        onContentChange={(menuItemId, content) => {
                          updateComponentInStep(component.id, stepId, child.id, {
                            sidebarContent: { ...(child.sidebarContent || {}), [menuItemId]: content },
                          });
                        }}
                        onMenuItemSelect={(menuItemId) => {
                          updateComponentInStep(component.id, stepId, child.id, { selectedMenuItem: menuItemId });
                        }}
                        onNavDataChange={(navData) => {
                          updateComponentInStep(component.id, stepId, child.id, { sidebarNavData: navData });
                        }}
                      />
                    </div>
                  );
                }

                let renderedChild: React.ReactNode = child.component;
                if (isTextComponent || isStepBtn) {
                  renderedChild = (
                    <EditableComponent
                      component={child}
                      updateComponent={(id, updates) => updateComponentInStep(component.id, stepId, id, updates)}
                    />
                  );
                }

                if (isStepBtn) {
                  return (
                    <div key={child.id} className="col-auto ms-auto" style={{ position: 'relative', paddingTop: '4px' }}>
                      {removeStepChild}
                      {renderedChild}
                    </div>
                  );
                }

                return (
                  <div key={child.id} className="col-md-12" style={{ position: 'relative' }}>
                    {removeStepChild}
                    <div className="dropped-component-preview">
                      {renderedChild}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="stepper-drop-placeholder">
              <i className="fa-solid fa-arrow-down"></i>
              <span>Drop components here</span>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className={`col-md-${colSize} mx-[0px] mt-[10px] mb-[0px] p-[0px]`}>
        <div
          ref={(node) => drag(drop(node))}
          style={{ opacity: isDragging ? 0.5 : 1, position: 'relative' }}
        >
          <div className="accordion-builder-toolbar">
            <select
              className="dropped-component-size-select"
              value={colSize}
              onChange={(e) => updateColSize(component.id, parseInt(e.target.value))}
              onClick={(e) => e.stopPropagation()}
            >
              <option value={12}>Full Width (12)</option>
              <option value={6}>Half (6)</option>
              <option value={4}>Third (4)</option>
              <option value={3}>Quarter (3)</option>
              <option value={8}>Two Thirds (8)</option>
              <option value={9}>Three Quarters (9)</option>
            </select>
            <button
              className="remove-component-btn"
              onClick={() => removeComponent(component.id)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Render stepper to match showcase design */}
          {isVertical ? (
            // Vertical Stepper
            <div className="stepper-vertical" style={{ position: 'relative', padding: '16px', backgroundColor: '#fff', borderRadius: '4px' }}>
              {steps.map((step, index) => {
                const isCompleted = index < activeStep;
                const isActive = index === activeStep;
                const isLast = index === steps.length - 1;

                return (
                  <div key={step.id} className="stepper-vertical-step" onClick={() => setActiveStep(component.id, index)} style={{ cursor: 'pointer' }}>
                    <div className="stepper-vertical-indicator-wrapper">
                      <div className={`stepper-horizontal-circle ${isCompleted ? 'stepper-horizontal-circle-completed' : ''} ${isActive ? 'stepper-horizontal-circle-active' : ''}`}>
                        {isCompleted ? <i className="fa-solid fa-check"></i> : isActive ? <i className="fa-solid fa-pen"></i> : null}
                      </div>
                      {!isLast && <div className={`stepper-vertical-line ${isCompleted ? 'stepper-vertical-line-completed' : ''}`} />}
                    </div>
                    <div className="stepper-vertical-content">
                      <div className="stepper-step-label-row">
                        <EditableStepLabel
                          label={step.label || `Step ${index + 1}`}
                          onCommit={label => updateStepLabel(component.id, step.id, label)}
                          isActive={isActive}
                          isCompleted={isCompleted}
                          onClick={() => setActiveStep(component.id, index)}
                        />
                        {steps.length > 1 && (
                          <button
                            className="stepper-step-remove-btn"
                            title="Remove step"
                            onClick={e => { e.stopPropagation(); removeStepFromStepper(component.id, step.id); }}
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        )}
                      </div>
                      {isActive && (
                        <div className="stepper-vertical-active-content">
                          <StepDropZone stepId={step.id} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {/* Add step — right of last step indicator line */}
              <div className="stepper-add-step-row">
                <button className="stepper-add-step-btn" onClick={() => addStepToStepper(component.id)}>
                  <i className="fa-solid fa-plus"></i> Add step
                </button>
              </div>
            </div>
          ) : (
            // Horizontal Stepper
            <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '4px' }}>
              <div className="stepper-horizontal-wrap">
                <div className="stepper-horizontal">
                  {steps.map((step, index) => {
                    const isCompleted = index < activeStep;
                    const isActive = index === activeStep;
                    const isLast = index === steps.length - 1;

                    return (
                      <div key={step.id} className="stepper-horizontal-step" onClick={() => setActiveStep(component.id, index)} style={{ cursor: 'pointer', position: 'relative' }}>
                        <div className="stepper-horizontal-indicator">
                          <div className={`stepper-horizontal-circle ${isCompleted ? 'stepper-horizontal-circle-completed' : ''} ${isActive ? 'stepper-horizontal-circle-active' : ''}`}>
                            {isCompleted ? <i className="fa-solid fa-check"></i> : isActive ? <i className="fa-solid fa-pen"></i> : null}
                          </div>
                          {!isLast && <div className={`stepper-horizontal-line ${isCompleted ? 'stepper-horizontal-line-completed' : ''}`} />}
                        </div>
                        <div className={`stepper-horizontal-label ${isCompleted ? 'stepper-horizontal-label-completed' : ''} ${isActive ? 'stepper-horizontal-label-active' : ''}`}>
                          <EditableStepLabel
                            label={step.label || `Step ${index + 1}`}
                            onCommit={label => updateStepLabel(component.id, step.id, label)}
                            isActive={isActive}
                            isCompleted={isCompleted}
                            onClick={() => setActiveStep(component.id, index)}
                          />
                          {steps.length > 1 && (
                            <button
                              className="stepper-step-remove-btn"
                              title="Remove step"
                              onClick={e => { e.stopPropagation(); removeStepFromStepper(component.id, step.id); }}
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Add step — inline at the end of the stepper row */}
                <button className="stepper-add-step-btn stepper-add-step-btn--inline" onClick={() => addStepToStepper(component.id)}>
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
              <div style={{ marginTop: '16px' }}>
                <StepDropZone stepId={steps[activeStep]?.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // For non-card components, render them directly without wrapper
  const isStepper = component.type === 'stepper';
  const isDataGrid = component.type === 'datagrid' || component.type === 'treelist';
  const isChart = component.type === 'chart';

  // Handle special components that need props
  let renderedComponent = component.component;
  if (component.type === 'sidebar') {
    renderedComponent = (
      <SidebarContentLayout
        isPreview={false}
        contentByMenuItem={component.sidebarContent || {}}
        selectedMenuItem={component.selectedMenuItem}
        navData={component.sidebarNavData}
        onContentChange={(menuItemId, content) => {
          if (updateSidebarContent) {
            updateSidebarContent(component.id, menuItemId, content);
          }
        }}
        onMenuItemSelect={(menuItemId) => {
          if (updateSidebarSelectedMenuItem) {
            updateSidebarSelectedMenuItem(component.id, menuItemId);
          }
        }}
        onNavDataChange={(navData) => {
          if (updateSidebarNavData) {
            updateSidebarNavData(component.id, navData);
          }
        }}
      />
    );
  } else if (component.type === 'spacer') {
    renderedComponent = <Spacer isPreview={false} />;
  } else if (component.type === 'datagrid' || component.type === 'datagrid-expandable') {
    renderedComponent = (
      <PageBuilderDataGrid
        gridData={component.gridData || DEFAULT_GRID_DATA}
        onChange={updated => updateComponent(component.id, { gridData: updated })}
        hasActionsColumn={!!component.gridFeatures?.actions}
        actionColumnChildren={component.actionColumnChildren || []}
        onActionColumnChildrenChange={children => updateComponent(component.id, { actionColumnChildren: children })}
      />
    );
  } else if (component.type === 'treelist') {
    renderedComponent = (
      <PbTreeListEditor
        component={component}
        colSize={colSize}
        updateColSize={updateColSize}
        removeComponent={removeComponent}
        updateComponent={updateComponent}
      />
    );
  } else if (component.type === 'scheduler') {
    const events = component.schedulerEvents || DEFAULT_SCHEDULER_EVENTS;
    const currentDate = component.schedulerCurrentDate || '2025-01-13';
    const view = component.schedulerView || 'week';

    return (
      <div className={`col-md-${colSize}`}>
        <div
          ref={(node) => drag(drop(node))}
          style={{ opacity: isDragging ? 0.5 : 1, position: 'relative' }}
        >
          <div className="accordion-builder-toolbar">
            <select
              className="dropped-component-size-select"
              value={view}
              onChange={(e) => updateComponent(component.id, { schedulerView: e.target.value as any })}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="day">Day View</option>
              <option value="week">Week View</option>
              <option value="month">Month View</option>
              <option value="agenda">Agenda View</option>
            </select>
            <select
              className="dropped-component-size-select"
              value={colSize}
              onChange={(e) => updateColSize(component.id, parseInt(e.target.value))}
              onClick={(e) => e.stopPropagation()}
            >
              <option value={12}>Full Width (12)</option>
              <option value={6}>Half (6)</option>
              <option value={8}>Two Thirds (8)</option>
              <option value={9}>Three Quarters (9)</option>
            </select>
            <button className="remove-component-btn" onClick={() => removeComponent(component.id)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <Scheduler
            dataSource={events}
            currentView={view}
            defaultCurrentDate={new Date(currentDate)}
            height={580}
            startDayHour={8}
            endDayHour={20}
            showAllDayPanel={true}
            textExpr="text"
            startDateExpr="startDate"
            endDateExpr="endDate"
            allDayExpr="allDay"
            editing={false}
          >
            <SchedulerView type="day" />
            <SchedulerView type="week" />
            <SchedulerView type="month" />
            <SchedulerView type="agenda" />
          </Scheduler>
        </div>
      </div>
    );
  } else if (component.type.startsWith('alert-') && component.alertVariant) {
    // Render alert with editing capability
    renderedComponent = (
      <Alert
        variant={component.alertVariant}
        message={component.alertMessage || 'This is an alert message'}
        showLink={component.showAlertLink}
        isEditable={true}
        onMessageChange={(newMessage) => {
          if (updateComponent) {
            updateComponent(component.id, { alertMessage: newMessage });
          }
        }}
        onClose={() => {
          if (removeComponent) {
            removeComponent(component.id);
          }
        }}
        dismissible={true}
      />
    );
  } else if (component.type === 'input-field') {
    const inputType = component.inputType || 'text';

    renderedComponent = (
      <div>
        <div className="accordion-builder-toolbar">
          <select
            className="dropped-component-size-select"
            value={colSize}
            onChange={(e) => updateColSize(component.id, parseInt(e.target.value))}
            onClick={(e) => e.stopPropagation()}
          >
            <option value={12}>Full Width (12)</option>
            <option value={6}>Half (6)</option>
            <option value={4}>Third (4)</option>
            <option value={3}>Quarter (3)</option>
            <option value={8}>Two Thirds (8)</option>
            <option value={9}>Three Quarters (9)</option>
          </select>
          <button className="remove-component-btn" onClick={() => removeComponent(component.id)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="pb-input-outlined" style={{ width: '100%' }}>
          {inputType === 'textarea' && <TextArea placeholder="Label" stylingMode="outlined" readOnly />}
          {inputType === 'dropdown' && <SelectBox placeholder="Label" stylingMode="outlined" />}
          {(inputType === 'date' || inputType === 'time') && <DateBox type={inputType} placeholder="Label" stylingMode="outlined" openOnFieldClick={false} />}
          {inputType === 'search' && <TextBox placeholder="Label" stylingMode="outlined" readOnly buttons={[{ name: 'search', location: 'before', options: { icon: 'search', stylingMode: 'text' } }]} />}
          {inputType === 'text' && <TextBox placeholder="Label" stylingMode="outlined" readOnly />}
        </div>
      </div>
    );
  } else if (component.type === 'button' || component.type === 'secondary-button' || component.type === 'tertiary-button') {
    // Render editable button with icon drop zone
    const ButtonWithIconDropZone: React.FC = () => {
      const [isEditingText, setIsEditingText] = useState(false);
      const [editValue, setEditValue] = useState(component.buttonText || 'Button');

      const [{ isOver }, drop] = useDrop(() => ({
        accept: 'COMPONENT_EXAMPLE',
        drop: (item: { type: string; name: string; iconClass?: string }) => {
          if (item.type === 'icon' && item.iconClass) {
            if (updateComponent) {
              updateComponent(component.id, { buttonIcon: item.iconClass, buttonIconPosition: 'left' });
            }
          }
        },
        collect: (monitor) => ({ isOver: !!monitor.isOver() })
      }), []);

      const btnClass = component.type === 'secondary-button' ? 'btn-secondary' :
                       component.type === 'tertiary-button' ? 'btn-tertiary' : 'btn-primary';

      return (
        <div ref={drop} style={{ display: 'inline-block', position: 'relative', backgroundColor: isOver ? '#e6e3f3' : 'transparent', borderRadius: '4px', padding: isOver ? '4px' : '0' }}>
          {isEditingText ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => {
                if (updateComponent && editValue.trim()) {
                  updateComponent(component.id, { buttonText: editValue });
                }
                setIsEditingText(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (updateComponent && editValue.trim()) {
                    updateComponent(component.id, { buttonText: editValue });
                  }
                  setIsEditingText(false);
                }
              }}
              autoFocus
              style={{
                padding: '5px 16px',
                fontSize: '16px',
                fontFamily: 'Source Sans Pro, sans-serif',
                fontWeight: 600,
                border: '2px solid var(--primary)',
                borderRadius: '4px'
              }}
            />
          ) : (
            <button
              className={btnClass}
              onClick={() => setIsEditingText(true)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              {component.buttonIcon && component.buttonIconPosition === 'left' && (
                <span style={{ marginRight: '8px', position: 'relative' }}>
                  <i className={`fa-solid fa-${component.buttonIcon}`}></i>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (updateComponent) {
                        updateComponent(component.id, { buttonIcon: undefined, buttonIconPosition: undefined });
                      }
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.click(); }}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#e31937',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </span>
                </span>
              )}
              {component.buttonText || 'Button'}
              {component.buttonIcon && component.buttonIconPosition === 'right' && (
                <span style={{ marginLeft: '8px', position: 'relative' }}>
                  <i className={`fa-solid fa-${component.buttonIcon}`}></i>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (updateComponent) {
                        updateComponent(component.id, { buttonIcon: undefined, buttonIconPosition: undefined });
                      }
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.click(); }}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#e31937',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </span>
                </span>
              )}
            </button>
          )}
          {isOver && <div style={{ position: 'absolute', top: '100%', left: 0, fontSize: '10px', color: '#5236ab', marginTop: '4px' }}>Drop icon here</div>}
        </div>
      );
    };
    renderedComponent = <ButtonWithIconDropZone />;
  } else if (component.type.startsWith('segmented-')) {
    // Render segmented buttons with icon support
    const SegmentedButtonItem: React.FC<{ option: string; index: number; isFirst: boolean; isLast: boolean }> = ({ option, index, isFirst, isLast }) => {
      const [selectedIndex, setSelectedIndex] = useState(0);
      const icons = component.segmentedButtonIcons || [];
      const [{ isOver }, drop] = useDrop(() => ({
        accept: 'COMPONENT_EXAMPLE',
        drop: (item: { type: string; name: string; iconClass?: string }) => {
          if (item.type === 'icon' && item.iconClass) {
            const newIcons = [...icons];
            newIcons[index] = item.iconClass;
            if (updateComponent) {
              updateComponent(component.id, { segmentedButtonIcons: newIcons });
            }
          }
        },
        collect: (monitor) => ({ isOver: !!monitor.isOver() })
      }), [icons, index]);

      const isSelected = selectedIndex === index;

      return (
        <div ref={drop} style={{ position: 'relative', display: 'inline-block' }}>
          <button
            className={`segmented-button ${isSelected ? 'segmented-button-selected' : ''} ${isFirst ? 'segmented-button-first' : ''} ${isLast ? 'segmented-button-last' : ''}`}
            onClick={() => setSelectedIndex(index)}
            style={{ backgroundColor: isOver ? '#e6e3f3' : undefined }}
          >
            {icons[index] ? (
              <span style={{ position: 'relative' }}>
                <i className={`fa-solid fa-${icons[index]}`}></i>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIcons = [...icons];
                    newIcons[index] = '';
                    if (updateComponent) {
                      updateComponent(component.id, { segmentedButtonIcons: newIcons });
                    }
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.click(); }}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#e31937',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </span>
              </span>
            ) : component.type === 'segmented-icons-text' && (
              <i className={`fa-solid segmented-button-icon`} style={{ opacity: 0.3 }}>+</i>
            )}
            {isSelected && component.type !== 'segmented-text' && (
              <i className="fa-solid fa-check segmented-button-check"></i>
            )}
            {component.type !== 'segmented-icons' && <span>{option}</span>}
          </button>
          {isOver && <div style={{ position: 'absolute', top: '100%', left: 0, fontSize: '9px', color: '#5236ab', whiteSpace: 'nowrap' }}>Drop icon</div>}
        </div>
      );
    };

    const SegmentedButtonsEditable: React.FC = () => {
      const options = ['Walk', 'Train', 'Car'];

      return (
        <div className="segmented-buttons">
          {options.map((option, index) => (
            <SegmentedButtonItem
              key={index}
              option={option}
              index={index}
              isFirst={index === 0}
              isLast={index === options.length - 1}
            />
          ))}
        </div>
      );
    };
    renderedComponent = <SegmentedButtonsEditable />;
  }

  const isInputField = component.type === 'input-field';
  const isButtonType = component.type === 'button' || component.type === 'secondary-button' ||
    component.type === 'tertiary-button' || component.type.startsWith('segmented-');
  const hasOwnToolbar = isInputField || component.type === 'treelist';

  if (isButtonType) {
    const colClass = isFirstInButtonGroup ? 'col-auto ms-auto' : 'col-auto';
    return (
      <div className={colClass} style={{ paddingTop: '4px', paddingBottom: '4px' }}>
        <div
          ref={(node) => drag(drop(node))}
          style={{ opacity: isDragging ? 0.5 : 1, position: 'relative' }}
        >
          <button
            className="remove-component-btn component-remove-btn"
            onClick={() => removeComponent(component.id)}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          {renderedComponent}
        </div>
      </div>
    );
  }

  return (
    <div className={`col-md-${colSize}`}>
      <div
        ref={(node) => drag(drop(node))}
        style={{
          opacity: isDragging ? 0.5 : 1,
          position: 'relative',
          marginBottom: (isDataGrid || isChart) ? '16px' : '0'
        }}
      >
        {!hasOwnToolbar && (
          <button
            className="remove-component-btn component-remove-btn"
            onClick={() => removeComponent(component.id)}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
        {renderedComponent}
      </div>
    </div>
  );
};

const TreeNode: React.FC<{
  node: PageLocation;
  selectedId: string | null;
  onSelect: (id: string) => void;
  level: number;
  onItemClick?: () => void;
}> = ({ node, selectedId, onSelect, level, onItemClick }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="tree-node">
      <div
        className={`tree-node-item ${selectedId === node.id ? 'tree-node-item-selected' : ''}`}
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={() => {
          onSelect(node.id);
          if (onItemClick) onItemClick();
        }}
      >
        {node.children && node.children.length > 0 && (
          <button
            className="tree-node-toggle"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <i className={`fa-solid fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
          </button>
        )}
        <i className="fa-solid fa-folder"></i>
        <span>{node.name}</span>
      </div>
      {isExpanded && node.children && node.children.map((child) => (
        <TreeNode
          key={child.id}
          node={child}
          selectedId={selectedId}
          onSelect={onSelect}
          level={level + 1}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
};

const DropdownTreeView: React.FC<{
  locations: PageLocation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}> = ({ locations, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const findLocationName = (id: string | null, locs: PageLocation[]): string => {
    if (!id) return 'Select location...';
    for (const loc of locs) {
      if (loc.id === id) return loc.name;
      if (loc.children) {
        const childName = findLocationName(id, loc.children);
        if (childName !== 'Select location...') return childName;
      }
    }
    return 'Select location...';
  };

  return (
    <div className="dropdown-treeview" ref={dropdownRef}>
      <button
        type="button"
        className="dropdown-treeview-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fa-solid fa-folder" style={{ marginRight: '8px' }}></i>
        <span style={{ flex: 1, textAlign: 'left' }}>{findLocationName(selectedId, locations)}</span>
        <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </button>
      {isOpen && (
        <div className="dropdown-treeview-menu">
          {locations.map((location) => (
            <TreeNode
              key={location.id}
              node={location}
              selectedId={selectedId}
              onSelect={onSelect}
              level={0}
              onItemClick={() => setIsOpen(false)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const PageBuilder: React.FC = () => {
  const [droppedComponents, setDroppedComponents] = useState<DroppedComponent[]>([]);
  const [pageName, setPageName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>('root');
  const [showPreview, setShowPreview] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  useEffect(() => {
    if (isExpanded) {
      document.body.classList.add('page-builder-fullscreen');
    } else {
      document.body.classList.remove('page-builder-fullscreen');
    }
    return () => document.body.classList.remove('page-builder-fullscreen');
  }, [isExpanded]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) setIsExpanded(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructionsMessage, setInstructionsMessage] = useState('');
  const [showLoadDrafts, setShowLoadDrafts] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<Array<{id: string, name: string, timestamp: number}>>([]);
  const [stepperActiveStates, setStepperActiveStates] = useState<{ [stepperId: string]: number }>({});

  const pageLocations = getPageLocations();

  // Load saved drafts list on mount
  React.useEffect(() => {
    const draftsListStr = localStorage.getItem('pageBuilderDraftsList');
    if (draftsListStr) {
      try {
        const draftsList = JSON.parse(draftsListStr);
        setSavedDrafts(draftsList);
      } catch (e) {
        console.error('Failed to load drafts list:', e);
      }
    }
  }, []);

  const [, drop] = useDrop(() => ({
    accept: 'COMPONENT_EXAMPLE',
    drop: (item: { type: string; name: string; component: React.ReactElement; gridFeatures?: any; inputFieldType?: string; inputFieldWidth?: number }, monitor) => {
      // Only handle drop if it's not already handled by a nested target
      if (monitor.didDrop()) {
        return;
      }

      const textContent = item.type.startsWith('text-')
        ? (extractTextContent(item.component) || getDefaultTextContent(item.type))
        : undefined;

      const alertVariant = item.type.startsWith('alert-') ? item.type.replace('alert-', '') as 'info' | 'warning' | 'error' | 'success' : undefined;

      const newComponent: DroppedComponent = {
        id: `${item.type}-${Date.now()}`,
        type: item.type,
        name: item.name,
        component: item.component,
        colSize: item.type === 'input-field' ? 4 : (item.type === 'card' || item.type === 'treelist' || item.type === 'scheduler') ? 12 : undefined,
        schedulerEvents: item.type === 'scheduler' ? DEFAULT_SCHEDULER_EVENTS : undefined,
        schedulerCurrentDate: item.type === 'scheduler' ? '2025-01-13' : undefined,
        schedulerView: item.type === 'scheduler' ? 'week' : undefined,
        treeData: item.type === 'treelist' ? [
          { id: 1, parentId: null, name: 'Row 1' },
          { id: 2, parentId: null, name: 'Row 2' },
          { id: 3, parentId: 2,    name: 'Child of Row 2' },
        ] : undefined,
        children: item.type === 'card' ? [] : undefined,
        headerLeftChildren: item.type === 'card' ? [] : undefined,
        headerRightChildren: item.type === 'card' ? [] : undefined,
        title: item.type === 'card' ? 'Card Title' : undefined,
        buttonText: (item.type === 'button' || item.type === 'secondary-button' || item.type === 'tertiary-button') ? 'Button' : undefined,
        textContent,
        accordionSections: item.type === 'accordion' ? DEFAULT_ACCORDION_SECTIONS.map(s => ({ ...s, children: [] })) : undefined,
        tabSections: (item.type === 'tabs' || item.type === 'tabs-icons') ? DEFAULT_TAB_SECTIONS.map(t => ({ ...t, children: [] })) : undefined,
        stepperSteps: (item.type === 'stepper' || item.type === 'verticalstepper') ? DEFAULT_STEPPER_STEPS.map(s => ({ ...s, children: [] })) : undefined,
        alignment: undefined,
        gridFeatures: item.gridFeatures,
        sidebarAlignment: item.type === 'sidebar' ? 'left' : undefined,
        sidebarContent: item.type === 'sidebar' ? {} : undefined,
        selectedMenuItem: item.type === 'sidebar' ? '2-2' : undefined,
        alertVariant,
        alertMessage: alertVariant ? `This is ${item.type.replace('alert-', '')} alert` : undefined,
        showAlertLink: false,
        inputType: item.type === 'input-field' ? (item.inputFieldType || 'text') as DroppedComponent['inputType'] : undefined,
      };
      setDroppedComponents([...droppedComponents, newComponent]);
    },
  }), [droppedComponents]);

  const moveComponent = (dragIndex: number, hoverIndex: number) => {
    const newComponents = [...droppedComponents];
    const [removed] = newComponents.splice(dragIndex, 1);
    newComponents.splice(hoverIndex, 0, removed);
    setDroppedComponents(newComponents);
  };

  const removeComponent = (id: string) => {
    setDroppedComponents(droppedComponents.filter(c => c.id !== id));
  };

  const updateColSize = (id: string, size: number) => {
    setDroppedComponents(droppedComponents.map(c =>
      c.id === id ? { ...c, colSize: size } : c
    ));
  };

  const updateComponent = (id: string, updates: Partial<DroppedComponent>) => {
    setDroppedComponents(droppedComponents.map(c =>
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const addComponentToCard = (cardId: string, component: DroppedComponent) => {
    setDroppedComponents(droppedComponents.map(c => {
      if (c.id === cardId && c.type === 'card') {
        return {
          ...c,
          children: [...(c.children || []), component]
        };
      }
      return c;
    }));
  };

  const removeComponentFromCard = (cardId: string, componentId: string) => {
    setDroppedComponents(droppedComponents.map(c => {
      if (c.id === cardId && c.type === 'card') {
        return {
          ...c,
          children: (c.children || []).filter(child => child.id !== componentId)
        };
      }
      return c;
    }));
  };

  const addComponentToCardHeader = (cardId: string, component: DroppedComponent, alignment: 'left' | 'right') => {
    setDroppedComponents(droppedComponents.map(c => {
      if (c.id === cardId && c.type === 'card') {
        const targetArray = alignment === 'left' ? 'headerLeftChildren' : 'headerRightChildren';
        return {
          ...c,
          [targetArray]: [...(c[targetArray] || []), component]
        };
      }
      return c;
    }));
  };

  const removeComponentFromCardHeader = (cardId: string, componentId: string, alignment: 'left' | 'right') => {
    setDroppedComponents(droppedComponents.map(c => {
      if (c.id === cardId && c.type === 'card') {
        const targetArray = alignment === 'left' ? 'headerLeftChildren' : 'headerRightChildren';
        return {
          ...c,
          [targetArray]: (c[targetArray] || []).filter(child => child.id !== componentId)
        };
      }
      return c;
    }));
  };

  const updateCardTitle = (id: string, title: string) => {
    setDroppedComponents(droppedComponents.map(c =>
      c.id === id ? { ...c, title } : c
    ));
  };

  const updateComponentInCard = (cardId: string, componentId: string, updates: Partial<DroppedComponent>) => {
    setDroppedComponents(droppedComponents.map(c => {
      if (c.id === cardId && c.type === 'card') {
        return {
          ...c,
          children: (c.children || []).map(child =>
            child.id === componentId ? { ...child, ...updates } : child
          )
        };
      }
      return c;
    }));
  };

  const updateComponentInCardHeader = (cardId: string, componentId: string, updates: Partial<DroppedComponent>, alignment: 'left' | 'right') => {
    setDroppedComponents(droppedComponents.map(c => {
      if (c.id === cardId && c.type === 'card') {
        const targetArray = alignment === 'left' ? 'headerLeftChildren' : 'headerRightChildren';
        return {
          ...c,
          [targetArray]: (c[targetArray] || []).map(child =>
            child.id === componentId ? { ...child, ...updates } : child
          )
        };
      }
      return c;
    }));
  };

  const moveComponentInCard = (cardId: string, dragIndex: number, hoverIndex: number) => {
    setDroppedComponents(droppedComponents.map(c => {
      if (c.id === cardId && c.type === 'card') {
        const newChildren = [...(c.children || [])];
        const [removed] = newChildren.splice(dragIndex, 1);
        newChildren.splice(hoverIndex, 0, removed);
        return {
          ...c,
          children: newChildren
        };
      }
      return c;
    }));
  };

  const moveComponentInCardHeader = (cardId: string, dragIndex: number, hoverIndex: number, alignment: 'left' | 'right') => {
    setDroppedComponents(droppedComponents.map(c => {
      if (c.id === cardId && c.type === 'card') {
        const targetArray = alignment === 'left' ? 'headerLeftChildren' : 'headerRightChildren';
        const newHeaderChildren = [...(c[targetArray] || [])];
        const [removed] = newHeaderChildren.splice(dragIndex, 1);
        newHeaderChildren.splice(hoverIndex, 0, removed);
        return {
          ...c,
          [targetArray]: newHeaderChildren
        };
      }
      return c;
    }));
  };

  const moveComponentBetweenAlignments = (cardId: string, componentId: string, fromAlignment: 'left' | 'right', toAlignment: 'left' | 'right') => {
    setDroppedComponents(droppedComponents.map(c => {
      if (c.id === cardId && c.type === 'card') {
        const fromArray = fromAlignment === 'left' ? 'headerLeftChildren' : 'headerRightChildren';
        const toArray = toAlignment === 'left' ? 'headerLeftChildren' : 'headerRightChildren';

        const component = (c[fromArray] || []).find(child => child.id === componentId);
        if (!component) return c;

        return {
          ...c,
          [fromArray]: (c[fromArray] || []).filter(child => child.id !== componentId),
          [toArray]: [...(c[toArray] || []), component]
        };
      }
      return c;
    }));
  };

  const addComponentToRow = useCallback((gridId: string, rowKey: string, component: DroppedComponent) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== gridId) return c;
      const byRow = c.detailChildrenByRow || {};
      return { ...c, detailChildrenByRow: { ...byRow, [rowKey]: [...(byRow[rowKey] || []), component] } };
    }));
  }, []);

  const removeComponentFromRow = useCallback((gridId: string, rowKey: string, componentId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== gridId) return c;
      const byRow = c.detailChildrenByRow || {};
      return { ...c, detailChildrenByRow: { ...byRow, [rowKey]: (byRow[rowKey] || []).filter(d => d.id !== componentId) } };
    }));
  }, []);

  // Same as above but for grids nested inside a card's children
  const addComponentToRowInCard = useCallback((cardId: string, gridId: string, rowKey: string, component: DroppedComponent) => {
    setDroppedComponents(prev => prev.map(card => {
      if (card.id !== cardId) return card;
      return {
        ...card,
        children: (card.children || []).map(child => {
          if (child.id !== gridId) return child;
          const byRow = child.detailChildrenByRow || {};
          return { ...child, detailChildrenByRow: { ...byRow, [rowKey]: [...(byRow[rowKey] || []), component] } };
        }),
      };
    }));
  }, []);

  const removeComponentFromRowInCard = useCallback((cardId: string, gridId: string, rowKey: string, componentId: string) => {
    setDroppedComponents(prev => prev.map(card => {
      if (card.id !== cardId) return card;
      return {
        ...card,
        children: (card.children || []).map(child => {
          if (child.id !== gridId) return child;
          const byRow = child.detailChildrenByRow || {};
          return { ...child, detailChildrenByRow: { ...byRow, [rowKey]: (byRow[rowKey] || []).filter(d => d.id !== componentId) } };
        }),
      };
    }));
  }, []);

  const updateAccordionSectionTitle = useCallback((accordionId: string, sectionId: string, title: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== accordionId) return c;
      return { ...c, accordionSections: (c.accordionSections || []).map(s => s.id === sectionId ? { ...s, title } : s) };
    }));
  }, []);

  const addComponentToAccordionSection = useCallback((accordionId: string, sectionId: string, component: DroppedComponent) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== accordionId) return c;
      return { ...c, accordionSections: (c.accordionSections || []).map(s => s.id === sectionId ? { ...s, children: [...s.children, component] } : s) };
    }));
  }, []);

  const removeComponentFromAccordionSection = useCallback((accordionId: string, sectionId: string, componentId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== accordionId) return c;
      return { ...c, accordionSections: (c.accordionSections || []).map(s => s.id === sectionId ? { ...s, children: s.children.filter(ch => ch.id !== componentId) } : s) };
    }));
  }, []);

  const updateComponentInAccordionSection = useCallback((accordionId: string, sectionId: string, componentId: string, updates: Partial<DroppedComponent>) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== accordionId) return c;
      return { ...c, accordionSections: (c.accordionSections || []).map(s => s.id === sectionId ? { ...s, children: s.children.map(ch => ch.id === componentId ? { ...ch, ...updates } : ch) } : s) };
    }));
  }, []);

  // Tab management functions
  const [tabsActiveStates, setTabsActiveStates] = useState<{ [tabsId: string]: number }>({});

  const setActiveTab = useCallback((tabsId: string, index: number) => {
    setTabsActiveStates(prev => ({ ...prev, [tabsId]: index }));
  }, []);

  const updateTabTitle = useCallback((tabsId: string, tabId: string, title: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== tabsId) return c;
      return { ...c, tabSections: (c.tabSections || []).map(t => t.id === tabId ? { ...t, title } : t) };
    }));
  }, []);

  const updateTabIcon = useCallback((tabsId: string, tabId: string, icon: string | undefined) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== tabsId) return c;
      return { ...c, tabSections: (c.tabSections || []).map(t => t.id === tabId ? { ...t, icon } : t) };
    }));
  }, []);

  const addTab = useCallback((tabsId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== tabsId) return c;
      const currentSections = c.tabSections || [];
      const newTabNumber = currentSections.length + 1;
      const newTab: TabSection = { id: `t${Date.now()}`, title: `Tab ${newTabNumber}`, children: [] };
      return { ...c, tabSections: [...currentSections, newTab] };
    }));
  }, []);

  const removeTab = useCallback((tabsId: string, tabId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== tabsId) return c;
      const newSections = (c.tabSections || []).filter(t => t.id !== tabId);
      return { ...c, tabSections: newSections };
    }));
    // Reset active tab if needed
    setTabsActiveStates(prev => {
      const current = prev[tabsId] || 0;
      const comp = droppedComponents.find(c => c.id === tabsId);
      const newLength = ((comp?.tabSections || []).filter(t => t.id !== tabId)).length;
      if (current >= newLength && newLength > 0) {
        return { ...prev, [tabsId]: newLength - 1 };
      }
      return prev;
    });
  }, [droppedComponents]);

  const addComponentToTab = useCallback((tabsId: string, tabId: string, component: DroppedComponent) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== tabsId) return c;
      return { ...c, tabSections: (c.tabSections || []).map(t => t.id === tabId ? { ...t, children: [...t.children, component] } : t) };
    }));
  }, []);

  const removeComponentFromTab = useCallback((tabsId: string, tabId: string, componentId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== tabsId) return c;
      return { ...c, tabSections: (c.tabSections || []).map(t => t.id === tabId ? { ...t, children: t.children.filter(ch => ch.id !== componentId) } : t) };
    }));
  }, []);

  const updateComponentInTab = useCallback((tabsId: string, tabId: string, componentId: string, updates: Partial<DroppedComponent>) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== tabsId) return c;
      return { ...c, tabSections: (c.tabSections || []).map(t => t.id === tabId ? { ...t, children: t.children.map(ch => ch.id === componentId ? { ...ch, ...updates } : ch) } : t) };
    }));
  }, []);

  // Cards in tabs
  const addComponentToCardInTab = useCallback((tabsId: string, tabId: string, cardId: string, component: DroppedComponent) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== tabsId) return c;
      return {
        ...c,
        tabSections: (c.tabSections || []).map(t => {
          if (t.id !== tabId) return t;
          return {
            ...t,
            children: t.children.map(card => {
              if (card.id !== cardId) return card;
              return { ...card, children: [...(card.children || []), component] };
            })
          };
        })
      };
    }));
  }, []);

  const removeComponentFromCardInTab = useCallback((tabsId: string, tabId: string, cardId: string, componentId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== tabsId) return c;
      return {
        ...c,
        tabSections: (c.tabSections || []).map(t => {
          if (t.id !== tabId) return t;
          return {
            ...t,
            children: t.children.map(card => {
              if (card.id !== cardId) return card;
              return { ...card, children: (card.children || []).filter(ch => ch.id !== componentId) };
            })
          };
        })
      };
    }));
  }, []);

  const updateComponentInCardInTab = useCallback((tabsId: string, tabId: string, cardId: string, componentId: string, updates: Partial<DroppedComponent>) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== tabsId) return c;
      return {
        ...c,
        tabSections: (c.tabSections || []).map(t => {
          if (t.id !== tabId) return t;
          return {
            ...t,
            children: t.children.map(card => {
              if (card.id !== cardId) return card;
              return { ...card, children: (card.children || []).map(ch => ch.id === componentId ? { ...ch, ...updates } : ch) };
            })
          };
        })
      };
    }));
  }, []);

  // Grid rows in accordion sections
  const addComponentToRowInAccordionSection = useCallback((accordionId: string, sectionId: string, gridId: string, rowKey: string, component: DroppedComponent) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== accordionId) return c;
      return {
        ...c,
        accordionSections: (c.accordionSections || []).map(s => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            children: s.children.map(child => {
              if (child.id !== gridId) return child;
              const byRow = child.detailChildrenByRow || {};
              return { ...child, detailChildrenByRow: { ...byRow, [rowKey]: [...(byRow[rowKey] || []), component] } };
            })
          };
        })
      };
    }));
  }, []);

  const removeComponentFromRowInAccordionSection = useCallback((accordionId: string, sectionId: string, gridId: string, rowKey: string, componentId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== accordionId) return c;
      return {
        ...c,
        accordionSections: (c.accordionSections || []).map(s => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            children: s.children.map(child => {
              if (child.id !== gridId) return child;
              const byRow = child.detailChildrenByRow || {};
              return { ...child, detailChildrenByRow: { ...byRow, [rowKey]: (byRow[rowKey] || []).filter(d => d.id !== componentId) } };
            })
          };
        })
      };
    }));
  }, []);

  // Grid rows in tabs
  const addComponentToRowInTab = useCallback((tabsId: string, tabId: string, gridId: string, rowKey: string, component: DroppedComponent) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== tabsId) return c;
      return {
        ...c,
        tabSections: (c.tabSections || []).map(t => {
          if (t.id !== tabId) return t;
          return {
            ...t,
            children: t.children.map(child => {
              if (child.id !== gridId) return child;
              const byRow = child.detailChildrenByRow || {};
              return { ...child, detailChildrenByRow: { ...byRow, [rowKey]: [...(byRow[rowKey] || []), component] } };
            })
          };
        })
      };
    }));
  }, []);

  const removeComponentFromRowInTab = useCallback((tabsId: string, tabId: string, gridId: string, rowKey: string, componentId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== tabsId) return c;
      return {
        ...c,
        tabSections: (c.tabSections || []).map(t => {
          if (t.id !== tabId) return t;
          return {
            ...t,
            children: t.children.map(child => {
              if (child.id !== gridId) return child;
              const byRow = child.detailChildrenByRow || {};
              return { ...child, detailChildrenByRow: { ...byRow, [rowKey]: (byRow[rowKey] || []).filter(d => d.id !== componentId) } };
            })
          };
        })
      };
    }));
  }, []);

  // Nested accordions in tabs
  const updateAccordionSectionTitleInTab = useCallback((tabsId: string, tabId: string, accordionId: string, sectionId: string, title: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== tabsId) return c;
      return {
        ...c,
        tabSections: (c.tabSections || []).map(t => {
          if (t.id !== tabId) return t;
          return {
            ...t,
            children: t.children.map(child => {
              if (child.id !== accordionId) return child;
              return { ...child, accordionSections: (child.accordionSections || []).map(s => s.id === sectionId ? { ...s, title } : s) };
            })
          };
        })
      };
    }));
  }, []);

  const addComponentToAccordionSectionInTab = useCallback((tabsId: string, tabId: string, accordionId: string, sectionId: string, component: DroppedComponent) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== tabsId) return c;
      return {
        ...c,
        tabSections: (c.tabSections || []).map(t => {
          if (t.id !== tabId) return t;
          return {
            ...t,
            children: t.children.map(child => {
              if (child.id !== accordionId) return child;
              return { ...child, accordionSections: (child.accordionSections || []).map(s => s.id === sectionId ? { ...s, children: [...s.children, component] } : s) };
            })
          };
        })
      };
    }));
  }, []);

  const removeComponentFromAccordionSectionInTab = useCallback((tabsId: string, tabId: string, accordionId: string, sectionId: string, componentId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== tabsId) return c;
      return {
        ...c,
        tabSections: (c.tabSections || []).map(t => {
          if (t.id !== tabId) return t;
          return {
            ...t,
            children: t.children.map(child => {
              if (child.id !== accordionId) return child;
              return { ...child, accordionSections: (child.accordionSections || []).map(s => s.id === sectionId ? { ...s, children: s.children.filter(ch => ch.id !== componentId) } : s) };
            })
          };
        })
      };
    }));
  }, []);

  const updateComponentInAccordionSectionInTab = useCallback((tabsId: string, tabId: string, accordionId: string, sectionId: string, componentId: string, updates: Partial<DroppedComponent>) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== tabsId) return c;
      return {
        ...c,
        tabSections: (c.tabSections || []).map(t => {
          if (t.id !== tabId) return t;
          return {
            ...t,
            children: t.children.map(child => {
              if (child.id !== accordionId) return child;
              return { ...child, accordionSections: (child.accordionSections || []).map(s => s.id === sectionId ? { ...s, children: s.children.map(ch => ch.id === componentId ? { ...ch, ...updates } : ch) } : s) };
            })
          };
        })
      };
    }));
  }, []);

  const addComponentToRowInAccordionSectionInTab = useCallback((tabsId: string, tabId: string, accordionId: string, sectionId: string, gridId: string, rowKey: string, component: DroppedComponent) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== tabsId) return c;
      return {
        ...c,
        tabSections: (c.tabSections || []).map(t => {
          if (t.id !== tabId) return t;
          return {
            ...t,
            children: t.children.map(child => {
              if (child.id !== accordionId) return child;
              return {
                ...child,
                accordionSections: (child.accordionSections || []).map(s => {
                  if (s.id !== sectionId) return s;
                  return {
                    ...s,
                    children: s.children.map(ch => {
                      if (ch.id !== gridId) return ch;
                      const currentDetailChildren = ch.detailChildrenByRow || {};
                      return { ...ch, detailChildrenByRow: { ...currentDetailChildren, [rowKey]: [...(currentDetailChildren[rowKey] || []), component] } };
                    })
                  };
                })
              };
            })
          };
        })
      };
    }));
  }, []);

  const removeComponentFromRowInAccordionSectionInTab = useCallback((tabsId: string, tabId: string, accordionId: string, sectionId: string, gridId: string, rowKey: string, componentId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== tabsId) return c;
      return {
        ...c,
        tabSections: (c.tabSections || []).map(t => {
          if (t.id !== tabId) return t;
          return {
            ...t,
            children: t.children.map(child => {
              if (child.id !== accordionId) return child;
              return {
                ...child,
                accordionSections: (child.accordionSections || []).map(s => {
                  if (s.id !== sectionId) return s;
                  return {
                    ...s,
                    children: s.children.map(ch => {
                      if (ch.id !== gridId) return ch;
                      const currentDetailChildren = ch.detailChildrenByRow || {};
                      return { ...ch, detailChildrenByRow: { ...currentDetailChildren, [rowKey]: (currentDetailChildren[rowKey] || []).filter(comp => comp.id !== componentId) } };
                    })
                  };
                })
              };
            })
          };
        })
      };
    }));
  }, []);

  // Stepper management
  const setActiveStep = useCallback((stepperId: string, index: number) => {
    setStepperActiveStates(prev => ({ ...prev, [stepperId]: index }));
  }, []);

  const addStepToStepper = useCallback((stepperId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      const currentSteps = c.stepperSteps || [];
      const newStepNumber = currentSteps.length + 1;
      const newStep: StepperStep = { id: `s${Date.now()}`, label: `Step ${newStepNumber}`, description: `Description for step ${newStepNumber}`, children: [] };
      return { ...c, stepperSteps: [...currentSteps, newStep] };
    }));
  }, []);

  const removeStepFromStepper = useCallback((stepperId: string, stepId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      const newSteps = (c.stepperSteps || []).filter(s => s.id !== stepId);
      if (newSteps.length === 0) return c; // Don't allow removing all steps
      return { ...c, stepperSteps: newSteps };
    }));
    // Reset active step if needed
    setStepperActiveStates(prev => {
      const current = prev[stepperId] || 0;
      const comp = droppedComponents.find(c => c.id === stepperId);
      const newLength = ((comp?.stepperSteps || []).filter(s => s.id !== stepId)).length;
      if (current >= newLength && newLength > 0) {
        return { ...prev, [stepperId]: newLength - 1 };
      }
      return prev;
    });
  }, [droppedComponents]);

  const updateStepLabel = useCallback((stepperId: string, stepId: string, label: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return { ...c, stepperSteps: (c.stepperSteps || []).map(s => s.id === stepId ? { ...s, label } : s) };
    }));
  }, []);

  const addComponentToStep = useCallback((stepperId: string, stepId: string, component: DroppedComponent) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return { ...c, stepperSteps: (c.stepperSteps || []).map(s => s.id === stepId ? { ...s, children: [...s.children, component] } : s) };
    }));
  }, []);

  const removeComponentFromStep = useCallback((stepperId: string, stepId: string, componentId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return { ...c, stepperSteps: (c.stepperSteps || []).map(s => s.id === stepId ? { ...s, children: s.children.filter(ch => ch.id !== componentId) } : s) };
    }));
  }, []);

  const updateComponentInStep = useCallback((stepperId: string, stepId: string, componentId: string, updates: Partial<DroppedComponent>) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? { ...s, children: s.children.map(ch => ch.id === componentId ? { ...ch, ...updates } : ch) }
            : s
        )
      };
    }));
  }, []);

  const updateColSizeInStep = useCallback((stepperId: string, stepId: string, componentId: string, size: number) => {
    updateComponentInStep(stepperId, stepId, componentId, { colSize: size });
  }, [updateComponentInStep]);

  const updateCardTitleInStep = useCallback((stepperId: string, stepId: string, cardId: string, title: string) => {
    updateComponentInStep(stepperId, stepId, cardId, { title });
  }, [updateComponentInStep]);

  const addComponentToCardInStep = useCallback((stepperId: string, stepId: string, cardId: string, component: DroppedComponent) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === cardId
                    ? { ...ch, children: [...(ch.children || []), component] }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const removeComponentFromCardInStep = useCallback((stepperId: string, stepId: string, cardId: string, componentId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === cardId
                    ? { ...ch, children: (ch.children || []).filter(child => child.id !== componentId) }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  // Accordion functions for stepper steps
  const updateAccordionSectionTitleInStep = useCallback((stepperId: string, stepId: string, accordionId: string, sectionId: string, title: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === accordionId
                    ? { ...ch, accordionSections: (ch.accordionSections || []).map(sec => sec.id === sectionId ? { ...sec, title } : sec) }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const addComponentToAccordionSectionInStep = useCallback((stepperId: string, stepId: string, accordionId: string, sectionId: string, component: DroppedComponent) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === accordionId
                    ? { ...ch, accordionSections: (ch.accordionSections || []).map(sec => sec.id === sectionId ? { ...sec, children: [...sec.children, component] } : sec) }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const removeComponentFromAccordionSectionInStep = useCallback((stepperId: string, stepId: string, accordionId: string, sectionId: string, componentId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === accordionId
                    ? { ...ch, accordionSections: (ch.accordionSections || []).map(sec => sec.id === sectionId ? { ...sec, children: sec.children.filter(child => child.id !== componentId) } : sec) }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const updateComponentInAccordionSectionInStep = useCallback((stepperId: string, stepId: string, accordionId: string, sectionId: string, componentId: string, updates: Partial<DroppedComponent>) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === accordionId
                    ? { ...ch, accordionSections: (ch.accordionSections || []).map(sec => sec.id === sectionId ? { ...sec, children: sec.children.map(child => child.id === componentId ? { ...child, ...updates } : child) } : sec) }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const addComponentToRowInAccordionSectionInStep = useCallback((stepperId: string, stepId: string, accordionId: string, sectionId: string, gridId: string, rowKey: string, component: DroppedComponent) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === accordionId
                    ? {
                        ...ch,
                        accordionSections: (ch.accordionSections || []).map(sec =>
                          sec.id === sectionId
                            ? {
                                ...sec,
                                children: sec.children.map(child =>
                                  child.id === gridId
                                    ? {
                                        ...child,
                                        detailChildrenByRow: {
                                          ...(child.detailChildrenByRow || {}),
                                          [rowKey]: [...((child.detailChildrenByRow || {})[rowKey] || []), component]
                                        }
                                      }
                                    : child
                                )
                              }
                            : sec
                        )
                      }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const removeComponentFromRowInAccordionSectionInStep = useCallback((stepperId: string, stepId: string, accordionId: string, sectionId: string, gridId: string, rowKey: string, componentId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === accordionId
                    ? {
                        ...ch,
                        accordionSections: (ch.accordionSections || []).map(sec =>
                          sec.id === sectionId
                            ? {
                                ...sec,
                                children: sec.children.map(child =>
                                  child.id === gridId
                                    ? {
                                        ...child,
                                        detailChildrenByRow: {
                                          ...(child.detailChildrenByRow || {}),
                                          [rowKey]: ((child.detailChildrenByRow || {})[rowKey] || []).filter(c => c.id !== componentId)
                                        }
                                      }
                                    : child
                                )
                              }
                            : sec
                        )
                      }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  // Tabs functions for stepper steps
  const setActiveTabInStep = useCallback((stepperId: string, stepId: string, tabsId: string, index: number) => {
    setTabsActiveStates(prev => ({ ...prev, [tabsId]: index }));
  }, []);

  const updateTabTitleInStep = useCallback((stepperId: string, stepId: string, tabsId: string, tabId: string, title: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === tabsId
                    ? { ...ch, tabSections: (ch.tabSections || []).map(t => t.id === tabId ? { ...t, title } : t) }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const addTabInStep = useCallback((stepperId: string, stepId: string, tabsId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === tabsId
                    ? {
                        ...ch,
                        tabSections: [
                          ...(ch.tabSections || []),
                          { id: `tab-${Date.now()}`, title: `Tab ${(ch.tabSections || []).length + 1}`, children: [] }
                        ]
                      }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const removeTabInStep = useCallback((stepperId: string, stepId: string, tabsId: string, tabId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === tabsId
                    ? { ...ch, tabSections: (ch.tabSections || []).filter(t => t.id !== tabId) }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const addComponentToTabInStep = useCallback((stepperId: string, stepId: string, tabsId: string, tabId: string, component: DroppedComponent) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === tabsId
                    ? { ...ch, tabSections: (ch.tabSections || []).map(t => t.id === tabId ? { ...t, children: [...t.children, component] } : t) }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const removeComponentFromTabInStep = useCallback((stepperId: string, stepId: string, tabsId: string, tabId: string, componentId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === tabsId
                    ? { ...ch, tabSections: (ch.tabSections || []).map(t => t.id === tabId ? { ...t, children: t.children.filter(child => child.id !== componentId) } : t) }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const updateComponentInTabInStep = useCallback((stepperId: string, stepId: string, tabsId: string, tabId: string, componentId: string, updates: Partial<DroppedComponent>) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === tabsId
                    ? { ...ch, tabSections: (ch.tabSections || []).map(t => t.id === tabId ? { ...t, children: t.children.map(child => child.id === componentId ? { ...child, ...updates } : child) } : t) }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const addComponentToRowInTabInStep = useCallback((stepperId: string, stepId: string, tabsId: string, tabId: string, gridId: string, rowKey: string, component: DroppedComponent) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === tabsId
                    ? {
                        ...ch,
                        tabSections: (ch.tabSections || []).map(t =>
                          t.id === tabId
                            ? {
                                ...t,
                                children: t.children.map(child =>
                                  child.id === gridId
                                    ? {
                                        ...child,
                                        detailChildrenByRow: {
                                          ...(child.detailChildrenByRow || {}),
                                          [rowKey]: [...((child.detailChildrenByRow || {})[rowKey] || []), component]
                                        }
                                      }
                                    : child
                                )
                              }
                            : t
                        )
                      }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const removeComponentFromRowInTabInStep = useCallback((stepperId: string, stepId: string, tabsId: string, tabId: string, gridId: string, rowKey: string, componentId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === tabsId
                    ? {
                        ...ch,
                        tabSections: (ch.tabSections || []).map(t =>
                          t.id === tabId
                            ? {
                                ...t,
                                children: t.children.map(child =>
                                  child.id === gridId
                                    ? {
                                        ...child,
                                        detailChildrenByRow: {
                                          ...(child.detailChildrenByRow || {}),
                                          [rowKey]: ((child.detailChildrenByRow || {})[rowKey] || []).filter(c => c.id !== componentId)
                                        }
                                      }
                                    : child
                                )
                              }
                            : t
                        )
                      }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const updateAccordionSectionTitleInTabInStep = useCallback((stepperId: string, stepId: string, tabsId: string, tabId: string, accordionId: string, sectionId: string, title: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === tabsId
                    ? {
                        ...ch,
                        tabSections: (ch.tabSections || []).map(t =>
                          t.id === tabId
                            ? {
                                ...t,
                                children: t.children.map(child =>
                                  child.id === accordionId
                                    ? { ...child, accordionSections: (child.accordionSections || []).map(sec => sec.id === sectionId ? { ...sec, title } : sec) }
                                    : child
                                )
                              }
                            : t
                        )
                      }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const addComponentToAccordionSectionInTabInStep = useCallback((stepperId: string, stepId: string, tabsId: string, tabId: string, accordionId: string, sectionId: string, component: DroppedComponent) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === tabsId
                    ? {
                        ...ch,
                        tabSections: (ch.tabSections || []).map(t =>
                          t.id === tabId
                            ? {
                                ...t,
                                children: t.children.map(child =>
                                  child.id === accordionId
                                    ? { ...child, accordionSections: (child.accordionSections || []).map(sec => sec.id === sectionId ? { ...sec, children: [...sec.children, component] } : sec) }
                                    : child
                                )
                              }
                            : t
                        )
                      }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const removeComponentFromAccordionSectionInTabInStep = useCallback((stepperId: string, stepId: string, tabsId: string, tabId: string, accordionId: string, sectionId: string, componentId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === tabsId
                    ? {
                        ...ch,
                        tabSections: (ch.tabSections || []).map(t =>
                          t.id === tabId
                            ? {
                                ...t,
                                children: t.children.map(child =>
                                  child.id === accordionId
                                    ? { ...child, accordionSections: (child.accordionSections || []).map(sec => sec.id === sectionId ? { ...sec, children: sec.children.filter(c => c.id !== componentId) } : sec) }
                                    : child
                                )
                              }
                            : t
                        )
                      }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const updateComponentInAccordionSectionInTabInStep = useCallback((stepperId: string, stepId: string, tabsId: string, tabId: string, accordionId: string, sectionId: string, componentId: string, updates: Partial<DroppedComponent>) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === tabsId
                    ? {
                        ...ch,
                        tabSections: (ch.tabSections || []).map(t =>
                          t.id === tabId
                            ? {
                                ...t,
                                children: t.children.map(child =>
                                  child.id === accordionId
                                    ? { ...child, accordionSections: (child.accordionSections || []).map(sec => sec.id === sectionId ? { ...sec, children: sec.children.map(c => c.id === componentId ? { ...c, ...updates } : c) } : sec) }
                                    : child
                                )
                              }
                            : t
                        )
                      }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const addComponentToRowInAccordionSectionInTabInStep = useCallback((stepperId: string, stepId: string, tabsId: string, tabId: string, accordionId: string, sectionId: string, gridId: string, rowKey: string, component: DroppedComponent) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === tabsId
                    ? {
                        ...ch,
                        tabSections: (ch.tabSections || []).map(t =>
                          t.id === tabId
                            ? {
                                ...t,
                                children: t.children.map(child =>
                                  child.id === accordionId
                                    ? {
                                        ...child,
                                        accordionSections: (child.accordionSections || []).map(sec =>
                                          sec.id === sectionId
                                            ? {
                                                ...sec,
                                                children: sec.children.map(c =>
                                                  c.id === gridId
                                                    ? {
                                                        ...c,
                                                        detailChildrenByRow: {
                                                          ...(c.detailChildrenByRow || {}),
                                                          [rowKey]: [...((c.detailChildrenByRow || {})[rowKey] || []), component]
                                                        }
                                                      }
                                                    : c
                                                )
                                              }
                                            : sec
                                        )
                                      }
                                    : child
                                )
                              }
                            : t
                        )
                      }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const removeComponentFromRowInAccordionSectionInTabInStep = useCallback((stepperId: string, stepId: string, tabsId: string, tabId: string, accordionId: string, sectionId: string, gridId: string, rowKey: string, componentId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === tabsId
                    ? {
                        ...ch,
                        tabSections: (ch.tabSections || []).map(t =>
                          t.id === tabId
                            ? {
                                ...t,
                                children: t.children.map(child =>
                                  child.id === accordionId
                                    ? {
                                        ...child,
                                        accordionSections: (child.accordionSections || []).map(sec =>
                                          sec.id === sectionId
                                            ? {
                                                ...sec,
                                                children: sec.children.map(c =>
                                                  c.id === gridId
                                                    ? {
                                                        ...c,
                                                        detailChildrenByRow: {
                                                          ...(c.detailChildrenByRow || {}),
                                                          [rowKey]: ((c.detailChildrenByRow || {})[rowKey] || []).filter(comp => comp.id !== componentId)
                                                        }
                                                      }
                                                    : c
                                                )
                                              }
                                            : sec
                                        )
                                      }
                                    : child
                                )
                              }
                            : t
                        )
                      }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  // Expandable grid functions for stepper steps
  const addComponentToRowInStep = useCallback((stepperId: string, stepId: string, gridId: string, rowKey: string, component: DroppedComponent) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === gridId
                    ? {
                        ...ch,
                        detailChildrenByRow: {
                          ...(ch.detailChildrenByRow || {}),
                          [rowKey]: [...((ch.detailChildrenByRow || {})[rowKey] || []), component]
                        }
                      }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  const removeComponentFromRowInStep = useCallback((stepperId: string, stepId: string, gridId: string, rowKey: string, componentId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== stepperId) return c;
      return {
        ...c,
        stepperSteps: (c.stepperSteps || []).map(s =>
          s.id === stepId
            ? {
                ...s,
                children: s.children.map(ch =>
                  ch.id === gridId
                    ? {
                        ...ch,
                        detailChildrenByRow: {
                          ...(ch.detailChildrenByRow || {}),
                          [rowKey]: ((ch.detailChildrenByRow || {})[rowKey] || []).filter(comp => comp.id !== componentId)
                        }
                      }
                    : ch
                )
              }
            : s
        )
      };
    }));
  }, []);

  // Sidebar content management
  const updateSidebarContent = useCallback((sidebarId: string, menuItemId: string, content: DroppedComponent[]) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== sidebarId) return c;
      return {
        ...c,
        sidebarContent: {
          ...(c.sidebarContent || {}),
          [menuItemId]: content
        }
      };
    }));
  }, []);

  const updateSidebarSelectedMenuItem = useCallback((sidebarId: string, menuItemId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== sidebarId) return c;
      return { ...c, selectedMenuItem: menuItemId };
    }));
  }, []);

  const updateSidebarNavData = useCallback((sidebarId: string, navData: any[]) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== sidebarId) return c;
      return { ...c, sidebarNavData: navData };
    }));
  }, []);

  const addCardToSidebar = useCallback((sidebarId: string, menuItemId: string, card: DroppedComponent) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== sidebarId) return c;
      const currentContent = (c.sidebarContent || {})[menuItemId] || [];
      return {
        ...c,
        sidebarContent: {
          ...(c.sidebarContent || {}),
          [menuItemId]: [...currentContent, card]
        }
      };
    }));
  }, []);

  const removeCardFromSidebar = useCallback((sidebarId: string, menuItemId: string, cardId: string) => {
    setDroppedComponents(prev => prev.map(c => {
      if (c.id !== sidebarId) return c;
      const currentContent = (c.sidebarContent || {})[menuItemId] || [];
      return {
        ...c,
        sidebarContent: {
          ...(c.sidebarContent || {}),
          [menuItemId]: currentContent.filter(card => card.id !== cardId)
        }
      };
    }));
  }, []);

  // Combined export: full React component with DevExtreme code
  const exportCode = () => {
    const name = pageName || 'Untitled Page';
    const locationName = getMenuNameById(selectedLocation || 'root') || selectedLocation || 'root';
    const output = buildExportCode(name, droppedComponents, locationName);
    downloadFile(output, `${name.replace(/\s+/g, '-').toLowerCase()}.tsx`, 'text/plain');
  };

  const [copyFramesState, setCopyFramesState] = useState<'idle' | 'copied' | 'error'>('idle');

  const copyFrames = async () => {
    try {
      await copyFramesToClipboard(pageName || 'Untitled Page', droppedComponents);
      setCopyFramesState('copied');
      setTimeout(() => setCopyFramesState('idle'), 2500);
    } catch {
      setCopyFramesState('error');
      setTimeout(() => setCopyFramesState('idle'), 2500);
    }
  };

  // Helper function to download a file
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const saveDraft = () => {
    if (droppedComponents.length === 0) {
      alert('Nothing to save. Please add components first.');
      return;
    }

    const draftName = pageName.trim() || `Design ${new Date().toLocaleString()}`;
    const draftId = `draft_${Date.now()}`;
    const timestamp = Date.now();

    const serializedComponents = serializeComponents(droppedComponents);

    const draftData = {
      id: draftId,
      name: draftName,
      timestamp,
      pageName,
      selectedLocation,
      droppedComponents: serializedComponents,
      tabsActiveStates,
      stepperActiveStates
    };

    // Save the draft data
    localStorage.setItem(draftId, JSON.stringify(draftData));

    // Update drafts list
    const updatedDraftsList = [...savedDrafts, { id: draftId, name: draftName, timestamp }];
    setSavedDrafts(updatedDraftsList);
    localStorage.setItem('pageBuilderDraftsList', JSON.stringify(updatedDraftsList));

    alert(`Draft "${draftName}" saved successfully!`);
  };

  const loadDraft = (draftId: string) => {
    const draftStr = localStorage.getItem(draftId);
    if (!draftStr) {
      alert('Draft not found');
      return;
    }

    try {
      const draftData = JSON.parse(draftStr);

      const deserializedComponents = deserializeComponents(draftData.droppedComponents);

      setPageName(draftData.pageName || '');
      setSelectedLocation(draftData.selectedLocation || 'root');
      setDroppedComponents(deserializedComponents);

      setTabsActiveStates(draftData.tabsActiveStates || {});
      setStepperActiveStates(draftData.stepperActiveStates || {});

      setShowLoadDrafts(false);
      alert('Draft loaded successfully!');
    } catch (e) {
      console.error('Failed to load draft:', e);
      alert('Failed to load draft');
    }
  };

  const deleteDraft = (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    localStorage.removeItem(draftId);
    const updatedDraftsList = savedDrafts.filter(d => d.id !== draftId);
    setSavedDrafts(updatedDraftsList);
    localStorage.setItem('pageBuilderDraftsList', JSON.stringify(updatedDraftsList));
  };

  const exportDesign = () => {
    if (droppedComponents.length === 0) {
      alert('Nothing to export. Please add components first.');
      return;
    }

    const exportName = pageName.trim() || `Design_${new Date().toISOString().split('T')[0]}`;

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      name: exportName,
      pageName,
      selectedLocation,
      droppedComponents: serializeComponents(droppedComponents),
      tabsActiveStates,
      stepperActiveStates
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const filename = `${exportName.replace(/[^a-z0-9]/gi, '_')}.json`;
    downloadFile(dataStr, filename, 'application/json');

    alert(`Design exported as ${filename}`);
  };

  const importDesign = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);

        if (!importData.droppedComponents) {
          alert('Invalid import file: missing components data');
          return;
        }

        const deserializedComponents = deserializeComponents(importData.droppedComponents);

        setPageName(importData.pageName || '');
        setSelectedLocation(importData.selectedLocation || 'root');
        setDroppedComponents(deserializedComponents);

        setTabsActiveStates(importData.tabsActiveStates || {});
        setStepperActiveStates(importData.stepperActiveStates || {});

        alert(`Design "${importData.name || 'Unnamed'}" imported successfully!`);
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to import design. Please check the file format.');
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be imported again
    event.target.value = '';
  };

  const handleCreatePage = () => {
    if (!pageName.trim()) {
      alert('Please enter a page name');
      return;
    }
    if (!selectedLocation) {
      alert('Please select a location');
      return;
    }
    if (droppedComponents.length === 0) {
      alert('Please add at least one component to the page');
      return;
    }

    // Recursive helper to serialize component without React elements
    function serializeComponent(comp: DroppedComponent): any {
      return {
        id: comp.id,
        type: comp.type,
        name: comp.name,
        buttonText: comp.buttonText,
        textContent: comp.textContent,
        title: comp.title,
        stepperData: comp.stepperData,
        stepperSteps: comp.stepperSteps ? serializeStepperSteps(comp.stepperSteps) : undefined,
        gridData: comp.gridData,
        detailChildrenByRow: comp.detailChildrenByRow ? serializeDetailChildren(comp.detailChildrenByRow) : undefined,
        accordionSections: comp.accordionSections ? serializeAccordionSections(comp.accordionSections) : undefined,
        tabSections: comp.tabSections ? serializeTabSections(comp.tabSections) : undefined
      };
    }

    // Helper to serialize accordion sections
    function serializeAccordionSections(sections?: AccordionSection[]): any[] | undefined {
      if (!sections) return undefined;
      return sections.map(section => ({
        id: section.id,
        title: section.title,
        children: section.children.map(child => serializeComponent(child))
      }));
    }

    // Helper to serialize tab sections
    function serializeTabSections(sections?: TabSection[]): any[] | undefined {
      if (!sections) return undefined;
      return sections.map(section => ({
        id: section.id,
        title: section.title,
        children: section.children.map(child => serializeComponent(child))
      }));
    }

    // Helper to serialize stepper steps
    function serializeStepperSteps(steps?: StepperStep[]): any[] | undefined {
      if (!steps) return undefined;
      return steps.map(step => ({
        id: step.id,
        label: step.label,
        description: step.description,
        children: step.children.map(child => serializeComponent(child))
      }));
    }

    // Helper to serialize detail children by row
    function serializeDetailChildren(detailChildren?: { [rowKey: string]: DroppedComponent[] }): { [key: string]: any[] } | undefined {
      if (!detailChildren) return undefined;
      const result: { [key: string]: any[] } = {};
      Object.keys(detailChildren).forEach(key => {
        result[key] = detailChildren[key].map(child => serializeComponent(child));
      });
      return result;
    }

    // Build detailed component data for Claude
    const pageData = {
      pageName,
      selectedLocation,
      components: droppedComponents.map(c => ({
        id: c.id,
        type: c.type,
        name: c.name,
        colSize: c.colSize || 12,
        title: c.title,
        buttonText: c.buttonText,
        textContent: c.textContent,
        stepperData: c.stepperData,
        stepperSteps: serializeStepperSteps(c.stepperSteps),
        gridData: c.gridData,
        detailChildrenByRow: serializeDetailChildren(c.detailChildrenByRow),
        accordionSections: serializeAccordionSections(c.accordionSections),
        tabSections: serializeTabSections(c.tabSections),
        children: c.children?.map(child => ({
          id: child.id,
          type: child.type,
          name: child.name,
          buttonText: child.buttonText,
          textContent: child.textContent,
          title: child.title,
          detailChildrenByRow: serializeDetailChildren(child.detailChildrenByRow),
          accordionSections: serializeAccordionSections(child.accordionSections),
          tabSections: serializeTabSections(child.tabSections),
          stepperSteps: serializeStepperSteps(child.stepperSteps)
        })) || [],
        headerLeftChildren: c.headerLeftChildren?.map(serializeComponent) || [],
        headerRightChildren: c.headerRightChildren?.map(serializeComponent) || []
      }))
    };

    // Format detailed output for console
    const consoleOutput = {
      action: 'CREATE_PAGE',
      data: pageData,
      instructions: {
        fileName: `${pageName.toLowerCase().replace(/\s+/g, '-')}.tsx`,
        componentName: pageName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(''),
        route: `/${pageName.toLowerCase().replace(/\s+/g, '-')}`,
        menuLocation: selectedLocation
      }
    };

    // Log to console for debugging
    console.log('=== PAGE CREATION REQUEST ===');
    console.log(JSON.stringify(consoleOutput, null, 2));
    console.log('=============================');

    // Save to window
    (window as any).__pageBuilderData = consoleOutput;

    const componentsList = droppedComponents.map(c => {
      let label = c.name;

      // Add custom title for cards
      if (c.type === 'card' && c.title) {
        label += ` - "${c.title}"`;
      }

      // Add custom text for buttons
      if (c.type === 'button' && c.buttonText) {
        label += ` - "${c.buttonText}"`;
      }

      // Add custom text for 40 Words component
      if (c.type === '40-words' && c.textContent) {
        label += ` - "${c.textContent.substring(0, 50)}${c.textContent.length > 50 ? '...' : ''}"`;
      }

      const parts = [`- ${label} (${c.colSize}/12 width)`];

      if (c.headerLeftChildren && c.headerLeftChildren.length > 0) {
        const headerLeftList = c.headerLeftChildren.map(child => {
          let childLabel = child.name;
          if (child.buttonText) childLabel += ` - "${child.buttonText}"`;
          return `  [Header Left] ${childLabel}`;
        }).join('\n');
        parts.push(headerLeftList);
      }

      if (c.headerRightChildren && c.headerRightChildren.length > 0) {
        const headerRightList = c.headerRightChildren.map(child => {
          let childLabel = child.name;
          if (child.buttonText) childLabel += ` - "${child.buttonText}"`;
          return `  [Header Right] ${childLabel}`;
        }).join('\n');
        parts.push(headerRightList);
      }

      if (c.children && c.children.length > 0) {
        const childrenList = c.children.map(child => {
          let childLabel = child.name;
          if (child.buttonText) childLabel += ` - "${child.buttonText}"`;
          if (child.title) childLabel += ` - "${child.title}"`;

          // Show accordion sections if present
          if (child.type === 'accordion' && child.accordionSections && child.accordionSections.length > 0) {
            const sectionsWithChildren = child.accordionSections.filter(s => s.children.length > 0);
            if (sectionsWithChildren.length > 0) {
              childLabel += ` (${sectionsWithChildren.length} sections with nested components)`;
            }
          }

          // Show expandable grid details if present
          if (child.type === 'datagrid-expandable' && child.detailChildrenByRow) {
            const rowCount = Object.keys(child.detailChildrenByRow).length;
            if (rowCount > 0) {
              childLabel += ` (${rowCount} rows with nested components)`;
            }
          }

          return `  └─ ${childLabel}`;
        }).join('\n');
        parts.push(childrenList);
      }

      // Show accordion sections for root-level accordions
      if (c.type === 'accordion' && c.accordionSections && c.accordionSections.length > 0) {
        const sectionsWithChildren = c.accordionSections.filter(s => s.children.length > 0);
        if (sectionsWithChildren.length > 0) {
          parts.push(`  └─ ${sectionsWithChildren.length} accordion sections with nested components`);
        }
      }

      // Show expandable grid details for root-level grids
      if (c.type === 'datagrid-expandable' && c.detailChildrenByRow) {
        const rowCount = Object.keys(c.detailChildrenByRow).length;
        if (rowCount > 0) {
          parts.push(`  └─ ${rowCount} expandable rows with nested components`);
        }
      }

      return parts.join('\n');
    }).join('\n');

    // Resolve the display name from the data-driven menu (src/data/menu.json)
    const menuLocationName = getMenuNameById(selectedLocation || 'root') || selectedLocation;

    // Create detailed message with file paths and instructions
    const fileName = `${pageName.replace(/\s+/g, '')}.tsx`;
    const componentName = pageName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('').replace(/\s+/g, '');
    const route = `/${pageName.toLowerCase().replace(/\s+/g, '-')}`;

    const detailedMessage = `Page ready to create!

Name: ${pageName}
Location: ${menuLocationName}

Components:
${componentsList}

COMPLETE PAGE DATA (JSON):
${JSON.stringify(pageData, null, 2)}

INSTRUCTIONS FOR CLAUDE:
1. Create file: src/app/pages/${fileName}
2. Add route to: src/app/routes.tsx
   - Import: import { ${componentName} } from "./pages/${fileName.replace('.tsx', '')}";
   - Route: { path: "${route}", Component: ${componentName} }
3. Add the page to the DATA-DRIVEN menu: src/data/menu.json
   - Add an entry with a "path" ("${route}") under the "${menuLocationName}" primary (or a new primary).
   - The menu is data-driven: the live nav (MegaMenu) AND this Page Builder placement both read
     menu.json. Do NOT hardcode menu items in MegaMenu.tsx.

IMPLEMENTATION REQUIREMENTS:
- Follow the design system in /CLAUDE.md + /Guidelines.md (DevExtreme + Bootstrap + our CSS classes
  + Font Awesome; NO Tailwind/inline styles/shadcn). Prefer the ui-kit wrappers and PageLayout.
- Use the JSON data above for ALL component properties (titles, button text, content, etc.)
- For cards: Use the "title" property from the JSON
- For buttons: Use the "buttonText" property AND the "name" property to determine button style (Primary/Secondary/Tertiary)
- For accordion sections: Implement ALL sections with their nested children from "accordionSections" array
- For expandable DataGrids: Implement nested components in detail rows from "detailChildrenByRow" object
- ALL DataGrids must include <ColumnChooser enabled={true} mode="select" /> for responsive columns
- Do NOT use placeholder text - use the EXACT data from the JSON above

Page data saved to window.__pageBuilderData for reference.`;

    setInstructionsMessage(detailedMessage);
    setShowInstructions(true);
  };

  return (
    <>
      <div className="page-builder p-[16px]">
        <div className="page-builder-header">
          <div>
            <h3>Page Builder</h3>
            
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={() => setShowPreview(true)}
              disabled={droppedComponents.length === 0}
              title="Preview page"
            >
              <i className="fa-solid fa-eye"></i>
              Preview
            </button>
            <button
              className="btn-secondary"
              onClick={() => setShowLoadDrafts(true)}
              title="Load a saved draft"
            >
              <i className="fa-solid fa-folder-open"></i>
              
            </button>
            <button
              className="btn-secondary"
              onClick={() => document.getElementById('import-file-input')?.click()}
              title="Import design from JSON file"
            >
              <i className="fa-solid fa-upload"></i>
             
            </button>
            <button
              className="btn-secondary"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Exit fullscreen" : "Fullscreen"}
            >
              <i className={`fa-solid ${isExpanded ? 'fa-compress' : 'fa-expand'}`}></i>

            </button>
          </div>
        </div>

        <div ref={drop} className="page-builder-canvas">
        {droppedComponents.length === 0 ? (
          <div className="page-builder-placeholder">
            <i className="fa-solid fa-arrow-left"></i>
            <p>Drag components here to start building</p>
          </div>
        ) : (
          <div className="page-builder-components">
            <div className="container-fluid px-0">
              <div className="row g-2 align-items-end">
                {droppedComponents.map((component, index) => {
                  const isBtn = component.type === 'button' || component.type === 'secondary-button' ||
                    component.type === 'tertiary-button' || component.type.startsWith('segmented-');
                  const prevIsBtn = index > 0 && (
                    droppedComponents[index - 1].type === 'button' ||
                    droppedComponents[index - 1].type === 'secondary-button' ||
                    droppedComponents[index - 1].type === 'tertiary-button' ||
                    droppedComponents[index - 1].type.startsWith('segmented-')
                  );
                  return (
                  <DroppedComponentItem
                    key={component.id}
                    component={component}
                    index={index}
                    isFirstInButtonGroup={isBtn && !prevIsBtn}
                    moveComponent={moveComponent}
                    removeComponent={removeComponent}
                    updateComponent={updateComponent}
                    updateColSize={updateColSize}
                    addComponentToCard={addComponentToCard}
                    removeComponentFromCard={removeComponentFromCard}
                    addComponentToCardHeader={addComponentToCardHeader}
                    removeComponentFromCardHeader={removeComponentFromCardHeader}
                    updateCardTitle={updateCardTitle}
                    updateComponentInCard={updateComponentInCard}
                    updateComponentInCardHeader={updateComponentInCardHeader}
                    moveComponentInCard={moveComponentInCard}
                    moveComponentInCardHeader={moveComponentInCardHeader}
                    moveComponentBetweenAlignments={moveComponentBetweenAlignments}
                    addComponentToRow={addComponentToRow}
                    removeComponentFromRow={removeComponentFromRow}
                    addComponentToRowInCard={addComponentToRowInCard}
                    removeComponentFromRowInCard={removeComponentFromRowInCard}
                    updateAccordionSectionTitle={updateAccordionSectionTitle}
                    addComponentToAccordionSection={addComponentToAccordionSection}
                    removeComponentFromAccordionSection={removeComponentFromAccordionSection}
                    updateComponentInAccordionSection={updateComponentInAccordionSection}
                    addComponentToRowInAccordionSection={addComponentToRowInAccordionSection}
                    removeComponentFromRowInAccordionSection={removeComponentFromRowInAccordionSection}
                    tabsActiveStates={tabsActiveStates}
                    setActiveTab={setActiveTab}
                    updateTabTitle={updateTabTitle}
                    updateTabIcon={updateTabIcon}
                    addTab={addTab}
                    removeTab={removeTab}
                    addComponentToTab={addComponentToTab}
                    removeComponentFromTab={removeComponentFromTab}
                    updateComponentInTab={updateComponentInTab}
                    addComponentToCardInTab={addComponentToCardInTab}
                    removeComponentFromCardInTab={removeComponentFromCardInTab}
                    updateComponentInCardInTab={updateComponentInCardInTab}
                    addComponentToRowInTab={addComponentToRowInTab}
                    removeComponentFromRowInTab={removeComponentFromRowInTab}
                    updateAccordionSectionTitleInTab={updateAccordionSectionTitleInTab}
                    addComponentToAccordionSectionInTab={addComponentToAccordionSectionInTab}
                    removeComponentFromAccordionSectionInTab={removeComponentFromAccordionSectionInTab}
                    updateComponentInAccordionSectionInTab={updateComponentInAccordionSectionInTab}
                    addComponentToRowInAccordionSectionInTab={addComponentToRowInAccordionSectionInTab}
                    removeComponentFromRowInAccordionSectionInTab={removeComponentFromRowInAccordionSectionInTab}
                    stepperActiveStates={stepperActiveStates}
                    setActiveStep={setActiveStep}
                    addStepToStepper={addStepToStepper}
                    removeStepFromStepper={removeStepFromStepper}
                    updateStepLabel={updateStepLabel}
                    addComponentToStep={addComponentToStep}
                    removeComponentFromStep={removeComponentFromStep}
                    updateComponentInStep={updateComponentInStep}
                    updateColSizeInStep={updateColSizeInStep}
                    updateCardTitleInStep={updateCardTitleInStep}
                    addComponentToCardInStep={addComponentToCardInStep}
                    removeComponentFromCardInStep={removeComponentFromCardInStep}
                    updateAccordionSectionTitleInStep={updateAccordionSectionTitleInStep}
                    addComponentToAccordionSectionInStep={addComponentToAccordionSectionInStep}
                    removeComponentFromAccordionSectionInStep={removeComponentFromAccordionSectionInStep}
                    updateComponentInAccordionSectionInStep={updateComponentInAccordionSectionInStep}
                    addComponentToRowInAccordionSectionInStep={addComponentToRowInAccordionSectionInStep}
                    removeComponentFromRowInAccordionSectionInStep={removeComponentFromRowInAccordionSectionInStep}
                    setActiveTabInStep={setActiveTabInStep}
                    updateTabTitleInStep={updateTabTitleInStep}
                    addTabInStep={addTabInStep}
                    removeTabInStep={removeTabInStep}
                    addComponentToTabInStep={addComponentToTabInStep}
                    removeComponentFromTabInStep={removeComponentFromTabInStep}
                    updateComponentInTabInStep={updateComponentInTabInStep}
                    addComponentToRowInTabInStep={addComponentToRowInTabInStep}
                    removeComponentFromRowInTabInStep={removeComponentFromRowInTabInStep}
                    updateAccordionSectionTitleInTabInStep={updateAccordionSectionTitleInTabInStep}
                    addComponentToAccordionSectionInTabInStep={addComponentToAccordionSectionInTabInStep}
                    removeComponentFromAccordionSectionInTabInStep={removeComponentFromAccordionSectionInTabInStep}
                    updateComponentInAccordionSectionInTabInStep={updateComponentInAccordionSectionInTabInStep}
                    addComponentToRowInAccordionSectionInTabInStep={addComponentToRowInAccordionSectionInTabInStep}
                    removeComponentFromRowInAccordionSectionInTabInStep={removeComponentFromRowInAccordionSectionInTabInStep}
                    addComponentToRowInStep={addComponentToRowInStep}
                    removeComponentFromRowInStep={removeComponentFromRowInStep}
                    updateSidebarContent={updateSidebarContent}
                    updateSidebarSelectedMenuItem={updateSidebarSelectedMenuItem}
                    updateSidebarNavData={updateSidebarNavData}
                    addCardToSidebar={addCardToSidebar}
                    removeCardFromSidebar={removeCardFromSidebar}
                  />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="page-builder-controls">
        <div className="page-builder-controls-row">
          <div className="page-builder-control-group">
            <label className="page-builder-label">Page Name</label>
            <input
              type="text"
              className="page-builder-input"
              placeholder="Enter page name"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
            />
          </div>

          <div className="page-builder-control-group">
            <label className="page-builder-label">Page Location</label>
            <DropdownTreeView
              locations={pageLocations}
              selectedId={selectedLocation}
              onSelect={setSelectedLocation}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="page-builder-create-btn" onClick={handleCreatePage}>
            <i className="fa-solid fa-plus"></i>
            Create Page
          </button>
          <button
            className="btn-secondary"
            onClick={saveDraft}
            disabled={droppedComponents.length === 0}
            title="Save current draft"
          >
            <i className="fa-solid fa-save"></i>
            Save draft
          </button>
          <button
            className="btn-secondary"
            onClick={exportDesign}
            disabled={droppedComponents.length === 0}
            title="Export design as JSON file"
          >
            <i className="fa-solid fa-download"></i>
            Export
          </button>
        </div>
        <input
          id="import-file-input"
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={importDesign}
        />
      </div>
      </div>


      {/* Preview Modal */}
      {showPreview && (
        <div className="page-builder-preview-overlay" onClick={() => setShowPreview(false)}>
          <div className="page-builder-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="page-builder-preview-header">
              <h3 className="page-builder-preview-title">
                {pageName || 'Untitled Page'} - Preview
              </h3>
              <div className="page-builder-preview-actions">
                <button
                  className={`page-builder-export-btn pb-copy-frames-btn${copyFramesState === 'copied' ? ' pb-copy-frames-btn--copied' : copyFramesState === 'error' ? ' pb-copy-frames-btn--error' : ''}`}
                  onClick={copyFrames}
                  title="Copy page as SVG frames — paste directly into Figma"
                >
                  {copyFramesState === 'copied' ? (
                    <><i className="fa-solid fa-check"></i> Copied!</>
                  ) : copyFramesState === 'error' ? (
                    <><i className="fa-solid fa-triangle-exclamation"></i> Failed</>
                  ) : (
                    <><i className="fa-brands fa-figma"></i> Copy frames</>
                  )}
                </button>
                <button
                  className="page-builder-export-btn"
                  onClick={exportCode}
                  title="Export HTML markup and React component code"
                >
                  <i className="fa-solid fa-code"></i>
                  Export Code
                </button>
                <button
                  className="page-builder-preview-close"
                  onClick={() => setShowPreview(false)}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>
            <div className="page-builder-preview-content">
              <div className="page-builder-preview-page">
                <div className="container-fluid">
                  <div className="row g-3">
                    {droppedComponents.map((component) => {
                      const colSize = component.colSize || 12;
                      const isStepper = component.type === 'stepper';

                      if (component.type === 'card' || component.type === 'block') {
                        const isBlockPreview = component.type === 'block';
                        return (
                          <div key={component.id} className={`col-md-${colSize}`}>
                            <div className={isBlockPreview ? 'block-standard' : 'card-standard'}>
                              <div className={isBlockPreview ? 'block-header-wrapper' : 'card-header-wrapper'}>
                                {!isBlockPreview && <h2 className="card-title-standard">{component.title || 'Card Title'}</h2>}
                                {((component.headerLeftChildren && component.headerLeftChildren.length > 0) ||
                                  (component.headerRightChildren && component.headerRightChildren.length > 0)) && (
                                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                      {component.headerLeftChildren?.map(child => {
                                        const isTextComponent = child.type.startsWith('text-');
                                        let renderedChild = child.component;

                                        if (isTextComponent && child.textContent) {
                                          if (child.type === 'text-list') {
                                            const items = child.textContent.split('\n').filter(line => line.trim());
                                            renderedChild = (
                                              <ul className="text-component text-list">
                                                {items.map((item, idx) => <li key={idx}>{item}</li>)}
                                              </ul>
                                            );
                                          } else if (child.type === 'text-link') {
                                            renderedChild = (
                                              <a href="#" className="text-component text-link" onClick={(e) => e.preventDefault()}>
                                                {child.textContent}
                                              </a>
                                            );
                                          } else if (child.type === 'text-card-title') {
                                            renderedChild = <h2 className="card-title-standard">{child.textContent || 'Card Title'}</h2>;
                                          } else {
                                            renderedChild = <p className="text-component">{child.textContent}</p>;
                                          }
                                        }

                                        return <div key={child.id}>{renderedChild}</div>;
                                      })}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                      {component.headerRightChildren?.map(child => {
                                        const isTextComponent = child.type.startsWith('text-');
                                        let renderedChild = child.component;

                                        if (isTextComponent && child.textContent) {
                                          if (child.type === 'text-list') {
                                            const items = child.textContent.split('\n').filter(line => line.trim());
                                            renderedChild = (
                                              <ul className="text-component text-list">
                                                {items.map((item, idx) => <li key={idx}>{item}</li>)}
                                              </ul>
                                            );
                                          } else if (child.type === 'text-link') {
                                            renderedChild = (
                                              <a href="#" className="text-component text-link" onClick={(e) => e.preventDefault()}>
                                                {child.textContent}
                                              </a>
                                            );
                                          } else {
                                            renderedChild = <p className="text-component">{child.textContent}</p>;
                                          }
                                        }

                                        return <div key={child.id}>{renderedChild}</div>;
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="card-body-standard">
                                {component.children && component.children.length > 0 ? (
                                  <div className="row g-0">
                                  {component.children.map((child, childIdx) => {
                                    if (child.type === 'sidebar') {
                                      return (
                                        <div key={child.id} className="col-md-12">
                                          <SidebarContentLayout
                                            isPreview={true}
                                            contentByMenuItem={child.sidebarContent || {}}
                                            selectedMenuItem={child.selectedMenuItem}
                                            navData={child.sidebarNavData}
                                          />
                                        </div>
                                      );
                                    }

                                    const isTextComponent = child.type.startsWith('text-');
                                    const isPreviewBtn = child.type === 'button' || child.type === 'secondary-button' ||
                                      child.type === 'tertiary-button' || child.type.startsWith('segmented-');
                                    const prevPreviewIsBtn = childIdx > 0 && (() => { const p = component.children![childIdx - 1]; return p.type === 'button' || p.type === 'secondary-button' || p.type === 'tertiary-button' || p.type.startsWith('segmented-'); })();
                                    let renderedChild = child.component;

                                    // Render text components with their updated content in preview
                                    if (isTextComponent && child.textContent) {
                                      if (child.type === 'text-list') {
                                        const items = child.textContent.split('\n').filter(line => line.trim());
                                        renderedChild = (
                                          <ul className="text-component text-list">
                                            {items.map((item, idx) => <li key={idx}>{item}</li>)}
                                          </ul>
                                        );
                                      } else if (child.type === 'text-link') {
                                        renderedChild = (
                                          <a href="#" className="text-component text-link" onClick={(e) => e.preventDefault()}>
                                            {child.textContent}
                                          </a>
                                        );
                                      } else {
                                        renderedChild = <p className="text-component">{child.textContent}</p>;
                                      }
                                    }

                                    // Render buttons with updated text and icons in preview
                                    if (isPreviewBtn && (child.type === 'button' || child.type === 'secondary-button' || child.type === 'tertiary-button')) {
                                      const btnCls = child.type === 'secondary-button' ? 'btn-secondary' : child.type === 'tertiary-button' ? 'btn-tertiary' : 'btn-primary';
                                      renderedChild = (
                                        <button className={btnCls}>
                                          {child.buttonIcon && child.buttonIconPosition === 'left' && <i className={`fa-solid fa-${child.buttonIcon}`} style={{ marginRight: '8px' }}></i>}
                                          {child.buttonText || 'Button'}
                                          {child.buttonIcon && child.buttonIconPosition === 'right' && <i className={`fa-solid fa-${child.buttonIcon}`} style={{ marginLeft: '8px' }}></i>}
                                        </button>
                                      );
                                    }

                                    // Render treelist from live treeData
                                    if (child.type === 'treelist') {
                                      const treeRows = child.treeData && child.treeData.length > 0 ? child.treeData : [{ id: 1, parentId: null, name: 'Row 1' }, { id: 2, parentId: null, name: 'Row 2' }];
                                      renderedChild = (
                                        <TreeList dataSource={treeRows} keyExpr="id" parentIdExpr="parentId" rootValue={null} showBorders={false} showColumnLines={false} showRowLines={true} style={{ width: '100%' }}>
                                          <TreeColumn dataField="name" caption="Name" />
                                          <TreeScrolling mode="standard" />
                                          <TreePaging enabled={false} />
                                        </TreeList>
                                      );
                                    }

                                    // Wrap TextSearch component for proper visibility in preview
                                    if (child.type === 'text-search') {
                                      renderedChild = <div style={{ display: 'block', minHeight: '48px' }}>{renderedChild}</div>;
                                    }

                                    if (isPreviewBtn) {
                                      return (
                                        <div key={child.id} className={prevPreviewIsBtn ? 'col-auto' : 'col-auto ms-auto'} style={{ paddingTop: '4px' }}>
                                          {renderedChild}
                                        </div>
                                      );
                                    }

                                    return (
                                      <div key={child.id} className="col-md-12" style={{ padding: child.type === 'datagrid-expandable' ? 0 : undefined }}>
                                        {child.type === 'datagrid-expandable' ? (
                                          <ExpandableGridWithDropZone
                                            gridId={child.id}
                                            detailChildrenByRow={child.detailChildrenByRow || {}}
                                            addComponentToRow={(gId, rk, comp) => addComponentToRowInCard(component.id, gId, rk, comp)}
                                            removeComponentFromRow={(gId, rk, cId) => removeComponentFromRowInCard(component.id, gId, rk, cId)}
                                            isPreview={true}
                                          />
                                        ) : child.type === 'accordion' ? (
                                          <AccordionWithContext
                                            accordionId={child.id}
                                            sections={child.accordionSections || DEFAULT_ACCORDION_SECTIONS}
                                            isPreview={true}
                                            updateSectionTitle={updateAccordionSectionTitle}
                                            addComponentToSection={addComponentToAccordionSection}
                                            removeComponentFromSection={removeComponentFromAccordionSection}
                                            updateComponentInSection={updateComponentInAccordionSection}
                                            addComponentToRowInSection={addComponentToRowInAccordionSection}
                                            removeComponentFromRowInSection={removeComponentFromRowInAccordionSection}
                                          />
                                        ) : (child.type === 'tabs' || child.type === 'tabs-icons') ? (
                                          <TabsWithContext
                                            tabsId={child.id}
                                            sections={child.tabSections || DEFAULT_TAB_SECTIONS}
                                            activeTab={tabsActiveStates[child.id] || 0}
                                            isPreview={true}
                                            setActiveTab={setActiveTab}
                                            updateTabTitle={updateTabTitle}
                                            addTab={addTab}
                                            removeTab={removeTab}
                                            addComponentToTab={addComponentToTab}
                                            removeComponentFromTab={removeComponentFromTab}
                                            updateComponentInTab={updateComponentInTab}
                                            addComponentToRowInTab={addComponentToRowInTab}
                                            removeComponentFromRowInTab={removeComponentFromRowInTab}
                                            updateAccordionSectionTitleInTab={updateAccordionSectionTitleInTab}
                                            addComponentToAccordionSectionInTab={addComponentToAccordionSectionInTab}
                                            removeComponentFromAccordionSectionInTab={removeComponentFromAccordionSectionInTab}
                                            updateComponentInAccordionSectionInTab={updateComponentInAccordionSectionInTab}
                                            addComponentToRowInAccordionSectionInTab={addComponentToRowInAccordionSectionInTab}
                                            removeComponentFromRowInAccordionSectionInTab={removeComponentFromRowInAccordionSectionInTab}
                                          />
                                        ) : renderedChild}
                                      </div>
                                    );
                                  })}
                                  </div>
                                ) : (
                                  <p>No content in card</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (component.type === 'datagrid-expandable') {
                        return (
                          <div key={component.id} className={`col-md-${colSize}`}>
                            <ExpandableGridWithDropZone
                              gridId={component.id}
                              detailChildrenByRow={component.detailChildrenByRow || {}}
                              addComponentToRow={addComponentToRow}
                              removeComponentFromRow={removeComponentFromRow}
                              isPreview={true}
                            />
                          </div>
                        );
                      }

                      if (component.type === 'accordion') {
                        return (
                          <div key={component.id} className={`col-md-${colSize}`}>
                            <AccordionWithContext
                              accordionId={component.id}
                              sections={component.accordionSections || DEFAULT_ACCORDION_SECTIONS}
                              isPreview={true}
                              updateSectionTitle={updateAccordionSectionTitle}
                              addComponentToSection={addComponentToAccordionSection}
                              removeComponentFromSection={removeComponentFromAccordionSection}
                              updateComponentInSection={updateComponentInAccordionSection}
                              addComponentToRowInSection={addComponentToRowInAccordionSection}
                              removeComponentFromRowInSection={removeComponentFromRowInAccordionSection}
                            />
                          </div>
                        );
                      }

                      if (component.type === 'tabs' || component.type === 'tabs-icons') {
                        return (
                          <div key={component.id} className={`col-md-${colSize}`}>
                            <TabsWithContext
                              tabsId={component.id}
                              sections={component.tabSections || DEFAULT_TAB_SECTIONS}
                              activeTab={tabsActiveStates[component.id] || 0}
                              isPreview={true}
                              setActiveTab={setActiveTab}
                              updateTabTitle={updateTabTitle}
                              addTab={addTab}
                              removeTab={removeTab}
                              addComponentToTab={addComponentToTab}
                              removeComponentFromTab={removeComponentFromTab}
                              updateComponentInTab={updateComponentInTab}
                              addComponentToRowInTab={addComponentToRowInTab}
                              removeComponentFromRowInTab={removeComponentFromRowInTab}
                              updateAccordionSectionTitleInTab={updateAccordionSectionTitleInTab}
                              addComponentToAccordionSectionInTab={addComponentToAccordionSectionInTab}
                              removeComponentFromAccordionSectionInTab={removeComponentFromAccordionSectionInTab}
                              updateComponentInAccordionSectionInTab={updateComponentInAccordionSectionInTab}
                              addComponentToRowInAccordionSectionInTab={addComponentToRowInAccordionSectionInTab}
                              removeComponentFromRowInAccordionSectionInTab={removeComponentFromRowInAccordionSectionInTab}
                            />
                          </div>
                        );
                      }

                      if (component.type === 'sidebar') {
                        return (
                          <div key={component.id} className={`col-md-${colSize}`}>
                            <SidebarContentLayout
                              isPreview={true}
                              contentByMenuItem={component.sidebarContent || {}}
                              selectedMenuItem={component.selectedMenuItem}
                              navData={component.sidebarNavData}
                            />
                          </div>
                        );
                      }

                      if (component.type === 'spacer') {
                        return (
                          <div key={component.id} className={`col-md-${colSize}`}>
                            <Spacer isPreview={true} />
                          </div>
                        );
                      }

                      if (component.type === 'input-field') {
                        const inputType = component.inputType || 'text';
                        const inputWidth = component.inputWidth || 270;
                        return (
                          <div key={component.id} className={`col-md-${colSize}`}>
                            <div className="pb-input-outlined" style={{ width: '100%' }}>
                              {inputType === 'textarea' && <TextArea placeholder="Label" stylingMode="outlined" readOnly />}
                              {inputType === 'dropdown' && <SelectBox placeholder="Label" stylingMode="outlined" readOnly />}
                              {(inputType === 'date' || inputType === 'time') && <DateBox type={inputType} placeholder="Label" stylingMode="outlined" readOnly openOnFieldClick={false} />}
                              {inputType === 'search' && (
                                <div className="pb-input-fake pb-input-fake--search">
                                  <i className="fa-solid fa-magnifying-glass pb-input-fake-icon-left"></i>
                                  <span className="pb-input-fake-placeholder">Label</span>
                                </div>
                              )}
                              {inputType === 'text' && <TextBox placeholder="Label" stylingMode="outlined" readOnly />}
                            </div>
                          </div>
                        );
                      }

                      if (component.type === 'stepper' || component.type === 'verticalstepper') {
                        const steps = component.stepperSteps || DEFAULT_STEPPER_STEPS;
                        const activeStep = stepperActiveStates[component.id] || 0;
                        const isVertical = component.type === 'verticalstepper';

                        return (
                          <div key={component.id} className={`col-md-${colSize}`}>
                            <div className={isVertical ? 'stepper-vertical' : ''}>
                              <div className={isVertical ? '' : 'stepper-horizontal'}>
                                {steps.map((step, index) => {
                                  const isCompleted = index < activeStep;
                                  const isActive = index === activeStep;
                                  const isLast = index === steps.length - 1;

                                  return (
                                    <div
                                      key={step.id}
                                      className={isVertical ? 'stepper-vertical-step' : 'stepper-horizontal-step'}
                                      onClick={() => setActiveStep(component.id, index)}
                                    >
                                      <div className={isVertical ? 'stepper-vertical-indicator-wrapper' : 'stepper-horizontal-indicator'}>
                                        <div className={`stepper-horizontal-circle ${isCompleted ? 'stepper-horizontal-circle-completed' : ''} ${isActive ? 'stepper-horizontal-circle-active' : ''}`}>
                                          {isCompleted ? (
                                            <i className="fa-solid fa-check"></i>
                                          ) : isActive ? (
                                            <i className="fa-solid fa-pen"></i>
                                          ) : null}
                                        </div>
                                        {!isLast && (
                                          <div className={`${isVertical ? 'stepper-vertical-line' : 'stepper-horizontal-line'} ${isCompleted ? (isVertical ? 'stepper-vertical-line-completed' : 'stepper-horizontal-line-completed') : ''}`} />
                                        )}
                                      </div>
                                      <div className={isVertical ? 'stepper-vertical-content' : ''}>
                                        {isActive && isVertical && steps[activeStep].children.length > 0 ? (
                                          <div className="stepper-vertical-active-content">
                                            <div className={`stepper-vertical-label ${isCompleted ? 'stepper-horizontal-label-completed' : ''} ${isActive ? 'stepper-horizontal-label-active' : ''}`}>
                                              {step.label || `Step ${index + 1}`}
                                            </div>
                                            <div className="row g-3">
                                              {steps[activeStep].children.map((child) => {
                                                // Render cards
                                                if (child.type === 'card') {
                                                  const cardColSize = child.colSize || 12;
                                                  return (
                                                    <div key={child.id} className={`col-md-${cardColSize}`}>
                                                      <div className="card-standard">
                                                        <div className="card-header-wrapper">
                                                          <h2 className="card-title-standard">{child.title || 'Card Title'}</h2>
                                                        </div>
                                                        <div className="card-body-standard">
                                                          {child.children && child.children.length > 0 ? (
                                                            <div className="row g-0">
                                                            {child.children.map((cardChild, ccIdx) => {
                                                              const isTextComp = cardChild.type.startsWith('text-');
                                                              const isBtnComp = cardChild.type === 'button' || cardChild.type === 'secondary-button' || cardChild.type === 'tertiary-button' || cardChild.type.startsWith('segmented-');
                                                              let renderedCardChild = cardChild.component;
                                                              if (isTextComp && cardChild.textContent) {
                                                                if (cardChild.type === 'text-list') {
                                                                  const items = cardChild.textContent.split('\n').filter(line => line.trim());
                                                                  renderedCardChild = (
                                                                    <ul className="text-component text-list">
                                                                      {items.map((item, idx) => <li key={idx}>{item}</li>)}
                                                                    </ul>
                                                                  );
                                                                } else if (cardChild.type === 'text-link') {
                                                                  renderedCardChild = (
                                                                    <a href="#" className="text-component text-link" onClick={(e) => e.preventDefault()}>
                                                                      {cardChild.textContent}
                                                                    </a>
                                                                  );
                                                                } else {
                                                                  renderedCardChild = <p className="text-component">{cardChild.textContent}</p>;
                                                                }
                                                              }
                                                              if (isBtnComp && !cardChild.type.startsWith('segmented-')) {
                                                                const btnCls = cardChild.type === 'secondary-button' ? 'btn-secondary' : cardChild.type === 'tertiary-button' ? 'btn-tertiary' : 'btn-primary';
                                                                renderedCardChild = (
                                                                  <button className={btnCls}>
                                                                    {cardChild.buttonIcon && cardChild.buttonIconPosition === 'left' && <i className={`fa-solid fa-${cardChild.buttonIcon}`} style={{ marginRight: '8px' }}></i>}
                                                                    {cardChild.buttonText || 'Button'}
                                                                    {cardChild.buttonIcon && cardChild.buttonIconPosition === 'right' && <i className={`fa-solid fa-${cardChild.buttonIcon}`} style={{ marginLeft: '8px' }}></i>}
                                                                  </button>
                                                                );
                                                              }
                                                              if (cardChild.type === 'treelist') {
                                                                const treeRows = cardChild.treeData && cardChild.treeData.length > 0 ? cardChild.treeData : [{ id: 1, parentId: null, name: 'Row 1' }, { id: 2, parentId: null, name: 'Row 2' }];
                                                                renderedCardChild = (
                                                                  <TreeList dataSource={treeRows} keyExpr="id" parentIdExpr="parentId" rootValue={null} showBorders={false} showColumnLines={false} showRowLines={true} style={{ width: '100%' }}>
                                                                    <TreeColumn dataField="name" caption="Name" />
                                                                    <TreeScrolling mode="standard" />
                                                                    <TreePaging enabled={false} />
                                                                  </TreeList>
                                                                );
                                                              }
                                                              const prevCCIsBtn = ccIdx > 0 && (() => { const p = child.children![ccIdx - 1]; return p.type === 'button' || p.type === 'secondary-button' || p.type === 'tertiary-button' || p.type.startsWith('segmented-'); })();
                                                              return isBtnComp
                                                                ? <div key={cardChild.id} className={prevCCIsBtn ? 'col-auto' : 'col-auto ms-auto'} style={{ paddingTop: '4px' }}>{renderedCardChild}</div>
                                                                : <div key={cardChild.id} className="col-md-12 mb-2">{renderedCardChild}</div>;
                                                            })}
                                                            </div>
                                                          ) : <p>No content in card</p>}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  );
                                                }

                                                // Render accordions with full functionality
                                                if (child.type === 'accordion') {
                                                  return (
                                                    <div key={child.id} className="col-md-12 mb-3">
                                                      <AccordionWithContext
                                                        accordionId={child.id}
                                                        sections={child.accordionSections || DEFAULT_ACCORDION_SECTIONS}
                                                        isPreview={true}
                                                        updateSectionTitle={(accordionId, sectionId, title) =>
                                                          updateAccordionSectionTitleInStep(component.id, steps[activeStep].id, accordionId, sectionId, title)
                                                        }
                                                        addComponentToSection={(accordionId, sectionId, comp) =>
                                                          addComponentToAccordionSectionInStep(component.id, steps[activeStep].id, accordionId, sectionId, comp)
                                                        }
                                                        removeComponentFromSection={(accordionId, sectionId, componentId) =>
                                                          removeComponentFromAccordionSectionInStep(component.id, steps[activeStep].id, accordionId, sectionId, componentId)
                                                        }
                                                        updateComponentInSection={(accordionId, sectionId, componentId, updates) =>
                                                          updateComponentInAccordionSectionInStep(component.id, steps[activeStep].id, accordionId, sectionId, componentId, updates)
                                                        }
                                                        addComponentToRowInSection={(accordionId, sectionId, gridId, rowKey, comp) =>
                                                          addComponentToRowInAccordionSectionInStep(component.id, steps[activeStep].id, accordionId, sectionId, gridId, rowKey, comp)
                                                        }
                                                        removeComponentFromRowInSection={(accordionId, sectionId, gridId, rowKey, componentId) =>
                                                          removeComponentFromRowInAccordionSectionInStep(component.id, steps[activeStep].id, accordionId, sectionId, gridId, rowKey, componentId)
                                                        }
                                                      />
                                                    </div>
                                                  );
                                                }

                                                // Render tabs with full functionality
                                                if (child.type === 'tabs' || child.type === 'tabs-icons') {
                                                  return (
                                                    <div key={child.id} className="col-md-12 mb-3">
                                                      <TabsWithContext
                                                        tabsId={child.id}
                                                        sections={child.tabSections || DEFAULT_TAB_SECTIONS}
                                                        activeTab={tabsActiveStates[child.id] || 0}
                                                        isPreview={true}
                                                        setActiveTab={(tabsId, index) =>
                                                          setActiveTabInStep(component.id, steps[activeStep].id, tabsId, index)
                                                        }
                                                        updateTabTitle={(tabsId, tabId, title) =>
                                                          updateTabTitleInStep(component.id, steps[activeStep].id, tabsId, tabId, title)
                                                        }
                                                        addTab={(tabsId) =>
                                                          addTabInStep(component.id, steps[activeStep].id, tabsId)
                                                        }
                                                        removeTab={(tabsId, tabId) =>
                                                          removeTabInStep(component.id, steps[activeStep].id, tabsId, tabId)
                                                        }
                                                        addComponentToTab={(tabsId, tabId, comp) =>
                                                          addComponentToTabInStep(component.id, steps[activeStep].id, tabsId, tabId, comp)
                                                        }
                                                        removeComponentFromTab={(tabsId, tabId, componentId) =>
                                                          removeComponentFromTabInStep(component.id, steps[activeStep].id, tabsId, tabId, componentId)
                                                        }
                                                        updateComponentInTab={(tabsId, tabId, componentId, updates) =>
                                                          updateComponentInTabInStep(component.id, steps[activeStep].id, tabsId, tabId, componentId, updates)
                                                        }
                                                        addComponentToRowInTab={(tabsId, tabId, gridId, rowKey, comp) =>
                                                          addComponentToRowInTabInStep(component.id, steps[activeStep].id, tabsId, tabId, gridId, rowKey, comp)
                                                        }
                                                        removeComponentFromRowInTab={(tabsId, tabId, gridId, rowKey, componentId) =>
                                                          removeComponentFromRowInTabInStep(component.id, steps[activeStep].id, tabsId, tabId, gridId, rowKey, componentId)
                                                        }
                                                        updateAccordionSectionTitleInTab={(tabsId, tabId, accordionId, sectionId, title) =>
                                                          updateAccordionSectionTitleInTabInStep(component.id, steps[activeStep].id, tabsId, tabId, accordionId, sectionId, title)
                                                        }
                                                        addComponentToAccordionSectionInTab={(tabsId, tabId, accordionId, sectionId, comp) =>
                                                          addComponentToAccordionSectionInTabInStep(component.id, steps[activeStep].id, tabsId, tabId, accordionId, sectionId, comp)
                                                        }
                                                        removeComponentFromAccordionSectionInTab={(tabsId, tabId, accordionId, sectionId, componentId) =>
                                                          removeComponentFromAccordionSectionInTabInStep(component.id, steps[activeStep].id, tabsId, tabId, accordionId, sectionId, componentId)
                                                        }
                                                        updateComponentInAccordionSectionInTab={(tabsId, tabId, accordionId, sectionId, componentId, updates) =>
                                                          updateComponentInAccordionSectionInTabInStep(component.id, steps[activeStep].id, tabsId, tabId, accordionId, sectionId, componentId, updates)
                                                        }
                                                        addComponentToRowInAccordionSectionInTab={(tabsId, tabId, accordionId, sectionId, gridId, rowKey, comp) =>
                                                          addComponentToRowInAccordionSectionInTabInStep(component.id, steps[activeStep].id, tabsId, tabId, accordionId, sectionId, gridId, rowKey, comp)
                                                        }
                                                        removeComponentFromRowInAccordionSectionInTab={(tabsId, tabId, accordionId, sectionId, gridId, rowKey, componentId) =>
                                                          removeComponentFromRowInAccordionSectionInTabInStep(component.id, steps[activeStep].id, tabsId, tabId, accordionId, sectionId, gridId, rowKey, componentId)
                                                        }
                                                      />
                                                    </div>
                                                  );
                                                }

                                                // Render expandable grids with full functionality
                                                if (child.type === 'datagrid-expandable') {
                                                  return (
                                                    <div key={child.id} className="col-md-12 mb-3" style={{ padding: 0 }}>
                                                      <ExpandableGridWithDropZone
                                                        gridId={child.id}
                                                        detailChildrenByRow={child.detailChildrenByRow || {}}
                                                        addComponentToRow={(gridId, rowKey, comp) =>
                                                          addComponentToRowInStep(component.id, steps[activeStep].id, gridId, rowKey, comp)
                                                        }
                                                        removeComponentFromRow={(gridId, rowKey, componentId) =>
                                                          removeComponentFromRowInStep(component.id, steps[activeStep].id, gridId, rowKey, componentId)
                                                        }
                                                        isPreview={true}
                                                      />
                                                    </div>
                                                  );
                                                }

                                                // Render grids with features
                                                if (child.type === 'datagrid' || child.type === 'datagrid-expandable') {
                                                  return (
                                                    <div key={child.id} className="col-md-12 mb-3">
                                                      <PageBuilderDataGrid
                                                        gridData={child.gridData || DEFAULT_GRID_DATA}
                                                        onChange={() => {}}
                                                        hasActionsColumn={!!child.gridFeatures?.actions}
                                                        actionColumnChildren={child.actionColumnChildren || []}
                                                      />
                                                    </div>
                                                  );
                                                }

                                                // Render sidebar with content
                                                if (child.type === 'sidebar') {
                                                  return (
                                                    <div key={child.id} className="col-md-12 mb-3">
                                                      <SidebarContentLayout
                                                        isPreview={true}
                                                        contentByMenuItem={child.sidebarContent || {}}
                                                        selectedMenuItem={child.selectedMenuItem}
                                                        navData={child.sidebarNavData}
                                                      />
                                                    </div>
                                                  );
                                                }

                                                // Render other components
                                                const isTextComponent = child.type.startsWith('text-');
                                                let renderedChild = child.component;

                                                if (isTextComponent && child.textContent) {
                                                  if (child.type === 'text-list') {
                                                    const items = child.textContent.split('\n').filter(line => line.trim());
                                                    renderedChild = (
                                                      <ul className="text-component text-list">
                                                        {items.map((item, idx) => <li key={idx}>{item}</li>)}
                                                      </ul>
                                                    );
                                                  } else if (child.type === 'text-link') {
                                                    renderedChild = (
                                                      <a href="#" className="text-component text-link" onClick={(e) => e.preventDefault()}>
                                                        {child.textContent}
                                                      </a>
                                                    );
                                                  } else {
                                                    renderedChild = <p className="text-component">{child.textContent}</p>;
                                                  }
                                                }

                                                return <div key={child.id} className="col-md-12 mb-3">{renderedChild}</div>;
                                              })}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className={`${isVertical ? 'stepper-vertical-label' : 'stepper-horizontal-label'} ${isCompleted ? 'stepper-horizontal-label-completed' : ''} ${isActive ? 'stepper-horizontal-label-active' : ''}`}>
                                            <div className="stepper-horizontal-title">
                                              {step.label || `Step ${index + 1}`}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              {!isVertical && (
                                <div>
                                  <div style={{ borderTop: '2px solid #efefef', width: '100%', margin: '40px 0 16px 0' }}></div>
                                  {steps[activeStep] && steps[activeStep].children.length > 0 ? (
                                    <div>
                                      <h3 style={{ fontFamily: 'Source Sans Pro, sans-serif', fontWeight: 600, fontSize: '18px', color: '#333', marginBottom: '16px' }}>
                                        {steps[activeStep].label}
                                      </h3>
                                      <div className="row g-3">
                                        {steps[activeStep].children.map((child) => {
                                          // Render cards
                                          if (child.type === 'card') {
                                            const cardColSize = child.colSize || 12;
                                            return (
                                              <div key={child.id} className={`col-md-${cardColSize}`}>
                                                <div className="card-standard">
                                                  <div className="card-header-wrapper">
                                                    <h2 className="card-title-standard">{child.title || 'Card Title'}</h2>
                                                  </div>
                                                  <div className="card-body-standard">
                                                    {child.children && child.children.length > 0 ? (
                                                      <div className="row g-0">
                                                      {child.children.map((cardChild, ccIdx2) => {
                                                        const isTextComp = cardChild.type.startsWith('text-');
                                                        let renderedCardChild = cardChild.component;
                                                        if (isTextComp && cardChild.textContent) {
                                                          if (cardChild.type === 'text-list') {
                                                            const items = cardChild.textContent.split('\n').filter(line => line.trim());
                                                            renderedCardChild = (
                                                              <ul className="text-component text-list">
                                                                {items.map((item, idx) => <li key={idx}>{item}</li>)}
                                                              </ul>
                                                            );
                                                          } else if (cardChild.type === 'text-link') {
                                                            renderedCardChild = (
                                                              <a href="#" className="text-component text-link" onClick={(e) => e.preventDefault()}>
                                                                {cardChild.textContent}
                                                              </a>
                                                            );
                                                          } else {
                                                            renderedCardChild = <p className="text-component">{cardChild.textContent}</p>;
                                                          }
                                                        }
                                                        const isBtnC = cardChild.type === 'button' || cardChild.type === 'secondary-button' || cardChild.type === 'tertiary-button' || cardChild.type.startsWith('segmented-');
                                                        if (isBtnC && !cardChild.type.startsWith('segmented-')) {
                                                          const bc = cardChild.type === 'secondary-button' ? 'btn-secondary' : cardChild.type === 'tertiary-button' ? 'btn-tertiary' : 'btn-primary';
                                                          renderedCardChild = (
                                                            <button className={bc}>
                                                              {cardChild.buttonIcon && cardChild.buttonIconPosition === 'left' && <i className={`fa-solid fa-${cardChild.buttonIcon}`} style={{ marginRight: '8px' }}></i>}
                                                              {cardChild.buttonText || 'Button'}
                                                              {cardChild.buttonIcon && cardChild.buttonIconPosition === 'right' && <i className={`fa-solid fa-${cardChild.buttonIcon}`} style={{ marginLeft: '8px' }}></i>}
                                                            </button>
                                                          );
                                                        }
                                                        if (cardChild.type === 'treelist') {
                                                          const treeRows = cardChild.treeData && cardChild.treeData.length > 0 ? cardChild.treeData : [{ id: 1, parentId: null, name: 'Row 1' }, { id: 2, parentId: null, name: 'Row 2' }];
                                                          renderedCardChild = (
                                                            <TreeList dataSource={treeRows} keyExpr="id" parentIdExpr="parentId" rootValue={null} showBorders={false} showColumnLines={false} showRowLines={true} style={{ width: '100%' }}>
                                                              <TreeColumn dataField="name" caption="Name" />
                                                              <TreeScrolling mode="standard" />
                                                              <TreePaging enabled={false} />
                                                            </TreeList>
                                                          );
                                                        }
                                                        const prevCCIsBtn2 = ccIdx2 > 0 && (() => { const p = child.children![ccIdx2 - 1]; return p.type === 'button' || p.type === 'secondary-button' || p.type === 'tertiary-button' || p.type.startsWith('segmented-'); })();
                                                        return isBtnC
                                                          ? <div key={cardChild.id} className={prevCCIsBtn2 ? 'col-auto' : 'col-auto ms-auto'} style={{ paddingTop: '4px' }}>{renderedCardChild}</div>
                                                          : <div key={cardChild.id} className="col-md-12 mb-2">{renderedCardChild}</div>;
                                                      })}
                                                      </div>
                                                    ) : <p>No content in card</p>}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          }

                                          // Render accordions with full functionality
                                          if (child.type === 'accordion') {
                                            return (
                                              <div key={child.id} className="col-md-12 mb-3">
                                                <AccordionWithContext
                                                  accordionId={child.id}
                                                  sections={child.accordionSections || DEFAULT_ACCORDION_SECTIONS}
                                                  isPreview={true}
                                                  updateSectionTitle={(accordionId, sectionId, title) =>
                                                    updateAccordionSectionTitleInStep(component.id, steps[activeStep].id, accordionId, sectionId, title)
                                                  }
                                                  addComponentToSection={(accordionId, sectionId, comp) =>
                                                    addComponentToAccordionSectionInStep(component.id, steps[activeStep].id, accordionId, sectionId, comp)
                                                  }
                                                  removeComponentFromSection={(accordionId, sectionId, componentId) =>
                                                    removeComponentFromAccordionSectionInStep(component.id, steps[activeStep].id, accordionId, sectionId, componentId)
                                                  }
                                                  updateComponentInSection={(accordionId, sectionId, componentId, updates) =>
                                                    updateComponentInAccordionSectionInStep(component.id, steps[activeStep].id, accordionId, sectionId, componentId, updates)
                                                  }
                                                  addComponentToRowInSection={(accordionId, sectionId, gridId, rowKey, comp) =>
                                                    addComponentToRowInAccordionSectionInStep(component.id, steps[activeStep].id, accordionId, sectionId, gridId, rowKey, comp)
                                                  }
                                                  removeComponentFromRowInSection={(accordionId, sectionId, gridId, rowKey, componentId) =>
                                                    removeComponentFromRowInAccordionSectionInStep(component.id, steps[activeStep].id, accordionId, sectionId, gridId, rowKey, componentId)
                                                  }
                                                />
                                              </div>
                                            );
                                          }

                                          // Render tabs with full functionality
                                          if (child.type === 'tabs' || child.type === 'tabs-icons') {
                                            return (
                                              <div key={child.id} className="col-md-12 mb-3">
                                                <TabsWithContext
                                                  tabsId={child.id}
                                                  sections={child.tabSections || DEFAULT_TAB_SECTIONS}
                                                  activeTab={tabsActiveStates[child.id] || 0}
                                                  isPreview={true}
                                                  setActiveTab={(tabsId, index) =>
                                                    setActiveTabInStep(component.id, steps[activeStep].id, tabsId, index)
                                                  }
                                                  updateTabTitle={(tabsId, tabId, title) =>
                                                    updateTabTitleInStep(component.id, steps[activeStep].id, tabsId, tabId, title)
                                                  }
                                                  addTab={(tabsId) =>
                                                    addTabInStep(component.id, steps[activeStep].id, tabsId)
                                                  }
                                                  removeTab={(tabsId, tabId) =>
                                                    removeTabInStep(component.id, steps[activeStep].id, tabsId, tabId)
                                                  }
                                                  addComponentToTab={(tabsId, tabId, comp) =>
                                                    addComponentToTabInStep(component.id, steps[activeStep].id, tabsId, tabId, comp)
                                                  }
                                                  removeComponentFromTab={(tabsId, tabId, componentId) =>
                                                    removeComponentFromTabInStep(component.id, steps[activeStep].id, tabsId, tabId, componentId)
                                                  }
                                                  updateComponentInTab={(tabsId, tabId, componentId, updates) =>
                                                    updateComponentInTabInStep(component.id, steps[activeStep].id, tabsId, tabId, componentId, updates)
                                                  }
                                                  addComponentToRowInTab={(tabsId, tabId, gridId, rowKey, comp) =>
                                                    addComponentToRowInTabInStep(component.id, steps[activeStep].id, tabsId, tabId, gridId, rowKey, comp)
                                                  }
                                                  removeComponentFromRowInTab={(tabsId, tabId, gridId, rowKey, componentId) =>
                                                    removeComponentFromRowInTabInStep(component.id, steps[activeStep].id, tabsId, tabId, gridId, rowKey, componentId)
                                                  }
                                                  updateAccordionSectionTitleInTab={(tabsId, tabId, accordionId, sectionId, title) =>
                                                    updateAccordionSectionTitleInTabInStep(component.id, steps[activeStep].id, tabsId, tabId, accordionId, sectionId, title)
                                                  }
                                                  addComponentToAccordionSectionInTab={(tabsId, tabId, accordionId, sectionId, comp) =>
                                                    addComponentToAccordionSectionInTabInStep(component.id, steps[activeStep].id, tabsId, tabId, accordionId, sectionId, comp)
                                                  }
                                                  removeComponentFromAccordionSectionInTab={(tabsId, tabId, accordionId, sectionId, componentId) =>
                                                    removeComponentFromAccordionSectionInTabInStep(component.id, steps[activeStep].id, tabsId, tabId, accordionId, sectionId, componentId)
                                                  }
                                                  updateComponentInAccordionSectionInTab={(tabsId, tabId, accordionId, sectionId, componentId, updates) =>
                                                    updateComponentInAccordionSectionInTabInStep(component.id, steps[activeStep].id, tabsId, tabId, accordionId, sectionId, componentId, updates)
                                                  }
                                                  addComponentToRowInAccordionSectionInTab={(tabsId, tabId, accordionId, sectionId, gridId, rowKey, comp) =>
                                                    addComponentToRowInAccordionSectionInTabInStep(component.id, steps[activeStep].id, tabsId, tabId, accordionId, sectionId, gridId, rowKey, comp)
                                                  }
                                                  removeComponentFromRowInAccordionSectionInTab={(tabsId, tabId, accordionId, sectionId, gridId, rowKey, componentId) =>
                                                    removeComponentFromRowInAccordionSectionInTabInStep(component.id, steps[activeStep].id, tabsId, tabId, accordionId, sectionId, gridId, rowKey, componentId)
                                                  }
                                                />
                                              </div>
                                            );
                                          }

                                          // Render expandable grids with full functionality
                                          if (child.type === 'datagrid-expandable') {
                                            return (
                                              <div key={child.id} className="col-md-12 mb-3" style={{ padding: 0 }}>
                                                <ExpandableGridWithDropZone
                                                  gridId={child.id}
                                                  detailChildrenByRow={child.detailChildrenByRow || {}}
                                                  addComponentToRow={(gridId, rowKey, comp) =>
                                                    addComponentToRowInStep(component.id, steps[activeStep].id, gridId, rowKey, comp)
                                                  }
                                                  removeComponentFromRow={(gridId, rowKey, componentId) =>
                                                    removeComponentFromRowInStep(component.id, steps[activeStep].id, gridId, rowKey, componentId)
                                                  }
                                                  isPreview={true}
                                                />
                                              </div>
                                            );
                                          }

                                          // Render grids with features
                                          if (child.type === 'datagrid' || child.type === 'datagrid-expandable') {
                                            return (
                                              <div key={child.id} className="col-md-12 mb-3">
                                                <PageBuilderDataGrid
                                                  gridData={child.gridData || DEFAULT_GRID_DATA}
                                                  onChange={() => {}}
                                                  hasActionsColumn={!!child.gridFeatures?.actions}
                                                  actionColumnChildren={child.actionColumnChildren || []}
                                                />
                                              </div>
                                            );
                                          }

                                          // Render sidebar with content
                                          if (child.type === 'sidebar') {
                                            return (
                                              <div key={child.id} className="col-md-12 mb-3">
                                                <SidebarContentLayout
                                                  isPreview={true}
                                                  contentByMenuItem={child.sidebarContent || {}}
                                                  selectedMenuItem={child.selectedMenuItem}
                                                  navData={child.sidebarNavData}
                                                />
                                              </div>
                                            );
                                          }

                                          // Render other components
                                          const isTextComponent = child.type.startsWith('text-');
                                          const isStepChildBtn = child.type === 'button' || child.type === 'secondary-button' || child.type === 'tertiary-button' || child.type.startsWith('segmented-');
                                          let renderedChild = child.component;

                                          if (isTextComponent && child.textContent) {
                                            if (child.type === 'text-list') {
                                              const items = child.textContent.split('\n').filter(line => line.trim());
                                              renderedChild = (
                                                <ul className="text-component text-list">
                                                  {items.map((item, idx) => <li key={idx}>{item}</li>)}
                                                </ul>
                                              );
                                            } else if (child.type === 'text-link') {
                                              renderedChild = (
                                                <a href="#" className="text-component text-link" onClick={(e) => e.preventDefault()}>
                                                  {child.textContent}
                                                </a>
                                              );
                                            } else {
                                              renderedChild = <p className="text-component">{child.textContent}</p>;
                                            }
                                          }
                                          if (isStepChildBtn && !child.type.startsWith('segmented-')) {
                                            const bc = child.type === 'secondary-button' ? 'btn-secondary' : child.type === 'tertiary-button' ? 'btn-tertiary' : 'btn-primary';
                                            renderedChild = (
                                              <button className={bc}>
                                                {child.buttonIcon && child.buttonIconPosition === 'left' && <i className={`fa-solid fa-${child.buttonIcon}`} style={{ marginRight: '8px' }}></i>}
                                                {child.buttonText || 'Button'}
                                                {child.buttonIcon && child.buttonIconPosition === 'right' && <i className={`fa-solid fa-${child.buttonIcon}`} style={{ marginLeft: '8px' }}></i>}
                                              </button>
                                            );
                                          }

                                          const prevStepIsBtn = (() => { const si = steps[activeStep].children.indexOf(child); if (si <= 0) return false; const p = steps[activeStep].children[si - 1]; return p.type === 'button' || p.type === 'secondary-button' || p.type === 'tertiary-button' || p.type.startsWith('segmented-'); })();
                                          if (isStepChildBtn) {
                                            return <div key={child.id} className={prevStepIsBtn ? 'col-auto' : 'col-auto ms-auto'} style={{ paddingTop: '4px' }}>{renderedChild}</div>;
                                          }

                                          return <div key={child.id} className="col-md-12 mb-3">{renderedChild}</div>;
                                        })}
                                      </div>
                                    </div>
                                  ) : (
                                    <p style={{ padding: '48px', textAlign: 'center', color: '#666' }}>
                                      No components in this step
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // Render buttons with custom text, icons, right-aligned and stackable
                      if (component.type === 'button' || component.type === 'secondary-button' || component.type === 'tertiary-button') {
                        const btnClass = component.type === 'secondary-button' ? 'btn-secondary' :
                                         component.type === 'tertiary-button' ? 'btn-tertiary' : 'btn-primary';
                        const compIdx = droppedComponents.indexOf(component);
                        const prevIsBtn = compIdx > 0 && (() => { const p = droppedComponents[compIdx - 1]; return p.type === 'button' || p.type === 'secondary-button' || p.type === 'tertiary-button' || p.type.startsWith('segmented-'); })();
                        return (
                          <div key={component.id} className={prevIsBtn ? 'col-auto' : 'col-auto ms-auto'} style={{ paddingTop: '4px' }}>
                            <button className={btnClass}>
                              {component.buttonIcon && component.buttonIconPosition === 'left' && (
                                <i className={`fa-solid fa-${component.buttonIcon}`} style={{ marginRight: '8px' }}></i>
                              )}
                              {component.buttonText || 'Button'}
                              {component.buttonIcon && component.buttonIconPosition === 'right' && (
                                <i className={`fa-solid fa-${component.buttonIcon}`} style={{ marginLeft: '8px' }}></i>
                              )}
                            </button>
                          </div>
                        );
                      }

                      // Render segmented buttons with custom icons
                      if (component.type.startsWith('segmented-')) {
                        const options = ['Walk', 'Train', 'Car'];
                        const icons = component.segmentedButtonIcons || [];
                        const segCompIdx = droppedComponents.indexOf(component);
                        const segPrevIsBtn = segCompIdx > 0 && (() => { const p = droppedComponents[segCompIdx - 1]; return p.type === 'button' || p.type === 'secondary-button' || p.type === 'tertiary-button' || p.type.startsWith('segmented-'); })();
                        return (
                          <div key={component.id} className={segPrevIsBtn ? 'col-auto' : 'col-auto ms-auto'} style={{ paddingTop: '4px' }}>
                            <div className="segmented-buttons">
                              {options.map((option, index) => {
                                const isFirst = index === 0;
                                const isLast = index === options.length - 1;
                                const isSelected = index === 0;
                                return (
                                  <button
                                    key={index}
                                    className={`segmented-button ${isSelected ? 'segmented-button-selected' : ''} ${isFirst ? 'segmented-button-first' : ''} ${isLast ? 'segmented-button-last' : ''}`}
                                  >
                                    {icons[index] && component.type !== 'segmented-text' && (
                                      <i className={`fa-solid fa-${icons[index]} segmented-button-icon`}></i>
                                    )}
                                    {isSelected && component.type !== 'segmented-text' && (
                                      <i className="fa-solid fa-check segmented-button-check"></i>
                                    )}
                                    {component.type !== 'segmented-icons' && <span>{option}</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      if (component.type === 'treelist') {
                        const treeRows = component.treeData && component.treeData.length > 0 ? component.treeData : [{ id: 1, parentId: null, name: 'Row 1' }, { id: 2, parentId: null, name: 'Row 2' }];
                        return (
                          <div key={component.id} className={`col-md-${colSize}`}>
                            <TreeList dataSource={treeRows} keyExpr="id" parentIdExpr="parentId" rootValue={null} showBorders={false} showColumnLines={false} showRowLines={true} style={{ width: '100%' }}>
                              <TreeColumn dataField="name" caption="Name" />
                              <TreeScrolling mode="standard" />
                              <TreePaging enabled={false} />
                            </TreeList>
                          </div>
                        );
                      }

                      if (component.type === 'datagrid' || component.type === 'datagrid-expandable') {
                        return (
                          <div key={component.id} className={`col-md-${colSize}`}>
                            <PageBuilderDataGrid
                              gridData={component.gridData || DEFAULT_GRID_DATA}
                              onChange={() => {}}
                              hasActionsColumn={!!component.gridFeatures?.actions}
                              actionColumnChildren={component.actionColumnChildren || []}
                            />
                          </div>
                        );
                      }

                      return (
                        <div
                          key={component.id}
                          className={`col-md-${colSize}`}
                          style={{ marginBottom: isStepper ? '50px' : '0' }}
                        >
                          {component.component}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="page-builder-instructions-overlay" onClick={() => setShowInstructions(false)}>
          <div className="page-builder-instructions-modal" onClick={(e) => e.stopPropagation()}>
            <div className="page-builder-instructions-header">
              <h3 className="page-builder-instructions-title">Page Creation Instructions</h3>
              <button
                className="page-builder-instructions-close"
                onClick={() => setShowInstructions(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="page-builder-instructions-content">
              <pre className="page-builder-instructions-text">{instructionsMessage}</pre>
            </div>
            <div className="page-builder-instructions-footer">
              <button
                className="btn-primary"
                onClick={() => {
                  const fullText = `Create this design\n\n${instructionsMessage}`;

                  // Create temporary textarea for copy fallback
                  const textarea = document.createElement('textarea');
                  textarea.value = fullText;
                  textarea.setAttribute('readonly', '');
                  textarea.className = 'page-builder-copy-textarea';
                  document.body.appendChild(textarea);

                  // Select and copy
                  textarea.select();
                  textarea.setSelectionRange(0, 99999);

                  try {
                    document.execCommand('copy');
                    // Reset form after copy
                    setPageName('');
                    setDroppedComponents([]);
                    setSelectedLocation('root');
                    setShowInstructions(false);
                  } catch (err) {
                    console.error('Failed to copy:', err);
                  } finally {
                    document.body.removeChild(textarea);
                  }
                }}
              >
                <i className="fa-solid fa-copy"></i>
                Copy Instructions
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowInstructions(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Design Modal */}
      {showLoadDrafts && (
        <div className="page-builder-preview-overlay" onClick={() => setShowLoadDrafts(false)}>
          <div className="page-builder-preview-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="page-builder-preview-header">
              <h3 className="page-builder-preview-title">Load draft</h3>
              <button
                className="page-builder-preview-close"
                onClick={() => setShowLoadDrafts(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="page-builder-preview-content">
              <div className="page-builder-preview-page">
                {savedDrafts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted-foreground)' }}>
                    <i className="fa-solid fa-folder-open" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
                    <p>No saved drafts found</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {savedDrafts.map(draft => (
                      <div
                        key={draft.id}
                        style={{
                          padding: '12px 16px',
                          border: '1px solid var(--light-border-color)',
                          borderRadius: '4px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: 'var(--color-white)'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: '4px' }}>{draft.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                            {new Date(draft.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn-primary"
                            onClick={() => loadDraft(draft.id)}
                            title="Load this draft"
                          >
                            <i className="fa-solid fa-folder-open"></i>
                            Load
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => deleteDraft(draft.id)}
                            title="Delete this draft"
                            style={{ color: '#dc3545' }}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
