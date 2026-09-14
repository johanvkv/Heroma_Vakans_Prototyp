import React, { useState } from 'react';

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
            className={`accordion-section ${isExpanded ? 'expanded' : 'collapsed'}`}
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
}