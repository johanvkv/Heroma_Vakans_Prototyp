import React from 'react';
import { useDrop } from 'react-dnd';
import { DroppedComponent, AccordionSection } from './pageBuilderTypes';
import {
  extractTextContent,
  getDefaultTextContent,
  DEFAULT_ACCORDION_SECTIONS,
  DEFAULT_TAB_SECTIONS,
  DEFAULT_STEPPER_STEPS,
} from './pageBuilderHelpers';
import { EditableComponent } from './PageBuilderEditableComponents';
import { ExpandableGridWithDropZone } from './PageBuilderGridComponents';
import { Spacer } from '../app/components/Spacer';
import { SidebarContentLayout } from '../app/components/SidebarContentLayout';
import { PageBuilderDataGrid, DEFAULT_GRID_DATA } from './PageBuilderDataGrid';
import { Accordion } from '../app/components/Accordion';

// ─── Accordion context ────────────────────────────────────────────────────────

export interface AccordionContextValue {
  accordionId: string;
  sections: AccordionSection[];
  isPreview: boolean;
  updateSectionTitle: (accordionId: string, sectionId: string, title: string) => void;
  addComponentToSection: (accordionId: string, sectionId: string, component: DroppedComponent) => void;
  removeComponentFromSection: (accordionId: string, sectionId: string, componentId: string) => void;
  updateComponentInSection: (accordionId: string, sectionId: string, componentId: string, updates: Partial<DroppedComponent>) => void;
  addComponentToRowInSection?: (accordionId: string, sectionId: string, gridId: string, rowKey: string, component: DroppedComponent) => void;
  removeComponentFromRowInSection?: (accordionId: string, sectionId: string, gridId: string, rowKey: string, componentId: string) => void;
}

export const AccordionContext = React.createContext<AccordionContextValue | null>(null);

const AccordionSectionDropZone: React.FC<{
  accordionId: string;
  sectionId: string;
  addComponentToSection: (accordionId: string, sectionId: string, component: DroppedComponent) => void;
}> = ({ accordionId, sectionId, addComponentToSection }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT_EXAMPLE',
    drop: (item: { type: string; name: string; component: React.ReactElement; gridFeatures?: any; inputFieldType?: DroppedComponent['inputType']; inputFieldWidth?: number }, monitor) => {
      if (monitor.didDrop()) return;
      const textContent = item.type.startsWith('text-')
        ? (extractTextContent(item.component) || getDefaultTextContent(item.type))
        : undefined;

      const alertVariant = item.type.startsWith('alert-') ? item.type.replace('alert-', '') as 'info' | 'warning' | 'error' | 'success' : undefined;

      addComponentToSection(accordionId, sectionId, {
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
  }), [accordionId, sectionId, addComponentToSection]);

  return (
    <div ref={drop} className={`accordion-section-drop-zone${isOver ? ' accordion-section-drop-zone-over' : ''}`}>
      <i className="fa-solid fa-arrow-down"></i>
      <span>Drop any component here</span>
    </div>
  );
};

