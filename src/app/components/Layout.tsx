import React from 'react';
import { Header } from './Header';
import { SubHeader } from './SubHeader';
import { ScrollToBottomButton } from './ScrollToBottomButton';
import { BreadcrumbItem } from './Breadcrumbs';

interface LayoutProps {
  children: React.ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
  title?: string;
  hideCaseActivityButton?: boolean;
  showAutomationControls?: boolean;
}

/**
 * PERMANENT LAYOUT COMPONENT
 * This component contains the persistent Header and SubHeader.
 * DO NOT REMOVE OR MODIFY - These elements remain consistent across the entire application.
 */
export const Layout: React.FC<LayoutProps> = ({ children, breadcrumbItems, title, hideCaseActivityButton = false, showAutomationControls = false }) => {
  return (
    <div className="app-wrapper text-foreground">
      <Header hideCaseActivityButton={hideCaseActivityButton} showAutomationControls={showAutomationControls} />
      <SubHeader breadcrumbItems={breadcrumbItems} title={title} />
      {children}
      <ScrollToBottomButton />
    </div>
  );
};
