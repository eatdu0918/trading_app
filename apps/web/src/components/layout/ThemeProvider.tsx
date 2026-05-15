'use client';

import { useEffect } from 'react';
import { initTheme } from '@/store/theme';
import { initAlerts } from '@/store/alerts';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initTheme();
    initAlerts();
  }, []);

  return <>{children}</>;
}
