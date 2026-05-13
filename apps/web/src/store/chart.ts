import { create } from 'zustand';

export interface IndicatorsConfig {
  ma5: boolean;
  ma20: boolean;
  ema20: boolean;
  bb: boolean;
  rsi: boolean;
  macd: boolean;
}

export type DrawingMode = 'none' | 'hline' | 'trendline' | 'fibonacci';

interface ChartStore {
  indicators: IndicatorsConfig;
  drawingMode: DrawingMode;
  drawingsClearedAt: number;
  setIndicator: (key: keyof IndicatorsConfig, value: boolean) => void;
  setDrawingMode: (mode: DrawingMode) => void;
  clearDrawings: () => void;
}

export const useChartStore = create<ChartStore>((set) => ({
  indicators: {
    ma5: false,
    ma20: false,
    ema20: false,
    bb: false,
    rsi: false,
    macd: false,
  },
  drawingMode: 'none',
  drawingsClearedAt: 0,
  setIndicator: (key, value) => set((s) => ({ indicators: { ...s.indicators, [key]: value } })),
  setDrawingMode: (mode) => set({ drawingMode: mode }),
  clearDrawings: () => set({ drawingsClearedAt: Date.now(), drawingMode: 'none' }),
}));
