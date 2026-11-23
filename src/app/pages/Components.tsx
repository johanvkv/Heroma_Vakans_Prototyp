/**
 * COMPONENTS PAGE
 * Showcase of all reusable components
 */
import React from 'react';
import { DndProvider, useDrag } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Layout } from '../components/Layout';
import { BreadcrumbItem } from '../components/Breadcrumbs';
import { Badge } from '../components/Badge';
import { CardMenu } from '../components/CardMenu';
import { EmployeeActionsMenu } from '../components/EmployeeActionsMenu';
import { SimpleActionsMenu } from '../components/SimpleActionsMenu';
import { Label } from '../components/Label';
import { DigitBadge } from '../components/DigitBadge';
import { IconBadge } from '../components/IconBadge';
import { StatusBadge } from '../components/StatusBadge';
import { IndicatorBadge } from '../components/IndicatorBadge';
import { Stepper } from '../components/Stepper';
import { VerticalStepper } from '../components/VerticalStepper';
import { Accordion } from '../components/Accordion';
import { Tabs } from '../components/Tabs';
import { TabsWithIcons } from '../components/TabsWithIcons';
import { TextArea } from '../components/TextArea';
import { TextSearch } from '../components/TextSearch';
import { Dropdown } from '../components/Dropdown';
import { CodeDisplay } from '../components/CodeDisplay';
import { PageBuilder } from '../../page-builder-studio/PageBuilder';
import { DraggableComponentExample } from '../components/DraggableComponentExample';
import { CodeExportModal } from '../components/CodeExportModal';
import { getComponentCode } from '../utils/codeGenerator';
import DataGrid, { Column, Paging, Scrolling, Selection, MasterDetail, SearchPanel, ColumnChooser } from 'devextreme-react/data-grid';
import DxTreeList, { Column as TreeColumn, Paging as TreePaging, Scrolling as TreeScrolling } from 'devextreme-react/tree-list';
import DxScheduler, { View as DxSchedulerView } from 'devextreme-react/scheduler';
import DxTextBox from 'devextreme-react/text-box';
import DxTextArea from 'devextreme-react/text-area';
import DxDateBox from 'devextreme-react/date-box';
import DxSelectBox from 'devextreme-react/select-box';
import Chart, { Series, ArgumentAxis, ValueAxis, Legend } from 'devextreme-react/chart';
import { StackedBarChart } from '../components/StackedBarChart';
import { StackedAreaChart } from '../components/StackedAreaChart';
import { PieChartComponent } from '../components/PieChartComponent';
import { DensityCurveChart } from '../components/DensityCurveChart';
import { ProgressBarChart } from '../components/ProgressBarChart';
import { ProgressGaugeChart } from '../components/ProgressGaugeChart';
import { NavigationSidebar } from '../components/NavigationSidebar';
import { SegmentedButtons } from '../components/SegmentedButtons';
import { Divider } from '../components/Divider';
import { Spacer } from '../components/Spacer';
import { Alert } from '../components/Alert';

type ComponentId = 'badge' | 'digitbadge' | 'statusbadge' | 'indicatorbadge' | 'button' | 'segmented' | 'card' | 'block' | 'datagrid' | 'treelist' | 'scheduler' | 'chart' | 'menu' | 'icons' | 'label' | 'input' | 'stepper' | 'accordion' | 'tabs' | 'text' | 'sidebar' | 'helpers' | 'alerts' | 'variables';

const gridSampleData = [
  { id: 1, link: 'Name', subLink: 'ID: 001234', name: 'John Smith', idNumber: '123ABC', amount: '1,234,567.89', percentage: 13.67, tag: 'Info',    labelType: 'info' },
  { id: 2, link: 'Name', subLink: 'ID: 002345', name: 'Jane Smith', idNumber: '456ABC', amount: '1,234,567.89', percentage: 59.00, tag: '',        labelType: '' },
  { id: 3, link: 'Name', subLink: 'ID: 003456', name: 'John Doe',   idNumber: '789ABC', amount: '1,234,567.89', percentage: 47.25, tag: 'Warning', labelType: 'warning' },
  { id: 4, link: 'Name', subLink: 'ID: 004567', name: 'Jane Doe',   idNumber: '123DEF', amount: '1,234,567.89', percentage: 99.99, tag: 'Error',   labelType: 'error' },
];

