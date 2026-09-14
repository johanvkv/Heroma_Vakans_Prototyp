import React, { useState, useCallback } from 'react';
import { NavigationSidebar, NavItem, DEFAULT_NAV_DATA } from './NavigationSidebar';
import { useDrop } from 'react-dnd';
import DataGrid, { Column, Paging, Scrolling, MasterDetail } from 'devextreme-react/data-grid';
import TextBox from 'devextreme-react/text-box';
import TextArea from 'devextreme-react/text-area';
import DateBox from 'devextreme-react/date-box';
import SelectBox from 'devextreme-react/select-box';

interface StepperData {
  label: string;
  description?: string;
}

interface GridColumn {
  dataField: string;
  caption: string;
}

interface GridData {
  columns: GridColumn[];
  data: any[];
}

interface AccordionSection {
  id: string;
  title: string;
  children: DroppedComponent[];
}

interface TabSection {
  id: string;
  title: string;
  children: DroppedComponent[];
}

interface StepperStep {
  id: string;
  label: string;
  description?: string;
  children: DroppedComponent[];
}

interface DroppedComponent {
  id: string;
  type: string;
  name: string;
  component: React.ReactElement;
  colSize?: number;
  children?: DroppedComponent[];
  headerChildren?: DroppedComponent[];
  headerLeftChildren?: DroppedComponent[];
  headerRightChildren?: DroppedComponent[];
  title?: string;
  buttonText?: string;
  textContent?: string;
  stepperData?: StepperData[];
  stepperSteps?: StepperStep[];
  gridData?: GridData;
  detailChildrenByRow?: { [rowKey: string]: DroppedComponent[] };
  accordionSections?: AccordionSection[];
  tabSections?: TabSection[];
  alignment?: 'left' | 'right' | 'center';
  inputType?: 'text' | 'date' | 'time' | 'search' | 'dropdown' | 'textarea';
  inputWidth?: number;
  buttonIcon?: string;
  buttonIconPosition?: 'left' | 'right';
  treeData?: Array<{ id: number; parentId: number | null; name: string }>;
}

interface SidebarContentLayoutProps {
  isPreview?: boolean;
  contentByMenuItem?: { [menuItemId: string]: DroppedComponent[] };
  onContentChange?: (menuItemId: string, content: DroppedComponent[]) => void;
  onMenuItemSelect?: (menuItemId: string) => void;
  selectedMenuItem?: string;
  navData?: NavItem[];
  onNavDataChange?: (data: NavItem[]) => void;
}

const DEFAULT_ACCORDION_SECTIONS: AccordionSection[] = [
  { id: 'a1', title: 'Section header 1', children: [] },
  { id: 'a2', title: 'Section header 2', children: [] },
  { id: 'a3', title: 'Section header 3', children: [] },
  { id: 'a4', title: 'Section header 4', children: [] },
  { id: 'a5', title: 'Section header 5', children: [] },
];

const DEFAULT_TAB_SECTIONS: TabSection[] = [
  { id: 't1', title: 'Tab 1', children: [] },
  { id: 't2', title: 'Tab 2', children: [] },
  { id: 't3', title: 'Tab 3', children: [] },
];

const DEFAULT_STEPPER_STEPS: StepperStep[] = [
  { id: 's1', label: 'Step 1', description: 'First step', children: [] },
  { id: 's2', label: 'Step 2', description: 'Second step', children: [] },
  { id: 's3', label: 'Step 3', description: 'Third step', children: [] },
];

// ─── Immutable path helpers ─────────────────────────────────────────────────
type PathSeg = { kind: 'idx'; v: number } | { kind: 'key'; v: string };

function parsePath(path: string): PathSeg[] {
  const segs: PathSeg[] = [];
  const re = /\[(\d+)\]|\['([^']+)'\]|\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(path)) !== null) {
    if (m[1] !== undefined) segs.push({ kind: 'idx', v: parseInt(m[1]) });
    else if (m[2] !== undefined) segs.push({ kind: 'key', v: m[2] });
    else segs.push({ kind: 'key', v: m[3] });
  }
  return segs;
}

function immutableSet(node: any, segs: PathSeg[], updates: Record<string, any>): any {
  if (segs.length === 0) return Array.isArray(node) ? node : { ...node, ...updates };
  const [s, ...rest] = segs;
  if (s.kind === 'idx') {
    const arr = [...(node as any[])];
    arr[s.v] = immutableSet(arr[s.v], rest, updates);
    return arr;
  }
  return { ...node, [s.v]: immutableSet(node[s.v], rest, updates) };
}

function immutableRemove(node: any, segs: PathSeg[]): any {
  if (segs.length === 1) {
    const s = segs[0];
    if (s.kind === 'idx') { const a = [...(node as any[])]; a.splice(s.v, 1); return a; }
    const o = { ...node }; delete o[s.v]; return o;
  }
  const [s, ...rest] = segs;
  if (s.kind === 'idx') {
    const arr = [...(node as any[])];
    arr[s.v] = immutableRemove(arr[s.v], rest);
    return arr;
  }
  return { ...node, [s.v]: immutableRemove(node[s.v], rest) };
}
// ─────────────────────────────────────────────────────────────────────────────

