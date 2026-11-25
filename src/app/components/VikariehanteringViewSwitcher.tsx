import React from 'react';

export type VikariehanteringView = 'schema' | 'orders' | 'settings';

export function VikariehanteringViewSwitcher({
  activeView,
  orderCount,
  onSelect,
}: {
  activeView: VikariehanteringView;
  orderCount?: number;
  onSelect: (view: VikariehanteringView) => void;
}) {
  return (
    <div className="schema-view-switcher" role="tablist" aria-label="Välj vy">
      <button type="button" className={activeView === 'schema' ? 'active' : ''} role="tab" aria-selected={activeView === 'schema'} onClick={() => onSelect('schema')}>
        <i className="fa-solid fa-calendar-days" /> Schema
      </button>
      <button type="button" className={activeView === 'orders' ? 'active' : ''} role="tab" aria-selected={activeView === 'orders'} onClick={() => onSelect('orders')}>
        <i className="fa-solid fa-users" /> Bemanning{orderCount !== undefined && <span>{orderCount}</span>}
      </button>
      <button type="button" className={activeView === 'settings' ? 'active' : ''} role="tab" aria-selected={activeView === 'settings'} onClick={() => onSelect('settings')}>
        <i className="fa-solid fa-gear" /> Inställningar
      </button>
    </div>
  );
}
