import { useEffect, useRef } from 'react';
import { useRole } from '../components/RoleContext';
import { AutomationProvider } from '../components/AutomationContext';
import { Schema } from './Schema';

function HospitalSchema() {
  const { setSelectedOrganisation } = useRole();
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setSelectedOrganisation('clinic');
  }, [setSelectedOrganisation]);
  return <Schema breadcrumbSectionLabel="Vikariehantering" hideMinimumStaffing useAlternativeOrganisationVisualization resourceNeedPrototype alwaysShowResourceNeeds />;
}

export function VikariehanteringSchema() {
  return <AutomationProvider><HospitalSchema /></AutomationProvider>;
}
