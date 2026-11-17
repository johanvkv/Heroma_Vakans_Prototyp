import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { PageLayout } from '../components/ui-kit';
import { useRole } from '../components/RoleContext';
import { useAutomation, AutomationMode } from '../components/AutomationContext';
import TreeView from 'devextreme-react/tree-view';

type SettingState = Record<string, boolean | string>;

function readSettings(roleId: string): SettingState {
  try { return JSON.parse(localStorage.getItem(`vikariehantering.roleSettings.${roleId}`) ?? '{}') as SettingState; }
  catch { return {}; }
}

const settingsByRole = {
  medarbetare: {
    title: 'Mina inställningar',
    intro: 'Välj hur du får förfrågningar och när du kan arbeta som vikarie.',
    groups: [
      { title: 'Förfrågningar', items: [['notifyNew', 'Meddela mig om nya vikariepass'], ['notifyUrgent', 'Prioritera akuta förfrågningar']] },
      { title: 'Tillgänglighet', items: [['shareAvailability', 'Visa min tillgänglighet för bemanningen'], ['allowShortNotice', 'Jag kan ta pass med kort varsel']] },
    ],
  },
  bestallare: {
    title: 'Beställarinställningar',
    intro: 'Styr hur frånvaro blir resursbehov och hur dina beställningar skickas.',
    groups: [
      { title: 'Resursbehov', items: [['suggestAbsence', 'Föreslå resursbehov vid registrerad frånvaro'], ['includeExtraPass', 'Visa extrapass som resursbehov'], ['defaultUrgent', 'Markera frånvaro samma dag som akut']] },
      { title: 'Beställningar', items: [['sendAvailableSubs', 'Skicka först till tillgängliga vikarier'], ['notifyOrderUpdates', 'Meddela mig när beställningen ändras']] },
    ],
  },
  bemannare: {
    title: 'Bemanningsinställningar',
    intro: 'Välj vilka faktorer som ska styra urval och tillsättning av vikarier.',
    groups: [
      { title: 'Urval av vikarie', items: [['rankCompetence', 'Prioritera rätt kompetens'], ['rankContinuity', 'Prioritera kontinuitet på avdelningen'], ['rankAvailability', 'Prioritera bekräftad tillgänglighet']] },
      { title: 'Handläggning', items: [['notifyNoCandidates', 'Meddela när ingen vikarie matchar'], ['holdUnanswered', 'Behåll obesvarade beställningar öppna']] },
    ],
  },
  admin: {
    title: 'Systeminställningar för vikariehantering',
    intro: 'Styr gemensamma regler och automation. Inställningarna påverkar förslagen i schemavyn.',
    groups: [
      { title: 'Resursbehov', items: [['includeExtraPass', 'Tillåt manuellt skapade extrapass'], ['notifyNoCandidates', 'Visa varning när ingen vikarie matchar']] },
      { title: 'Behörighet och avisering', items: [['allowOrdering', 'Låt beställare skicka behov till central bemanning'], ['notifyOrderUpdates', 'Skicka avisering vid statusändring']] },
    ],
  },
} as const;

const roleNames: Record<string, keyof typeof settingsByRole> = {
  medarbetare: 'medarbetare', bestallare: 'bestallare', bemannare: 'bemannare', admin: 'admin',
};

const modeOptions: Array<{ id: AutomationMode; label: string; help: string }> = [
  { id: 'off', label: 'Av', help: 'Alla behov bedöms och tillsätts manuellt.' },
  { id: 'always', label: 'Alltid aktiv', help: 'Automatiken arbetar löpande när ett nytt behov uppstår.' },
  { id: 'off-hours', label: 'Utanför bemanningstid', help: 'Aktiv på vardagar före eller efter bemanningstiden samt på helger.' },
  { id: 'free-then-confirm', label: 'Kostnadsfri vikarie direkt', help: 'Kostnadsfria matchningar tillsätts automatiskt. Kostnadskrävande val behöver godkännas.' },
];

