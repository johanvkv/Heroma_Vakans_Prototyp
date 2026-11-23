import React from 'react';
import { useDrop } from 'react-dnd';
import { DroppedComponent, TabSection } from './pageBuilderTypes';
import {
  extractTextContent,
  getDefaultTextContent,
  DEFAULT_ACCORDION_SECTIONS,
  DEFAULT_TAB_SECTIONS,
  DEFAULT_STEPPER_STEPS,
} from './pageBuilderHelpers';
import { EditableComponent } from './PageBuilderEditableComponents';
import { AccordionWithContext } from './PageBuilderAccordionContext';
import { ExpandableGridWithDropZone } from './PageBuilderGridComponents';
import { Spacer } from '../app/components/Spacer';
import { SidebarContentLayout } from '../app/components/SidebarContentLayout';
import { PageBuilderDataGrid, DEFAULT_GRID_DATA } from './PageBuilderDataGrid';
import TreeList, { Column as TreeColumn, Paging as TreePaging, Scrolling as TreeScrolling } from 'devextreme-react/tree-list';
import DataGrid, { Column as DxColumn, Paging as DxPaging, Scrolling as DxScrolling, Selection as DxSelection, SearchPanel as DxSearchPanel } from 'devextreme-react/data-grid';
import TextBox from 'devextreme-react/text-box';
import TextArea from 'devextreme-react/text-area';
import DateBox from 'devextreme-react/date-box';
import SelectBox from 'devextreme-react/select-box';
import { Alert } from '../app/components/Alert';
import { pageBuilderGridData } from './PageBuilderGridComponents';

// ─── Tab context ──────────────────────────────────────────────────────────────

export interface TabContextValue {
  tabsId: string;
  sections: TabSection[];
  activeTab: number;
  isPreview: boolean;
  setActiveTab: (index: number) => void;
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
  addComponentToRowInTab?: (tabsId: string, tabId: string, gridId: string, rowKey: string, component: DroppedComponent) => void;
  removeComponentFromRowInTab?: (tabsId: string, tabId: string, gridId: string, rowKey: string, componentId: string) => void;
  updateAccordionSectionTitleInTab?: (tabsId: string, tabId: string, accordionId: string, sectionId: string, title: string) => void;
  addComponentToAccordionSectionInTab?: (tabsId: string, tabId: string, accordionId: string, sectionId: string, component: DroppedComponent) => void;
  removeComponentFromAccordionSectionInTab?: (tabsId: string, tabId: string, accordionId: string, sectionId: string, componentId: string) => void;
  updateComponentInAccordionSectionInTab?: (tabsId: string, tabId: string, accordionId: string, sectionId: string, componentId: string, updates: Partial<DroppedComponent>) => void;
  addComponentToRowInAccordionSectionInTab?: (tabsId: string, tabId: string, accordionId: string, sectionId: string, gridId: string, rowKey: string, component: DroppedComponent) => void;
  removeComponentFromRowInAccordionSectionInTab?: (tabsId: string, tabId: string, accordionId: string, sectionId: string, gridId: string, rowKey: string, componentId: string) => void;
}

export const TabContext = React.createContext<TabContextValue | null>(null);

