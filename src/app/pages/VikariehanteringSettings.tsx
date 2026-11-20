import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { PageLayout } from '../components/ui-kit';
import { useRole } from '../components/RoleContext';
import { useAutomation, type AutomationMode } from '../components/AutomationContext';
import { VikariehanteringViewSwitcher } from '../components/VikariehanteringViewSwitcher';

type SettingValue = boolean | string | number;
type SettingControl = 'toggle' | 'number' | 'time' | 'select';
interface SettingOption { value: string; label: string; }
interface SettingItem {
  key: string;
  label: string;
  help: string;
  control: SettingControl;
  defaultValue: SettingValue;
  options?: SettingOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}
interface SettingGroup { title: string; description: string; items: SettingItem[]; }
interface RoleSettingsConfig { title: string; intro: string; groups: SettingGroup[]; }
type SettingState = Record<string, SettingValue>;
type RoleKey = 'medarbetare' | 'bestallare' | 'bemannare' | 'admin';

const toggle = (key: string, label: string, help: string, defaultValue = true): SettingItem => ({ key, label, help, control: 'toggle', defaultValue });
const numberSetting = (key: string, label: string, help: string, defaultValue: number, min: number, max: number, unit: string, step = 1): SettingItem => ({ key, label, help, control: 'number', defaultValue, min, max, step, unit });
const timeSetting = (key: string, label: string, help: string, defaultValue: string): SettingItem => ({ key, label, help, control: 'time', defaultValue });
const selectSetting = (key: string, label: string, help: string, defaultValue: string, options: SettingOption[]): SettingItem => ({ key, label, help, control: 'select', defaultValue, options });

