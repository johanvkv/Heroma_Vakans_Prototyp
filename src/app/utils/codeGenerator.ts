// Component source code mappings
// These contain the actual source code from the component files
const COMPONENT_SOURCE_CODE: { [key: string]: string } = {
  'accordion': `import React, { useState } from 'react';

interface AccordionSection {
  id: string;
  title: string;
  content?: React.ReactNode;
  nested?: AccordionSection[];
}

const SECTIONS: AccordionSection[] = [
  { id: '1', title: 'Section header 1' },
  { id: '2', title: 'Section header 2' },
  { id: '3', title: 'Section header 3' },
  {
    id: '4',
    title: 'Section header 4',
    content: (
      <>
        <p>This is content for your accordion. Add interesting things in the space to help users. You can even make a bullet list if you want.</p>
        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
          <li>List item 3</li>
        </ul>
      </>
    )
  },
  { id: '5', title: 'Section header 5' },
];

function PlusIcon() {
  return (
    <div className="accordion-icon">
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <path d="M11 13H5V11H11V5H13V11H19V13H13V19H11V13Z" fill="#5236ab" />
      </svg>
    </div>
  );
}

function MinusIcon() {
  return (
    <div className="accordion-icon">
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <path d="M5 13V11H19V13H5Z" fill="#5236ab" />
      </svg>
    </div>
  );
}

export function Accordion() {
  const [expandedId, setExpandedId] = useState<string | null>('4');

  const toggleSection = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="d-flex flex-column w-100">
      {SECTIONS.map((section) => {
        const isExpanded = expandedId === section.id;
        return (
          <div
            key={section.id}
            className={\`accordion-section \${isExpanded ? 'expanded' : 'collapsed'}\`}
          >
            <button
              className="accordion-header"
              onClick={() => toggleSection(section.id)}
              type="button"
              aria-expanded={isExpanded}
            >
              <span className="accordion-title">{section.title}</span>
              {isExpanded ? <MinusIcon /> : <PlusIcon />}
            </button>
            {isExpanded && (
              <div className="accordion-content">
                {section.content || <p>Content for {section.title}...</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}`,

  'stepper': `import React from 'react';

export interface Step {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="stepper-horizontal">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isLast = index === steps.length - 1;
        const stepNumber = \`Step \${index + 1}\`;

        return (
          <div key={index} className="stepper-horizontal-step">
            <div className="stepper-horizontal-indicator">
              <div className={\`stepper-horizontal-circle \${isCompleted ? 'stepper-horizontal-circle-completed' : ''} \${isActive ? 'stepper-horizontal-circle-active' : ''}\`}>
                {isCompleted ? (
                  <i className="fa-solid fa-check"></i>
                ) : isActive ? (
                  <i className="fa-solid fa-pen"></i>
                ) : null}
              </div>
              {!isLast && (
                <div className={\`stepper-horizontal-line \${isCompleted ? 'stepper-horizontal-line-completed' : ''}\`} />
              )}
            </div>
            <div className={\`stepper-horizontal-label \${isCompleted ? 'stepper-horizontal-label-completed' : ''} \${isActive ? 'stepper-horizontal-label-active' : ''}\`}>
              <div className="stepper-horizontal-title" title={\`\${stepNumber}: \${step.label}\`}>
                <span className="stepper-title-full">{stepNumber}</span>
              </div>
              {step.label && (
                <div className="stepper-horizontal-description" title={step.label}>{step.label}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};`,

  'tabs': `import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs?: Tab[];
  activeTab?: number;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs = [
    { id: '1', label: 'Selected tab' },
    { id: '2', label: 'Default tab' },
    { id: '3', label: 'Default tab' }
  ],
  activeTab = 0
}) => {
  const [selectedIndex, setSelectedIndex] = useState(activeTab);

  return (
    <div className="tabs-container">
      <div className="tabs-wrapper">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            className={\`tab-item \${index === selectedIndex ? 'tab-item-active' : ''}\`}
            onClick={() => setSelectedIndex(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-line"></div>
    </div>
  );
};`,

  'tabs-icons': `import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsWithIconsProps {
  tabs?: Tab[];
  activeTab?: number;
}

export const TabsWithIcons: React.FC<TabsWithIconsProps> = ({
  tabs = [
    { id: '1', label: 'Selected tab' },
    { id: '2', label: 'Default tab' },
    { id: '3', label: 'Default tab' }
  ],
  activeTab = 0
}) => {
  const [selectedIndex, setSelectedIndex] = useState(activeTab);

  return (
    <div className="tabs-container">
      <div className="tabs-wrapper">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            className={\`tab-item tab-item-with-icon \${index === selectedIndex ? 'tab-item-active' : ''}\`}
            onClick={() => setSelectedIndex(index)}
          >
            <i className={\`fa-solid fa-bell \${index === selectedIndex ? 'tab-icon-active' : 'tab-icon'}\`}></i>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-line"></div>
    </div>
  );
};`,

  'datagrid-expandable': `import React from 'react';
import DataGrid, { Column, Paging, Scrolling, MasterDetail, ColumnChooser } from 'devextreme-react/data-grid';

// Sample data for the grid
const gridData = [
  { id: 1, link: 'Account name, ID, etc.', name: 'John Smith', idNumber: '123ABC', amount: '1,234,567.89' },
  { id: 2, link: 'Account name, ID, etc.', name: 'Jane Smith', idNumber: '456ABC', amount: '1,234,567.89' },
  { id: 3, link: 'Account name, ID, etc.', name: 'John Doe', idNumber: '789ABC', amount: '1,234,567.89' },
  { id: 4, link: 'Account name, ID, etc.', name: 'Jane Doe', idNumber: '123DEF', amount: '1,234,567.89' },
];

// Detail view component shown when a row is expanded
const GridDetailView = ({ data }: { data: any }) => {
  const rowData = data?.data;
  if (!rowData) return null;

  return (
    <div className="datagrid-detail-view">
      <div><span className="datagrid-detail-label">Name</span><span>{rowData.name}</span></div>
      <div><span className="datagrid-detail-label">ID Number</span><span>{rowData.idNumber}</span></div>
      <div><span className="datagrid-detail-label">Amount</span><span>$\{rowData.amount}</span></div>
    </div>
  );
};

// Main DataGrid component
export const ExpandableDataGrid = () => {
  return (
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
      <Column dataField="idNumber" caption="ID Number" />
      <Column dataField="amount" caption="$ Amount" alignment="right" />
      <MasterDetail enabled={true} component={GridDetailView} />
      <ColumnChooser enabled={true} mode="select" />
      <Scrolling mode="standard" />
      <Paging enabled={false} />
    </DataGrid>
  );
};`,

  'datagrid': `import React from 'react';
import DataGrid, { Column, Paging, Scrolling } from 'devextreme-react/data-grid';

// Sample data
const gridData = [
  { id: 1, link: 'Name', subLink: 'ID: 001234', name: 'John Smith', idNumber: '123ABC', amount: '1,234,567.89', percentage: 13.67 },
  { id: 2, link: 'Name', subLink: 'ID: 002345', name: 'Jane Smith', idNumber: '456ABC', amount: '1,234,567.89', percentage: 59.00 },
  { id: 3, link: 'Name', subLink: 'ID: 003456', name: 'John Doe', idNumber: '789ABC', amount: '1,234,567.89', percentage: 47.25 },
  { id: 4, link: 'Name', subLink: 'ID: 004567', name: 'Jane Doe', idNumber: '123DEF', amount: '1,234,567.89', percentage: 99.99 },
];

const GridLinkCell = ({ value }: { value?: string }) => (
  <span className="datagrid-link-cell">{value ?? ''}</span>
);

export const StandardDataGrid = () => {
  return (
    <DataGrid
      dataSource={gridData}
      showBorders={false}
      showColumnLines={false}
      showRowLines={true}
      hoverStateEnabled={true}
      rowAlternationEnabled={true}
      style={{ width: '100%' }}
    >
      <Column dataField="link" caption="Link" cellRender={GridLinkCell} />
      <Column dataField="name" caption="Name" />
      <Column dataField="idNumber" caption="ID Number" />
      <Column dataField="amount" caption="$ Amount" alignment="right" />
      <Column dataField="percentage" caption="Percentage %" alignment="right" width={120} />
      <Scrolling mode="standard" />
      <Paging enabled={false} />
    </DataGrid>
  );
};`,

  'card': `import React from 'react';

export const Card = () => {
  return (
    <div className="card-standard" style={{ width: '100%' }}>
      <div className="card-header-wrapper">
        <h2 className="card-title-standard">Card Title</h2>
        <div className="card-header-actions">
          <button className="btn-secondary">Action</button>
        </div>
      </div>
      <div className="card-body-standard">
        <p>This is the card body content. Cards can contain any type of content.</p>
      </div>
    </div>
  );
};`,

  'stackedbar': `import React from 'react';
import Chart, { Series, ArgumentAxis, ValueAxis, Legend, CommonSeriesSettings } from 'devextreme-react/chart';

const chartData = [
  { quarter: 'Q1', series1: 8000, series2: 5000 },
  { quarter: 'Q2', series1: 6000, series2: 4500 },
  { quarter: 'Q3', series1: 7000, series2: 7000 },
  { quarter: 'Q4', series1: 5500, series2: 2500 }
];

export const StackedBarChart = () => {
  return (
    <div className="chart-card">
      <h3 className="chart-title">Stacked bar chart</h3>
      <Chart
        dataSource={chartData}
        className="chart-standard"
      >
        <CommonSeriesSettings
          argumentField="quarter"
          type="stackedbar"
        />
        <Series
          valueField="series1"
          name="Label"
          color="#5236ab"
        />
        <Series
          valueField="series2"
          name="Label"
          color="#e31937"
        />
        <ArgumentAxis />
        <ValueAxis />
        <Legend
          verticalAlignment="bottom"
          horizontalAlignment="center"
          itemTextPosition="right"
        />
      </Chart>
    </div>
  );
};`,

  'stackedarea': `import React from 'react';
import Chart, { Series, ArgumentAxis, ValueAxis, Legend, CommonSeriesSettings } from 'devextreme-react/chart';

const chartData = [
  { month: 'Apr', series1: 30, series2: 20, series3: 15, series4: 10 },
  { month: 'May', series1: 35, series2: 18, series3: 12, series4: 8 },
  { month: 'Jun', series1: 25, series2: 22, series3: 18, series4: 12 },
  { month: 'Jul', series1: 40, series2: 15, series3: 10, series4: 15 },
  { month: 'Aug', series1: 32, series2: 25, series3: 20, series4: 10 },
  { month: 'Sep', series1: 38, series2: 20, series3: 15, series4: 12 },
  { month: 'Oct', series1: 30, series2: 28, series3: 16, series4: 8 }
];

export const StackedAreaChart = () => {
  return (
    <div className="chart-card">
      <h3 className="chart-title">Stacked area chart</h3>
      <Chart
        dataSource={chartData}
        className="chart-standard"
      >
        <CommonSeriesSettings
          argumentField="month"
          type="stackedarea"
        />
        <Series
          valueField="series1"
          name="Label"
          color="#5236ab"
        />
        <Series
          valueField="series2"
          name="Label"
          color="#e31937"
        />
        <Series
          valueField="series3"
          name="Label"
          color="#ff978a"
        />
        <Series
          valueField="series4"
          name="Label"
          color="#fde5a7"
        />
        <ArgumentAxis />
        <ValueAxis
          valueMarginsEnabled={false}
        />
        <Legend
          verticalAlignment="bottom"
          horizontalAlignment="center"
          itemTextPosition="right"
        />
      </Chart>
    </div>
  );
};`,

  'piechart': `import React from 'react';
import PieChart, { Series, Legend, Label } from 'devextreme-react/pie-chart';

const chartData = [
  { category: 'A', value: 20 },
  { category: 'B', value: 25 },
  { category: 'C', value: 20 },
  { category: 'D', value: 18 },
  { category: 'E', value: 17 }
];

const chartColors = ['#5236ab', '#e31937', '#ff978a', '#fde5a7', '#200a58'];

export const PieChartComponent = () => {
  return (
    <div className="chart-card">
      <h3 className="chart-title">Pie chart</h3>
      <PieChart
        dataSource={chartData}
        palette={chartColors}
        className="chart-standard"
      >
        <Series
          argumentField="category"
          valueField="value"
        >
          <Label visible={true} position="inside" customizeText={(arg: any) => arg.argument} />
        </Series>
        <Legend
          verticalAlignment="bottom"
          horizontalAlignment="center"
          itemTextPosition="right"
        />
      </PieChart>
    </div>
  );
};`
};

export const getComponentCode = (componentType: string): string => {
  // Return actual source code from component files
  return COMPONENT_SOURCE_CODE[componentType] || `// Source code not available for ${componentType}`;
};
