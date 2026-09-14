import React from 'react';
import { Layout } from '../Layout';
import { BreadcrumbItem } from '../Breadcrumbs';

interface PageLayoutProps {
  title: string;
  breadcrumbItems: BreadcrumbItem[];
  /** Bootstrap grid columns placed inside the standard `.row` (e.g. `<div className="col-12">…</div>`). */
  children: React.ReactNode;
}

/**
 * Compliant page scaffold (Mode B). Wraps the persistent `<Layout>` (Header/SubHeader)
 * and the standard Bootstrap content grid so every new page starts compliant.
 * Children should be Bootstrap columns inside the `.row`.
 */
export const PageLayout: React.FC<PageLayoutProps> = ({ title, breadcrumbItems, children }) => (
  <Layout breadcrumbItems={breadcrumbItems} title={title}>
    <main className="main-content-wrapper">
      <div className="container-fluid">
        <div className="row g-3">{children}</div>
      </div>
    </main>
  </Layout>
);
