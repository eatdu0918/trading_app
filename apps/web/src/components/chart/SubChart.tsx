'use client';

import type { Candle } from '@trading-app/core';
import { macd as computeMacd, rsi as computeRsi } from '@trading-app/core';
import { toLightweightCandle } from '@trading-app/datafeed';
import {
  ColorType,
  LineStyle,
  createChart,
  type IChartApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import { useEffect, useRef } from 'react';

const THEME = {
  background: '#0b0e11',
  text: '#e6e9ef',
  border: '#232a36',
  bullish: '#22c55e',
  bearish: '#ef4444',
  neutral: '#6b7280',
  accent: '#3b82f6',
  signal: '#fbbf24',
} as const;

interface SubChartProps {
  type: 'rsi' | 'macd';
  bars: Candle[];
  height?: number;
}

export function SubChart({ type, bars, height = 120 }: SubChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Create chart on mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: THEME.background },
        textColor: THEME.text,
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: THEME.border, style: LineStyle.Dotted },
        horzLines: { color: THEME.border, style: LineStyle.Dotted },
      },
      rightPriceScale: { borderColor: THEME.border },
      timeScale: { borderColor: THEME.border, timeVisible: true, secondsVisible: false },
      autoSize: true,
    });
    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  // Update data when bars change
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || bars.length === 0) return;

    const times = bars.map((b) => toLightweightCandle(b).time as UTCTimestamp);
    const closes = bars.map((b) => b.close);

    if (type === 'rsi') {
      const rsiVals = computeRsi(closes, 14);
      const series = chart.addLineSeries({
        color: THEME.accent,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: true,
        priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
      });
      series.setData(
        rsiVals
          .map((v, i) => (v !== null ? { time: times[i]!, value: v } : null))
          .filter((d): d is NonNullable<typeof d> => d !== null),
      );
      // Reference lines
      series.createPriceLine({
        price: 70,
        color: THEME.bearish,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: '70',
      });
      series.createPriceLine({
        price: 30,
        color: THEME.bullish,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: '30',
      });
      series.createPriceLine({
        price: 50,
        color: THEME.neutral,
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: false,
        title: '',
      });

      chart
        .priceScale('right')
        .applyOptions({ autoScale: false, minimum: 0, maximum: 100 } as Parameters<
          ReturnType<IChartApi['priceScale']>['applyOptions']
        >[0]);
    } else {
      const macdVals = computeMacd(closes, 12, 26, 9);

      const histSeries = chart.addHistogramSeries({
        priceLineVisible: false,
        lastValueVisible: false,
      });
      histSeries.setData(
        macdVals
          .map((v, i) =>
            v.histogram !== null
              ? {
                  time: times[i]!,
                  value: v.histogram,
                  color: v.histogram >= 0 ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)',
                }
              : null,
          )
          .filter((d): d is NonNullable<typeof d> => d !== null),
      );

      const macdLine = chart.addLineSeries({
        color: THEME.accent,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: true,
      });
      macdLine.setData(
        macdVals
          .map((v, i) => (v.macd !== null ? { time: times[i]!, value: v.macd } : null))
          .filter((d): d is NonNullable<typeof d> => d !== null),
      );

      const signalLine = chart.addLineSeries({
        color: THEME.signal,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: true,
      });
      signalLine.setData(
        macdVals
          .map((v, i) => (v.signal !== null ? { time: times[i]!, value: v.signal } : null))
          .filter((d): d is NonNullable<typeof d> => d !== null),
      );
    }
  }, [type, bars]);

  const label = type === 'rsi' ? 'RSI (14)' : 'MACD (12,26,9)';

  return (
    <div
      className="relative w-full shrink-0 overflow-hidden border-t border-[var(--color-border)]"
      style={{ height }}
    >
      <span className="absolute left-2 top-1 z-10 font-mono text-[10px] text-[var(--color-text-muted)]">
        {label}
      </span>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
