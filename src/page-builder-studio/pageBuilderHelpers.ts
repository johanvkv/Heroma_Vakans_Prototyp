import React from 'react';
import { AccordionSection, TabSection, StepperStep, SchedulerEvent } from './pageBuilderTypes';

// Helper function to extract text content from React element
export const extractTextContent = (element?: React.ReactElement): string => {
  if (!element || !element.props) {
    return '';
  }
  if (typeof element.props.children === 'string') {
    return element.props.children;
  }
  if (Array.isArray(element.props.children)) {
    return element.props.children
      .filter((child: any) => typeof child === 'string' || (child && child.props && child.props.children))
      .map((child: any) => {
        if (typeof child === 'string') return child;
        if (child.props && typeof child.props.children === 'string') return child.props.children;
        return '';
      })
      .join('\n');
  }
  return '';
};

// Helper function to get default text content for text components
export const getDefaultTextContent = (type: string): string => {
  switch (type) {
    case 'text-20':
      return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.';
    case 'text-list':
      return 'First item in the list\nSecond item with more content\nThird item to demonstrate structure';
    case 'text-link':
      return 'Click here to learn more';
    case 'text-card-title':
      return 'Card Title';
    default:
      return '';
  }
};

export const DEFAULT_ACCORDION_SECTIONS: AccordionSection[] = [
  { id: 'a1', title: 'Section header 1', children: [] },
  { id: 'a2', title: 'Section header 2', children: [] },
  { id: 'a3', title: 'Section header 3', children: [] },
  { id: 'a4', title: 'Section header 4', children: [] },
  { id: 'a5', title: 'Section header 5', children: [] },
];

export const DEFAULT_TAB_SECTIONS: TabSection[] = [
  { id: 't1', title: 'Tab 1', children: [] },
  { id: 't2', title: 'Tab 2', children: [] },
  { id: 't3', title: 'Tab 3', children: [] },
];

export const DEFAULT_STEPPER_STEPS: StepperStep[] = [
  { id: 's1', label: 'Step 1', description: 'First step', children: [] },
  { id: 's2', label: 'Step 2', description: 'Second step', children: [] },
  { id: 's3', label: 'Step 3', description: 'Third step', children: [] },
];

export const DEFAULT_SCHEDULER_EVENTS: SchedulerEvent[] = [
  { id: 1,  text: 'Team Standup',          startDate: '2025-01-13T09:00:00', endDate: '2025-01-13T09:30:00' },
  { id: 2,  text: 'Design Review',          startDate: '2025-01-13T11:00:00', endDate: '2025-01-13T12:00:00' },
  { id: 3,  text: 'Sprint Planning',        startDate: '2025-01-14T10:00:00', endDate: '2025-01-14T11:30:00' },
  { id: 4,  text: 'Client Call',            startDate: '2025-01-14T14:00:00', endDate: '2025-01-14T15:00:00' },
  { id: 5,  text: 'Deployment Window',      startDate: '2025-01-15T08:00:00', endDate: '2025-01-15T10:00:00' },
  { id: 6,  text: 'Retrospective',          startDate: '2025-01-16T15:00:00', endDate: '2025-01-16T16:00:00' },
  { id: 7,  text: 'All-day Conference',     startDate: '2025-01-17T00:00:00', endDate: '2025-01-17T23:59:00', allDay: true },
];
