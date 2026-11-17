import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AutomationMode = 'off' | 'always' | 'off-hours' | 'free-then-confirm';

interface AutomationContextValue {
  automationMode: AutomationMode;
  setAutomationMode: (mode: AutomationMode) => void;
  autoCreateNeeds: boolean;
  setAutoCreateNeeds: (enabled: boolean) => void;
  autoAssignFreeSubstitutes: boolean;
  setAutoAssignFreeSubstitutes: (enabled: boolean) => void;
  askBeforePaidSubstitutes: boolean;
  setAskBeforePaidSubstitutes: (enabled: boolean) => void;
  businessHoursStart: string;
  setBusinessHoursStart: (time: string) => void;
  businessHoursEnd: string;
  setBusinessHoursEnd: (time: string) => void;
  isAutomationActive: boolean;
}

const AutomationContext = createContext<AutomationContextValue | null>(null);

function stored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(`vikariehantering.${key}`);
    return value === null ? fallback : JSON.parse(value) as T;
  } catch { return fallback; }
}

function isOutsideOfficeHours(start: string, end: string): boolean {
  const now = new Date();
  const weekday = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = Number(start.slice(0, 2)) * 60 + Number(start.slice(3, 5));
  const endMinutes = Number(end.slice(0, 2)) * 60 + Number(end.slice(3, 5));
  return weekday === 0 || weekday === 6 || minutes < startMinutes || minutes >= endMinutes;
}

function useStoredState<T>(key: string, initial: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => stored(key, initial));
  const update = (next: T) => {
    setValue(next);
    try { localStorage.setItem(`vikariehantering.${key}`, JSON.stringify(next)); } catch { /* storage unavailable */ }
  };
  return [value, update];
}

export const AutomationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [, setMinuteTick] = useState(0);
  const [automationMode, setAutomationMode] = useStoredState<AutomationMode>('automationMode', 'off');
  const [autoCreateNeeds, setAutoCreateNeeds] = useStoredState('autoCreateNeeds', true);
  const [autoAssignFreeSubstitutes, setAutoAssignFreeSubstitutes] = useStoredState('autoAssignFreeSubstitutes', true);
  const [askBeforePaidSubstitutes, setAskBeforePaidSubstitutes] = useStoredState('askBeforePaidSubstitutes', true);
  const [businessHoursStart, setBusinessHoursStart] = useStoredState('businessHoursStart', '08:00');
  const [businessHoursEnd, setBusinessHoursEnd] = useStoredState('businessHoursEnd', '17:00');
  useEffect(() => {
    const timer = window.setInterval(() => setMinuteTick(value => value + 1), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const isAutomationActive = automationMode === 'always'
    || automationMode === 'free-then-confirm'
    || (automationMode === 'off-hours' && isOutsideOfficeHours(businessHoursStart, businessHoursEnd));
  const value = useMemo(() => ({ automationMode, setAutomationMode, autoCreateNeeds, setAutoCreateNeeds,
    autoAssignFreeSubstitutes, setAutoAssignFreeSubstitutes, askBeforePaidSubstitutes, setAskBeforePaidSubstitutes,
    businessHoursStart, setBusinessHoursStart, businessHoursEnd, setBusinessHoursEnd, isAutomationActive }),
  [automationMode, isAutomationActive, autoCreateNeeds, autoAssignFreeSubstitutes, askBeforePaidSubstitutes, businessHoursStart, businessHoursEnd]);
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

