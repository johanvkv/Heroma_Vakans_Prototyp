import React from 'react';

export interface StepperData {
  label: string;
  description?: string;
}

export interface GridColumn {
  dataField: string;
  caption: string;
}

export interface GridData {
  columns: GridColumn[];
  data: any[];
}

export interface AccordionSection {
  id: string;
  title: string;
  children: DroppedComponent[];
}

export interface TreeRowItem {
  id: number;
  parentId: number | null;
  name: string;
}

export interface TabSection {
  id: string;
  title: string;
  icon?: string;
  children: DroppedComponent[];
}

export interface StepperStep {
  id: string;
  label: string;
  description?: string;
  children: DroppedComponent[];
}

export interface DroppedComponent {
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
  hasActionsColumn?: boolean;
  actionColumnChildren?: DroppedComponent[];
  detailChildrenByRow?: { [rowKey: string]: DroppedComponent[] };
  accordionSections?: AccordionSection[];
  tabSections?: TabSection[];
  alignment?: 'left' | 'right' | 'center';
  sidebarAlignment?: 'left' | 'right';
  sidebarContent?: { [menuItemId: string]: DroppedComponent[] };
  selectedMenuItem?: string;
  sidebarNavData?: any[];
  gridFeatures?: {
    selection?: boolean;
    columnChooser?: boolean;
    sorting?: boolean;
    searchPanel?: boolean;
    expandable?: boolean;
    actions?: boolean;
  };
  alertVariant?: 'info' | 'warning' | 'error' | 'success';
  alertMessage?: string;
  showAlertLink?: boolean;
  buttonIcon?: string;
  buttonIconPosition?: 'left' | 'right';
  segmentedButtonIcons?: string[];
  inputType?: 'text' | 'date' | 'time' | 'search' | 'dropdown' | 'textarea';
  inputWidth?: number;
  treeData?: TreeRowItem[];
  schedulerEvents?: SchedulerEvent[];
  schedulerCurrentDate?: string;
  schedulerView?: 'day' | 'week' | 'month' | 'agenda';
}

export interface SchedulerEvent {
  id: number;
  text: string;
  startDate: string;
  endDate: string;
  allDay?: boolean;
}