const PageBuilderAccordion: React.FC<{ data?: any }> = () => {
  const ctx = React.useContext(AccordionContext);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = React.useState<string | null>(null);
  const [editingTitle, setEditingTitle] = React.useState('');

  if (!ctx) return null;

  const handleTitleClick = (e: React.MouseEvent, section: AccordionSection) => {
    if (ctx.isPreview) return;
    e.stopPropagation();
    setEditingSectionId(section.id);
    setEditingTitle(section.title);
  };

  const commitTitle = (sectionId: string) => {
    ctx.updateSectionTitle(ctx.accordionId, sectionId, editingTitle);
    setEditingSectionId(null);
  };

  return (
    <div className="d-flex flex-column w-100">
      {ctx.sections.map((section) => {
        const isExpanded = expandedId === section.id;
        return (
          <div key={section.id} className={`accordion-section ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <button
              className="accordion-header"
              onClick={() => setExpandedId(prev => prev === section.id ? null : section.id)}
              type="button"
              aria-expanded={isExpanded}
            >
              {editingSectionId === section.id && !ctx.isPreview ? (
                <input
                  className="accordion-title-input"
                  value={editingTitle}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => commitTitle(section.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape') commitTitle(section.id);
                    e.stopPropagation();
                  }}
                />
              ) : (
                <span
                  className={`accordion-title${ctx.isPreview ? '' : ' accordion-title-editable'}`}
                  onClick={(e) => handleTitleClick(e, section)}
                  title={ctx.isPreview ? undefined : 'Click to edit'}
                >
                  {section.title}
                </span>
              )}
              <div className="accordion-icon">
                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
                  {isExpanded
                    ? <path d="M5 13V11H19V13H5Z" fill="#5236ab" />
                    : <path d="M11 13H5V11H11V5H13V11H19V13H13V19H11V13Z" fill="#5236ab" />
                  }
                </svg>
              </div>
            </button>
            {isExpanded && (
              <div className="accordion-content">
                {section.children.length > 0 && (
                  <div className="accordion-dropped-children">
                    {section.children.map((child) => {
                      // Render cards with full dropzone functionality
                      if (child.type === 'card') {
                        const cardColSize = child.colSize || 12;
                        return (
                          <div key={child.id} className={`accordion-dropped-child row g-3`}>
                            <div className={`col-md-${cardColSize}`} style={{ position: 'relative' }}>
                              {!ctx.isPreview && (
                                <>
                                  <button
                                    className="accordion-child-remove"
                                    onClick={() => ctx.removeComponentFromSection(ctx.accordionId, section.id, child.id)}
                                    style={{ position: 'absolute', top: '4px', right: '4px', zIndex: 15 }}
                                  >
                                    <i className="fa-solid fa-xmark"></i>
                                  </button>
                                  <select
                                    className="dropped-component-size-select"
                                    value={cardColSize}
                                    onChange={(e) => ctx.updateComponentInSection(ctx.accordionId, section.id, child.id, { colSize: parseInt(e.target.value) })}
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
                                </>
                              )}
                              <div className="card-standard">
                                <div className="card-header-wrapper">
                                  <h2 className="card-title-standard">{child.title || 'Card Title'}</h2>
                                </div>
                                <div className="card-body-standard">
                                  {child.children && child.children.length > 0 ? (
                                    child.children.map(cardChild => {
                                      const isTextComponent = cardChild.type.startsWith('text-');
                                      const isBtnChild = cardChild.type === 'button' || cardChild.type === 'secondary-button' || cardChild.type === 'tertiary-button' || cardChild.type.startsWith('segmented-');
                                      let renderedCardChild = cardChild.component;

                                      if (!ctx.isPreview && isBtnChild) {
                                        renderedCardChild = (
                                          <EditableComponent
                                            component={cardChild}
                                            updateComponent={(id, updates) => ctx.updateComponentInSection(ctx.accordionId, section.id, id, updates)}
                                          />
                                        );
                                      } else if (isTextComponent && cardChild.textContent) {
                                        if (ctx.isPreview) {
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
                                        } else {
                                          renderedCardChild = (
                                            <EditableComponent
                                              component={cardChild}
                                              updateComponent={(id, updates) => ctx.updateComponentInSection(ctx.accordionId, section.id, id, updates)}
                                            />
                                          );
                                        }
                                      }

                                      return (
                                        <div key={cardChild.id} style={{ position: 'relative', marginBottom: '12px', display: isBtnChild ? 'flex' : 'block', justifyContent: isBtnChild ? 'flex-end' : undefined }}>
                                          {!ctx.isPreview && (
                                            <button
                                              className="accordion-child-remove"
                                              onClick={() => {
                                                ctx.updateComponentInSection(ctx.accordionId, section.id, child.id, {
                                                  children: (child.children || []).filter(c => c.id !== cardChild.id)
                                                });
                                              }}
                                            >
                                              <i className="fa-solid fa-xmark"></i>
                                            </button>
                                          )}
                                          {isBtnChild ? renderedCardChild : <div className="dropped-component-preview">{renderedCardChild}</div>}
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
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Render nested accordions
                      if (child.type === 'accordion') {
                        return (
                          <div key={child.id} className="accordion-dropped-child">
                            {!ctx.isPreview && (
                              <button
                                className="accordion-child-remove"
                                onClick={() => ctx.removeComponentFromSection(ctx.accordionId, section.id, child.id)}
                              >
                                <i className="fa-solid fa-xmark"></i>
                              </button>
                            )}
                            <Accordion />
                          </div>
                        );
                      }

                      // Render nested tabs
                      if (child.type === 'tabs' || child.type === 'tabs-icons') {
                        return (
                          <div key={child.id} className="accordion-dropped-child">
                            {!ctx.isPreview && (
                              <button
                                className="accordion-child-remove"
                                onClick={() => ctx.removeComponentFromSection(ctx.accordionId, section.id, child.id)}
                              >
                                <i className="fa-solid fa-xmark"></i>
                              </button>
                            )}
                            {child.component}
                          </div>
                        );
                      }

                      const isTextComponent = child.type.startsWith('text-');
                      const isAccordionBtn = child.type === 'button' || child.type === 'secondary-button' || child.type === 'tertiary-button' || child.type.startsWith('segmented-');
                      let renderedChild = child.component;

                      if (!ctx.isPreview && isAccordionBtn) {
                        renderedChild = (
                          <EditableComponent
                            component={child}
                            updateComponent={(id, updates) => ctx.updateComponentInSection(ctx.accordionId, section.id, id, updates)}
                          />
                        );
                      } else if (isTextComponent && child.textContent) {
                        if (ctx.isPreview) {
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
                        } else {
                          renderedChild = (
                            <EditableComponent
                              component={child}
                              updateComponent={(id, updates) => ctx.updateComponentInSection(ctx.accordionId, section.id, id, updates)}
                            />
                          );
                        }
                      }

                      // Render editable data grids
                      if (child.type === 'datagrid') {
                        renderedChild = (
                          <PageBuilderDataGrid
                            gridData={child.gridData || DEFAULT_GRID_DATA}
                            onChange={updated => ctx.updateComponentInSection(ctx.accordionId, section.id, child.id, { gridData: updated })}
                            hasActionsColumn={!!child.gridFeatures?.actions}
                            actionColumnChildren={child.actionColumnChildren || []}
                            onActionColumnChildrenChange={children => ctx.updateComponentInSection(ctx.accordionId, section.id, child.id, { actionColumnChildren: children })}
                          />
                        );
                      }

                      // Render expandable grids with drop zone support
                      if (child.type === 'datagrid-expandable') {
                        renderedChild = (
                          <ExpandableGridWithDropZone
                            gridId={child.id}
                            detailChildrenByRow={child.detailChildrenByRow || {}}
                            addComponentToRow={(gId, rk, comp) => ctx.addComponentToRowInSection?.(ctx.accordionId, section.id, gId, rk, comp)}
                            removeComponentFromRow={(gId, rk, cId) => ctx.removeComponentFromRowInSection?.(ctx.accordionId, section.id, gId, rk, cId)}
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
                              ctx.updateComponentInSection(ctx.accordionId, section.id, child.id, {
                                sidebarContent: { ...(child.sidebarContent || {}), [menuItemId]: content },
                              });
                            }}
                            onMenuItemSelect={(menuItemId) => {
                              ctx.updateComponentInSection(ctx.accordionId, section.id, child.id, {
                                selectedMenuItem: menuItemId,
                              });
                            }}
                            onNavDataChange={(navData) => {
                              ctx.updateComponentInSection(ctx.accordionId, section.id, child.id, {
                                sidebarNavData: navData,
                              });
                            }}
                          />
                        );
                      }

                      // Wrap TextSearch component for proper visibility
                      if (child.type === 'text-search' && ctx.isPreview) {
                        renderedChild = <div style={{ display: 'block', minHeight: '48px' }}>{renderedChild}</div>;
                      }

                      return (
                        <div key={child.id} className="accordion-dropped-child" style={isAccordionBtn ? { display: 'flex', justifyContent: 'flex-end' } : undefined}>
                          {!ctx.isPreview && child.type !== 'datagrid-expandable' && (
                            <button
                              className="remove-component-btn accordion-child-remove"
                              onClick={() => ctx.removeComponentFromSection(ctx.accordionId, section.id, child.id)}
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          )}
                          {child.type === 'datagrid-expandable' && (
                            <div style={{ position: 'relative' }}>
                              {!ctx.isPreview && (
                                <button
                                  className="remove-component-btn"
                                  style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}
                                  onClick={() => ctx.removeComponentFromSection(ctx.accordionId, section.id, child.id)}
                                >
                                  <i className="fa-solid fa-xmark"></i>
                                </button>
                              )}
                              {renderedChild}
                            </div>
                          )}
                          {child.type !== 'datagrid-expandable' && renderedChild}
                        </div>
                      );
                    })}
                  </div>
                )}
                {!ctx.isPreview && (
                  <AccordionSectionDropZone
                    accordionId={ctx.accordionId}
                    sectionId={section.id}
                    addComponentToSection={ctx.addComponentToSection}
                  />
                )}
                {ctx.isPreview && section.children.length === 0 && (
                  <p>Content for {section.title}...</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const AccordionWithContext: React.FC<{
  accordionId: string;
  sections: AccordionSection[];
  isPreview?: boolean;
  updateSectionTitle: (accordionId: string, sectionId: string, title: string) => void;
  addComponentToSection: (accordionId: string, sectionId: string, component: DroppedComponent) => void;
  removeComponentFromSection: (accordionId: string, sectionId: string, componentId: string) => void;
  updateComponentInSection: (accordionId: string, sectionId: string, componentId: string, updates: Partial<DroppedComponent>) => void;
  addComponentToRowInSection?: (accordionId: string, sectionId: string, gridId: string, rowKey: string, component: DroppedComponent) => void;
  removeComponentFromRowInSection?: (accordionId: string, sectionId: string, gridId: string, rowKey: string, componentId: string) => void;
}> = ({ accordionId, sections, isPreview = false, updateSectionTitle, addComponentToSection, removeComponentFromSection, updateComponentInSection, addComponentToRowInSection, removeComponentFromRowInSection }) => (
  <AccordionContext.Provider value={{ accordionId, sections, isPreview, updateSectionTitle, addComponentToSection, removeComponentFromSection, updateComponentInSection, addComponentToRowInSection, removeComponentFromRowInSection }}>
    <PageBuilderAccordion />
  </AccordionContext.Provider>
);