const TabSectionDropZone: React.FC<{
  tabsId: string;
  tabId: string;
  addComponentToTab: (tabsId: string, tabId: string, component: DroppedComponent) => void;
}> = ({ tabsId, tabId, addComponentToTab }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT_EXAMPLE',
    drop: (item: { type: string; name: string; component: React.ReactElement; gridFeatures?: any; inputFieldType?: DroppedComponent['inputType']; inputFieldWidth?: number }, monitor) => {
      if (monitor.didDrop()) return;
      const textContent = item.type.startsWith('text-')
        ? (extractTextContent(item.component) || getDefaultTextContent(item.type))
        : undefined;

      const alertVariant = item.type.startsWith('alert-') ? item.type.replace('alert-', '') as 'info' | 'warning' | 'error' | 'success' : undefined;

      addComponentToTab(tabsId, tabId, {
        id: `${item.type}-${Date.now()}`,
        type: item.type,
        name: item.name,
        component: item.component,
        buttonText: (item.type === 'button' || item.type === 'secondary-button' || item.type === 'tertiary-button') ? 'Button' : undefined,
        textContent,
        accordionSections: item.type === 'accordion' ? DEFAULT_ACCORDION_SECTIONS.map(s => ({ ...s, children: [] })) : undefined,
        detailChildrenByRow: item.type === 'datagrid-expandable' ? {} : undefined,
        gridData: (item.type === 'datagrid' || item.type === 'datagrid-expandable') ? { columns: [{ dataField: 'col0', caption: 'Name' }, { dataField: 'col1', caption: 'ID Number' }, { dataField: 'col2', caption: 'Amount' }], data: [{ id: 1, col0: 'John Smith', col1: '123ABC', col2: '1,234.00' }, { id: 2, col0: 'Jane Smith', col1: '456ABC', col2: '2,345.00' }, { id: 3, col0: 'John Doe', col1: '789ABC', col2: '3,456.00' }] } : undefined,
        children: item.type === 'card' ? [] : undefined,
        title: item.type === 'card' ? 'Card Title' : undefined,
        colSize: item.type === 'card' ? 12 : undefined,
        alignment: undefined,
        gridFeatures: item.gridFeatures,
        alertVariant,
        alertMessage: alertVariant ? `This is ${item.type.replace('alert-', '')} alert` : undefined,
        showAlertLink: false,
        inputType: item.type === 'input-field' ? (item.inputFieldType || 'text') : undefined,
        inputWidth: item.type === 'input-field' ? (item.inputFieldWidth || 270) : undefined,
        sidebarContent: item.type === 'sidebar' ? {} : undefined,
        selectedMenuItem: item.type === 'sidebar' ? '2-2' : undefined,
      });
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver({ shallow: true }) }),
  }), [tabsId, tabId, addComponentToTab]);

  return (
    <div ref={drop} className={`tab-drop-zone${isOver ? ' tab-drop-zone-over' : ''}`}>
      <i className="fa-solid fa-arrow-down"></i>
      <span>Drop components here</span>
    </div>
  );
};

const TabButtonWithIconDropZone: React.FC<{
  tab: TabSection;
  index: number;
  isActive: boolean;
  isPreview: boolean;
  onSelect: () => void;
  onUpdateIcon: (tabId: string, icon: string | undefined) => void;
  onTitleClick: (e: React.MouseEvent, tab: TabSection) => void;
  editingTabId: string | null;
  editingTitle: string;
  onEditingTitleChange: (value: string) => void;
  onCommitTitle: (tabId: string) => void;
}> = ({
  tab,
  index,
  isActive,
  isPreview,
  onSelect,
  onUpdateIcon,
  onTitleClick,
  editingTabId,
  editingTitle,
  onEditingTitleChange,
  onCommitTitle
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT_EXAMPLE',
    drop: (item: { type: string; name: string; iconClass?: string }) => {
      if (item.type === 'icon' && item.iconClass) {
        onUpdateIcon(tab.id, item.iconClass);
      }
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() })
  }), [tab.id, onUpdateIcon]);

  return (
    <div
      ref={!isPreview ? drop : null}
      role="button"
      tabIndex={0}
      className={`tab-item ${isActive ? 'tab-item-active' : ''}`}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(); }}
      style={!isPreview && isOver ? { backgroundColor: 'rgba(82, 54, 171, 0.1)' } : undefined}
    >
      {tab.icon && (
        <div style={{ display: 'inline-flex', alignItems: 'center', marginRight: '6px', position: 'relative' }}>
          <i className={`fa-solid fa-${tab.icon}`} style={{ fontSize: '14px' }}></i>
          {!isPreview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateIcon(tab.id, undefined);
              }}
              style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '14px',
                height: '14px',
                fontSize: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
              title="Remove icon"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      )}
      {editingTabId === tab.id && !isPreview ? (
        <input
          className="tab-title-input"
          value={editingTitle}
          autoFocus
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onEditingTitleChange(e.target.value)}
          onBlur={() => onCommitTitle(tab.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') onCommitTitle(tab.id);
            e.stopPropagation();
          }}
        />
      ) : (
        <span
          className={`tab-title${isPreview ? '' : ' tab-title-editable'}`}
          onClick={(e) => onTitleClick(e, tab)}
          title={isPreview ? undefined : 'Click to edit'}
        >
          {tab.title}
        </span>
      )}
    </div>
  );
};