export const SidebarContentLayout: React.FC<SidebarContentLayoutProps> = ({
  isPreview = false,
  contentByMenuItem = {},
  onContentChange,
  onMenuItemSelect,
  selectedMenuItem: externalSelectedMenuItem,
  navData,
  onNavDataChange
}) => {
  const [internalSelectedMenuItem, setInternalSelectedMenuItem] = useState<string>(externalSelectedMenuItem || '2-2');
  const [tabsActiveStates, setTabsActiveStates] = useState<{ [tabsId: string]: number }>({});
  const [stepperActiveStates, setStepperActiveStates] = useState<{ [stepperId: string]: number }>({});
  // In preview mode there is no onMenuItemSelect callback so externalSelectedMenuItem never changes;
  // use internalSelectedMenuItem (updated on click) so switching menu items actually changes the content.
  const selectedMenuItem = onMenuItemSelect ? (externalSelectedMenuItem || internalSelectedMenuItem) : internalSelectedMenuItem;

  const handleMenuItemSelect = (id: string) => {
    setInternalSelectedMenuItem(id);
    if (onMenuItemSelect) {
      onMenuItemSelect(id);
    }
  };

  const handleNavDataChange = (data: NavItem[]) => {
    if (onNavDataChange) {
      onNavDataChange(data);
    }
  };

  const currentContent = contentByMenuItem[selectedMenuItem] || [];

  const updateContent = useCallback((updater: (content: DroppedComponent[]) => DroppedComponent[]) => {
    if (onContentChange && !isPreview) {
      const updated = updater(currentContent);
      onContentChange(selectedMenuItem, updated);
    }
  }, [currentContent, selectedMenuItem, onContentChange, isPreview]);

  const setActiveTab = useCallback((tabsId: string, index: number) => {
    setTabsActiveStates(prev => ({ ...prev, [tabsId]: index }));
  }, []);

  const setActiveStep = useCallback((stepperId: string, index: number) => {
    setStepperActiveStates(prev => ({ ...prev, [stepperId]: index }));
  }, []);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT_EXAMPLE',
    drop: (item: { type: string; name: string; component: React.ReactElement; inputFieldType?: string; inputFieldWidth?: number }, monitor) => {
      if (monitor.didDrop() || isPreview) return;

      const newComponent: DroppedComponent = {
        id: `${item.type}-${Date.now()}`,
        type: item.type,
        name: item.name,
        component: item.component,
        colSize: 12,
        children: item.type === 'card' ? [] : undefined,
        headerLeftChildren: item.type === 'card' ? [] : undefined,
        headerRightChildren: item.type === 'card' ? [] : undefined,
        title: item.type === 'card' ? 'Card Title' : undefined,
        detailChildrenByRow: item.type === 'datagrid-expandable' ? {} : undefined,
        accordionSections: item.type === 'accordion' ? DEFAULT_ACCORDION_SECTIONS.map(s => ({ ...s, children: [] })) : undefined,
        tabSections: (item.type === 'tabs' || item.type === 'tabs-icons') ? DEFAULT_TAB_SECTIONS.map(t => ({ ...t, children: [] })) : undefined,
        stepperSteps: (item.type === 'stepper-vertical' || item.type === 'stepper-horizontal') ? DEFAULT_STEPPER_STEPS.map(s => ({ ...s, children: [] })) : undefined,
        inputType: item.type === 'input-field' ? (item.inputFieldType as any || 'text') : undefined,
        inputWidth: item.type === 'input-field' ? (item.inputFieldWidth || 270) : undefined,
        buttonText: (item.type === 'button' || item.type === 'secondary-button' || item.type === 'tertiary-button') ? 'Button' : undefined,
        treeData: item.type === 'treelist' ? [{ id: 1, parentId: null, name: 'Row 1' }, { id: 2, parentId: null, name: 'Row 2' }, { id: 3, parentId: 2, name: 'Child of Row 2' }] : undefined,
      };

      updateContent(content => [...content, newComponent]);
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver({ shallow: true }) }),
  }), [selectedMenuItem, currentContent, isPreview, updateContent]);

  return (
    <div className="sidebar-content-layout">
      <div className="sidebar-nav">
        <NavigationSidebar
          isPreview={isPreview}
          onItemSelect={handleMenuItemSelect}
          initialNavData={navData}
          onNavDataChange={handleNavDataChange}
        />
      </div>
      <div
        ref={isPreview ? undefined : drop}
        className={`sidebar-content-dropzone ${isPreview ? 'preview' : ''} ${!isPreview && isOver ? 'drag-over' : ''}`}
      >
        {!isPreview && currentContent.length === 0 && (
          <div className="sidebar-dropzone-placeholder">
            <i className="fa-solid fa-arrow-down"></i>
            <div>Drop components here</div>
            <div className="sidebar-dropzone-menu-label">
              Content for: {selectedMenuItem}
            </div>
          </div>
        )}
        {currentContent.length > 0 && (
          <div className="sidebar-content-grid row">
            {currentContent.map((component, index) => (
              <NestedComponentRenderer
                key={component.id}
                component={component}
                path={`[${index}]`}
                isPreview={isPreview}
                updateContent={updateContent}
                tabsActiveStates={tabsActiveStates}
                setActiveTab={setActiveTab}
                stepperActiveStates={stepperActiveStates}
                setActiveStep={setActiveStep}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Button with icon drop support for sidebar content
const ButtonWithIconDropSidebar: React.FC<{
  component: DroppedComponent;
  btnClass: string;
  isPreview: boolean;
  updateAtPath: (updates: Partial<DroppedComponent>) => void;
}> = ({ component, btnClass, isPreview, updateAtPath }) => {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: 'COMPONENT_EXAMPLE',
    drop: (item: { type: string; iconClass?: string }) => {
      if (item.type === 'icon' && item.iconClass) {
        updateAtPath({ buttonIcon: item.iconClass, buttonIconPosition: 'left' });
      }
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() })
  }), [updateAtPath]);

  return (
    <div ref={isPreview ? undefined : dropRef} style={{ display: 'inline-block', backgroundColor: isOver ? '#e6e3f3' : 'transparent', borderRadius: '4px' }}>
      <button className={btnClass}>
        {component.buttonIcon && component.buttonIconPosition === 'left' && (
          <span style={{ marginRight: '8px', position: 'relative' }}>
            <i className={`fa-solid fa-${component.buttonIcon}`}></i>
            {!isPreview && <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); updateAtPath({ buttonIcon: undefined, buttonIconPosition: undefined }); }} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '16px', height: '16px', borderRadius: '50%', background: '#e31937', color: 'white', border: 'none', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><i className="fa-solid fa-xmark"></i></span>}
          </span>
        )}
        {component.buttonText || 'Button'}
        {component.buttonIcon && component.buttonIconPosition === 'right' && (
          <span style={{ marginLeft: '8px', position: 'relative' }}>
            <i className={`fa-solid fa-${component.buttonIcon}`}></i>
            {!isPreview && <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); updateAtPath({ buttonIcon: undefined, buttonIconPosition: undefined }); }} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '16px', height: '16px', borderRadius: '50%', background: '#e31937', color: 'white', border: 'none', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><i className="fa-solid fa-xmark"></i></span>}
          </span>
        )}
      </button>
      {isOver && !isPreview && <div style={{ fontSize: '10px', color: '#5236ab', marginTop: '4px' }}>Drop icon here</div>}
    </div>
  );
};

// Unified nested component renderer
interface NestedComponentRendererProps {
  component: DroppedComponent;
  path: string;
  isPreview: boolean;
  updateContent: (updater: (content: DroppedComponent[]) => DroppedComponent[]) => void;
  tabsActiveStates: { [tabsId: string]: number };
  setActiveTab: (tabsId: string, index: number) => void;
  stepperActiveStates: { [stepperId: string]: number };
  setActiveStep: (stepperId: string, index: number) => void;
}

