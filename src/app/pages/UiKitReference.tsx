/**
 * UI-KIT REFERENCE PAGE (Mode B)
 *
 * Canonical, fully-compliant example page. Uses ONLY the ui-kit wrappers, DevExtreme,
 * Bootstrap layout/utility classes, Font Awesome and our CSS classes — no inline styles,
 * no Tailwind utility classes, no shadcn/Lucide/Recharts. Use this as the template for new
 * prototype pages (see CLAUDE.md).
 */
import React, { useState } from 'react';
import {
  PageLayout,
  Card,
  PrimaryButton,
  SecondaryButton,
  TertiaryButton,
} from '../components/ui-kit';
import { BreadcrumbItem } from '../components/Breadcrumbs';
import DataGrid, { Column, Selection, Paging, Scrolling } from 'devextreme-react/data-grid';
import { persons, getActiveEmployment } from '../../data';

// POC: read from the shared person register (src/data) instead of embedding mock data.
const gridData = persons.slice(0, 6).map((p, i) => {
  const emp = getActiveEmployment(p.id) ?? p.employments[0];
  return {
    id: i + 1,
    namn: p.displayName,
    avdelning: emp?.organization.department ?? '—',
    roll: emp?.position.title ?? '—',
    anstallningsdatum: emp?.validFrom ?? '',
  };
});

export const UiKitReference = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Heroma', href: '/' },
    { label: 'UI-kit referens', isActive: true },
  ];

  return (
    <PageLayout title="UI-kit referens" breadcrumbItems={breadcrumbItems}>
      {/* Åtgärdsknappar — de tre varianterna via ui-kit-wrappers */}
      <div className="col-12">
        <Card title="Åtgärder">
          <div className="d-flex gap-2 flex-wrap">
            <PrimaryButton icon="fa-solid fa-plus">Ny post</PrimaryButton>
            <SecondaryButton icon="fa-solid fa-pen">Redigera</SecondaryButton>
            <TertiaryButton icon="fa-solid fa-trash">Ta bort</TertiaryButton>
          </div>
        </Card>
      </div>

      {/* DevExtreme DataGrid med radval */}
      <div className="col-12">
        <Card title="Personuppgifter">
          <DataGrid
            dataSource={gridData}
            keyExpr="id"
            showBorders={false}
            showColumnLines={false}
            showRowLines={true}
            hoverStateEnabled={true}
            rowAlternationEnabled={true}
            selectedRowKeys={selectedRowKeys}
            onSelectionChanged={(e) => setSelectedRowKeys(e.selectedRowKeys as number[])}
          >
            <Selection mode="multiple" showCheckBoxesMode="always" />
            <Column dataField="namn" caption="Namn" />
            <Column dataField="avdelning" caption="Avdelning" />
            <Column dataField="roll" caption="Roll" />
            <Column dataField="anstallningsdatum" caption="Anställningsdatum" dataType="date" format="yyyy-MM-dd" />
            <Scrolling mode="standard" />
            <Paging enabled={false} />
          </DataGrid>
        </Card>
      </div>

      {/* Två kort sida vid sida (Bootstrap-kolumner) */}
      <div className="col-md-6">
        <Card title="Kontaktuppgifter">
          <div className="d-flex flex-column gap-3">
            <div>
              <label className="label-standard d-block">E-post</label>
              <p className="mb-0">anna.lindgren@foretaget.se</p>
            </div>
            <div>
              <label className="label-standard d-block">Telefon</label>
              <p className="mb-0">+46 70 123 45 67</p>
            </div>
            <div>
              <label className="label-standard d-block">Adress</label>
              <p className="mb-0">Storgatan 12, 111 22 Stockholm</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="col-md-6">
        <Card title="Anställningsinformation">
          <div className="d-flex flex-column gap-3">
            <div>
              <label className="label-standard d-block">Anställningsform</label>
              <p className="mb-0">Tillsvidareanställning</p>
            </div>
            <div>
              <label className="label-standard d-block">Tjänstgöringsgrad</label>
              <p className="mb-0">100%</p>
            </div>
            <div>
              <label className="label-standard d-block">Semesterdagar kvar</label>
              <p className="mb-0">18 dagar</p>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};