export function VikariehanteringSettings() {
  const navigate = useNavigate();
  const { selectedRoleId, selectedRole } = useRole();
  const automation = useAutomation();
  const config = settingsByRole[roleNames[selectedRoleId] ?? 'medarbetare'];
  const [values, setValues] = useState<SettingState>(() => readSettings(selectedRoleId));
  const [activeSettingId, setActiveSettingId] = useState('section-0');
  useEffect(() => {
    setValues(readSettings(selectedRoleId));
    setActiveSettingId('section-0');
  }, [selectedRoleId]);
  const save = (key: string, value: boolean | string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    localStorage.setItem(`vikariehantering.roleSettings.${selectedRoleId}`, JSON.stringify(next));
  };
  const checked = (key: string, fallback = true) => values[key] === undefined ? fallback : values[key] === true;
  const settingTree = [{
    id: 'root', text: 'Vikariehantering', expanded: true,
    items: [
      ...config.groups.map((group, index) => ({ id: `section-${index}`, text: group.title, icon: 'fa-solid fa-sliders' })),
      ...(selectedRoleId === 'admin' ? [{ id: 'automation', text: 'Automation', icon: 'fa-solid fa-robot' }] : []),
    ],
  }];
  const activeGroupIndex = activeSettingId.startsWith('section-') ? Number(activeSettingId.slice('section-'.length)) : -1;
  const activeGroup = config.groups[activeGroupIndex];
  const breadcrumbs = [{ label: 'Heroma', href: '/' }, { label: 'Vikariehantering' }, { label: 'Inställningar', isActive: true }];

  return <PageLayout title="Inställningar" breadcrumbItems={breadcrumbs} hideCaseActivityButton>
    <div className="col-12"><div className="vh-settings-page">
      <div className="vh-settings-topline">
        <div><span className="vh-settings-eyebrow">VIKARIEHANTERING · FÖRSKOLA</span><h1>{config.title}</h1><p>{config.intro}</p></div>
        <button className="vh-settings-back" onClick={() => navigate('/vikariehantering/schema')}><i className="fa-solid fa-arrow-left" /> Till schemat</button>
      </div>
      <div className="vh-role-note"><i className="fa-solid fa-user-shield" /><span>Du agerar som <strong>{selectedRole.label}</strong>. Byt roll via Admin i huvudmenyn.</span></div>

      <div className="vh-settings-workspace">
        <aside className="vh-settings-tree-panel" aria-label="Inställningskategorier">
          <div className="vh-settings-tree-heading"><i className="fa-solid fa-list-tree" /> Inställningar</div>
          <TreeView
            items={settingTree}
            keyExpr="id"
            displayExpr="text"
            itemsExpr="items"
            expandedExpr="expanded"
            selectByClick
            selectionMode="single"
            onItemClick={event => {
              const id = String(event.itemData?.id ?? '');
              if (id !== 'root') setActiveSettingId(id);
            }}
            itemRender={item => <div className={`vh-settings-tree-item${item.id === activeSettingId ? ' active' : ''}`}><i className={item.icon ?? 'fa-solid fa-folder'} /><span>{item.text}</span></div>}
          />
        </aside>
        <section className="vh-settings-detail">
          {activeGroup && <>
            <div className="vh-settings-detail-heading"><span>INSTÄLLNINGAR · {selectedRole.label.toUpperCase()}</span><h2>{activeGroup.title}</h2><p>{config.intro}</p></div>
            <section className="vh-settings-card">
              <h2>{activeGroup.title}</h2>
              <div className="vh-setting-list">{activeGroup.items.map(([key, label]) => <label className="vh-setting-row" key={key}>
                <span><strong>{label}</strong><small>{key === 'suggestAbsence' ? 'Förslaget läggs i resursbehovslistan för granskning.' : key === 'rankCompetence' ? 'Kompetensmatchning vägs in i föreslagen vikarie.' : 'Kan ändras när som helst.'}</small></span>
                <input type="checkbox" checked={checked(key)} onChange={event => save(key, event.target.checked)} />
              </label>)}</div>
            </section>
          </>}

          {activeSettingId === 'automation' && selectedRoleId === 'admin' && <section className="vh-settings-card vh-automation-card">
        <div className="vh-card-title"><span className="vh-automation-icon"><i className="fa-solid fa-robot" /></span><div><h2>Automation</h2><p>Bestäm när systemet föreslår, matchar och tillsätter vikarier.</p></div></div>
        <div className="vh-automation-modes">{modeOptions.map(mode => <label className={`vh-mode-option${automation.automationMode === mode.id ? ' selected' : ''}`} key={mode.id}>
          <input type="radio" name="automationMode" value={mode.id} checked={automation.automationMode === mode.id} onChange={() => automation.setAutomationMode(mode.id)} />
          <span><strong>{mode.label}</strong><small>{mode.help}</small></span>
        </label>)}</div>
        <div className="vh-automation-rules">
          <label><input type="checkbox" checked={automation.autoCreateNeeds} onChange={e => automation.setAutoCreateNeeds(e.target.checked)} /><span><strong>Skapa behov automatiskt</strong><small>Lägg frånvaropass i resursbehovslistan.</small></span></label>
          <label><input type="checkbox" checked={automation.autoAssignFreeSubstitutes} onChange={e => automation.setAutoAssignFreeSubstitutes(e.target.checked)} /><span><strong>Tillsätt kostnadsfria matchningar</strong><small>Välj tillgänglig vikarie utan manuell åtgärd.</small></span></label>
          <label><input type="checkbox" checked={automation.askBeforePaidSubstitutes} onChange={e => automation.setAskBeforePaidSubstitutes(e.target.checked)} /><span><strong>Begär godkännande för kostnad</strong><small>Visa bekräftelse innan kostnadskrävande vikarie tillsätts.</small></span></label>
        </div>
        <div className="vh-hours-row"><div><strong>Bemanningstid</strong><small>Används av läget ”Utanför bemanningstid”.</small></div><label>Från <input type="time" value={automation.businessHoursStart} onChange={e => automation.setBusinessHoursStart(e.target.value)} /></label><label>Till <input type="time" value={automation.businessHoursEnd} onChange={e => automation.setBusinessHoursEnd(e.target.value)} /></label></div>
      </section>}
        </section>
      </div>
      <div className="vh-settings-footnote"><i className="fa-solid fa-circle-info" /> Inställningarna sparas automatiskt i den här prototypen.</div>
    </div></div>
  </PageLayout>;
}
