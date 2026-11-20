import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { useRole } from '../components/RoleContext';
import { AutomationProvider } from '../components/AutomationContext';
import { Schema } from './Schema';

function HospitalSchema() {
  const [searchParams] = useSearchParams();
  const { setSelectedOrganisation } = useRole();
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setSelectedOrganisation('clinic');
  }, [setSelectedOrganisation]);
  const initialActiveView = searchParams.get('view') === 'orders' ? 'orders' : 'schema';
  return <Schema breadcrumbSectionLabel="Vikariehantering" hideMinimumStaffing useAlternativeOrganisationVisualization resourceNeedPrototype alwaysShowResourceNeeds initialActiveView={initialActiveView} />;
}

export function VikariehanteringSchema() {
  return <AutomationProvider><HospitalSchema /></AutomationProvider>;
}