const NestedComponentRenderer: React.FC<NestedComponentRendererProps> = ({
  component,
  path,
  isPreview,
  updateContent,
  tabsActiveStates,
  setActiveTab,
  stepperActiveStates,
  setActiveStep
}) => {
  const colSize = component.colSize || 12;

  const updateAtPath = (updates: Partial<DroppedComponent>) => {
    updateContent(content => immutableSet(content, parsePath(path), updates) as DroppedComponent[]);
  };

  const removeAtPath = () => {
    updateContent(content => immutableRemove(content, parsePath(path)) as DroppedComponent[]);
  };

  // Card with dropzone
  if (component.type === 'card') {
    return (
      <div className={`col-md-${colSize}`}>
        <CardNested
          component={component}
          path={path}
          isPreview={isPreview}
          updateContent={updateContent}
          updateAtPath={updateAtPath}
          removeAtPath={removeAtPath}
          tabsActiveStates={tabsActiveStates}
          setActiveTab={setActiveTab}
          stepperActiveStates={stepperActiveStates}
          setActiveStep={setActiveStep}
        />
      </div>
    );
  }

  // Accordion with dropzones
  if (component.type === 'accordion') {
    return (
      <div className={`col-md-${colSize}`}>
        <AccordionNested
          component={component}
          path={path}
          isPreview={isPreview}
          updateContent={updateContent}
          updateAtPath={updateAtPath}
          removeAtPath={removeAtPath}
          tabsActiveStates={tabsActiveStates}
          setActiveTab={setActiveTab}
          stepperActiveStates={stepperActiveStates}
          setActiveStep={setActiveStep}
        />
      </div>
    );
  }

  // Tabs with dropzones
  if (component.type === 'tabs' || component.type === 'tabs-icons') {
    return (
      <div className={`col-md-${colSize}`}>
        <TabsNested
          component={component}
          path={path}
          isPreview={isPreview}
          updateContent={updateContent}
          updateAtPath={updateAtPath}
          removeAtPath={removeAtPath}
          tabsActiveStates={tabsActiveStates}
          setActiveTab={setActiveTab}
          stepperActiveStates={stepperActiveStates}
          setActiveStep={setActiveStep}
        />
      </div>
    );
  }

  // Stepper with dropzones
  if (component.type === 'stepper-vertical' || component.type === 'stepper-horizontal') {
    return (
      <div className={`col-md-${colSize}`}>
        <StepperNested
          component={component}
          path={path}
          isPreview={isPreview}
          updateContent={updateContent}
          updateAtPath={updateAtPath}
          removeAtPath={removeAtPath}
          tabsActiveStates={tabsActiveStates}
          setActiveTab={setActiveTab}
          stepperActiveStates={stepperActiveStates}
          setActiveStep={setActiveStep}
        />
      </div>
    );
  }

  // Expandable grid with dropzones
  if (component.type === 'datagrid-expandable') {
    return (
      <div className={`col-md-${colSize}`}>
        <ExpandableGridNested
          component={component}
          path={path}
          isPreview={isPreview}
          updateContent={updateContent}
          updateAtPath={updateAtPath}
          removeAtPath={removeAtPath}
          tabsActiveStates={tabsActiveStates}
          setActiveTab={setActiveTab}
          stepperActiveStates={stepperActiveStates}
          setActiveStep={setActiveStep}
        />
      </div>
    );
  }

  // Button rendering with icon drop
  if (component.type === 'button' || component.type === 'secondary-button' || component.type === 'tertiary-button') {
    const btnClass = component.type === 'secondary-button' ? 'btn-secondary' : component.type === 'tertiary-button' ? 'btn-tertiary' : 'btn-primary';
    return (
      <div className={`col-auto ${isPreview ? '' : 'ms-auto'}`}>
        {!isPreview && <button className="accordion-child-remove" onClick={removeAtPath}><i className="fa-solid fa-xmark"></i></button>}
        <ButtonWithIconDropSidebar component={component} btnClass={btnClass} isPreview={isPreview} updateAtPath={updateAtPath} />
      </div>
    );
  }

  // TreeList rendering with editing
  if (component.type === 'treelist') {
    const rows = component.treeData && component.treeData.length > 0 ? component.treeData : [{ id: 1, parentId: null, name: 'Row 1' }, { id: 2, parentId: null, name: 'Row 2' }];
    return (
      <div className={`col-md-${colSize}`}>
        {!isPreview && <button className="accordion-child-remove" onClick={removeAtPath}><i className="fa-solid fa-xmark"></i></button>}
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Tree List</div>
        <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '14px' }}>
          {rows.filter(r => r.parentId === null).map(r => (
            <li key={r.id}>{r.name}
              {rows.filter(c => c.parentId === r.id).length > 0 && (
                <ul style={{ paddingLeft: '16px' }}>
                  {rows.filter(c => c.parentId === r.id).map(c => <li key={c.id}>{c.name}</li>)}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Input field rendering
  if (component.type === 'input-field') {
    const t = component.inputType || 'text';
    return (
      <div className={`col-md-${component.colSize || 4}`}>
        {!isPreview && <button className="accordion-child-remove" onClick={removeAtPath}><i className="fa-solid fa-xmark"></i></button>}
        <div className="pb-input-outlined">
          {t === 'textarea' && <TextArea placeholder="Label" stylingMode="outlined" readOnly />}
          {t === 'dropdown' && <SelectBox placeholder="Label" stylingMode="outlined" />}
          {(t === 'date' || t === 'time') && <DateBox type={t} placeholder="Label" stylingMode="outlined" />}
          {(t === 'text' || t === 'search') && <TextBox placeholder={t === 'search' ? 'Search...' : 'Label'} stylingMode="outlined" readOnly />}
        </div>
      </div>
    );
  }

  // Default rendering
  return (
    <div className={`col-md-${colSize}`}>
      <div style={{ position: 'relative' }}>
        {!isPreview && (
          <div className="dropped-component-controls">
            <select
              className="dropped-component-size-select"
              value={colSize}
              onChange={(e) => updateAtPath({ colSize: parseInt(e.target.value) })}
            >
              <option value={12}>Full Width (12)</option>
              <option value={6}>Half (6)</option>
              <option value={4}>Third (4)</option>
              <option value={3}>Quarter (3)</option>
              <option value={8}>Two Thirds (8)</option>
              <option value={9}>Three Quarters (9)</option>
            </select>
            <button className="remove-component-btn" onClick={removeAtPath}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        )}
        {component.component}
      </div>
    </div>
  );
};

// Card component with nesting
const CardNested: React.FC<{
  component: DroppedComponent;
  path: string;
  isPreview: boolean;
  updateContent: (updater: (content: DroppedComponent[]) => DroppedComponent[]) => void;
  updateAtPath: (updates: Partial<DroppedComponent>) => void;
  removeAtPath: () => void;
  tabsActiveStates: { [tabsId: string]: number };
  setActiveTab: (tabsId: string, index: number) => void;
  stepperActiveStates: { [stepperId: string]: number };
  setActiveStep: (stepperId: string, index: number) => void;
}> = ({ component, path, isPreview, updateContent, updateAtPath, removeAtPath, tabsActiveStates, setActiveTab, stepperActiveStates, setActiveStep }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(component.title || 'Card Title');
  const colSize = component.colSize || 12;
  const children = component.children || [];

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT_EXAMPLE',
    drop: (item: { type: string; name: string; component: React.ReactElement; inputFieldType?: string; inputFieldWidth?: number }, monitor) => {
      if (monitor.didDrop() || isPreview) return;

      const newComponent: DroppedComponent = {
        id: `${item.type}-${Date.now()}`,
        type: item.type,
        name: item.name,
        component: item.component,
        colSize: 12,
        children: item.type === 'card' ? [] : undefined,
        title: item.type === 'card' ? 'Card Title' : undefined,
        accordionSections: item.type === 'accordion' ? DEFAULT_ACCORDION_SECTIONS.map(s => ({ ...s, children: [] })) : undefined,
        tabSections: (item.type === 'tabs' || item.type === 'tabs-icons') ? DEFAULT_TAB_SECTIONS.map(t => ({ ...t, children: [] })) : undefined,
        stepperSteps: (item.type === 'stepper-vertical' || item.type === 'stepper-horizontal') ? DEFAULT_STEPPER_STEPS.map(s => ({ ...s, children: [] })) : undefined,
        detailChildrenByRow: item.type === 'datagrid-expandable' ? {} : undefined,
        inputType: item.type === 'input-field' ? (item.inputFieldType as any || 'text') : undefined,
        inputWidth: item.type === 'input-field' ? (item.inputFieldWidth || 270) : undefined,
        buttonText: (item.type === 'button' || item.type === 'secondary-button' || item.type === 'tertiary-button') ? 'Button' : undefined,
        treeData: item.type === 'treelist' ? [{ id: 1, parentId: null, name: 'Row 1' }, { id: 2, parentId: null, name: 'Row 2' }, { id: 3, parentId: 2, name: 'Child of Row 2' }] : undefined,
      };

      updateAtPath({ children: [...children, newComponent] });
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver({ shallow: true }) }),
  }), [children, isPreview, updateAtPath]);

  return (
    <div className="card-standard">
      <div className="card-header-wrapper">
        {isEditingTitle ? (
          <input
            type="text"
            className="card-title-editable"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={() => {
              setIsEditingTitle(false);
              updateAtPath({ title: editedTitle });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditingTitle(false);
                updateAtPath({ title: editedTitle });
              }
            }}
            autoFocus
          />
        ) : (
          <h2
            className="card-title-standard card-title-clickable"
            onClick={() => !isPreview && setIsEditingTitle(true)}
          >
            {component.title || 'Card Title'}
          </h2>
        )}
        {!isPreview && (
          <div className="card-header-actions">
            <select
              className="dropped-component-size-select"
              value={colSize}
              onChange={(e) => updateAtPath({ colSize: parseInt(e.target.value) })}
            >
              <option value={12}>Full Width (12)</option>
              <option value={6}>Half (6)</option>
              <option value={4}>Third (4)</option>
              <option value={3}>Quarter (3)</option>
              <option value={8}>Two Thirds (8)</option>
              <option value={9}>Three Quarters (9)</option>
            </select>
            <button className="remove-component-btn" onClick={removeAtPath}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        )}
      </div>
      <div className="card-body-standard">
        <div ref={drop} className={`card-drop-zone ${isOver ? 'drag-over' : ''}`}>
          {!isPreview && children.length === 0 && (
            <div className="card-drop-placeholder">
              <i className="fa-solid fa-arrow-down"></i>
              <span>Drop components here</span>
            </div>
          )}
          {children.length > 0 && (
            <div className="card-dropped-components row">
              {children.map((child, index) => (
                <NestedComponentRenderer
                  key={child.id}
                  component={child}
                  path={`${path}.children[${index}]`}
                  isPreview={isPreview}
                  updateContent={updateContent}
                  tabsActiveStates={tabsActiveStates}
                  setActiveTab={setActiveTab}
                  stepperActiveStates={stepperActiveStates}
                  setActiveStep={setActiveStep}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Continue with Accordion, Tabs, Stepper, and ExpandableGrid in next response...

// Accordion component with dropzones in each section
const AccordionNested: React.FC<{
  component: DroppedComponent;
  path: string;
  isPreview: boolean;
  updateContent: (updater: (content: DroppedComponent[]) => DroppedComponent[]) => void;
  updateAtPath: (updates: Partial<DroppedComponent>) => void;
  removeAtPath: () => void;
  tabsActiveStates: { [tabsId: string]: number };
  setActiveTab: (tabsId: string, index: number) => void;
  stepperActiveStates: { [stepperId: string]: number };
  setActiveStep: (stepperId: string, index: number) => void;
}> = ({ component, path, isPreview, updateContent, updateAtPath, removeAtPath, tabsActiveStates, setActiveTab, stepperActiveStates, setActiveStep }) => {
  const colSize = component.colSize || 12;
  const sections = component.accordionSections || DEFAULT_ACCORDION_SECTIONS;

  return (
    <div style={{ position: 'relative' }}>
      {!isPreview && (
        <div className="dropped-component-controls">
          <select
            className="dropped-component-size-select"
            value={colSize}
            onChange={(e) => updateAtPath({ colSize: parseInt(e.target.value) })}
          >
            <option value={12}>Full Width (12)</option>
            <option value={6}>Half (6)</option>
            <option value={4}>Third (4)</option>
            <option value={3}>Quarter (3)</option>
            <option value={8}>Two Thirds (8)</option>
            <option value={9}>Three Quarters (9)</option>
          </select>
          <button className="remove-component-btn" onClick={removeAtPath}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}
      <div className="accordion">
        {sections.map((section, sectionIndex) => {
          const sectionPath = `${path}.accordionSections[${sectionIndex}]`;
          const updateSectionAtPath = (updates: Partial<AccordionSection>) => {
            updateContent(content => immutableSet(content, parsePath(sectionPath), updates) as DroppedComponent[]);
          };
          return (
            <AccordionSectionNested
              key={section.id}
              section={section}
              sectionIndex={sectionIndex}
              path={sectionPath}
              isPreview={isPreview}
              updateContent={updateContent}
              updateAtPath={updateSectionAtPath}
              tabsActiveStates={tabsActiveStates}
              setActiveTab={setActiveTab}
              stepperActiveStates={stepperActiveStates}
              setActiveStep={setActiveStep}
            />
          );
        })}
      </div>
    </div>
  );
};

const AccordionSectionNested: React.FC<{
  section: AccordionSection;
  sectionIndex: number;
  path: string;
  isPreview: boolean;
  updateContent: (updater: (content: DroppedComponent[]) => DroppedComponent[]) => void;
  updateAtPath: (updates: Partial<AccordionSection>) => void;
  tabsActiveStates: { [tabsId: string]: number };
  setActiveTab: (tabsId: string, index: number) => void;
  stepperActiveStates: { [stepperId: string]: number };
  setActiveStep: (stepperId: string, index: number) => void;
}> = ({ section, sectionIndex, path, isPreview, updateContent, updateAtPath, tabsActiveStates, setActiveTab, stepperActiveStates, setActiveStep }) => {
  const [isExpanded, setIsExpanded] = useState(sectionIndex === 3);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(section.title);
  const children = section.children || [];

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT_EXAMPLE',
    drop: (item: { type: string; name: string; component: React.ReactElement; inputFieldType?: string; inputFieldWidth?: number }, monitor) => {
      if (monitor.didDrop() || isPreview) return;

      const newComponent: DroppedComponent = {
        id: `${item.type}-${Date.now()}`,
        type: item.type,
        name: item.name,
        component: item.component,
        colSize: 12,
        children: item.type === 'card' ? [] : undefined,
        title: item.type === 'card' ? 'Card Title' : undefined,
        accordionSections: item.type === 'accordion' ? DEFAULT_ACCORDION_SECTIONS.map(s => ({ ...s, children: [] })) : undefined,
        tabSections: (item.type === 'tabs' || item.type === 'tabs-icons') ? DEFAULT_TAB_SECTIONS.map(t => ({ ...t, children: [] })) : undefined,
        stepperSteps: (item.type === 'stepper-vertical' || item.type === 'stepper-horizontal') ? DEFAULT_STEPPER_STEPS.map(s => ({ ...s, children: [] })) : undefined,
        detailChildrenByRow: item.type === 'datagrid-expandable' ? {} : undefined,
        inputType: item.type === 'input-field' ? (item.inputFieldType as any || 'text') : undefined,
        inputWidth: item.type === 'input-field' ? (item.inputFieldWidth || 270) : undefined,
      };

      updateAtPath({ children: [...children, newComponent] });
      if (!isExpanded) setIsExpanded(true);
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver({ shallow: true }) }),
  }), [children, isPreview, updateAtPath, isExpanded]);

  return (
    <div className="accordion-item">
      <div className="accordion-header" onClick={() => setIsExpanded(!isExpanded)}>
        {isEditingTitle && !isPreview ? (
          <input
            className="accordion-title-input"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={() => {
              setIsEditingTitle(false);
              updateAtPath({ title: editedTitle });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditingTitle(false);
                updateAtPath({ title: editedTitle });
              }
              e.stopPropagation();
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <h3
            className="accordion-title"
            onDoubleClick={(e) => {
              if (!isPreview) {
                e.stopPropagation();
                setIsEditingTitle(true);
              }
            }}
          >
            {section.title}
          </h3>
        )}
        <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
      </div>
      {isExpanded && (
        <div ref={drop} className={`accordion-content ${isOver ? 'drag-over-accordion' : ''}`}>
          {!isPreview && children.length === 0 && (
            <div className="accordion-drop-placeholder">
              <i className="fa-solid fa-arrow-down"></i>
              <span>Drop components here</span>
            </div>
          )}
          {children.length > 0 && (
            <div className="row">
              {children.map((child, childIndex) => (
                <NestedComponentRenderer
                  key={child.id}
                  component={child}
                  path={`${path}.children[${childIndex}]`}
                  isPreview={isPreview}
                  updateContent={updateContent}
                  tabsActiveStates={tabsActiveStates}
                  setActiveTab={setActiveTab}
                  stepperActiveStates={stepperActiveStates}
                  setActiveStep={setActiveStep}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Tabs component with dropzones in each tab panel
const TabsNested: React.FC<{
  component: DroppedComponent;
  path: string;
  isPreview: boolean;
  updateContent: (updater: (content: DroppedComponent[]) => DroppedComponent[]) => void;
  updateAtPath: (updates: Partial<DroppedComponent>) => void;
  removeAtPath: () => void;
  tabsActiveStates: { [tabsId: string]: number };
  setActiveTab: (tabsId: string, index: number) => void;
  stepperActiveStates: { [stepperId: string]: number };
  setActiveStep: (stepperId: string, index: number) => void;
}> = ({ component, path, isPreview, updateContent, updateAtPath, removeAtPath, tabsActiveStates, setActiveTab, stepperActiveStates, setActiveStep }) => {
  const colSize = component.colSize || 12;
  const sections = component.tabSections || DEFAULT_TAB_SECTIONS;
  const activeTab = tabsActiveStates[component.id] || 0;

  const addTab = () => {
    const newId = `t${Date.now()}`;
    const newTab: TabSection = {
      id: newId,
      title: `Tab ${sections.length + 1}`,
      children: []
    };
    updateAtPath({ tabSections: [...sections, newTab] });
  };

  const removeTab = (tabId: string) => {
    if (sections.length <= 1) return;
    const updatedTabs = sections.filter(t => t.id !== tabId);
    updateAtPath({ tabSections: updatedTabs });
    if (activeTab >= updatedTabs.length) {
      setActiveTab(component.id, updatedTabs.length - 1);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {!isPreview && (
        <div className="dropped-component-controls">
          <select
            className="dropped-component-size-select"
            value={colSize}
            onChange={(e) => updateAtPath({ colSize: parseInt(e.target.value) })}
          >
            <option value={12}>Full Width (12)</option>
            <option value={6}>Half (6)</option>
            <option value={4}>Third (4)</option>
            <option value={3}>Quarter (3)</option>
            <option value={8}>Two Thirds (8)</option>
            <option value={9}>Three Quarters (9)</option>
          </select>
          <button className="remove-component-btn" onClick={removeAtPath}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}
      <div className="tabs-container">
        <div className="tabs-wrapper">
          {sections.map((tab, index) => (
            <TabHeaderNested
              key={tab.id}
              tab={tab}
              index={index}
              isActive={index === activeTab}
              componentId={component.id}
              path={`${path}.tabSections[${index}]`}
              isPreview={isPreview}
              updateContent={updateContent}
              setActiveTab={setActiveTab}
              removeTab={removeTab}
              canRemove={sections.length > 1}
            />
          ))}
          {!isPreview && (
            <button className="tab-add-btn" onClick={addTab} title="Add tab">
              <i className="fa-solid fa-plus"></i>
            </button>
          )}
        </div>
        <div className="tab-content-area">
          {sections.map((tab, tabIndex) => (
            activeTab === tabIndex && (
              <TabPanelNested
                key={tab.id}
                tab={tab}
                tabIndex={tabIndex}
                path={`${path}.tabSections[${tabIndex}]`}
                isPreview={isPreview}
                updateContent={updateContent}
                tabsActiveStates={tabsActiveStates}
                setActiveTab={setActiveTab}
                stepperActiveStates={stepperActiveStates}
                setActiveStep={setActiveStep}
              />
            )
          ))}
        </div>
      </div>
    </div>
  );
};

const TabHeaderNested: React.FC<{
  tab: TabSection;
  index: number;
  isActive: boolean;
  componentId: string;
  path: string;
  isPreview: boolean;
  updateContent: (updater: (content: DroppedComponent[]) => DroppedComponent[]) => void;
  setActiveTab: (tabsId: string, index: number) => void;
  removeTab: (tabId: string) => void;
  canRemove: boolean;
}> = ({ tab, index, isActive, componentId, path, isPreview, updateContent, setActiveTab, removeTab, canRemove }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(tab.title);

  const updateTitle = () => {
    updateContent(content => immutableSet(content, parsePath(path), { title: editedTitle }) as DroppedComponent[]);
  };

  return (
    <div className="tab-item-wrapper">
      <button
        className={`tab-item ${isActive ? 'tab-item-active' : ''}`}
        onClick={() => setActiveTab(componentId, index)}
      >
        {isEditingTitle && !isPreview ? (
          <input
            className="tab-title-input"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={() => {
              setIsEditingTitle(false);
              updateTitle();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditingTitle(false);
                updateTitle();
              }
              e.stopPropagation();
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span
            onDoubleClick={(e) => {
              if (!isPreview) {
                e.stopPropagation();
                setIsEditingTitle(true);
              }
            }}
          >
            {tab.title}
          </span>
        )}
      </button>
      {!isPreview && canRemove && (
        <button
          className="tab-remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            removeTab(tab.id);
          }}
          title="Remove tab"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      )}
    </div>
  );
};

const TabPanelNested: React.FC<{
  tab: TabSection;
  tabIndex: number;
  path: string;
  isPreview: boolean;
  updateContent: (updater: (content: DroppedComponent[]) => DroppedComponent[]) => void;
  tabsActiveStates: { [tabsId: string]: number };
  setActiveTab: (tabsId: string, index: number) => void;
  stepperActiveStates: { [stepperId: string]: number };
  setActiveStep: (stepperId: string, index: number) => void;
}> = ({ tab, tabIndex, path, isPreview, updateContent, tabsActiveStates, setActiveTab, stepperActiveStates, setActiveStep }) => {
  const children = tab.children || [];

  const updateTabChildren = (newChildren: DroppedComponent[]) => {
    updateContent(content => immutableSet(content, parsePath(path), { children: newChildren }) as DroppedComponent[]);
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT_EXAMPLE',
    drop: (item: { type: string; name: string; component: React.ReactElement; inputFieldType?: string; inputFieldWidth?: number }, monitor) => {
      if (monitor.didDrop() || isPreview) return;

      const newComponent: DroppedComponent = {
        id: `${item.type}-${Date.now()}`,
        type: item.type,
        name: item.name,
        component: item.component,
        colSize: 12,
        children: item.type === 'card' ? [] : undefined,
        title: item.type === 'card' ? 'Card Title' : undefined,
        accordionSections: item.type === 'accordion' ? DEFAULT_ACCORDION_SECTIONS.map(s => ({ ...s, children: [] })) : undefined,
        tabSections: (item.type === 'tabs' || item.type === 'tabs-icons') ? DEFAULT_TAB_SECTIONS.map(t => ({ ...t, children: [] })) : undefined,
        stepperSteps: (item.type === 'stepper-vertical' || item.type === 'stepper-horizontal') ? DEFAULT_STEPPER_STEPS.map(s => ({ ...s, children: [] })) : undefined,
        detailChildrenByRow: item.type === 'datagrid-expandable' ? {} : undefined,
        inputType: item.type === 'input-field' ? (item.inputFieldType as any || 'text') : undefined,
        inputWidth: item.type === 'input-field' ? (item.inputFieldWidth || 270) : undefined,
      };

      updateTabChildren([...children, newComponent]);
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver({ shallow: true }) }),
  }), [children, isPreview, updateTabChildren]);

  return (
    <div ref={drop} className={`tab-drop-zone ${isOver ? 'tab-drop-zone-over' : ''}`}>
      {!isPreview && children.length === 0 && (
        <div className="tab-drop-placeholder">
          <i className="fa-solid fa-arrow-down"></i>
          <span>Drop components here</span>
        </div>
      )}
      {children.length > 0 && (
        <div className="tab-dropped-children row">
          {children.map((child, childIndex) => (
            <NestedComponentRenderer
              key={child.id}
              component={child}
              path={`${path}.children[${childIndex}]`}
              isPreview={isPreview}
              updateContent={updateContent}
              tabsActiveStates={tabsActiveStates}
              setActiveTab={setActiveTab}
              stepperActiveStates={stepperActiveStates}
              setActiveStep={setActiveStep}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Continue with Stepper and ExpandableGrid...

// Stepper component with dropzones in each step
const StepperNested: React.FC<{
  component: DroppedComponent;
  path: string;
  isPreview: boolean;
  updateContent: (updater: (content: DroppedComponent[]) => DroppedComponent[]) => void;
  updateAtPath: (updates: Partial<DroppedComponent>) => void;
  removeAtPath: () => void;
  tabsActiveStates: { [tabsId: string]: number };
  setActiveTab: (tabsId: string, index: number) => void;
  stepperActiveStates: { [stepperId: string]: number };
  setActiveStep: (stepperId: string, index: number) => void;
}> = ({ component, path, isPreview, updateContent, updateAtPath, removeAtPath, tabsActiveStates, setActiveTab, stepperActiveStates, setActiveStep }) => {
  const colSize = component.colSize || 12;
  const steps = component.stepperSteps || DEFAULT_STEPPER_STEPS;
  const activeStep = stepperActiveStates[component.id] || 0;
  const isVertical = component.type === 'stepper-vertical';

  const addStep = () => {
    const newId = `s${Date.now()}`;
    const newStep: StepperStep = {
      id: newId,
      label: `Step ${steps.length + 1}`,
      description: `Description for step ${steps.length + 1}`,
      children: []
    };
    updateAtPath({ stepperSteps: [...steps, newStep] });
  };

  const removeStep = (stepId: string) => {
    if (steps.length <= 1) return;
    const updatedSteps = steps.filter(s => s.id !== stepId);
    updateAtPath({ stepperSteps: updatedSteps });
    if (activeStep >= updatedSteps.length) {
      setActiveStep(component.id, updatedSteps.length - 1);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {!isPreview && (
        <div className="dropped-component-controls">
          <select
            className="dropped-component-size-select"
            value={colSize}
            onChange={(e) => updateAtPath({ colSize: parseInt(e.target.value) })}
          >
            <option value={12}>Full Width (12)</option>
            <option value={6}>Half (6)</option>
            <option value={4}>Third (4)</option>
            <option value={3}>Quarter (3)</option>
            <option value={8}>Two Thirds (8)</option>
            <option value={9}>Three Quarters (9)</option>
          </select>
          <button className="remove-component-btn" onClick={removeAtPath}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}
      <div className={`stepper-container ${isVertical ? 'stepper-vertical' : 'stepper-horizontal'}`}>
        <div className={`stepper-steps ${isVertical ? 'stepper-steps-vertical' : 'stepper-steps-horizontal'}`}>
          {steps.map((step, index) => (
            <StepHeaderNested
              key={step.id}
              step={step}
              index={index}
              isActive={index === activeStep}
              componentId={component.id}
              path={`${path}.stepperSteps[${index}]`}
              isPreview={isPreview}
              isVertical={isVertical}
              updateContent={updateContent}
              setActiveStep={setActiveStep}
              removeStep={removeStep}
              canRemove={steps.length > 1}
            />
          ))}
          {!isPreview && (
            <button className="stepper-add-btn" onClick={addStep} title="Add step">
              <i className="fa-solid fa-plus"></i> Add Step
            </button>
          )}
        </div>
        <div className="stepper-content-area">
          {steps.map((step, stepIndex) => (
            activeStep === stepIndex && (
              <StepPanelNested
                key={step.id}
                step={step}
                stepIndex={stepIndex}
                path={`${path}.stepperSteps[${stepIndex}]`}
                isPreview={isPreview}
                updateContent={updateContent}
                tabsActiveStates={tabsActiveStates}
                setActiveTab={setActiveTab}
                stepperActiveStates={stepperActiveStates}
                setActiveStep={setActiveStep}
              />
            )
          ))}
        </div>
      </div>
    </div>
  );
};

const StepHeaderNested: React.FC<{
  step: StepperStep;
  index: number;
  isActive: boolean;
  componentId: string;
  path: string;
  isPreview: boolean;
  isVertical: boolean;
  updateContent: (updater: (content: DroppedComponent[]) => DroppedComponent[]) => void;
  setActiveStep: (stepperId: string, index: number) => void;
  removeStep: (stepId: string) => void;
  canRemove: boolean;
}> = ({ step, index, isActive, componentId, path, isPreview, isVertical, updateContent, setActiveStep, removeStep, canRemove }) => {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editedLabel, setEditedLabel] = useState(step.label);

  const updateLabel = () => {
    updateContent(content => immutableSet(content, parsePath(path), { label: editedLabel }) as DroppedComponent[]);
  };

  return (
    <div className={`stepper-step ${isActive ? 'stepper-step-active' : ''}`}>
      <div className="stepper-step-number">{index + 1}</div>
      <div className="stepper-step-content" onClick={() => setActiveStep(componentId, index)}>
        {isEditingLabel && !isPreview ? (
          <input
            className="stepper-label-input"
            value={editedLabel}
            onChange={(e) => setEditedLabel(e.target.value)}
            onBlur={() => {
              setIsEditingLabel(false);
              updateLabel();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditingLabel(false);
                updateLabel();
              }
              e.stopPropagation();
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <div
            className="stepper-step-label"
            onDoubleClick={(e) => {
              if (!isPreview) {
                e.stopPropagation();
                setIsEditingLabel(true);
              }
            }}
          >
            {step.label}
          </div>
        )}
        {step.description && (
          <div className="stepper-step-description">{step.description}</div>
        )}
      </div>
      {!isPreview && canRemove && (
        <button
          className="stepper-remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            removeStep(step.id);
          }}
          title="Remove step"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      )}
    </div>
  );
};

const StepPanelNested: React.FC<{
  step: StepperStep;
  stepIndex: number;
  path: string;
  isPreview: boolean;
  updateContent: (updater: (content: DroppedComponent[]) => DroppedComponent[]) => void;
  tabsActiveStates: { [tabsId: string]: number };
  setActiveTab: (tabsId: string, index: number) => void;
  stepperActiveStates: { [stepperId: string]: number };
  setActiveStep: (stepperId: string, index: number) => void;
}> = ({ step, stepIndex, path, isPreview, updateContent, tabsActiveStates, setActiveTab, stepperActiveStates, setActiveStep }) => {
  const children = step.children || [];

  const updateStepChildren = (newChildren: DroppedComponent[]) => {
    updateContent(content => immutableSet(content, parsePath(path), { children: newChildren }) as DroppedComponent[]);
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT_EXAMPLE',
    drop: (item: { type: string; name: string; component: React.ReactElement; inputFieldType?: string; inputFieldWidth?: number }, monitor) => {
      if (monitor.didDrop() || isPreview) return;

      const newComponent: DroppedComponent = {
        id: `${item.type}-${Date.now()}`,
        type: item.type,
        name: item.name,
        component: item.component,
        colSize: 12,
        children: item.type === 'card' ? [] : undefined,
        title: item.type === 'card' ? 'Card Title' : undefined,
        accordionSections: item.type === 'accordion' ? DEFAULT_ACCORDION_SECTIONS.map(s => ({ ...s, children: [] })) : undefined,
        tabSections: (item.type === 'tabs' || item.type === 'tabs-icons') ? DEFAULT_TAB_SECTIONS.map(t => ({ ...t, children: [] })) : undefined,
        stepperSteps: (item.type === 'stepper-vertical' || item.type === 'stepper-horizontal') ? DEFAULT_STEPPER_STEPS.map(s => ({ ...s, children: [] })) : undefined,
        detailChildrenByRow: item.type === 'datagrid-expandable' ? {} : undefined,
        inputType: item.type === 'input-field' ? (item.inputFieldType as any || 'text') : undefined,
        inputWidth: item.type === 'input-field' ? (item.inputFieldWidth || 270) : undefined,
      };

      updateStepChildren([...children, newComponent]);
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver({ shallow: true }) }),
  }), [children, isPreview, updateStepChildren]);

  return (
    <div ref={drop} className={`stepper-drop-zone ${isOver ? 'stepper-drop-zone-over' : ''}`}>
      {!isPreview && children.length === 0 && (
        <div className="stepper-drop-placeholder">
          <i className="fa-solid fa-arrow-down"></i>
          <span>Drop components here</span>
        </div>
      )}
      {children.length > 0 && (
        <div className="stepper-dropped-children row">
          {children.map((child, childIndex) => (
            <NestedComponentRenderer
              key={child.id}
              component={child}
              path={`${path}.children[${childIndex}]`}
              isPreview={isPreview}
              updateContent={updateContent}
              tabsActiveStates={tabsActiveStates}
              setActiveTab={setActiveTab}
              stepperActiveStates={stepperActiveStates}
              setActiveStep={setActiveStep}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Expandable DataGrid with dropzones in expanded rows
const ExpandableGridNested: React.FC<{
  component: DroppedComponent;
  path: string;
  isPreview: boolean;
  updateContent: (updater: (content: DroppedComponent[]) => DroppedComponent[]) => void;
  updateAtPath: (updates: Partial<DroppedComponent>) => void;
  removeAtPath: () => void;
  tabsActiveStates: { [tabsId: string]: number };
  setActiveTab: (tabsId: string, index: number) => void;
  stepperActiveStates: { [stepperId: string]: number };
  setActiveStep: (stepperId: string, index: number) => void;
}> = ({ component, path, isPreview, updateContent, updateAtPath, removeAtPath, tabsActiveStates, setActiveTab, stepperActiveStates, setActiveStep }) => {
  const colSize = component.colSize || 12;
  const detailChildrenByRow = component.detailChildrenByRow || {};

  const gridData = [
    { id: 1, link: 'Link 1', name: 'Item 1', category: 'Category A' },
    { id: 2, link: 'Link 2', name: 'Item 2', category: 'Category B' },
    { id: 3, link: 'Link 3', name: 'Item 3', category: 'Category C' },
  ];

  const renderMasterDetail = (rowData: any) => {
    const rowKey = `row-${rowData.id}`;
    const children = detailChildrenByRow[rowKey] || [];

    const updateRowChildren = (newChildren: DroppedComponent[]) => {
      const updatedDetails = { ...detailChildrenByRow, [rowKey]: newChildren };
      updateAtPath({ detailChildrenByRow: updatedDetails });
    };

    const [{ isOver }, drop] = useDrop(() => ({
      accept: 'COMPONENT_EXAMPLE',
      drop: (item: { type: string; name: string; component: React.ReactElement; inputFieldType?: string; inputFieldWidth?: number }, monitor) => {
        if (monitor.didDrop() || isPreview) return;

        const newComponent: DroppedComponent = {
          id: `${item.type}-${Date.now()}`,
          type: item.type,
          name: item.name,
          component: item.component,
          colSize: 12,
          children: item.type === 'card' ? [] : undefined,
          title: item.type === 'card' ? 'Card Title' : undefined,
          accordionSections: item.type === 'accordion' ? DEFAULT_ACCORDION_SECTIONS.map(s => ({ ...s, children: [] })) : undefined,
          tabSections: (item.type === 'tabs' || item.type === 'tabs-icons') ? DEFAULT_TAB_SECTIONS.map(t => ({ ...t, children: [] })) : undefined,
          stepperSteps: (item.type === 'stepper-vertical' || item.type === 'stepper-horizontal') ? DEFAULT_STEPPER_STEPS.map(s => ({ ...s, children: [] })) : undefined,
          detailChildrenByRow: item.type === 'datagrid-expandable' ? {} : undefined,
          inputType: item.type === 'input-field' ? (item.inputFieldType as any || 'text') : undefined,
          inputWidth: item.type === 'input-field' ? (item.inputFieldWidth || 270) : undefined,
        };

        updateRowChildren([...children, newComponent]);
      },
      collect: (monitor) => ({ isOver: !!monitor.isOver({ shallow: true }) }),
    }), [children, isPreview, updateRowChildren]);

    return (
      <div ref={drop} className={`expandable-grid-detail ${isOver ? 'drag-over' : ''}`}>
        {!isPreview && children.length === 0 && (
          <div className="grid-detail-placeholder">
            <i className="fa-solid fa-arrow-down"></i>
            <span>Drop components here</span>
          </div>
        )}
        {children.length > 0 && (
          <div className="row">
            {children.map((child, childIndex) => (
              <NestedComponentRenderer
                key={child.id}
                component={child}
                path={`${path}.detailChildrenByRow['${rowKey}'][${childIndex}]`}
                isPreview={isPreview}
                updateContent={updateContent}
                tabsActiveStates={tabsActiveStates}
                setActiveTab={setActiveTab}
                stepperActiveStates={stepperActiveStates}
                setActiveStep={setActiveStep}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      {!isPreview && (
        <div className="dropped-component-controls">
          <select
            className="dropped-component-size-select"
            value={colSize}
            onChange={(e) => updateAtPath({ colSize: parseInt(e.target.value) })}
          >
            <option value={12}>Full Width (12)</option>
            <option value={6}>Half (6)</option>
            <option value={4}>Third (4)</option>
            <option value={3}>Quarter (3)</option>
            <option value={8}>Two Thirds (8)</option>
            <option value={9}>Three Quarters (9)</option>
          </select>
          <button className="remove-component-btn" onClick={removeAtPath}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}
      <DataGrid
        keyExpr="id"
        dataSource={gridData}
        showBorders={false}
        showColumnLines={false}
        showRowLines={true}
        hoverStateEnabled={true}
        rowAlternationEnabled={true}
        columnAutoWidth={true}
      >
        <Column dataField="link" caption="Link" />
        <Column dataField="name" caption="Name" />
        <Column dataField="category" caption="Category" />
        <Paging enabled={true} pageSize={10} />
        <Scrolling mode="standard" />
        <MasterDetail enabled={true} render={renderMasterDetail} />
      </DataGrid>
    </div>
  );
};
