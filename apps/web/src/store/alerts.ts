import { create } from 'zustand';

export type AlertDirection = 'above' | 'below';

export interface PriceAlert {
  id: string;
  symbolId: string;
  symbolBase: string;
  targetPrice: number;
  direction: AlertDirection;
  triggered: boolean;
  createdAt: number;
}

interface AlertStore {
  alerts: PriceAlert[];
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => void;
  removeAlert: (id: string) => void;
  markTriggered: (id: string) => void;
}

function loadAlerts(): PriceAlert[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('price-alerts') ?? '[]') as PriceAlert[];
  } catch {
    return [];
  }
}

function saveAlerts(alerts: PriceAlert[]) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('price-alerts', JSON.stringify(alerts));
  }
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],

  addAlert: (alert) =>
    set((s) => {
      const next = [
        ...s.alerts,
        {
          ...alert,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          createdAt: Date.now(),
          triggered: false,
        },
      ];
      saveAlerts(next);
      return { alerts: next };
    }),

  removeAlert: (id) =>
    set((s) => {
      const next = s.alerts.filter((a) => a.id !== id);
      saveAlerts(next);
      return { alerts: next };
    }),

  markTriggered: (id) =>
    set((s) => {
      const next = s.alerts.map((a) => (a.id === id ? { ...a, triggered: true } : a));
      saveAlerts(next);
      return { alerts: next };
    }),
}));

export function initAlerts() {
  useAlertStore.setState({ alerts: loadAlerts() });
}