const GridDetailView = ({ data }: { data: any }) => {
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

const GridActionsCell = ({ data }: { data: any }) => {
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

const GridLinkCell = ({ value }: { value?: string }) => (
  <span className="datagrid-link-cell">{value ?? ''}</span>
);

const GridSubtleLabelCell = ({ data }: { data: any }) => {
  if (!data || !('name' in data)) return <span />;
  return (
    <div className="datagrid-label-cell">
      <span>{data.name}</span>
      {data.tag && (
        <span className={`label-subtle label-${data.labelType || 'default'}`}>
          {data.tag}
        </span>
      )}
    </div>
  );
};

type MenuItem = 'home' | 'getting-started' | 'styles' | 'components' | 'updates' | ComponentId;

export const Components = () => {
  const [selectedMenuItem, setSelectedMenuItem] = React.useState<MenuItem>('getting-started');
  const [selectedComponent, setSelectedComponent] = React.useState<ComponentId>('stepper');
  const [pageBuilderWidth, setPageBuilderWidth] = React.useState(50); // percentage
  const [isResizing, setIsResizing] = React.useState(false);
  const [isComponentsExpanded, setIsComponentsExpanded] = React.useState(true);
  const [codeExportModal, setCodeExportModal] = React.useState<{ isOpen: boolean; code: string; title: string }>({
    isOpen: false,
    code: '',
    title: ''
  });

  const [inputFieldType, setInputFieldType] = React.useState<'text' | 'date' | 'time' | 'search' | 'dropdown' | 'textarea'>('text');
  const [inputFieldWidth, setInputFieldWidth] = React.useState(270);

  const [gridFeatures, setGridFeatures] = React.useState({
    selection: false,
    columnChooser: false,
    sorting: true,
    searchPanel: false,
    expandable: false,
    actions: false
  });

  const [alertWithLink, setAlertWithLink] = React.useState(false);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Heroma', href: '/' },
    { label: 'Components', isActive: true }
  ];

  const mainMenuItems = [
    { id: 'home' as MenuItem, name: 'Home', icon: 'fa-home' },
    { id: 'getting-started' as MenuItem, name: 'Getting Started', icon: 'fa-rocket' },
    { id: 'styles' as MenuItem, name: 'Styles', icon: 'fa-palette' },
    { id: 'updates' as MenuItem, name: 'Updates', icon: 'fa-bell' },
  ];

  const components = [
    { id: 'stepper' as ComponentId, name: 'Stepper', icon: 'fa-list-ol' },
    { id: 'accordion' as ComponentId, name: 'Accordion', icon: 'fa-bars-staggered' },
    { id: 'tabs' as ComponentId, name: 'Tabs', icon: 'fa-folder-open' },
    { id: 'sidebar' as ComponentId, name: 'Sidebar', icon: 'fa-bars' },
    { id: 'text' as ComponentId, name: 'Text', icon: 'fa-font' },
    { id: 'label' as ComponentId, name: 'Labels', icon: 'fa-tag' },
    { id: 'input' as ComponentId, name: 'Input Fields', icon: 'fa-keyboard' },
    { id: 'digitbadge' as ComponentId, name: 'Digit Badges', icon: 'fa-hashtag' },
    { id: 'badge' as ComponentId, name: 'Icon Badges', icon: 'fa-certificate' },
    { id: 'statusbadge' as ComponentId, name: 'Status Badges', icon: 'fa-circle' },
    { id: 'indicatorbadge' as ComponentId, name: 'Indicator Badges', icon: 'fa-circle-dot' },
    { id: 'button' as ComponentId, name: 'Button', icon: 'fa-square' },
    { id: 'alerts' as ComponentId, name: 'Alerts', icon: 'fa-triangle-exclamation' },
    { id: 'card' as ComponentId, name: 'Card', icon: 'fa-table-cells' },
    { id: 'block' as ComponentId, name: 'Blocks', icon: 'fa-table-cells' },
    { id: 'datagrid' as ComponentId, name: 'DataGrid', icon: 'fa-table' },
    { id: 'treelist' as ComponentId, name: 'Tree List', icon: 'fa-list-tree' },
    { id: 'scheduler' as ComponentId, name: 'Scheduler', icon: 'fa-calendar-days' },
    { id: 'chart' as ComponentId, name: 'Chart', icon: 'fa-chart-area' },
    { id: 'menu' as ComponentId, name: 'Menu', icon: 'fa-ellipsis-vertical' },
    { id: 'helpers' as ComponentId, name: 'Helpers', icon: 'fa-toolbox' },
    { id: 'icons' as ComponentId, name: 'Icons', icon: 'fa-icons' },
  ];

  const handleMenuItemClick = (itemId: MenuItem) => {
    setSelectedMenuItem(itemId);
    if (itemId === 'components') {
      setIsComponentsExpanded(!isComponentsExpanded);
    } else if (components.some(c => c.id === itemId)) {
      setSelectedComponent(itemId as ComponentId);
      setSelectedMenuItem('components');
      setIsComponentsExpanded(true);
    }
  };

  const handleComponentClick = (componentId: ComponentId) => {
    setSelectedComponent(componentId);
    setSelectedMenuItem(componentId);
  };

  // Sample data for examples
  const sampleEmployees = [
    { name: 'Johan Karlsson', id: '11684C', status: 'Sjuk' },
    { name: 'Anna Andersson', id: '41664C', status: '' },
    { name: 'Frida Abrosson', id: '78868C', status: 'Tjänstledig' }
  ];

  const sampleChartData = [
    { month: 'Jan', value: 300 },
    { month: 'Feb', value: 280 },
    { month: 'Mar', value: 350 },
    { month: 'Apr', value: 320 }
  ];

  const openCodeExport = (componentType: string, componentName: string) => {
    const code = getComponentCode(componentType);
    setCodeExportModal({
      isOpen: true,
      code,
      title: `${componentName} - Implementation Code`
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const windowWidth = window.innerWidth;
      const newWidth = ((windowWidth - e.clientX) / windowWidth) * 100;

      // Constrain between 20% and 60%
      if (newWidth >= 20 && newWidth <= 60) {
        setPageBuilderWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    if (isResizing) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const MinimizedDraggableItem: React.FC<{ type: string; name: string; label: string; component: React.ReactElement }> = ({ type, name, label, component }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'COMPONENT_EXAMPLE',
      item: { type, name, component },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }), [type, name, component]);

    const itemStyle = {
      padding: '12px 16px',
      background: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: '4px',
      cursor: isDragging ? 'grabbing' : 'grab',
      transition: 'all 0.2s',
      fontSize: '14px',
      fontWeight: 500,
      color: 'var(--foreground)',
      userSelect: 'none' as const,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      opacity: isDragging ? 0.5 : 1
    };

    return (
      <div ref={drag} style={itemStyle}>
        <i className="fa-solid fa-grip-vertical" style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}></i>
        <span>{label}</span>
      </div>
    );
  };

  const renderMinimizedComponents = () => {
    const minimizedStyle = {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px'
    };

    switch (selectedComponent) {
      case 'stepper':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="stepper"
              name="Stepper"
              label="Horizontal Stepper"
              component={
                <Stepper
                  steps={[
                    { label: 'Personal Information' },
                    { label: 'Address' },
                    { label: 'Review' },
                    { label: 'Complete' }
                  ]}
                  currentStep={1}
                />
              }
            />
            <MinimizedDraggableItem
              type="verticalstepper"
              name="Vertical Stepper"
              label="Vertical Stepper"
              component={
                <VerticalStepper
                  steps={[
                    { label: 'Step title', content: undefined },
                    {
                      label: 'Step title',
                      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque tellus leo, iaculis id consectetur vel, lacinia sit amet lectus. Vivamus porta turpis ut venenis lobortis. Proin vel mi ac risus ultricies accumsan.'
                    },
                    { label: 'Step title', content: undefined },
                    { label: 'Step title', content: undefined },
                    { label: 'Step title', content: undefined }
                  ]}
                  currentStep={1}
                  onBack={() => console.log('Back clicked')}
                  onCancel={() => console.log('Cancel clicked')}
                  onNext={() => console.log('Next clicked')}
                />
              }
            />
          </div>
        );

      case 'accordion':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="accordion"
              name="Accordion"
              label="Accordion"
              component={<Accordion />}
            />
          </div>
        );

      case 'tabs':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="tabs"
              name="Tabs"
              label="Tabs"
              component={<Tabs />}
            />
            <MinimizedDraggableItem
              type="tabs-icons"
              name="Tabs with Icons"
              label="Tabs with Icons"
              component={<TabsWithIcons />}
            />
          </div>
        );

      case 'text':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="text-card-title"
              name="Card Title"
              label="Card Title"
              component={<h2 className="card-title-standard">Card Title</h2>}
            />
            <MinimizedDraggableItem
              type="text-20"
              name="20 Words"
              label="20 Words"
              component={<p className="text-component">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p>}
            />
            <MinimizedDraggableItem
              type="text-list"
              name="Bullet List"
              label="Bullet List"
              component={
                <ul className="text-component text-list">
                  <li>First item in the list</li>
                  <li>Second item with more content</li>
                  <li>Third item to demonstrate structure</li>
                </ul>
              }
            />
            <MinimizedDraggableItem
              type="text-link"
              name="Link"
              label="Link"
              component={<a href="#" className="text-component text-link" onClick={(e) => e.preventDefault()}>Click here to learn more</a>}
            />
          </div>
        );

      case 'button':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="button"
              name="Primary Button"
              label="Primary Button"
              component={<button className="btn-primary">Button</button>}
            />
            <MinimizedDraggableItem
              type="secondary-button"
              name="Secondary Button"
              label="Secondary Button"
              component={<button className="btn-secondary">Button</button>}
            />
            <MinimizedDraggableItem
              type="tertiary-button"
              name="Tertiary Button"
              label="Tertiary Button"
              component={<button className="btn-tertiary">Button</button>}
            />
            <MinimizedDraggableItem
              type="segmented-text"
              name="Segmented Buttons Text"
              label="Segmented - Text Only"
              component={<SegmentedButtons type="text" />}
            />
            <MinimizedDraggableItem
              type="segmented-icons-text"
              name="Segmented Buttons Icons & Text"
              label="Segmented - Icons & Text"
              component={<SegmentedButtons type="icons-text" />}
            />
            <MinimizedDraggableItem
              type="segmented-icons"
              name="Segmented Buttons Icons"
              label="Segmented - Icons Only"
              component={<SegmentedButtons type="icons" />}
            />
          </div>
        );

      case 'sidebar':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="sidebar"
              name="Navigation Sidebar"
              label="Navigation Sidebar"
              component={<NavigationSidebar />}
            />
          </div>
        );

      case 'alerts':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="alert-info"
              name="Info Alert"
              label="Info Alert"
              component={<Alert variant="info" message="This is an info alert" showLink={alertWithLink} />}
            />
            <MinimizedDraggableItem
              type="alert-warning"
              name="Warning Alert"
              label="Warning Alert"
              component={<Alert variant="warning" message="This is a warning alert" showLink={alertWithLink} />}
            />
            <MinimizedDraggableItem
              type="alert-error"
              name="Error Alert"
              label="Error Alert"
              component={<Alert variant="error" message="This is an error alert" showLink={alertWithLink} />}
            />
            <MinimizedDraggableItem
              type="alert-success"
              name="Success Alert"
              label="Success Alert"
              component={<Alert variant="success" message="This is a success alert" showLink={alertWithLink} />}
            />
          </div>
        );

      case 'block':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="block"
              name="Block"
              label="Block"
              component={<div className="block-standard"><div className="block-header-wrapper"></div></div>}
            />
          </div>
        );

      case 'card':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="card"
              name="Card"
              label="Card"
              component={
                <div className="card-standard" style={{ width: '400px' }}>
                  <div className="card-header-wrapper">
                    <h2 className="card-title-standard">Card Title</h2>
                    <div className="card-header-actions">
                      <button className="btn-secondary">Action</button>
                      <CardMenu />
                    </div>
                  </div>
                  <div className="card-body-standard">
                    <p>This is the card body content. Cards can contain any type of content.</p>
                  </div>
                </div>
              }
            />
          </div>
        );

      case 'datagrid':
        return (
          <div style={minimizedStyle}>
            <div style={{ padding: '12px', fontSize: '12px', color: 'var(--muted-foreground)', textAlign: 'center' }}>
              Expand to configure grid features
            </div>
          </div>
        );

      case 'treelist':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="treelist"
              name="Tree List"
              label="Tree List"
              component={<i className="fa-solid fa-list-tree" style={{ fontSize: '16px' }}></i>}
            />
          </div>
        );

      case 'scheduler':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="scheduler"
              name="Scheduler"
              label="Scheduler"
              component={<i className="fa-solid fa-calendar-days" style={{ fontSize: '16px' }}></i>}
            />
          </div>
        );

      case 'chart':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="stackedbar"
              name="Stacked Bar Chart"
              label="Stacked Bar Chart"
              component={<StackedBarChart />}
            />
            <MinimizedDraggableItem
              type="stackedarea"
              name="Stacked Area Chart"
              label="Stacked Area Chart"
              component={<StackedAreaChart />}
            />
            <MinimizedDraggableItem
              type="piechart"
              name="Pie Chart"
              label="Pie Chart"
              component={<PieChartComponent />}
            />
            <MinimizedDraggableItem
              type="densitycurve"
              name="Density Curve Chart"
              label="Density Curve Chart"
              component={<DensityCurveChart />}
            />
            <MinimizedDraggableItem
              type="progressbar"
              name="Progress Bar Chart"
              label="Progress Bar Chart"
              component={<ProgressBarChart />}
            />
            <MinimizedDraggableItem
              type="progressgauge"
              name="Progress Gauge Chart"
              label="Progress Gauge Chart"
              component={<ProgressGaugeChart />}
            />
          </div>
        );

      case 'input':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="input"
              name="Input Field"
              label="Input Field"
              component={
                <div className="input-field">
                  <input type="text" className="input-field-control" placeholder="Label" />
                </div>
              }
            />
            <MinimizedDraggableItem
              type="text-area"
              name="Text Area"
              label="Text Area"
              component={<TextArea label="Label" maxLength={50} rows={2} />}
            />
            <MinimizedDraggableItem
              type="text-search"
              name="Text Search"
              label="Text Search"
              component={<TextSearch label="Label" />}
            />
            <MinimizedDraggableItem
              type="dropdown"
              name="Dropdown"
              label="Dropdown"
              component={
                <Dropdown
                  options={['Option 1', 'Option 2', 'Option 3', 'Option 4']}
                  placeholder="Label"
                  label="Label"
                />
              }
            />
          </div>
        );

      case 'label':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="label"
              name="Label Default"
              label="Label Default"
              component={<Label type="default">Default</Label>}
            />
            <MinimizedDraggableItem
              type="label"
              name="Label Info"
              label="Label Info"
              component={<Label type="info">Info</Label>}
            />
            <MinimizedDraggableItem
              type="label"
              name="Label Success"
              label="Label Success"
              component={<Label type="success">Success</Label>}
            />
            <MinimizedDraggableItem
              type="label"
              name="Label Warning"
              label="Label Warning"
              component={<Label type="warning">Warning</Label>}
            />
            <MinimizedDraggableItem
              type="label"
              name="Label Error"
              label="Label Error"
              component={<Label type="error">Error</Label>}
            />
            <MinimizedDraggableItem
              type="label"
              name="Label Default Subtle"
              label="Label Default Subtle"
              component={<Label type="default" variant="subtle">Default</Label>}
            />
            <MinimizedDraggableItem
              type="label"
              name="Label Info Subtle"
              label="Label Info Subtle"
              component={<Label type="info" variant="subtle">Info</Label>}
            />
            <MinimizedDraggableItem
              type="label"
              name="Label Success Subtle"
              label="Label Success Subtle"
              component={<Label type="success" variant="subtle">Success</Label>}
            />
            <MinimizedDraggableItem
              type="label"
              name="Label Warning Subtle"
              label="Label Warning Subtle"
              component={<Label type="warning" variant="subtle">Warning</Label>}
            />
            <MinimizedDraggableItem
              type="label"
              name="Label Error Subtle"
              label="Label Error Subtle"
              component={<Label type="error" variant="subtle">Error</Label>}
            />
          </div>
        );

      case 'digitbadge':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="digitbadge"
              name="Digit Badge Regular Info Single"
              label="Regular Info (Single)"
              component={<DigitBadge count={8} type="info" size="regular" />}
            />
            <MinimizedDraggableItem
              type="digitbadge"
              name="Digit Badge Regular Info Pill"
              label="Regular Info (Pill)"
              component={<DigitBadge count={246} type="info" size="regular" />}
            />
            <MinimizedDraggableItem
              type="digitbadge"
              name="Digit Badge Regular Error Single"
              label="Regular Error (Single)"
              component={<DigitBadge count={8} type="error" size="regular" />}
            />
            <MinimizedDraggableItem
              type="digitbadge"
              name="Digit Badge Regular Error Pill"
              label="Regular Error (Pill)"
              component={<DigitBadge count={246} type="error" size="regular" />}
            />
            <MinimizedDraggableItem
              type="digitbadge"
              name="Digit Badge Small Info Single"
              label="Small Info (Single)"
              component={<DigitBadge count={8} type="info" size="small" />}
            />
            <MinimizedDraggableItem
              type="digitbadge"
              name="Digit Badge Small Info Pill"
              label="Small Info (Pill)"
              component={<DigitBadge count={246} type="info" size="small" />}
            />
            <MinimizedDraggableItem
              type="digitbadge"
              name="Digit Badge Small Error Single"
              label="Small Error (Single)"
              component={<DigitBadge count={8} type="error" size="small" />}
            />
            <MinimizedDraggableItem
              type="digitbadge"
              name="Digit Badge Small Error Pill"
              label="Small Error (Pill)"
              component={<DigitBadge count={246} type="error" size="small" />}
            />
          </div>
        );

      case 'badge':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="iconbadge"
              name="Icon Badge Info"
              label="Icon Badge Info"
              component={<IconBadge type="info" icon="fa-info" />}
            />
            <MinimizedDraggableItem
              type="iconbadge"
              name="Icon Badge Success"
              label="Icon Badge Success"
              component={<IconBadge type="success" icon="fa-check" />}
            />
            <MinimizedDraggableItem
              type="iconbadge"
              name="Icon Badge Warning"
              label="Icon Badge Warning"
              component={<IconBadge type="warning" icon="fa-exclamation" />}
            />
            <MinimizedDraggableItem
              type="iconbadge"
              name="Icon Badge Error"
              label="Icon Badge Error"
              component={<IconBadge type="error" icon="fa-xmark" />}
            />
          </div>
        );

      case 'statusbadge':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="statusbadge"
              name="Status Badge Offline"
              label="Status Badge Offline"
              component={<StatusBadge status="offline" />}
            />
            <MinimizedDraggableItem
              type="statusbadge"
              name="Status Badge Available"
              label="Status Badge Available"
              component={<StatusBadge status="available" />}
            />
            <MinimizedDraggableItem
              type="statusbadge"
              name="Status Badge Away"
              label="Status Badge Away"
              component={<StatusBadge status="away" />}
            />
            <MinimizedDraggableItem
              type="statusbadge"
              name="Status Badge Busy"
              label="Status Badge Busy"
              component={<StatusBadge status="busy" />}
            />
          </div>
        );

      case 'indicatorbadge':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="indicatorbadge"
              name="Indicator Badge Info"
              label="Indicator Badge Info"
              component={<IndicatorBadge type="info" />}
            />
            <MinimizedDraggableItem
              type="indicatorbadge"
              name="Indicator Badge Success"
              label="Indicator Badge Success"
              component={<IndicatorBadge type="success" />}
            />
            <MinimizedDraggableItem
              type="indicatorbadge"
              name="Indicator Badge Warning"
              label="Indicator Badge Warning"
              component={<IndicatorBadge type="warning" />}
            />
            <MinimizedDraggableItem
              type="indicatorbadge"
              name="Indicator Badge Error"
              label="Indicator Badge Error"
              component={<IndicatorBadge type="error" />}
            />
          </div>
        );

      case 'menu':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="menu"
              name="Card Menu"
              label="Card Menu"
              component={<CardMenu />}
            />
            <MinimizedDraggableItem
              type="menu"
              name="Employee Actions Menu"
              label="Employee Actions Menu"
              component={<EmployeeActionsMenu employeeName="Johan Karlsson" />}
            />
            <MinimizedDraggableItem
              type="menu"
              name="Simple Actions Menu"
              label="Simple Actions Menu"
              component={<SimpleActionsMenu personName="Anna Andersson" />}
            />
          </div>
        );

      case 'helpers':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="divider"
              name="Divider"
              label="Divider"
              component={<Divider />}
            />
            <MinimizedDraggableItem
              type="spacer"
              name="Spacer"
              label="Spacer (10px)"
              component={<Spacer />}
            />
          </div>
        );

      case 'icons':
        return (
          <div style={minimizedStyle}>
            <MinimizedDraggableItem
              type="icon"
              name="Icon House"
              label="Icon House"
              component={<i className="fa-solid fa-house" style={{ fontSize: '16px' }}></i>}
            />
            <MinimizedDraggableItem
              type="icon"
              name="Icon Gauge"
              label="Icon Gauge"
              component={<i className="fa-solid fa-gauge" style={{ fontSize: '16px' }}></i>}
            />
            <MinimizedDraggableItem
              type="icon"
              name="Icon Users"
              label="Icon Users"
              component={<i className="fa-solid fa-users" style={{ fontSize: '16px' }}></i>}
            />
            <MinimizedDraggableItem
              type="icon"
              name="Icon Arrow Right"
              label="Icon Arrow Right"
              component={<i className="fa-solid fa-arrow-right" style={{ fontSize: '16px' }}></i>}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderComponentExample = () => {
    switch (selectedComponent) {
      case 'stepper':
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Stepper Component</h3>
            <p className="component-showcase-description">
              Steppers display progress through a sequence of logical and numbered steps. They guide users through
              a multi-step process with visual feedback on completion. Available in horizontal and vertical layouts.
            </p>
            <div className="component-showcase-examples">
              <div className="component-showcase-example-full">
                <h4 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>Horizontal Stepper</h4>
                <DraggableComponentExample type="stepper" name="Stepper" className="draggable-example-full-width">
                  <Stepper
                    steps={[
                      { label: 'Personal Information' },
                      { label: 'Address' },
                      { label: 'Review' },
                      { label: 'Complete' }
                    ]}
                    currentStep={1}
                  />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example-full" style={{ marginTop: '32px' }}>
                <h4 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>Vertical Stepper</h4>
                <DraggableComponentExample type="verticalstepper" name="Vertical Stepper" className="draggable-example-full-width">
                  <VerticalStepper
                    steps={[
                      { label: 'Step title', content: undefined },
                      {
                        label: 'Step title',
                        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque tellus leo, iaculis id consectetur vel, lacinia sit amet lectus. Vivamus porta turpis ut venenis lobortis. Proin vel mi ac risus ultricies accumsan.'
                      },
                      { label: 'Step title', content: undefined },
                      { label: 'Step title', content: undefined },
                      { label: 'Step title', content: undefined }
                    ]}
                    currentStep={1}
                    onBack={() => console.log('Back clicked')}
                    onCancel={() => console.log('Cancel clicked')}
                    onNext={() => console.log('Next clicked')}
                  />
                </DraggableComponentExample>
              </div>
            </div>
            <div style={{ marginTop: '24px', marginBottom: '16px' }}>
              <button
                className="btn-primary"
                onClick={() => openCodeExport('stepper', 'Stepper')}
              >
                <i className="fa-solid fa-code" style={{ marginRight: '8px' }}></i>
                Export Full Component Code
              </button>
            </div>
            <CodeDisplay
              markup={`// Horizontal Stepper
<Stepper
  steps={[
    { label: 'Personal Information' },
    { label: 'Address' },
    { label: 'Review' }
  ]}
  currentStep={1}
/>

// Vertical Stepper
<VerticalStepper
  steps={[
    { label: 'Step 1', content: 'Description...' },
    { label: 'Step 2', content: 'Description...' }
  ]}
  currentStep={1}
  onBack={() => console.log('Back')}
  onCancel={() => console.log('Cancel')}
  onNext={() => console.log('Next')}
/>`}
              css={`.stepper-horizontal-circle {
  width: 24px;
  height: 24px;
  border-radius: 100px;
  background-color: var(--color-white);
  border: 1px solid var(--input-border);
}

.stepper-horizontal-circle-completed {
  background-color: var(--stepper-completed);
  border-color: var(--stepper-completed);
  color: var(--color-white);
}`}
            />
          </div>
        );

      case 'accordion':
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Accordion Component</h3>
            <p className="component-showcase-description">
              Accordions allow users to expand and collapse content sections. Only one section can be expanded at a time,
              making them ideal for FAQs and grouped content.
            </p>
            <div className="component-showcase-examples">
              <div className="component-showcase-example-full">
                <DraggableComponentExample type="accordion" name="Accordion" className="draggable-example-full-width">
                  <Accordion />
                </DraggableComponentExample>
              </div>
            </div>
            <div style={{ marginTop: '24px', marginBottom: '16px' }}>
              <button
                className="btn-primary"
                onClick={() => openCodeExport('accordion', 'Accordion')}
              >
                <i className="fa-solid fa-code" style={{ marginRight: '8px' }}></i>
                Export Full Component Code
              </button>
            </div>
            <CodeDisplay
              markup={`<Accordion />`}
              css={`.accordion-section {
  border-bottom: 1px solid var(--border-color);
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
}

.accordion-content {
  padding: 0 16px 16px;
}

.accordion-icon {
  width: 24px;
  height: 24px;
}`}
            />
          </div>
        );

      case 'tabs':
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Tabs Component</h3>
            <p className="component-showcase-description">
              Tabs organize content into separate views where only one view is visible at a time.
              Available in two variants: text-only and with icons.
            </p>
            <div className="component-showcase-examples">
              <div className="component-showcase-example-full">
                <p className="component-showcase-example-label">Text Only</p>
                <DraggableComponentExample type="tabs" name="Tabs" className="draggable-example-full-width">
                  <Tabs />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example-full" style={{ marginTop: '24px' }}>
                <p className="component-showcase-example-label">With Icons</p>
                <DraggableComponentExample type="tabs-icons" name="Tabs with Icons" className="draggable-example-full-width">
                  <TabsWithIcons />
                </DraggableComponentExample>
              </div>
            </div>
            <div style={{ marginTop: '24px', marginBottom: '16px', display: 'flex', gap: '12px' }}>
              <button
                className="btn-primary"
                onClick={() => openCodeExport('tabs', 'Tabs')}
              >
                <i className="fa-solid fa-code" style={{ marginRight: '8px' }}></i>
                Export Tabs Code
              </button>
              <button
                className="btn-secondary"
                onClick={() => openCodeExport('tabs-icons', 'Tabs with Icons')}
              >
                <i className="fa-solid fa-code" style={{ marginRight: '8px' }}></i>
                Export Tabs with Icons Code
              </button>
            </div>
            <CodeDisplay
              markup={`<Tabs />

// With Icons
<TabsWithIcons />`}
              css={`.tabs-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.tab-item {
  padding: 16px 20px;
  font-weight: 600;
  border-bottom: 4px solid transparent;
}

.tab-item-active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}`}
            />
          </div>
        );

      case 'text':
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Text Components</h3>
            <p className="component-showcase-description">
              Draggable text elements in various lengths. All text components are editable when placed in cards or accordions.
            </p>
            <div className="component-showcase-examples">
              <div className="component-showcase-example-full">
                <p className="component-showcase-example-label">20 Words</p>
                <DraggableComponentExample type="text-20" name="20 Words" className="draggable-example-full-width">
                  <p className="text-component">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p>
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example-full">
                <p className="component-showcase-example-label">Bullet List</p>
                <DraggableComponentExample type="text-list" name="Bullet List" className="draggable-example-full-width">
                  <ul className="text-component text-list">
                    <li>First item in the list</li>
                    <li>Second item with more content</li>
                    <li>Third item to demonstrate structure</li>
                  </ul>
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example-full">
                <p className="component-showcase-example-label">Link</p>
                <DraggableComponentExample type="text-link" name="Link" className="draggable-example-full-width">
                  <a href="#" className="text-component text-link" onClick={(e) => e.preventDefault()}>Click here to learn more</a>
                </DraggableComponentExample>
              </div>
            </div>
          </div>
        );

      case 'label':
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Label Component</h3>
            <p className="component-showcase-description">
              Labels are used to categorize and tag content. Standard labels are bold and colorful,
              while subtle labels are lighter and better for repeated use in grids or lists.
            </p>
            <div className="component-showcase-examples">
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Standard Labels</p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <DraggableComponentExample type="label" name="Label Default">
                    <Label type="default">Default</Label>
                  </DraggableComponentExample>
                  <DraggableComponentExample type="label" name="Label Info">
                    <Label type="info">Info</Label>
                  </DraggableComponentExample>
                  <DraggableComponentExample type="label" name="Label Success">
                    <Label type="success">Success</Label>
                  </DraggableComponentExample>
                  <DraggableComponentExample type="label" name="Label Warning">
                    <Label type="warning">Warning</Label>
                  </DraggableComponentExample>
                  <DraggableComponentExample type="label" name="Label Error">
                    <Label type="error">Error</Label>
                  </DraggableComponentExample>
                </div>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Subtle Labels</p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <DraggableComponentExample type="label" name="Label Default Subtle">
                    <Label type="default" variant="subtle">Default</Label>
                  </DraggableComponentExample>
                  <DraggableComponentExample type="label" name="Label Info Subtle">
                    <Label type="info" variant="subtle">Info</Label>
                  </DraggableComponentExample>
                  <DraggableComponentExample type="label" name="Label Success Subtle">
                    <Label type="success" variant="subtle">Success</Label>
                  </DraggableComponentExample>
                  <DraggableComponentExample type="label" name="Label Warning Subtle">
                    <Label type="warning" variant="subtle">Warning</Label>
                  </DraggableComponentExample>
                  <DraggableComponentExample type="label" name="Label Error Subtle">
                    <Label type="error" variant="subtle">Error</Label>
                  </DraggableComponentExample>
                </div>
              </div>
            </div>
            <CodeDisplay
              markup={`<!-- Standard Label -->
<Label type="info">Info</Label>

<!-- Subtle Label -->
<Label type="success" variant="subtle">Success</Label>

<!-- All Types -->
<Label type="default">Default</Label>
<Label type="warning">Warning</Label>
<Label type="error">Error</Label>`}
              css={`.label-standard {
  padding: 4px 8px;
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
  border-radius: 0;
}

.label-standard-info {
  background-color: var(--primary-color);
  color: var(--color-white);
}

.label-subtle {
  padding: 4px 8px;
  font-size: 14px;
  font-weight: 400;
  display: inline-block;
  border-radius: 0;
}

.label-subtle-info {
  background-color: var(--primary-light);
  color: var(--primary-color);
}`}
            />
          </div>
        );

      case 'input':
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Input Fields</h3>
            <p className="component-showcase-description">
              Input fields are used for user input. All input types share the same visual style.
              Border colors: default (var(--input-border)), hover (var(--color-dark-text)), focus (var(--primary-color) with 2px border), error (var(--critical)), disabled (var(--disabled-color-alpha)).
            </p>

            <div style={{ marginTop: '24px', marginBottom: '24px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '4px', border: '1px solid #efefef' }}>
              <h4 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>Input Type</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={inputFieldType === 'text'}
                    onChange={() => setInputFieldType('text')}
                  />
                  <span>Text</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={inputFieldType === 'date'}
                    onChange={() => setInputFieldType('date')}
                  />
                  <span>Date</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={inputFieldType === 'time'}
                    onChange={() => setInputFieldType('time')}
                  />
                  <span>Time</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={inputFieldType === 'search'}
                    onChange={() => setInputFieldType('search')}
                  />
                  <span>Search</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={inputFieldType === 'dropdown'}
                    onChange={() => setInputFieldType('dropdown')}
                  />
                  <span>Dropdown</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={inputFieldType === 'textarea'}
                    onChange={() => setInputFieldType('textarea')}
                  />
                  <span>Text Area</span>
                </label>
              </div>
            </div>

            <div className="component-showcase-examples">
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Input Field</p>
                <DraggableComponentExample
                  type="input-field"
                  name="Input Field"
                  inputFieldType={inputFieldType}
                  inputFieldWidth={inputFieldWidth}
                >
                  <div className="pb-input-outlined" style={{ width: '100%' }}>
                    {inputFieldType === 'textarea' && <DxTextArea placeholder="Label" stylingMode="outlined" readOnly />}
                    {inputFieldType === 'dropdown' && <DxSelectBox placeholder="Label" stylingMode="outlined" />}
                    {(inputFieldType === 'date' || inputFieldType === 'time') && <DxDateBox type={inputFieldType} placeholder="Label" stylingMode="outlined" openOnFieldClick={false} />}
                    {inputFieldType === 'search' && <DxTextBox placeholder="Label" stylingMode="outlined" readOnly buttons={[{ name: 'search', location: 'before', options: { icon: 'search', stylingMode: 'text' } }]} />}
                    {inputFieldType === 'text' && <DxTextBox placeholder="Label" stylingMode="outlined" readOnly />}
                  </div>
                </DraggableComponentExample>
              </div>
            </div>

          </div>
        );

      case 'digitbadge':
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Digit Badge Component</h3>
            <p className="component-showcase-description">
              Digit badges display numerical values to indicate counts, notifications, or status.
              Regular size is 24x24px (circular for single digits, stretches to pill for multiple digits).
              Small size is 18x18px. Available in info (var(--primary-color)) and error (var(--critical)) variants.
            </p>
            <div className="component-showcase-examples">
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Regular Info (Single)</p>
                <DraggableComponentExample type="digitbadge" name="Digit Badge Regular Info Single">
                  <DigitBadge count={8} type="info" size="regular" />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Regular Info (Pill)</p>
                <DraggableComponentExample type="digitbadge" name="Digit Badge Regular Info Pill">
                  <DigitBadge count={246} type="info" size="regular" />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Regular Error (Single)</p>
                <DraggableComponentExample type="digitbadge" name="Digit Badge Regular Error Single">
                  <DigitBadge count={8} type="error" size="regular" />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Regular Error (Pill)</p>
                <DraggableComponentExample type="digitbadge" name="Digit Badge Regular Error Pill">
                  <DigitBadge count={246} type="error" size="regular" />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Small Info (Single)</p>
                <DraggableComponentExample type="digitbadge" name="Digit Badge Small Info Single">
                  <DigitBadge count={8} type="info" size="small" />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Small Info (Pill)</p>
                <DraggableComponentExample type="digitbadge" name="Digit Badge Small Info Pill">
                  <DigitBadge count={246} type="info" size="small" />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Small Error (Single)</p>
                <DraggableComponentExample type="digitbadge" name="Digit Badge Small Error Single">
                  <DigitBadge count={8} type="error" size="small" />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Small Error (Pill)</p>
                <DraggableComponentExample type="digitbadge" name="Digit Badge Small Error Pill">
                  <DigitBadge count={246} type="error" size="small" />
                </DraggableComponentExample>
              </div>
            </div>
            <CodeDisplay
              markup={`<!-- Regular -->
<DigitBadge count={8} type="info" size="regular" />
<DigitBadge count={246} type="error" size="regular" />

<!-- Small -->
<DigitBadge count={8} type="info" size="small" />
<DigitBadge count={246} type="error" size="small" />`}
              css={`.digit-badge-regular {
  padding: 0 8px;
  font-size: 16px;
  line-height: 24px;
  height: 24px;
  min-width: 24px;
  border-radius: 100px;
}

/* Single digit: round (24x24) */
.digit-badge-regular.digit-badge-single {
  width: 24px;
  padding: 0;
}

/* Multiple digits: pill shape */

.digit-badge-info {
  background-color: var(--primary-color);
  color: var(--color-white);
}

.digit-badge-error {
  background-color: var(--critical);
  color: var(--color-white);
}`}
            />
          </div>
        );

      case 'badge':
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Icon Badge Component</h3>
            <p className="component-showcase-description">
              Icon badges display icons within a colored circular background. Size is 24x24px with 20px icon.
              Available in info (var(--primary-color)), success (var(--success)), warning (var(--warning)), and error (var(--critical)) variants.
            </p>
            <div className="component-showcase-examples">
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Info</p>
                <DraggableComponentExample type="iconbadge" name="Icon Badge Info">
                  <IconBadge type="info" icon="fa-info" />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Success</p>
                <DraggableComponentExample type="iconbadge" name="Icon Badge Success">
                  <IconBadge type="success" icon="fa-check" />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Warning</p>
                <DraggableComponentExample type="iconbadge" name="Icon Badge Warning">
                  <IconBadge type="warning" icon="fa-exclamation" />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Error</p>
                <DraggableComponentExample type="iconbadge" name="Icon Badge Error">
                  <IconBadge type="error" icon="fa-xmark" />
                </DraggableComponentExample>
              </div>
            </div>
            <CodeDisplay
              markup={`<!-- Info -->
<IconBadge type="info" icon="fa-info" />

<!-- Success -->
<IconBadge type="success" icon="fa-check" />

<!-- Warning -->
<IconBadge type="warning" icon="fa-exclamation" />

<!-- Error -->
<IconBadge type="error" icon="fa-xmark" />`}
              css={`.icon-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 100px;
  padding: 2px;
  width: 24px;
  height: 24px;
}

.icon-badge-info {
  background-color: var(--primary-color);
}

.icon-badge-success {
  background-color: var(--success);
}

.icon-badge-warning {
  background-color: var(--warning);
}

.icon-badge-error {
  background-color: var(--critical);
}

.icon-badge i {
  width: 20px;
  height: 20px;
  color: var(--color-white);
  font-size: 20px;
}`}
            />
          </div>
        );

      case 'statusbadge':
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Status Badge Component</h3>
            <p className="component-showcase-description">
              Status badges indicate user availability status with icons and colored backgrounds. Size is 16x16px with 12px icon and white border.
              Available statuses: offline (var(--text-mid-color)), available (var(--success)), away (var(--warning)), and busy (var(--critical)).
            </p>
            <div className="component-showcase-examples">
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Offline</p>
                <DraggableComponentExample type="statusbadge" name="Status Badge Offline">
                  <StatusBadge status="offline" />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Available</p>
                <DraggableComponentExample type="statusbadge" name="Status Badge Available">
                  <StatusBadge status="available" />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Away</p>
                <DraggableComponentExample type="statusbadge" name="Status Badge Away">
                  <StatusBadge status="away" />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Busy</p>
                <DraggableComponentExample type="statusbadge" name="Status Badge Busy">
                  <StatusBadge status="busy" />
                </DraggableComponentExample>
              </div>
            </div>
            <CodeDisplay
              markup={`<!-- Offline -->
<StatusBadge status="offline" />

<!-- Available -->
<StatusBadge status="available" />

<!-- Away -->
<StatusBadge status="away" />

<!-- Busy -->
<StatusBadge status="busy" />`}
              css={`.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 100px;
  padding: 2px;
  width: 16px;
  height: 16px;
  box-shadow: 0 0 0 1px var(--color-white);
}

.status-badge-offline {
  background-color: var(--text-mid-color);
}

.status-badge-available {
  background-color: var(--success);
}

.status-badge-away {
  background-color: var(--warning);
}

.status-badge-busy {
  background-color: var(--critical);
}

.status-badge i {
  width: 12px;
  height: 12px;
  color: var(--color-white);
  font-size: 12px;
}`}
            />
          </div>
        );

      case 'indicatorbadge':
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Indicator Badge Component</h3>
            <p className="component-showcase-description">
              Indicator badges are simple colored dots used for minimal status indicators. Size is 8x8px.
              Available in info (var(--primary-color)), success (var(--success)), warning (var(--warning)), and error (var(--critical)) variants.
            </p>
            <div className="component-showcase-examples">
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Info</p>
                <DraggableComponentExample type="indicatorbadge" name="Indicator Badge Info">
                  <IndicatorBadge type="info" />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Success</p>
                <DraggableComponentExample type="indicatorbadge" name="Indicator Badge Success">
                  <IndicatorBadge type="success" />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Warning</p>
                <DraggableComponentExample type="indicatorbadge" name="Indicator Badge Warning">
                  <IndicatorBadge type="warning" />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Error</p>
                <DraggableComponentExample type="indicatorbadge" name="Indicator Badge Error">
                  <IndicatorBadge type="error" />
                </DraggableComponentExample>
              </div>
            </div>
            <CodeDisplay
              markup={`<!-- Info -->
<IndicatorBadge type="info" />

<!-- Success -->
<IndicatorBadge type="success" />

<!-- Warning -->
<IndicatorBadge type="warning" />

<!-- Error -->
<IndicatorBadge type="error" />`}
              css={`.indicator-badge {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 100px;
}

.indicator-badge-info {
  background-color: var(--primary-color);
}

.indicator-badge-success {
  background-color: var(--success);
}

.indicator-badge-warning {
  background-color: var(--warning);
}

.indicator-badge-error {
  background-color: var(--critical);
}`}
            />
          </div>
        );

      case 'button':
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Button Component</h3>
            <p className="component-showcase-description">
              Buttons trigger actions. Primary buttons are for main actions, secondary for less important actions,
              and tertiary (text buttons) for subtle actions. All buttons have hover, focus, and disabled states.
            </p>
            <div className="component-showcase-examples">
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Primary Button</p>
                <DraggableComponentExample type="button" name="Primary Button">
                  <button className="btn-primary">Button</button>
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Secondary Button</p>
                <DraggableComponentExample type="secondary-button" name="Secondary Button">
                  <button className="btn-secondary">Button</button>
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Tertiary Button</p>
                <DraggableComponentExample type="tertiary-button" name="Tertiary Button">
                  <button className="btn-tertiary">Button</button>
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Disabled Primary</p>
                <DraggableComponentExample type="button" name="Disabled Button">
                  <button className="btn-primary" disabled>Button</button>
                </DraggableComponentExample>
              </div>
            </div>
            <CodeDisplay
              markup={`<!-- Primary -->
<button className="btn-primary">Button</button>

<!-- Secondary -->
<button className="btn-secondary">Button</button>

<!-- Tertiary -->
<button className="btn-tertiary">Button</button>

<!-- Disabled -->
<button className="btn-primary" disabled>Button</button>`}
              css={`.btn-primary {
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--btn-primary-color);
  background-color: var(--btn-primary-bg);
  border: none;
  border-radius: 0;
}

.btn-primary:hover {
  background-color: var(--btn-primary-hover-bg);
  color: var(--btn-primary-hover-color);
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.3);
}

.btn-primary:disabled {
  background-color: var(--btn-disabled-bg);
  color: var(--disabled-color-alpha);
}`}
            />

            <h3 className="component-showcase-title" style={{ marginTop: '48px' }}>Segmented Buttons</h3>
            <p className="component-showcase-description">
              Segmented buttons allow users to select one option from a group of 2-5 choices. They come in
              three variants: text only, icons with text, and icons only. The selected state is indicated
              by a checkmark and background color change.
            </p>
            <div className="component-showcase-examples">
              <div className="component-showcase-example-full">
                <p className="component-showcase-example-label">Text Only</p>
                <DraggableComponentExample type="segmented-text" name="Segmented Buttons Text">
                  <SegmentedButtons type="text" />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example-full">
                <p className="component-showcase-example-label">Icons and Text</p>
                <DraggableComponentExample type="segmented-icons-text" name="Segmented Buttons Icons & Text">
                  <SegmentedButtons type="icons-text" />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example-full">
                <p className="component-showcase-example-label">Icons Only</p>
                <DraggableComponentExample type="segmented-icons" name="Segmented Buttons Icons">
                  <SegmentedButtons type="icons" />
                </DraggableComponentExample>
              </div>
            </div>
            <CodeDisplay
              markup={`import { SegmentedButtons } from './components/SegmentedButtons';

<!-- Text only -->
<SegmentedButtons type="text" options={['Walk', 'Train', 'Car']} />

<!-- Icons and text -->
<SegmentedButtons type="icons-text" options={['Walk', 'Train', 'Car']} />

<!-- Icons only -->
<SegmentedButtons type="icons" options={['Walk', 'Train', 'Car']} />`}
              css={`.segmented-buttons {
  display: inline-flex;
}

.segmented-button {
  background: white;
  border: 1px solid #333;
  padding: 8px 12px;
  font-weight: 600;
  font-size: 16px;
}

.segmented-button-selected {
  background: #e6e3f3;
}`}
            />
          </div>
        );

      case 'sidebar':
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Navigation Sidebar</h3>
            <p className="component-showcase-description">
              A collapsible navigation sidebar with parent and child menu items. Features expandable sections,
              selected state highlighting with purple background and left border, and smooth transitions.
            </p>
            <div className="component-showcase-examples">
              <div className="component-showcase-example-full" style={{ maxWidth: '300px' }}>
                <DraggableComponentExample type="sidebar" name="Navigation Sidebar">
                  <NavigationSidebar isPreview={true} />
                </DraggableComponentExample>
              </div>
            </div>
            <CodeDisplay
              markup={`import { NavigationSidebar } from './components/NavigationSidebar';

<NavigationSidebar />`}
              css={`.nav-sidebar {
  background: white;
  border: 1px solid #efefef;
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.15);
}

.nav-sidebar-item {
  height: 64px;
  padding: 10px 16px;
  border-bottom: 1px solid #efefef;
}

.nav-sidebar-child-item-selected {
  background: #e6e3f3;
  border-left: 4px solid #5236ab;
}`}
            />
          </div>
        );

      case 'alerts':
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Alerts Component</h3>
            <p className="component-showcase-description">
              Alerts display important messages to users. They come in four variants: Info (informational messages), Warning (caution messages), Error (problem messages), and Success (confirmation messages). Alerts can optionally include action links.
            </p>

            <div style={{ marginTop: '24px', marginBottom: '24px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '4px', border: '1px solid #efefef' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={alertWithLink}
                  onChange={(e) => setAlertWithLink(e.target.checked)}
                />
                <span>Include action link</span>
              </label>
            </div>

            <div className="component-showcase-examples">
              <div className="component-showcase-example-full">
                <p className="component-showcase-example-label">Info Alert</p>
                <DraggableComponentExample type="alert-info" name="Info Alert">
                  <Alert variant="info" message="This is an info alert" showLink={alertWithLink} />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example-full">
                <p className="component-showcase-example-label">Warning Alert</p>
                <DraggableComponentExample type="alert-warning" name="Warning Alert">
                  <Alert variant="warning" message="This is a warning alert" showLink={alertWithLink} />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example-full">
                <p className="component-showcase-example-label">Error Alert</p>
                <DraggableComponentExample type="alert-error" name="Error Alert">
                  <Alert variant="error" message="This is an error alert" showLink={alertWithLink} />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example-full">
                <p className="component-showcase-example-label">Success Alert</p>
                <DraggableComponentExample type="alert-success" name="Success Alert">
                  <Alert variant="success" message="This is a success alert" showLink={alertWithLink} />
                </DraggableComponentExample>
              </div>
            </div>

            <div style={{ marginTop: '24px', marginBottom: '16px', display: 'flex', gap: '12px' }}>
              <button
                className="btn-primary"
                onClick={() => openCodeExport('alert', 'Alert')}
              >
                <i className="fa-solid fa-code" style={{ marginRight: '8px' }}></i>
                Export Component Code
              </button>
            </div>
          </div>
        );

      case 'block':
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Block</h3>
            <p className="component-showcase-description">
              Blocks are borderless container components with a clean header drop zone. Drop a Card Title text element into the header left area, and add buttons or menus to the right. The body accepts any component.
            </p>
            <div className="component-showcase-examples">
              <DraggableComponentExample type="block" name="Block">
                <div className="block-standard" style={{ width: '100%' }}>
                  <div className="block-header-wrapper">
                    <span className="block-header-title-placeholder">Drop title here</span>
                  </div>
                  <div className="card-body-standard">
                    <p style={{ color: '#999', fontSize: '14px' }}>Block body — drop components here</p>
                  </div>
                </div>
              </DraggableComponentExample>
            </div>
          </div>
        );

      case 'card':
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Card Component</h3>
            <p className="component-showcase-description">
              Cards are container components with a header and body. They feature a 4px border-top accent
              and can include action buttons and menus in the header.
            </p>
            <div className="component-showcase-examples">
              <div className="component-showcase-example-full">
                <DraggableComponentExample type="card" name="Card">
                  <div className="card-standard" style={{ width: '400px' }}>
                    <div className="card-header-wrapper">
                      <h2 className="card-title-standard">Card Title</h2>
                      <div className="card-header-actions">
                        <button className="btn-secondary">Action</button>
                        <CardMenu />
                      </div>
                    </div>
                    <div className="card-body-standard">
                      <p>This is the card body content. Cards can contain any type of content.</p>
                    </div>
                  </div>
                </DraggableComponentExample>
              </div>
            </div>
            <div style={{ marginTop: '24px', marginBottom: '16px' }}>
              <button
                className="btn-primary"
                onClick={() => openCodeExport('card', 'Card')}
              >
                <i className="fa-solid fa-code" style={{ marginRight: '8px' }}></i>
                Export Full Component Code
              </button>
            </div>
            <CodeDisplay
              markup={`<div className="card-standard">
  <div className="card-header-wrapper">
    <h2 className="card-title-standard">Card Title</h2>
    <div className="card-header-actions">
      <button className="btn-secondary">Action</button>
      <CardMenu />
    </div>
  </div>
  <div className="card-body-standard">
    <p>Card body content goes here</p>
  </div>
</div>`}
              css={`.card-standard {
  border: 1px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  background-color: var(--color-white);
  border-radius: 0;
}

.card-header-wrapper {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.card-title-standard {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.card-body-standard {
  padding: 16px;
}`}
            />
          </div>
        );

      case 'datagrid':
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">DataGrid Component</h3>
            <p className="component-showcase-description">
              DataGrid from DevExtreme displays tabular data with zebra striping, sorting, custom cell rendering, and multiple interaction patterns. Configure the features below and drag to the page builder.
            </p>

            <div style={{ marginTop: '24px', marginBottom: '24px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '4px', border: '1px solid #efefef' }}>
              <h4 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>Grid Features</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={gridFeatures.selection}
                    onChange={(e) => setGridFeatures(prev => ({ ...prev, selection: e.target.checked }))}
                  />
                  <span>Row Selection (Checkboxes)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={gridFeatures.columnChooser}
                    onChange={(e) => setGridFeatures(prev => ({ ...prev, columnChooser: e.target.checked }))}
                  />
                  <span>Column Chooser</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={gridFeatures.sorting}
                    onChange={(e) => setGridFeatures(prev => ({ ...prev, sorting: e.target.checked }))}
                  />
                  <span>Column Sorting</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={gridFeatures.searchPanel}
                    onChange={(e) => setGridFeatures(prev => ({ ...prev, searchPanel: e.target.checked }))}
                  />
                  <span>Search Panel</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={gridFeatures.expandable}
                    onChange={(e) => setGridFeatures(prev => ({ ...prev, expandable: e.target.checked }))}
                  />
                  <span>Expandable Rows</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={gridFeatures.actions}
                    onChange={(e) => setGridFeatures(prev => ({ ...prev, actions: e.target.checked }))}
                  />
                  <span>Actions Column</span>
                </label>
              </div>
            </div>

            <div className="component-showcase-examples">
              <div className="component-showcase-example-full">
                <DraggableComponentExample
                  type={gridFeatures.expandable ? "datagrid-expandable" : "datagrid"}
                  name="DataGrid"
                  gridFeatures={gridFeatures}
                >
                  <DataGrid
                    dataSource={gridSampleData}
                    showBorders={false}
                    showColumnLines={false}
                    showRowLines={true}
                    hoverStateEnabled={true}
                    rowAlternationEnabled={true}
                    style={{ width: '100%' }}
                  >
                    {gridFeatures.selection && <Selection mode="multiple" showCheckBoxesMode="always" />}
                    {gridFeatures.searchPanel && <SearchPanel visible={true} />}
                    {gridFeatures.columnChooser && <ColumnChooser enabled={true} />}
                    <Column dataField="link" caption="Link" cellRender={GridLinkCell} allowSorting={gridFeatures.sorting} />
                    <Column dataField="name" caption="Name" allowSorting={gridFeatures.sorting} />
                    <Column dataField="idNumber" caption="ID Number" allowSorting={gridFeatures.sorting} />
                    <Column dataField="amount" caption="$ Amount" alignment="right" allowSorting={gridFeatures.sorting} />
                    <Column dataField="percentage" caption="Percentage %" alignment="right" width={120} allowSorting={gridFeatures.sorting} />
                    {gridFeatures.actions && <Column caption="Actions" width={80} alignment="center" cellRender={GridActionsCell} allowSorting={false} />}
                    {gridFeatures.expandable && <MasterDetail enabled={true} component={GridDetailView} />}
                    <Scrolling mode="standard" />
                    <Paging enabled={false} />
                  </DataGrid>
                </DraggableComponentExample>
              </div>
            </div>

            <div style={{ marginTop: '24px', marginBottom: '16px', display: 'flex', gap: '12px' }}>
              <button
                className="btn-primary"
                onClick={() => openCodeExport('datagrid-expandable', 'DataGrid Expandable')}
              >
                <i className="fa-solid fa-code" style={{ marginRight: '8px' }}></i>
                Export Full Component Code
              </button>
              <button
                className="btn-secondary"
                onClick={() => openCodeExport('datagrid', 'DataGrid Standard')}
              >
                <i className="fa-solid fa-code" style={{ marginRight: '8px' }}></i>
                Export Standard DataGrid
              </button>
            </div>

            <CodeDisplay
              markup={`import DataGrid, { Column, Paging, Scrolling, Selection, MasterDetail, SearchPanel, ColumnChooser } from 'devextreme-react/data-grid';

// Standard with zebra
<DataGrid dataSource={data} rowAlternationEnabled={true} showBorders={false} showColumnLines={false} showRowLines={true} hoverStateEnabled={true}>
  <Column dataField="name" caption="Name" />
  <Column dataField="amount" caption="$ Amount" alignment="right" />
</DataGrid>

// With checkboxes
<DataGrid ...>
  <Selection mode="multiple" showCheckBoxesMode="always" />
  ...
</DataGrid>

// With expandable rows
<DataGrid ...>
  <MasterDetail enabled={true} component={DetailView} />
  ...
</DataGrid>

// With actions column
<Column caption="Actions" width={80} alignment="center" cellRender={ActionsCell} allowSorting={false} />

// With subtle labels
<Column dataField="name" caption="Name" cellRender={NameWithTagCell} />`}
              css={`/* Zebra striping */
.dx-datagrid-rowsview .dx-row-alt > td { background: #f6f8f9; }

/* Header purple underline */
.dx-datagrid-headers { border-bottom: 2px solid var(--primary-color); }

/* Link cells */
.datagrid-link-cell { color: var(--primary-color); cursor: pointer; }

/* Subtle tag labels */
.datagrid-subtle-tag {
  font-size: 12px;
  padding: 1px 6px;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  border-radius: 2px;
}

/* Actions cell */
.datagrid-actions-button { background: none; border: none; cursor: pointer; }
.datagrid-actions-flyout { position: absolute; right: 0; top: 100%; min-width: 160px; z-index: 1100; }`}
            />
          </div>
        );

      case 'treelist': {
        const treeListSampleData = [
          { id: 1, parentId: null, name: 'Region: Europe', employees: 120, budget: '2,400,000' },
          { id: 2, parentId: 1,    name: 'Sweden',         employees: 45,  budget: '900,000' },
          { id: 3, parentId: 2,    name: 'Stockholm',      employees: 28,  budget: '560,000' },
          { id: 4, parentId: 2,    name: 'Gothenburg',     employees: 17,  budget: '340,000' },
          { id: 5, parentId: 1,    name: 'Germany',        employees: 75,  budget: '1,500,000' },
          { id: 6, parentId: 5,    name: 'Berlin',         employees: 40,  budget: '800,000' },
          { id: 7, parentId: 5,    name: 'Munich',         employees: 35,  budget: '700,000' },
          { id: 8, parentId: null, name: 'Region: Asia',   employees: 95,  budget: '1,900,000' },
          { id: 9, parentId: 8,    name: 'Japan',          employees: 55,  budget: '1,100,000' },
          { id: 10, parentId: 9,   name: 'Tokyo',          employees: 55,  budget: '1,100,000' },
        ];
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Tree List Component</h3>
            <p className="component-showcase-description">
              DevExtreme TreeList displays hierarchical data with expandable parent/child rows. Drag it into the page builder to configure rows interactively.
            </p>
            <div className="component-showcase-examples">
              <div className="component-showcase-example-full">
                <DraggableComponentExample type="treelist" name="Tree List">
                  <DxTreeList
                    dataSource={treeListSampleData}
                    keyExpr="id"
                    parentIdExpr="parentId"
                    rootValue={null}
                    showBorders={false}
                    showColumnLines={false}
                    showRowLines={true}
                    hoverStateEnabled={true}
                    style={{ width: '100%' }}
                  >
                    <TreeColumn dataField="name" caption="Name" />
                    <TreeColumn dataField="employees" caption="Employees" alignment="right" width={120} />
                    <TreeColumn dataField="budget" caption="Budget" alignment="right" width={140} />
                    <TreeScrolling mode="standard" />
                    <TreePaging enabled={false} />
                  </DxTreeList>
                </DraggableComponentExample>
              </div>
            </div>
          </div>
        );
      }

      case 'scheduler': {
        const schedulerSampleData = [
          { id: 1,  text: 'Team Standup',      startDate: '2025-01-13T09:00:00', endDate: '2025-01-13T09:30:00' },
          { id: 2,  text: 'Design Review',      startDate: '2025-01-13T11:00:00', endDate: '2025-01-13T12:00:00' },
          { id: 3,  text: 'Sprint Planning',    startDate: '2025-01-14T10:00:00', endDate: '2025-01-14T11:30:00' },
          { id: 4,  text: 'Client Call',        startDate: '2025-01-14T14:00:00', endDate: '2025-01-14T15:00:00' },
          { id: 5,  text: 'Deployment Window',  startDate: '2025-01-15T08:00:00', endDate: '2025-01-15T10:00:00' },
          { id: 6,  text: 'Retrospective',      startDate: '2025-01-16T15:00:00', endDate: '2025-01-16T16:00:00' },
          { id: 7,  text: 'All-day Conference', startDate: '2025-01-17T00:00:00', endDate: '2025-01-17T23:59:00', allDay: true },
        ];
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Scheduler Component</h3>
            <p className="component-showcase-description">
              DevExtreme Scheduler provides a full-featured calendar and event scheduling view. Supports day, week, month,
              and agenda views. Drag it into the page builder to add a scheduler with sample events.
            </p>
            <div className="component-showcase-examples">
              <div className="component-showcase-example-full">
                <p className="component-showcase-example-label">Week View</p>
                <DraggableComponentExample type="scheduler" name="Scheduler">
                  <DxScheduler
                    dataSource={schedulerSampleData}
                    currentView="week"
                    defaultCurrentDate={new Date('2025-01-13')}
                    height={500}
                    startDayHour={8}
                    endDayHour={20}
                    showAllDayPanel={true}
                    textExpr="text"
                    startDateExpr="startDate"
                    endDateExpr="endDate"
                    allDayExpr="allDay"
                    editing={false}
                  >
                    <DxSchedulerView type="day" />
                    <DxSchedulerView type="week" />
                    <DxSchedulerView type="month" />
                    <DxSchedulerView type="agenda" />
                  </DxScheduler>
                </DraggableComponentExample>
              </div>
            </div>
          </div>
        );
      }

      case 'chart':
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Chart Components</h3>
            <p className="component-showcase-description">
              Charts from DevExtreme are used for data visualization. Multiple chart types are available
              including bar charts, area charts, pie charts, and progress indicators.
            </p>
            <div className="component-showcase-examples">
              <div className="component-showcase-example-full">
                <p className="component-showcase-example-label">Stacked Bar Chart</p>
                <DraggableComponentExample type="stackedbar" name="Stacked Bar Chart">
                  <StackedBarChart />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example-full">
                <p className="component-showcase-example-label">Stacked Area Chart</p>
                <DraggableComponentExample type="stackedarea" name="Stacked Area Chart">
                  <StackedAreaChart />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Pie Chart</p>
                <DraggableComponentExample type="piechart" name="Pie Chart">
                  <PieChartComponent />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Density Curve</p>
                <DraggableComponentExample type="densitycurve" name="Density Curve Chart">
                  <DensityCurveChart />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Progress Bar</p>
                <DraggableComponentExample type="progressbar" name="Progress Bar Chart">
                  <ProgressBarChart />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Progress Gauge</p>
                <DraggableComponentExample type="progressgauge" name="Progress Gauge Chart">
                  <ProgressGaugeChart />
                </DraggableComponentExample>
              </div>
            </div>
            <div style={{ marginTop: '24px' }}>
              <button className="btn-secondary" onClick={() => openCodeExport('stackedbar', 'Stacked Bar Chart')}>
                Export Stacked Bar Code
              </button>
              {' '}
              <button className="btn-secondary" onClick={() => openCodeExport('stackedarea', 'Stacked Area Chart')}>
                Export Stacked Area Code
              </button>
              {' '}
              <button className="btn-secondary" onClick={() => openCodeExport('piechart', 'Pie Chart')}>
                Export Pie Chart Code
              </button>
            </div>
            <CodeDisplay
              markup={`import Chart, { Series, ArgumentAxis, ValueAxis, Legend } from 'devextreme-react/chart';

// Stacked Bar Chart
<Chart dataSource={data} className="chart-standard">
  <CommonSeriesSettings argumentField="quarter" type="stackedbar" />
  <Series valueField="series1" name="Label" color="#5236ab" />
  <Series valueField="series2" name="Label" color="#e31937" />
  <ArgumentAxis />
  <ValueAxis />
  <Legend verticalAlignment="bottom" horizontalAlignment="center" />
</Chart>

// Stacked Area Chart
<Chart dataSource={data} className="chart-standard">
  <CommonSeriesSettings argumentField="month" type="stackedarea" />
  <Series valueField="series1" name="Label" color="#5236ab" />
  <ArgumentAxis />
  <ValueAxis />
  <Legend verticalAlignment="bottom" horizontalAlignment="center" />
</Chart>`}
              css={`.chart-card {
  background: white;
  border: 1px solid #efefef;
  border-radius: 4px;
  padding: 24px;
}

.chart-title {
  font-family: 'Source Sans Pro', sans-serif;
  font-weight: bold;
  font-size: 18px;
  color: #333;
  margin: 0 0 24px 0;
  text-align: center;
}

.chart-standard {
  width: 100%;
  height: 300px;
}`}
            />
          </div>
        );

      case 'menu':
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Menu Components</h3>
            <p className="component-showcase-description">
              Action menus provide contextual options for items. Different menu types are used based on
              context: CardMenu for card headers, EmployeeActionsMenu for employee rows, and SimpleActionsMenu
              for simple actions.
            </p>
            <div className="component-showcase-examples">
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Card Menu</p>
                <DraggableComponentExample type="menu" name="Card Menu">
                  <CardMenu />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Employee Actions Menu</p>
                <DraggableComponentExample type="menu" name="Employee Actions Menu">
                  <EmployeeActionsMenu employeeName="Johan Karlsson" />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example">
                <p className="component-showcase-example-label">Simple Actions Menu</p>
                <DraggableComponentExample type="menu" name="Simple Actions Menu">
                  <SimpleActionsMenu personName="Anna Andersson" />
                </DraggableComponentExample>
              </div>
            </div>
            <CodeDisplay
              markup={`<!-- Card Menu -->
<CardMenu />

<!-- Employee Actions Menu -->
<EmployeeActionsMenu employeeName="Johan Karlsson" />

<!-- Simple Actions Menu -->
<SimpleActionsMenu personName="Anna Andersson" />

<!-- Basic dropdown menu pattern -->
<div className="dropdown">
  <button className="dropdown-toggle">
    <i className="fa-solid fa-ellipsis-vertical"></i>
  </button>
  <div className="dropdown-menu">
    <a className="dropdown-item" href="#">Action</a>
    <a className="dropdown-item" href="#">Another action</a>
  </div>
</div>`}
              css={`.dropdown-toggle {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
}

.dropdown-toggle:hover {
  background-color: var(--bg-lighter);
}

.dropdown-menu {
  position: absolute;
  background-color: var(--color-white);
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 160px;
}

.dropdown-item {
  padding: 8px 12px;
  display: block;
  text-decoration: none;
  color: var(--color-dark-text);
}

.dropdown-item:hover {
  background-color: var(--bg-lighter);
}`}
            />
          </div>
        );

      case 'helpers':
        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Helper Components</h3>
            <p className="component-showcase-description">
              Helper components provide visual structure and spacing. Dividers create visual separation
              with a 1px faded line that can span different widths (like card columns). Spacers add
              10px of vertical space between elements.
            </p>
            <div className="component-showcase-examples">
              <div className="component-showcase-example-full">
                <p className="component-showcase-example-label">Divider (Full Width)</p>
                <DraggableComponentExample type="divider" name="Divider">
                  <Divider />
                </DraggableComponentExample>
              </div>
              <div className="component-showcase-example-full">
                <p className="component-showcase-example-label">Spacer (10px)</p>
                <div style={{ border: '1px dashed #ccc', padding: '4px' }}>
                  <DraggableComponentExample type="spacer" name="Spacer">
                    <Spacer />
                  </DraggableComponentExample>
                </div>
              </div>
            </div>
            <CodeDisplay
              markup={`import { Divider } from './components/Divider';
import { Spacer } from './components/Spacer';

<!-- Divider -->
<Divider width={12} />  {/* Full width */}
<Divider width={6} />   {/* Half width */}

<!-- Spacer -->
<Spacer />`}
              css={`.divider-line {
  width: 100%;
  height: 1px;
  background-color: #efefef;
  opacity: 0.6;
}

.spacer-component {
  width: 100%;
  height: 10px;
}`}
            />
          </div>
        );

      case 'icons':
        const iconCategories = [
          {
            name: 'Interface',
            icons: ['home', 'house', 'bars', 'xmark', 'check', 'plus', 'minus', 'gear', 'magnifying-glass', 'ellipsis', 'ellipsis-vertical', 'pen', 'trash', 'eye', 'eye-slash', 'download', 'upload', 'share', 'link', 'copy', 'paste', 'filter', 'sliders', 'grid', 'list', 'table', 'grip', 'arrows-rotate', 'maximize', 'minimize', 'expand', 'compress']
          },
          {
            name: 'Arrows',
            icons: ['arrow-right', 'arrow-left', 'arrow-up', 'arrow-down', 'arrow-up-right-from-square', 'angles-right', 'angles-left', 'angles-up', 'angles-down', 'chevron-right', 'chevron-left', 'chevron-up', 'chevron-down', 'caret-right', 'caret-left', 'caret-up', 'caret-down', 'circle-arrow-right', 'circle-arrow-left', 'circle-arrow-up', 'circle-arrow-down']
          },
          {
            name: 'Users & People',
            icons: ['user', 'users', 'user-group', 'user-plus', 'user-minus', 'user-gear', 'user-tie', 'user-shield', 'user-check', 'user-xmark', 'address-book', 'id-card', 'id-badge']
          },
          {
            name: 'Communication',
            icons: ['envelope', 'comment', 'comments', 'message', 'inbox', 'paper-plane', 'phone', 'fax', 'bell', 'bullhorn', 'rss', 'at', 'hashtag']
          },
          {
            name: 'Files & Folders',
            icons: ['file', 'file-lines', 'file-pdf', 'file-word', 'file-excel', 'file-image', 'file-video', 'file-code', 'file-zipper', 'folder', 'folder-open', 'folder-plus', 'floppy-disk', 'hard-drive']
          },
          {
            name: 'Media',
            icons: ['image', 'images', 'video', 'music', 'camera', 'camera-retro', 'film', 'play', 'pause', 'stop', 'backward', 'forward', 'volume-high', 'volume-low', 'volume-xmark']
          },
          {
            name: 'Business & Finance',
            icons: ['dollar-sign', 'euro-sign', 'sterling-sign', 'yen-sign', 'money-bill', 'coins', 'credit-card', 'wallet', 'receipt', 'chart-line', 'chart-bar', 'chart-pie', 'briefcase', 'building', 'store']
          },
          {
            name: 'E-commerce',
            icons: ['cart-shopping', 'bag-shopping', 'basket-shopping', 'box', 'boxes-stacked', 'truck', 'truck-fast', 'dolly', 'tags', 'tag', 'barcode', 'qrcode', 'percent', 'gift']
          },
          {
            name: 'Time & Calendar',
            icons: ['calendar', 'calendar-days', 'calendar-check', 'calendar-plus', 'calendar-xmark', 'clock', 'stopwatch', 'hourglass', 'hourglass-half', 'history']
          },
          {
            name: 'Status & Alerts',
            icons: ['circle-check', 'circle-xmark', 'circle-exclamation', 'circle-info', 'triangle-exclamation', 'shield-halved', 'ban', 'exclamation', 'question', 'info']
          },
          {
            name: 'Weather',
            icons: ['sun', 'moon', 'cloud', 'cloud-sun', 'cloud-rain', 'cloud-bolt', 'snowflake', 'temperature-high', 'temperature-low', 'wind']
          },
          {
            name: 'Location & Travel',
            icons: ['location-dot', 'map', 'map-location-dot', 'globe', 'compass', 'plane', 'car', 'train', 'ship', 'person-walking', 'flag', 'route']
          },
          {
            name: 'Medical',
            icons: ['heart', 'heart-pulse', 'stethoscope', 'syringe', 'pills', 'capsules', 'hospital', 'user-doctor', 'kit-medical', 'plus', 'xmark']
          },
          {
            name: 'Security',
            icons: ['lock', 'unlock', 'key', 'shield', 'shield-halved', 'user-shield', 'fingerprint', 'user-lock', 'eye-slash']
          },
          {
            name: 'Social',
            icons: ['thumbs-up', 'thumbs-down', 'heart', 'star', 'bookmark', 'share-nodes', 'retweet', 'quote-left', 'quote-right']
          },
          {
            name: 'Food & Drink',
            icons: ['utensils', 'mug-hot', 'wine-glass', 'martini-glass', 'beer-mug-empty', 'cake-candles', 'pizza-slice', 'burger', 'ice-cream', 'apple-whole']
          },
          {
            name: 'Sports & Recreation',
            icons: ['basketball', 'football', 'baseball', 'volleyball', 'table-tennis-paddle-ball', 'dumbbell', 'bicycle', 'trophy', 'medal', 'gamepad']
          },
          {
            name: 'Education',
            icons: ['book', 'book-open', 'graduation-cap', 'school', 'chalkboard', 'chalkboard-user', 'pencil', 'pen-to-square', 'highlighter', 'eraser']
          },
          {
            name: 'Technology',
            icons: ['desktop', 'laptop', 'tablet', 'mobile', 'keyboard', 'mouse', 'server', 'database', 'wifi', 'signal', 'plug', 'battery-full', 'battery-half', 'battery-empty']
          },
          {
            name: 'Coding',
            icons: ['code', 'terminal', 'bug', 'brackets-curly', 'file-code', 'laptop-code', 'microchip', 'code-branch', 'code-commit', 'code-fork']
          }
        ];

        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">Icons</h3>
            <p className="component-showcase-description">
              Font Awesome 6.5.1 Free icons. Drag any icon to buttons or segmented buttons. All icons use fa-solid class.
            </p>

            {iconCategories.map((category, catIndex) => (
              <div key={catIndex} style={{ marginBottom: '32px' }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '16px',
                  color: 'var(--primary)',
                  fontFamily: 'Source Sans Pro, sans-serif'
                }}>
                  {category.name}
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '12px'
                }}>
                  {category.icons.map((icon, iconIndex) => (
                    <div key={iconIndex} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <DraggableComponentExample
                        type="icon"
                        name={icon}
                        iconClass={icon}
                      >
                        <i className={`fa-solid fa-${icon}`} style={{ fontSize: '24px' }}></i>
                      </DraggableComponentExample>
                      <span style={{
                        fontSize: '10px',
                        textAlign: 'center',
                        wordBreak: 'break-word',
                        color: 'var(--muted-foreground)'
                      }}>
                        {icon}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <CodeDisplay
              markup={`<!-- Font Awesome Icons -->
<i className="fa-solid fa-house"></i>
<i className="fa-solid fa-gauge"></i>
<i className="fa-solid fa-users"></i>
<i className="fa-solid fa-arrow-right"></i>
<i className="fa-solid fa-cake-candles"></i>
<i className="fa-solid fa-ellipsis-vertical"></i>

<!-- Regular variant -->
<i className="fa-regular fa-heart"></i>
<i className="fa-regular fa-star"></i>

<!-- Sizing -->
<i className="fa-solid fa-house" style={{ fontSize: '24px' }}></i>
<i className="fa-solid fa-house" style={{ fontSize: '32px' }}></i>`}
              css={`/* Font Awesome 6.5.1 Free */
/* Include stylesheet: */
/* <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet"> */

/* Use only fa-solid or fa-regular classes */
/* Do NOT use fa-light or fa-duotone (Pro only) */

.fa-solid,
.fa-regular {
  display: inline-block;
  font-style: normal;
  font-variant: normal;
  text-rendering: auto;
  line-height: 1;
}

/* Custom icon colors */
.icon-primary {
  color: var(--primary-color);
}

.icon-error {
  color: var(--critical);
}`}
            />
          </div>
        );

      case 'variables':
        const themeVariables = [
          { category: 'Colors', vars: [
            '--color-white: #FFF',
            '--color-black: #000',
            '--color-dark-text: #333',
            '--color-disabled-text: #a3a3a3',
            '--color-disabled-input-bg: #EFEFEF',
            '--color-readonly-text: #6B6B6B'
          ]},
          { category: 'Primary Colors', vars: [
            '--primary-color: var(--primary-color)',
            '--primary-text-color: var(--color-white)',
            '--primary-hover: #cbc3e6',
            '--primary-dark: #200a58',
            '--secondary-color: #4229a0'
          ]},
          { category: 'Background Colors', vars: [
            '--page-bg: #f9f9f9',
            '--card-bg: var(--color-white)',
            '--widget-bg: var(--color-white)',
            '--menu-bg: #f9f9f9',
            '--row-alt-bg: #f9f9f9'
          ]},
          { category: 'Border Colors', vars: [
            '--border-color: #ddd',
            '--border-color-default: #ddd',
            '--border-color-highlighted: #333',
            '--light-border-color: #e5e5e5',
            '--secondary-border-color: #cbc3e6'
          ]},
          { category: 'Text Colors', vars: [
            '--text-color: #151515',
            '--default-text-color: #151515',
            '--text-dark: #000',
            '--text-white-color: var(--color-white)',
            '--text-mid-color: var(--text-mid-color)',
            '--active-text-color: var(--primary-color)',
            '--inactive-text-color: #6B6B6B'
          ]},
          { category: 'Status Colors', vars: [
            '--success: var(--success)',
            '--warning: var(--warning)',
            '--critical: var(--critical)',
            '--search-highlight-color: #fac000'
          ]},
          { category: 'Input Styles', vars: [
            '--input-bg: var(--color-white)',
            '--input-border: #a8a8a8',
            '--input-color: #151515',
            '--input-focus-bg: var(--primary-color)',
            '--input-disabled-bg: #EFEFEF',
            '--input-disabled-border: #B8B8B8'
          ]},
          { category: 'Button Styles', vars: [
            '--heroma-button-size: 34px',
            '--btn-primary-bg: var(--primary-color)',
            '--btn-primary-color: var(--color-white)',
            '--btn-primary-hover-bg: #cbc3e6',
            '--btn-primary-hover-color: #200a58',
            '--btn-secondary-bg: var(--color-white)',
            '--btn-secondary-color: var(--primary-color)',
            '--btn-secondary-border-color: var(--primary-color)',
            '--btn-disabled-bg: var(--color-white)',
            '--btn-disabled-color: #a3a3a3'
          ]},
          { category: 'Stepper Styles', vars: [
            '--stepper-bg: var(--color-white)',
            '--stepper-color: #a8a8a8',
            '--stepper-active: var(--primary-color)',
            '--stepper-active-border: var(--primary-color)',
            '--stepper-completed: var(--primary-color)',
            '--stepper-text-color: #a3a3a3'
          ]},
          { category: 'Badge Styles', vars: [
            '--badge-bg: #cbc3e6',
            '--badge-text-color: var(--primary-color)',
            '--badge-danger-bg: var(--critical)'
          ]},
          { category: 'Grid & Table Styles', vars: [
            '--row-bg: var(--color-white)',
            '--row-alt-bg: #f9f9f9',
            '--row-active-bg: #e3dff5',
            '--row-hover-bg: #e3dff5',
            '--grid-text-color: #151515',
            '--grid-header-border: var(--primary-color)'
          ]}
        ];

        return (
          <div className="component-showcase">
            <h3 className="component-showcase-title">CSS Theme Variables</h3>
            <p className="component-showcase-description">
              Centralized CSS custom properties and color variables used throughout the application.
              These variables ensure consistent styling and theming across all components.
            </p>
            <div className="variables-container">
              {themeVariables.map((section, idx) => (
                <div key={idx} className="variable-section">
                  <h4 className="variable-section-title">{section.category}</h4>
                  <div className="variable-list">
                    {section.vars.map((variable, vIdx) => {
                      const [name, value] = variable.split(': ');
                      const isColor = value.startsWith('#') || value.startsWith('rgb');
                      return (
                        <div key={vIdx} className="variable-item">
                          <code className="variable-name">{name}</code>
                          <div className="variable-value-wrapper">
                            {isColor && (
                              <span
                                className="variable-color-preview"
                                style={{ backgroundColor: value }}
                              ></span>
                            )}
                            <code className="variable-value">{value}</code>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Layout breadcrumbItems={breadcrumbItems} title="Components">
        <main className="main-content-wrapper">
          <div className="container-fluid" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
            <div className="components-layout-wrapper">
              {/* Left Sidebar - Navigation */}
                <div className="components-sidebar-column">
                  <div className="components-sidebar">
                    <nav className="components-sidebar-nav">
                      {mainMenuItems.map((item) => (
                        <button
                          key={item.id}
                          className={`components-sidebar-item ${selectedMenuItem === item.id ? 'components-sidebar-item-active' : ''}`}
                          onClick={() => handleMenuItemClick(item.id)}
                        >
                          <i className={`fa-solid ${item.icon}`}></i>
                          <span>{item.name}</span>
                        </button>
                      ))}

                      {/* Components Section with Nested Items */}
                      <button
                        className={`components-sidebar-item ${selectedMenuItem === 'components' || components.some(c => c.id === selectedMenuItem) ? 'components-sidebar-item-active' : ''}`}
                        onClick={() => {
                          setIsComponentsExpanded(!isComponentsExpanded);
                          setSelectedMenuItem('components');
                        }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <i className="fa-solid fa-layer-group"></i>
                          <span>Components</span>
                        </div>
                        <i className={`fa-solid fa-chevron-${isComponentsExpanded ? 'down' : 'right'}`} style={{ fontSize: '12px' }}></i>
                      </button>

                      {/* Nested Component List */}
                      {isComponentsExpanded && (
                        <div className="components-sidebar-nested">
                          {components.map((component) => (
                            <button
                              key={component.id}
                              className={`components-sidebar-nested-item ${selectedComponent === component.id ? 'components-sidebar-nested-item-active' : ''}`}
                              onClick={() => handleComponentClick(component.id)}
                            >
                              <i className={`fa-solid ${component.icon}`} style={{ fontSize: '14px' }}></i>
                              <span>{component.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </nav>
                  </div>
                </div>

              {/* Middle Content - Component Info */}
              <div className="components-content-column" style={{ width: `${100 - 16.67 - pageBuilderWidth}%` }}>
                <div className="components-content p-[16px]">
                  <div>
                      {selectedMenuItem === 'home' && (
                        <div className="component-showcase">
                          <h3 className="component-showcase-title">Welcome to Components</h3>
                          <p className="component-showcase-description">
                            A comprehensive toolkit for building and exploring UI components with an interactive page builder.
                          </p>
                        </div>
                      )}
                      {selectedMenuItem === 'getting-started' && (
                        <div className="component-showcase">
                          <h3 className="component-showcase-title">Getting Started</h3>
                          <p className="component-showcase-description">
                            Learn how to use Components to create, customize, and export pages.
                          </p>
                          <div style={{ marginTop: '24px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--foreground)' }}>Component Library</h4>
                            <p style={{ marginBottom: '16px', lineHeight: '1.6', color: 'var(--foreground)' }}>
                              Browse through our extensive component library on the left sidebar. Each component is ready to drag and drop into your page designs. Click on any component category to see available variations and examples.
                            </p>

                            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--foreground)' }}>Page Builder</h4>
                            <p style={{ marginBottom: '16px', lineHeight: '1.6', color: 'var(--foreground)' }}>
                              The page builder on the right allows you to create custom page layouts by dragging components from the library. You can:
                            </p>
                            <ul style={{ marginBottom: '16px', marginLeft: '20px', lineHeight: '1.8', color: 'var(--foreground)' }}>
                              <li>Drag components directly into the canvas</li>
                              <li>Drop components into containers like cards, accordions, tabs, and steppers</li>
                              <li>Adjust component widths using the size selector</li>
                              <li>Edit text content by clicking on text elements</li>
                              <li>Reorder components by dragging them vertically</li>
                              <li>Remove components using the × button</li>
                            </ul>

                            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--foreground)' }}>Creating Pages</h4>
                            <p style={{ marginBottom: '16px', lineHeight: '1.6', color: 'var(--foreground)' }}>
                              Once you've built your page layout:
                            </p>
                            <ol style={{ marginBottom: '16px', marginLeft: '20px', lineHeight: '1.8', color: 'var(--foreground)' }}>
                              <li>Click the "Preview" button to see your page without the builder UI</li>
                              <li>Use the "Export Markup" button to download HTML</li>
                              <li>Use the "Export Component" button to download React code</li>
                            </ol>

                            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--foreground)' }}>Working with Drafts</h4>
                            <p style={{ marginBottom: '16px', lineHeight: '1.6', color: 'var(--foreground)' }}>
                              Your page builder state is automatically maintained during your session. If you navigate away and come back, your work will still be there. For permanent storage, export your page using the export buttons.
                            </p>

                            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--foreground)' }}>Tips & Tricks</h4>
                            <ul style={{ marginBottom: '16px', marginLeft: '20px', lineHeight: '1.8', color: 'var(--foreground)' }}>
                              <li>Use the fullscreen button to maximize your workspace</li>
                              <li>Resize the page builder panel by dragging the divider</li>
                              <li>Click component names in the showcase to see live examples</li>
                              <li>Explore nested components by dropping cards, accordions, and tabs</li>
                            </ul>
                          </div>
                        </div>
                      )}
                      {selectedMenuItem === 'styles' && (
                        <div className="component-showcase">
                          <h3 className="component-showcase-title">Variables</h3>
                          <p className="component-showcase-description">
                            CSS custom properties (variables) define the design tokens used throughout the application.
                            Use these to maintain consistency across components.
                          </p>
                          <div style={{ marginTop: '24px', lineHeight: '1.8', color: 'var(--foreground)' }}>
                            <p>Variables are not draggable — they are used as design tokens in stylesheets.</p>
                            <p style={{ marginTop: '12px' }}>Expand theme.css to view and edit all available CSS variables.</p>
                          </div>
                        </div>
                      )}
                      {selectedMenuItem === 'updates' && (
                        <div className="component-showcase">
                          <h3 className="component-showcase-title">Updates & Changelog</h3>
                          <p className="component-showcase-description">
                            Stay informed about the latest features, improvements, and component additions.
                          </p>
                          <div style={{ marginTop: '24px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--foreground)' }}>Recent Updates</h4>
                            <p style={{ marginBottom: '16px', lineHeight: '1.6', color: 'var(--foreground)' }}>
                              • Components - New navigation structure<br />
                              • Stepper components with nested drop zones<br />
                              • Improved component library organization<br />
                              • Enhanced card and accordion support
                            </p>
                          </div>
                        </div>
                      )}
                      {components.some(c => c.id === selectedMenuItem) && renderComponentExample()}
                  </div>
                </div>
              </div>

              {/* Resizer */}
              <div
                className="page-builder-resizer"
                onMouseDown={handleMouseDown}
              >
                <div className="page-builder-resizer-handle"></div>
              </div>

              {/* Right Panel - Page Builder */}
              <div className="components-page-builder-column" style={{ width: `${pageBuilderWidth}%` }}>
                <div className="components-page-builder">
                  <PageBuilder />
                </div>
              </div>
            </div>
          </div>
        </main>
      </Layout>
      <CodeExportModal
        isOpen={codeExportModal.isOpen}
        onClose={() => setCodeExportModal({ ...codeExportModal, isOpen: false })}
        code={codeExportModal.code}
        title={codeExportModal.title}
      />
    </DndProvider>
  );
};
