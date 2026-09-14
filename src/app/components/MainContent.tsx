import React from 'react';
import { Carousel } from './Carousel';
import { PersonalCasesCard } from './PersonalCasesCard';
import { SalaryCard } from './SalaryCard';
import { VacationCard } from './VacationCard';
import { DataTableCard } from './DataTableCard';
import { Accordion } from './Accordion';
import { HeatMapCard } from './HeatMapCard';
import { FAQCard } from './FAQCard';

/**
 * MAIN CONTENT COMPONENT
 * This component contains the editable dashboard content.
 * Feel free to modify this component when remixing the template.
 */
export const MainContent = () => {
  return (
    <main className="main-content p-0 mx-3">
      <div className="d-flex flex-column gap-4">
        {/* Carousel */}
        <Carousel />

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          <div className="h-100">
            <PersonalCasesCard />
          </div>
          <div className="h-100">
            <SalaryCard />
          </div>
          <div className="h-100">
            <VacationCard />
          </div>
        </div>

        {/* Heat Map Card */}

        {/* Data Table Card */}
        <div className="w-100">
          <DataTableCard />
        </div>

        {/* FAQ Card with Accordion */}
        <div className="w-100">
          <FAQCard />
        </div>

        {/* Accordion */}
        <div className="w-100">
          <Accordion />
        </div>
      </div>
    </main>
  );
};