const settingsByRole: Record<RoleKey, RoleSettingsConfig> = {
  medarbetare: {
    title: 'Mina inställningar',
    intro: 'Välj hur du får förfrågningar och när du kan arbeta som vikarie.',
    groups: [
      { title: 'Förfrågningar', description: 'Välj vilka förfrågningar du vill få.', items: [
        toggle('notifyNew', 'Meddela mig om nya vikariepass', 'Skicka en avisering när ett nytt pass matchar min profil.'),
        toggle('notifyUrgent', 'Prioritera akuta förfrågningar', 'Akuta pass visas först i listan över förfrågningar.'),
        toggle('allowShortNotice', 'Jag kan ta pass med kort varsel', 'Gör mig tillgänglig för pass som börjar snart.'),
      ] },
      { title: 'Tillgänglighet', description: 'Styr hur bemanningen ser din tillgänglighet.', items: [
        toggle('shareAvailability', 'Visa min tillgänglighet för bemanningen', 'Tillgängliga tider används vid matchning mot pass.'),
        selectSetting('availabilityNotice', 'Kortaste framförhållning', 'Hur långt före passet vill du normalt bli tillfrågad?', 'same-day', [
          { value: 'same-day', label: 'Samma dag' }, { value: 'one-day', label: 'Minst en dag' }, { value: 'three-days', label: 'Minst tre dagar' },
        ]),
      ] },
      { title: 'Aviseringar', description: 'Välj när och hur aviseringar når dig.', items: [
        selectSetting('notificationChannel', 'Aviseringskanal', 'Kanal för nya pass och ändringar.', 'app', [
          { value: 'app', label: 'I appen' }, { value: 'sms', label: 'SMS' }, { value: 'both', label: 'App och SMS' },
        ]),
        timeSetting('quietHoursStart', 'Stör ej från', 'Aviseringar som inte är akuta pausas från den här tiden.', '21:00'),
        timeSetting('quietHoursEnd', 'Stör ej till', 'Aviseringar återupptas vid den här tiden.', '07:00'),
      ] },
    ],
  },
  bestallare: {
    title: 'Beställarinställningar',
    intro: 'Styr hur frånvaro blir resursbehov och hur dina beställningar skickas.',
    groups: [
      { title: 'Resursbehov', description: 'Bestäm när frånvaro och extrapass ska föreslås som resursbehov.', items: [
        toggle('suggestAbsence', 'Föreslå resursbehov vid registrerad frånvaro', 'Förslaget läggs i resursbehovslistan för granskning.'),
        toggle('includeExtraPass', 'Visa extrapass som resursbehov', 'Ta med manuellt skapade extrapass i listan.'),
        toggle('defaultUrgent', 'Markera frånvaro samma dag som akut', 'Gör behov med start idag lättare att hitta.'),
      ] },
      { title: 'Beställningar', description: 'Styr hur beställningar skickas och följs upp.', items: [
        toggle('sendAvailableSubs', 'Skicka först till tillgängliga vikarier', 'Prioritera kandidater med registrerad tillgänglighet.'),
        toggle('notifyOrderUpdates', 'Meddela mig när beställningen ändras', 'Avisera vid statusändring eller nytt svar.'),
      ] },
      { title: 'Kostnadsgränser', description: 'Sätt ramar för när en beställning behöver godkännas.', items: [
        numberSetting('approvalCostLimit', 'Kostnad som kräver godkännande', 'Beställningar över gränsen inväntar attest.', 1500, 0, 10000, 'kr'),
        selectSetting('costPreference', 'Förvald kostnadsprioritet', 'Används som förvalt urval i kandidatpanelen.', 'balanced', [
          { value: 'lowest', label: 'Lägsta kostnad först' }, { value: 'balanced', label: 'Balanserad matchning' }, { value: 'continuity', label: 'Kontinuitet först' },
        ]),
      ] },
      { title: 'Eskalering och svarstider', description: 'Välj när ett obesvarat behov ska skickas vidare.', items: [
        numberSetting('requestResponseMinutes', 'Vänta på svar', 'Tid innan obesvarad förfrågan eskaleras.', 30, 5, 240, 'min'),
        toggle('escalateUnfilled', 'Skicka obesatta behov vidare till bemanning', 'Eskalera när ingen kandidat tackat ja inom svarstiden.'),
        toggle('notifyNoCandidates', 'Meddela när ingen kandidat matchar', 'Visa en tydlig avisering om urvalet saknar matchningar.'),
      ] },
    ],
  },
  bemannare: {
    title: 'Bemanningsinställningar',
    intro: 'Välj vilka regler och faktorer som ska styra urval och handläggning.',
    groups: [
      { title: 'Urval av vikarie', description: 'Styr hur kandidater rangordnas i urvalet.', items: [
        toggle('rankCompetence', 'Prioritera rätt kompetens', 'Kompetensmatchning vägs in i föreslagen vikarie.'),
        toggle('rankContinuity', 'Prioritera kontinuitet på enheten', 'Kandidater som arbetat på enheten senaste halvåret rankas högre.'),
        toggle('rankAvailability', 'Prioritera bekräftad tillgänglighet', 'Bekräftad tillgänglighet rankas högre än okänd tillgänglighet.'),
      ] },
      { title: 'Handläggning', description: 'Välj hur pågående behov och aviseringar ska hanteras.', items: [
        toggle('notifyNoCandidates', 'Meddela när ingen vikarie matchar', 'Visa varning när urvalet inte ger någon lämplig kandidat.'),
        toggle('holdUnanswered', 'Behåll obesvarade beställningar öppna', 'Låt beställningen ligga kvar tills den stängs eller eskaleras.'),
        numberSetting('candidateBatchSize', 'Kandidater per förfrågningsomgång', 'Antal kandidater som kontaktas samtidigt.', 3, 1, 20, 'st'),
      ] },
      { title: 'Arbetstidsregler', description: 'Ta hänsyn till vila och arbetade timmar vid matchning.', items: [
        toggle('enforceDailyRest', 'Spärra pass som bryter mot dygnsvila', 'Kandidater med otillräcklig vila kan inte väljas.'),
        numberSetting('minimumDailyRest', 'Minsta dygnsvila', 'Vilotid mellan två arbetspass.', 11, 8, 16, 'tim'),
        numberSetting('lasWarningThreshold', 'LAS-varning vid', 'Visa varning när timvikariens arbetade timmar närmar sig gränsen.', 320, 100, 360, 'tim'),
        numberSetting('atlWarningThreshold', 'ATL-varning vid', 'Visa varning för fastanställda nära den valda ATL-gränsen.', 180, 100, 200, 'tim'),
      ] },
      { title: 'Kompetenskrav', description: 'Bestäm när kompetens är ett krav respektive en urvalsfaktor.', items: [
        toggle('requireCompetenceMatch', 'Kräv matchning mot obligatorisk kompetens', 'Uteslut kandidater som saknar passets obligatoriska kompetens.'),
        toggle('allowNearCompetence', 'Tillåt närliggande kompetens', 'Visa kandidater med likvärdig kompetens som möjliga alternativ.', false),
      ] },
    ],
  },
  admin: {
    title: 'Systeminställningar för vikariehantering',
    intro: 'Styr gemensamma regler, behörigheter och automatisering för sjukhusenheten.',
    groups: [
      { title: 'Resursbehov', description: 'Styr vilka typer av behov som kan skapas och följas upp.', items: [
        toggle('includeExtraPass', 'Tillåt manuellt skapade extrapass', 'Extrapass kan läggas till som resursbehov.'),
        toggle('notifyNoCandidates', 'Visa varning när ingen vikarie matchar', 'Gör omatchade behov synliga för bemanning.'),
      ] },
      { title: 'Behörighet och avisering', description: 'Styr åtkomst och viktiga statusmeddelanden.', items: [
        toggle('allowOrdering', 'Låt beställare skicka behov till central bemanning', 'Beställare kan lämna över resursbehov.'),
        toggle('notifyOrderUpdates', 'Skicka avisering vid statusändring', 'Avisera berörda användare när status ändras.'),
        toggle('allowRequesterDirectAssignment', 'Låt beställare tillsätta kostnadsfria kandidater direkt', 'Beställare kan använda automatiska kostnadsfria matchningar.'),
      ] },
      { title: 'Organisation och bemanningstid', description: 'Bestäm hur enheternas tider och ansvar påverkar hanteringen.', items: [
        toggle('useUnitSpecificBusinessHours', 'Använd bemanningstid per enhet', 'Enhetens tider kan ersätta de gemensamma tiderna i automationen.'),
        selectSetting('afterHoursRouting', 'Ansvar utanför bemanningstid', 'Välj vilken funktion som får nästa åtgärd.', 'central', [
          { value: 'central', label: 'Central bemanning' }, { value: 'requester', label: 'Beställande enhet' }, { value: 'on-call', label: 'Beredskap' },
        ]),
        toggle('includeNightsWeekends', 'Hantera natt och helg automatiskt', 'Låt automationen arbeta med behov utanför vardagstid.'),
      ] },
      { title: 'Register och datakvalitet', description: 'Säkerställ att kandidatuppgifter är aktuella.', items: [
        toggle('requireClearance', 'Kräv giltigt belastningsregisterutdrag', 'Uteslut kandidater med saknat eller utgånget utdrag.'),
        numberSetting('clearanceExpiryNotice', 'Påminn före utdrag löper ut', 'Visa påminnelse så här många dagar innan utgång.', 30, 1, 180, 'dag'),
        toggle('requireCompetenceRecords', 'Kräv verifierade kompetensuppgifter', 'Visa bara verifierad kompetens som uppfyllt krav.'),
      ] },
    ],
  },
};

