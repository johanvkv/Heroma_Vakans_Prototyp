/**
 * PERSONER — read-only view of the shared person register (Phase 2, Step 2). Mode B.
 *
 * Reads from `src/data/` (never embeds mock data). Read-only DataGrid — no add/edit/delete.
 * Reachable from the user-settings panel; a limited column subset is shown on purpose (the full
 * dataset lives in `src/data/seed.json`).
 */
import React from 'react';
import { PageLayout, Card } from '../components/ui-kit';
import { BreadcrumbItem } from '../components/Breadcrumbs';
import DataGrid, { Column, Paging, Pager, Scrolling, SearchPanel, HeaderFilter } from 'devextreme-react/data-grid';
import { persons, getActiveEmployment, fullName } from '../../data';

const rows = persons.map((p) => {
  const emp = getActiveEmployment(p.id) ?? p.employments[0];
  return {
    id: p.id,
    namn: p.displayName || fullName(p),
    personnummer: p.personalIdentityNumber,
    befattning: emp?.position.title ?? '—',
    avdelning: emp?.organization.department ?? '—',
    kostnadsstalle: emp?.organization.costCenter ?? '—',
    anstallningsform: emp?.employmentForm ?? '—',
    grad: emp ? `${emp.degree}%` : '—',
  };
});

export const Personer = () => {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Heroma', href: '/' },
    { label: 'Inställningar' },
    { label: 'Personer', isActive: true },
  ];

  return (
    <PageLayout title="Personer" breadcrumbItems={breadcrumbItems}>
      <div className="col-12">
        <Card title="Personregister (läsvy)">
          <DataGrid
            dataSource={rows}
            keyExpr="id"
            showBorders={false}
            showColumnLines={false}
            showRowLines={true}
            hoverStateEnabled={true}
            rowAlternationEnabled={true}
            columnAutoWidth={true}
          >
            <SearchPanel visible={true} placeholder="Sök person…" />
            <HeaderFilter visible={true} />
            <Column dataField="namn" caption="Namn" />
            <Column dataField="personnummer" caption="Personnummer" />
            <Column dataField="befattning" caption="Befattning" />
            <Column dataField="avdelning" caption="Avdelning" />
            <Column dataField="kostnadsstalle" caption="Kostnadsställe" />
            <Column dataField="anstallningsform" caption="Anställningsform" />
            <Column dataField="grad" caption="Grad" alignment="left" />
            <Scrolling mode="standard" />
            <Paging defaultPageSize={10} />
            <Pager visible={true} showPageSizeSelector={true} allowedPageSizes={[10, 20]} showInfo={true} />
          </DataGrid>
        </Card>
      </div>
    </PageLayout>
  );
};
