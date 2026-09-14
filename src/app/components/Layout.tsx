import React from 'react';
import { Header } from './Header';
import { SubHeader } from './SubHeader';
import { ScrollToBottomButton } from './ScrollToBottomButton';
import { BreadcrumbItem } from './Breadcrumbs';

interface LayoutProps {
  children: React.ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
  title?: string;
}

/**
 * PERMANENT LAYOUT COMPONENT
 * This component contains the persistent Header and SubHeader.
 * DO NOT REMOVE OR MODIFY - These elements remain consistent across the entire application.
 */
export const Layout: React.FC<LayoutProps> = ({ children, breadcrumbItems, title }) => {
  return (
    <div className="app-wrapper text-foreground">
      {/* PERMANENT HEADER - DO NOT REMOVE */}
      <Header />

      {/* PERMANENT SUB-HEADER - DO NOT REMOVE */}
      <SubHeader breadcrumbItems={breadcrumbItems} title={title} />

      {/* EDITABLE CONTENT AREA */}
      {children}

      {/* FLOATING BUTTONS */}
      <ScrollToBottomButton />
    </div>
  );
};