const roleNames: Record<string, RoleKey> = {
  medarbetare: 'medarbetare', bestallare: 'bestallare', bemannare: 'bemannare', admin: 'admin',
};

const modeOptions: Array<{ id: AutomationMode; label: string; help: string }> = [
  { id: 'off', label: 'Av', help: 'Alla behov bedöms och tillsätts manuellt.' },
  { id: 'always', label: 'Alltid aktiv', help: 'Automatiken arbetar löpande när ett nytt behov uppstår.' },
  { id: 'off-hours', label: 'Utanför bemanningstid', help: 'Aktiv på vardagar före eller efter bemanningstiden samt på helger.' },
  { id: 'free-then-confirm', label: 'Kostnadsfri vikarie direkt', help: 'Kostnadsfria matchningar tillsätts automatiskt. Kostnadskrävande val behöver godkännas.' },
];

function readSettings(roleId: string): SettingState {
  try { return JSON.parse(localStorage.getItem(`vikariehantering.roleSettings.${roleId}`) ?? '{}') as SettingState; }
  catch { return {}; }
}

export function VikariehanteringSettings() {
  const navigate = useNavigate();
  const { selectedRoleId, selectedRole } = useRole();
  const automation = useAutomation();
  const config = settingsByRole[roleNames[selectedRoleId] ?? 'medarbetare'];
  const [values, setValues] = useState<SettingState>(() => readSettings(selectedRoleId));
  const [orderCount] = useState(() => {
    const savedCount = sessionStorage.getItem('vikariehantering.orderCount');
    return savedCount === null ? 4 : Math.max(0, Number(savedCount) || 0);
  });
  useEffect(() => setValues(readSettings(selectedRoleId)), [selectedRoleId]);

  const save = (key: string, value: SettingValue) => {
    const next = { ...values, [key]: value };
    setValues(next);
    localStorage.setItem(`vikariehantering.roleSettings.${selectedRoleId}`, JSON.stringify(next));
  };
  const breadcrumbs = [{ label: 'Heroma', href: '/' }, { label: 'Vikariehantering' }, { label: 'Inställningar', isActive: true }];
  const renderControl = (item: SettingItem) => {
    const id = `setting-${selectedRoleId}-${item.key}`;
    const value = values[item.key] ?? item.defaultValue;
    if (item.control === 'toggle') return <input id={id} type="checkbox" checked={value === true} onChange={event => save(item.key, event.currentTarget.checked)} />;
    if (item.control === 'select') return <select id={id} value={String(value)} onChange={event => save(item.key, event.currentTarget.value)}>{item.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
    if (item.control === 'time') return <input id={id} type="time" value={String(value)} onChange={event => save(item.key, event.currentTarget.value)} />;
    return <div className="vh-setting-number"><input id={id} type="number" value={String(value)} min={item.min} max={item.max} step={item.step} onChange={event => save(item.key, event.currentTarget.value === '' ? '' : Number(event.currentTarget.value))} /><span>{item.unit}</span></div>;
  };

  return <PageLayout title="Inställningar" breadcrumbItems={breadcrumbs} hideCaseActivityButton>
    <div className="col-12"><div className="vh-settings-page">
      <VikariehanteringViewSwitcher
        activeView="settings"
        orderCount={orderCount}
        onSelect={view => {
          if (view === 'schema') navigate('/vikariehantering/schema');
          if (view === 'orders') navigate('/vikariehantering/schema?view=orders');
        }}
      />
      <div className="vh-settings-topline">
        <div><span className="vh-settings-eyebrow">VIKARIEHANTERING · SJUKHUS</span><h1>{config.title}</h1><p>{config.intro}</p></div>
      </div>
      <div className="vh-role-note"><i className="fa-solid fa-user-shield" /><span>Du agerar som <strong>{selectedRole.label}</strong>. Byt roll via Admin i huvudmenyn.</span></div>

      <div className="vh-settings-groups">
        {config.groups.map(group => <section className="vh-settings-card" key={group.title}>
          <div className="vh-settings-group-heading"><h2>{group.title}</h2><p>{group.description}</p></div>
          <div className="vh-setting-list">{group.items.map(item => <div className="vh-setting-row" key={item.key}>
            <span className="vh-setting-copy"><label htmlFor={`setting-${selectedRoleId}-${item.key}`}><strong>{item.label}</strong></label><small>{item.help}</small></span>
            <div className={`vh-setting-control vh-setting-control-${item.control}`}>{renderControl(item)}</div>
          </div>)}</div>
        </section>)}
      </div>

      {selectedRoleId === 'admin' && <section className="vh-settings-card vh-automation-card">
        <div className="vh-card-title"><span className="vh-automation-icon"><i className="fa-solid fa-robot" /></span><div><h2>Automation</h2><p>Bestäm när systemet föreslår, matchar och tillsätter vikarier.</p></div></div>
        <div className="vh-automation-modes">{modeOptions.map(mode => <label className={`vh-mode-option${automation.automationMode === mode.id ? ' selected' : ''}`} key={mode.id}>
          <input type="radio" name="automationMode" value={mode.id} checked={automation.automationMode === mode.id} onChange={() => automation.setAutomationMode(mode.id)} />
          <span><strong>{mode.label}</strong><small>{mode.help}</small></span>
        </label>)}</div>
        <div className="vh-automation-rules">
          <label><input type="checkbox" checked={automation.autoCreateNeeds} onChange={event => automation.setAutoCreateNeeds(event.target.checked)} /><span><strong>Skapa behov automatiskt</strong><small>Lägg frånvaropass i resursbehovslistan.</small></span></label>
          <label><input type="checkbox" checked={automation.autoAssignFreeSubstitutes} onChange={event => automation.setAutoAssignFreeSubstitutes(event.target.checked)} /><span><strong>Tillsätt kostnadsfria matchningar</strong><small>Välj tillgänglig vikarie utan manuell åtgärd.</small></span></label>
          <label><input type="checkbox" checked={automation.askBeforePaidSubstitutes} onChange={event => automation.setAskBeforePaidSubstitutes(event.target.checked)} /><span><strong>Begär godkännande för kostnad</strong><small>Visa bekräftelse innan kostnadskrävande vikarie tillsätts.</small></span></label>
        </div>
        <div className="vh-hours-row"><div><strong>Bemanningstid</strong><small>Används av läget ”Utanför bemanningstid”.</small></div><label>Från <input type="time" value={automation.businessHoursStart} onChange={event => automation.setBusinessHoursStart(event.target.value)} /></label><label>Till <input type="time" value={automation.businessHoursEnd} onChange={event => automation.setBusinessHoursEnd(event.target.value)} /></label></div>
      </section>}

      <div className="vh-settings-footnote"><i className="fa-solid fa-circle-info" /> Inställningarna sparas automatiskt i den här prototypen.</div>
    </div></div>
  </PageLayout>;
}
