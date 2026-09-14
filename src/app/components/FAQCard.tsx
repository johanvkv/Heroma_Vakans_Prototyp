import React, { useState } from 'react';
import { Tooltip } from './Tooltip';
import { CardMenu } from './CardMenu';

const FAQ_SECTIONS = [
  {
    id: '1',
    title: 'Hur ansöker jag om semester?',
    content: (
      <div>
        <p>För att ansöka om semester följer du dessa steg:</p>
        <ol>
          <li>Gå till avsnittet "Semester" i din portal</li>
          <li>Klicka på "Ny semesteransökan"</li>
          <li>Välj datum och fyll i formuläret</li>
          <li>Skicka in din ansökan för godkännande</li>
        </ol>
      </div>
    )
  },
  {
    id: '2',
    title: 'Var hittar jag min lönespecifikation?',
    content: (
      <div>
        <p>Din lönespecifikation finns tillgänglig på flera ställen:</p>
        <ul>
          <li>Under "Lön" i huvudmenyn</li>
          <li>I avsnittet "Dokument"</li>
          <li>Via snabblänkar på startsidan</li>
        </ul>
        <p>Du kan ladda ner tidigare specifikationer i PDF-format.</p>
      </div>
    )
  },
  {
    id: '3',
    title: 'Hur uppdaterar jag mina kontaktuppgifter?',
    content: (
      <div>
        <p>För att uppdatera dina kontaktuppgifter:</p>
        <ol>
          <li>Klicka på din profil i övre högra hörnet</li>
          <li>Välj "Inställningar"</li>
          <li>Gå till "Personuppgifter"</li>
          <li>Redigera och spara dina nya uppgifter</li>
        </ol>
      </div>
    )
  },
  {
    id: '4',
    title: 'Vad gör jag om jag glömt mitt lösenord?',
    content: (
      <div>
        <p>Om du har glömt ditt lösenord kan du återställa det genom att:</p>
        <ul>
          <li>Klicka på "Glömt lösenord?" på inloggningssidan</li>
          <li>Ange din e-postadress</li>
          <li>Följ instruktionerna i det e-postmeddelande du får</li>
        </ul>
        <p>Om du inte får något e-postmeddelande, kontakta IT-support.</p>
      </div>
    )
  },
  {
    id: '5',
    title: 'Hur rapporterar jag sjukfrånvaro?',
    content: (
      <div>
        <p>För att rapportera sjukfrånvaro:</p>
        <ol>
          <li>Gå till "Frånvaro" i menyn</li>
          <li>Välj "Rapportera sjukdom"</li>
          <li>Fyll i från vilket datum och förväntat datum för återgång</li>
          <li>Skicka in rapporten</li>
        </ol>
        <p>Kom ihåg att kontakta din chef så snart som möjligt vid sjukdom.</p>
      </div>
    )
  },
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

export const FAQCard = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'normal' | 'collapsed' | 'fullscreen'>('normal');

  return (
    <div className={`card-container border-top-4 ${viewMode === 'fullscreen' ? 'card-fullscreen' : ''}`}>
      <div className="card-content-wrapper">
        <div className="card-header-row card-header-row-bordered">
          <h3 className="card-title">
            <span>Vanliga frågor</span>
            <span className="tooltip-wrapper">
              <i className="fa-solid fa-circle-info card-title-icon"></i>
              <Tooltip text="Svar på vanliga frågor om portalen och dess funktioner" />
            </span>
          </h3>
          <CardMenu viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {viewMode !== 'collapsed' && (
          <div className="card-body">
            <div className="d-flex flex-column w-100 accordion-container-bg">
              {FAQ_SECTIONS.map((section) => {
                const isExpanded = expandedId === section.id;
                return (
                  <div key={section.id} className={`accordion-section ${isExpanded ? 'expanded' : 'collapsed'}`}>
                    <button
                      className="accordion-header"
                      onClick={() => setExpandedId(prev => prev === section.id ? null : section.id)}
                      type="button"
                      aria-expanded={isExpanded}
                    >
                      <span className="accordion-title">{section.title}</span>
                      {isExpanded ? <MinusIcon /> : <PlusIcon />}
                    </button>
                    {isExpanded && (
                      <div className="accordion-content">{section.content}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
