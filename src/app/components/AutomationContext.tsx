import React, { createContext, useContext, useMemo, useState } from 'react';

export type AutomationMode = 'off' | 'always' | 'off-hours';

interface AutomationContextValue {
  automationMode: AutomationMode;
  setAutomationMode: (mode: AutomationMode) => void;
  isAutomationActive: boolean;
}

const AutomationContext = createContext<AutomationContextValue | null>(null);

function isOutsideOfficeHours(): boolean {
  const now = new Date();
  const weekday = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return weekday === 0 || weekday === 6 || minutes < 8 * 60 || minutes >= 17 * 60;
}

export const AutomationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [automationMode, setAutomationMode] = useState<AutomationMode>('off');
  const isAutomationActive = automationMode === 'always' || (automationMode === 'off-hours' && isOutsideOfficeHours());
  const value = useMemo(() => ({ automationMode, setAutomationMode, isAutomationActive }), [automationMode, isAutomationActive]);
  return <AutomationContext.Provider value={value}>{children}</AutomationContext.Provider>;
};

export function useAutomation(): AutomationContextValue {
  const context = useContext(AutomationContext);
  if (!context) throw new Error('useAutomation måste användas inuti AutomationProvider');
  return context;
}

export function useOptionalAutomation(): AutomationContextValue | null {
  return useContext(AutomationContext);
}