const PageBuilderTabs: React.FC<{ data?: any }> = () => {
  const ctx = React.useContext(TabContext);
  const [editingTabId, setEditingTabId] = React.useState<string | null>(null);
  const [editingTitle, setEditingTitle] = React.useState('');

  if (!ctx) return null;

  // Card drop zone for tabs
  const CardInTabDropZone: React.FC<{ tabId: string; cardId: string; cardChildren: DroppedComponent[] }> = ({ tabId, cardId, cardChildren }) => {
    const [{ isOver }, dropCard] = useDrop(() => ({
      accept: 'COMPONENT_EXAMPLE',
      drop: (item: { type: string; name: string; component: React.ReactElement; gridFeatures?: any; inputFieldType?: DroppedComponent['inputType']; inputFieldWidth?: number }, monitor) => {
        if (monitor.didDrop()) return;
        if (ctx.addComponentToCardInTab) {
          const textContent = item.type.startsWith('text-')
            ? (extractTextContent(item.component) || getDefaultTextContent(item.type))
            : undefined;
          const alertVariant = item.type.startsWith('alert-') ? item.type.replace('alert-', '') as 'info' | 'warning' | 'error' | 'success' : undefined;

          ctx.addComponentToCardInTab(ctx.tabsId, tabId, cardId, {
            id: `${item.type}-${Date.now()}`,
            type: item.type,
            name: item.name,
            component: item.component,
            buttonText: (item.type === 'button' || item.type === 'secondary-button' || item.type === 'tertiary-button') ? 'Button' : undefined,
            textContent,
            alignment: undefined,
            gridFeatures: item.gridFeatures,
            alertVariant,
            alertMessage: alertVariant ? `This is ${item.type.replace('alert-', '')} alert` : undefined,
            showAlertLink: false,
            inputType: item.type === 'input-field' ? (item.inputFieldType || 'text') : undefined,
            inputWidth: item.type === 'input-field' ? (item.inputFieldWidth || 270) : undefined,
            sidebarContent: item.type === 'sidebar' ? {} : undefined,
            selectedMenuItem: item.type === 'sidebar' ? '2-2' : undefined,
          });
        }
      },
      collect: (monitor) => ({ isOver: !!monitor.isOver({ shallow: true }) }),
    }), [tabId, cardId]);

    return (
      <div ref={dropCard} className={`card-body-standard ${isOver ? 'card-drop-zone-over' : ''}`}>
        {cardChildren.length > 0 ? (
          cardChildren.map((cardChild) => {
            const isTextComponent = cardChild.type.startsWith('text-');
            const isBtnType = cardChild.type === 'button' || cardChild.type === 'secondary-button' ||
              cardChild.type === 'tertiary-button' || cardChild.type.startsWith('segmented-');
            const isTreeList = cardChild.type === 'treelist';
            let renderedChild = cardChild.component;

            if (!ctx.isPreview && isTreeList) {
              const treeRows = cardChild.treeData && cardChild.treeData.length > 0
                ? cardChild.treeData
                : [{ id: 1, parentId: null, name: 'Row 1' }, { id: 2, parentId: null, name: 'Row 2' }];
              renderedChild = (
                <TreeList dataSource={treeRows} keyExpr="id" parentIdExpr="parentId" rootValue={null} showBorders={false} showColumnLines={false} showRowLines={true} style={{ width: '100%' }}>
                  <TreeColumn dataField="name" caption="Name" />
                  <TreeScrolling mode="standard" />
                  <TreePaging enabled={false} />
                </TreeList>
              );
            } else if (!ctx.isPreview && (isTextComponent || isBtnType)) {
              renderedChild = (
                <EditableComponent
                  component={cardChild}
                  updateComponent={(id, updates) => {
                    if (ctx.updateComponentInCardInTab) {
                      ctx.updateComponentInCardInTab(ctx.tabsId, tabId, cardId, id, updates);
                    }
                  }}
                />
              );
            } else if (ctx.isPreview && isTreeList) {
              const treeRows = cardChild.treeData && cardChild.treeData.length > 0 ? cardChild.treeData : [{ id: 1, parentId: null, name: 'Row 1' }, { id: 2, parentId: null, name: 'Row 2' }];
              renderedChild = (
                <TreeList dataSource={treeRows} keyExpr="id" parentIdExpr="parentId" rootValue={null} showBorders={false} showColumnLines={false} showRowLines={true} style={{ width: '100%' }}>
                  <TreeColumn dataField="name" caption="Name" />
                  <TreeScrolling mode="standard" />
                  <TreePaging enabled={false} />
                </TreeList>
              );
            } else if (ctx.isPreview && isTextComponent && cardChild.textContent) {
              if (cardChild.type === 'text-list') {
                const items = cardChild.textContent.split('\n').filter(line => line.trim());
                renderedChild = (
                  <ul className="text-component text-list">
                    {items.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                );
              } else if (cardChild.type === 'text-link') {
                renderedChild = (
                  <a href="#" className="text-component text-link" onClick={(e) => e.preventDefault()}>
                    {cardChild.textContent}
                  </a>
                );
              } else {
                renderedChild = <p className="text-component">{cardChild.textContent}</p>;
              }
            } else if (ctx.isPreview && isBtnType) {
              const btnClass = cardChild.type === 'secondary-button' ? 'btn-secondary' :
                cardChild.type === 'tertiary-button' ? 'btn-tertiary' :
                cardChild.type.startsWith('segmented-') ? '' : 'btn-primary';
              renderedChild = btnClass ? <button className={btnClass}>{cardChild.buttonText || 'Button'}</button> : cardChild.component;
            }

            return (
              <div key={cardChild.id} style={{ position: 'relative', marginBottom: '12px', display: isBtnType ? 'flex' : 'block', justifyContent: isBtnType ? 'flex-end' : undefined }}>
                {!ctx.isPreview && (
                  <button
                    className="accordion-child-remove"
                    onClick={() => {
                      if (ctx.removeComponentFromCardInTab) {
                        ctx.removeComponentFromCardInTab(ctx.tabsId, tabId, cardId, cardChild.id);
                      }
                    }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
                {isBtnType ? renderedChild : <div className="dropped-component-preview">{renderedChild}</div>}
              </div>
            );
          })
        ) : (
          !ctx.isPreview && (
            <div className="card-drop-placeholder">
              <i className="fa-solid fa-arrow-down"></i>
              <span>Drop components here</span>
            </div>
          )
        )}
      </div>
    );
  };

  const handleTitleClick = (e: React.MouseEvent, tab: TabSection) => {
    if (ctx.isPreview) return;
    e.stopPropagation();
    setEditingTabId(tab.id);
    setEditingTitle(tab.title);
  };

  const commitTitle = (tabId: string) => {
    ctx.updateTabTitle(ctx.tabsId, tabId, editingTitle);
    setEditingTabId(null);
  };

  const handleUpdateIcon = (tabId: string, icon: string | undefined) => {
    if (ctx.updateTabIcon) {
      ctx.updateTabIcon(ctx.tabsId, tabId, icon);
    }
  };

  const activeSection = ctx.sections[ctx.activeTab];

  return (
    <div className={ctx.isPreview ? "tabs-container" : "tabs-container-builder"}>
      <div className="tabs-wrapper">
        {ctx.sections.map((tab, index) => (
          <div key={tab.id} className="tab-item-wrapper">
            <TabButtonWithIconDropZone
              tab={tab}
              index={index}
              isActive={index === ctx.activeTab}
              isPreview={ctx.isPreview}
              onSelect={() => ctx.setActiveTab(index)}
              onUpdateIcon={handleUpdateIcon}
              onTitleClick={handleTitleClick}
              editingTabId={editingTabId}
              editingTitle={editingTitle}
              onEditingTitleChange={setEditingTitle}
              onCommitTitle={commitTitle}
            />
            {!ctx.isPreview && ctx.sections.length > 1 && (
              <button
                className="remove-tab-btn"
                onClick={() => ctx.removeTab(ctx.tabsId, tab.id)}
                title="Remove tab"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        ))}
        {!ctx.isPreview && (
          <button
            className="add-tab-btn"
            onClick={() => ctx.addTab(ctx.tabsId)}
            title="Add tab"
          >
            <i className="fa-solid fa-plus"></i>
          </button>
        )}
      </div>
      <div className="tabs-line"></div>

      {activeSection && (
        <div className="tab-content-area">
          {activeSection.children.length > 0 && (
            <div className="tab-dropped-children">
              <div className="row g-3">
              {activeSection.children.map((child, childIdx) => {
                const colSize = child.colSize || 12;
                const isTabChildBtn = child.type === 'button' || child.type === 'secondary-button' ||
                  child.type === 'tertiary-button' || child.type.startsWith('segmented-');
                const prevChildIsBtn = childIdx > 0 && (() => { const p = activeSection.children[childIdx - 1]; return p.type === 'button' || p.type === 'secondary-button' || p.type === 'tertiary-button' || p.type.startsWith('segmented-'); })();
                const isFirstTabBtn = isTabChildBtn && !prevChildIsBtn;
                const isTextComponent = child.type.startsWith('text-');
                let renderedChild = child.component;

                if (!ctx.isPreview && (isTextComponent || isTabChildBtn)) {
                  renderedChild = (
                    <EditableComponent
                      component={child}
                      updateComponent={(id, updates) => ctx.updateComponentInTab(ctx.tabsId, activeSection.id, id, updates)}
                    />
                  );
                } else if (ctx.isPreview && isTabChildBtn && !child.type.startsWith('segmented-')) {
                  const bc = child.type === 'secondary-button' ? 'btn-secondary' : child.type === 'tertiary-button' ? 'btn-tertiary' : 'btn-primary';
                  renderedChild = (
                    <button className={bc}>
                      {child.buttonIcon && child.buttonIconPosition === 'left' && <i className={`fa-solid fa-${child.buttonIcon}`} style={{ marginRight: '8px' }}></i>}
                      {child.buttonText || 'Button'}
                      {child.buttonIcon && child.buttonIconPosition === 'right' && <i className={`fa-solid fa-${child.buttonIcon}`} style={{ marginLeft: '8px' }}></i>}
                    </button>
                  );
                } else if (ctx.isPreview && isTextComponent && child.textContent) {
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

                // Render editable data grids
                if (child.type === 'datagrid') {
                  renderedChild = (
                    <PageBuilderDataGrid
                      gridData={child.gridData || DEFAULT_GRID_DATA}
                      onChange={updated => ctx.updateComponentInTab(ctx.tabsId, activeSection.id, child.id, { gridData: updated })}
                      hasActionsColumn={!!child.gridFeatures?.actions}
                      actionColumnChildren={child.actionColumnChildren || []}
                      onActionColumnChildrenChange={children => ctx.updateComponentInTab(ctx.tabsId, activeSection.id, child.id, { actionColumnChildren: children })}
                    />
                  );
                }

                // Render expandable grids with drop zone support
                if (child.type === 'datagrid-expandable') {
                  renderedChild = (
                    <ExpandableGridWithDropZone
                      gridId={child.id}
                      detailChildrenByRow={child.detailChildrenByRow || {}}
                      addComponentToRow={(gId, rk, comp) => ctx.addComponentToRowInTab?.(ctx.tabsId, activeSection.id, gId, rk, comp)}
                      removeComponentFromRow={(gId, rk, cId) => ctx.removeComponentFromRowInTab?.(ctx.tabsId, activeSection.id, gId, rk, cId)}
                      isPreview={ctx.isPreview}
                    />
                  );
                }

                // Pass isPreview prop to components that need it
                if (child.type === 'spacer') {
                  renderedChild = <Spacer isPreview={ctx.isPreview} />;
                }
                if (child.type === 'sidebar') {
                  renderedChild = (
                    <SidebarContentLayout
                      isPreview={ctx.isPreview}
                      contentByMenuItem={child.sidebarContent || {}}
                      selectedMenuItem={child.selectedMenuItem}
                      navData={child.sidebarNavData}
                      onContentChange={(menuItemId, content) => {
                        ctx.updateComponentInTab(ctx.tabsId, activeSection.id, child.id, {
                          sidebarContent: { ...(child.sidebarContent || {}), [menuItemId]: content },
                        });
                      }}
                      onMenuItemSelect={(menuItemId) => {
                        ctx.updateComponentInTab(ctx.tabsId, activeSection.id, child.id, {
                          selectedMenuItem: menuItemId,
                        });
                      }}
                      onNavDataChange={(navData) => {
                        ctx.updateComponentInTab(ctx.tabsId, activeSection.id, child.id, {
                          sidebarNavData: navData,
                        });
                      }}
                    />
                  );
                }

                // Render nested accordions with context support
                if (child.type === 'accordion') {
                  renderedChild = (
                    <AccordionWithContext
                      accordionId={child.id}
                      sections={child.accordionSections || DEFAULT_ACCORDION_SECTIONS}
                      isPreview={ctx.isPreview}
                      updateSectionTitle={(aId, sId, title) => ctx.updateAccordionSectionTitleInTab?.(ctx.tabsId, activeSection.id, aId, sId, title)}
                      addComponentToSection={(aId, sId, comp) => ctx.addComponentToAccordionSectionInTab?.(ctx.tabsId, activeSection.id, aId, sId, comp)}
                      removeComponentFromSection={(aId, sId, cId) => ctx.removeComponentFromAccordionSectionInTab?.(ctx.tabsId, activeSection.id, aId, sId, cId)}
                      updateComponentInSection={(aId, sId, cId, updates) => ctx.updateComponentInAccordionSectionInTab?.(ctx.tabsId, activeSection.id, aId, sId, cId, updates)}
                      addComponentToRowInSection={(aId, sId, gridId, rowKey, comp) => ctx.addComponentToRowInAccordionSectionInTab?.(ctx.tabsId, activeSection.id, aId, sId, gridId, rowKey, comp)}
                      removeComponentFromRowInSection={(aId, sId, gridId, rowKey, cId) => ctx.removeComponentFromRowInAccordionSectionInTab?.(ctx.tabsId, activeSection.id, aId, sId, gridId, rowKey, cId)}
                    />
                  );
                }

                // Render cards with drop zones
                if (child.type === 'card') {
                  const cardColSizeVal = child.colSize || 12;
                  renderedChild = (
                    <div style={{ width: '100%' }}>
                      <div className="card-standard">
                        <div className="card-header-wrapper">
                          <h2 className="card-title-standard">{child.title || 'Card Title'}</h2>
                          {!ctx.isPreview && (
                            <div className="card-header-actions">
                              <select
                                className="dropped-component-size-select"
                                value={cardColSizeVal}
                                onChange={(e) => {
                                  const newSize = parseInt(e.target.value);
                                  ctx.updateComponentInTab(ctx.tabsId, activeSection.id, child.id, { colSize: newSize });
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
                          )}
                        </div>
                        <CardInTabDropZone
                          tabId={activeSection.id}
                          cardId={child.id}
                          cardChildren={child.children || []}
                        />
                      </div>
                    </div>
                  );
                }

                if (child.type === 'text-search' && ctx.isPreview) {
                  renderedChild = <div style={{ display: 'block', minHeight: '48px' }}>{renderedChild}</div>;
                }

                if (isTabChildBtn) {
                  return (
                    <div key={child.id} className={isFirstTabBtn ? 'col-auto ms-auto' : 'col-auto'} style={{ paddingTop: '4px', paddingBottom: '4px' }}>
                      <div style={{ position: 'relative' }}>
                        {!ctx.isPreview && (
                          <button
                            className="remove-component-btn"
                            onClick={() => ctx.removeComponentFromTab(ctx.tabsId, activeSection.id, child.id)}
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        )}
                        {renderedChild}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={child.id} className={`col-md-${colSize}`}>
                    <div className="tab-dropped-child" style={{ position: 'relative' }}>
                      {!ctx.isPreview && (
                        <>
                          <button
                            className="remove-component-btn"
                            style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}
                            onClick={() => ctx.removeComponentFromTab(ctx.tabsId, activeSection.id, child.id)}
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                          <select
                            className="dropped-component-size-select"
                            value={colSize}
                            onChange={(e) => ctx.updateComponentInTab(ctx.tabsId, activeSection.id, child.id, { colSize: parseInt(e.target.value) })}
                            onClick={(e) => e.stopPropagation()}
                            style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 10 }}
                          >
                            <option value={12}>Full Width (12)</option>
                            <option value={6}>Half (6)</option>
                            <option value={4}>Third (4)</option>
                            <option value={3}>Quarter (3)</option>
                            <option value={8}>Two Thirds (8)</option>
                            <option value={9}>Three Quarters (9)</option>
                          </select>
                        </>
                      )}
                      {renderedChild}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          )}
          {!ctx.isPreview && (
            <TabSectionDropZone
              tabsId={ctx.tabsId}
              tabId={activeSection.id}
              addComponentToTab={ctx.addComponentToTab}
            />
          )}
          {ctx.isPreview && activeSection.children.length === 0 && (
            <p className="tab-empty-state">No content in this tab</p>
          )}
        </div>
      )}
    </div>
  );
};

export const TabsWithContext: React.FC<{
  tabsId: string;
  sections: TabSection[];
  activeTab?: number;
  isPreview?: boolean;
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
  addComponentToRowInTab?: (tabsId: string, tabId: string, gridId: string, rowKey: string, component: DroppedComponent) => void;
  removeComponentFromRowInTab?: (tabsId: string, tabId: string, gridId: string, rowKey: string, componentId: string) => void;
  updateAccordionSectionTitleInTab?: (tabsId: string, tabId: string, accordionId: string, sectionId: string, title: string) => void;
  addComponentToAccordionSectionInTab?: (tabsId: string, tabId: string, accordionId: string, sectionId: string, component: DroppedComponent) => void;
  removeComponentFromAccordionSectionInTab?: (tabsId: string, tabId: string, accordionId: string, sectionId: string, componentId: string) => void;
  updateComponentInAccordionSectionInTab?: (tabsId: string, tabId: string, accordionId: string, sectionId: string, componentId: string, updates: Partial<DroppedComponent>) => void;
  addComponentToRowInAccordionSectionInTab?: (tabsId: string, tabId: string, accordionId: string, sectionId: string, gridId: string, rowKey: string, component: DroppedComponent) => void;
  removeComponentFromRowInAccordionSectionInTab?: (tabsId: string, tabId: string, accordionId: string, sectionId: string, gridId: string, rowKey: string, componentId: string) => void;
}> = ({ tabsId, sections, activeTab = 0, isPreview = false, setActiveTab: setActiveTabProp, updateTabTitle, updateTabIcon, addTab, removeTab, addComponentToTab, removeComponentFromTab, updateComponentInTab, addComponentToCardInTab, removeComponentFromCardInTab, updateComponentInCardInTab, addComponentToRowInTab, removeComponentFromRowInTab, updateAccordionSectionTitleInTab, addComponentToAccordionSectionInTab, removeComponentFromAccordionSectionInTab, updateComponentInAccordionSectionInTab, addComponentToRowInAccordionSectionInTab, removeComponentFromRowInAccordionSectionInTab }) => {
  const [localActiveTab, setLocalActiveTab] = React.useState(activeTab);

  const handleSetActiveTab = (index: number) => {
    setLocalActiveTab(index);
    setActiveTabProp(tabsId, index);
  };

  return (
    <TabContext.Provider value={{
      tabsId,
      sections,
      activeTab: localActiveTab,
      isPreview,
      setActiveTab: handleSetActiveTab,
      updateTabTitle,
      updateTabIcon,
      addTab,
      removeTab,
      addComponentToTab,
      removeComponentFromTab,
      updateComponentInTab,
      addComponentToCardInTab,
      removeComponentFromCardInTab,
      updateComponentInCardInTab,
      addComponentToRowInTab,
      removeComponentFromRowInTab,
      updateAccordionSectionTitleInTab,
      addComponentToAccordionSectionInTab,
      removeComponentFromAccordionSectionInTab,
      updateComponentInAccordionSectionInTab,
      addComponentToRowInAccordionSectionInTab,
      removeComponentFromRowInAccordionSectionInTab
    }}>
      <PageBuilderTabs />
    </TabContext.Provider>
  );
};
