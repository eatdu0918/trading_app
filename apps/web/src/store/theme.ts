import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'dark',
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: next });
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  },
}));

export function initTheme() {
  const stored = (typeof localStorage !== 'undefined' &&
    localStorage.getItem('theme')) as Theme | null;
  const theme: Theme = stored ?? 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  useThemeStore.setState({ theme });
}
