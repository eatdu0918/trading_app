'use client';

import type { Candle, Timeframe, TradingSymbol } from '@trading-app/core';
import {
  BinanceDatafeed,
  toLightweightCandle,
  toLightweightVolume,
  type Datafeed,
} from '@trading-app/datafeed';
import {
  ColorType,
  CrosshairMode,
  LineStyle,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import { useEffect, useRef } from 'react';

export type ChartStatus = 'loading' | 'ready' | 'error';

interface ChartProps {
  symbol: TradingSymbol;
  timeframe: Timeframe;
  onLatestBarChange?: (bar: Candle) => void;
  onStatusChange?: (status: ChartStatus) => void;
}

const CHART_THEME = {
  background: '#0b0e11',
  textPrimary: '#e6e9ef',
  border: '#232a36',
  bullish: '#22c55e',
  bearish: '#ef4444',
  volumeUp: 'rgba(34, 197, 94, 0.35)',
  volumeDown: 'rgba(239, 68, 68, 0.35)',
} as const;

const HISTORY_BARS = 500;

function timeframeWindowMs(timeframe: Timeframe, bars: number): number {
  const m = 60_000;
  const h = 60 * m;
  const d = 24 * h;
  const spans: Record<Timeframe, number> = {
    '1m': m, '3m': 3*m, '5m': 5*m, '15m': 15*m, '30m': 30*m,
    '1h': h, '2h': 2*h, '4h': 4*h, '6h': 6*h, '8h': 8*h, '12h': 12*h,
    '1d': d, '3d': 3*d, '1w': 7*d, '1M': 30*d,
  };
  return spans[timeframe] * bars;
}

export function Chart({ symbol, timeframe, onLatestBarChange, onStatusChange }: ChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const callbacksRef = useRef({ onLatestBarChange, onStatusChange });

  useEffect(() => {
    callbacksRef.current = { onLatestBarChange, onStatusChange };
  }, [onLatestBarChange, onStatusChange]);

  // Create chart once on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: CHART_THEME.background },
        textColor: CHART_THEME.textPrimary,
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: CHART_THEME.border, style: LineStyle.Dotted },
        horzLines: { color: CHART_THEME.border, style: LineStyle.Dotted },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: {
        borderColor: CHART_THEME.border,
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: CHART_THEME.border,
        timeVisible: true,
        secondsVisible: false,
      },
      autoSize: true,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: CHART_THEME.bullish,
      downColor: CHART_THEME.bearish,
      borderUpColor: CHART_THEME.bullish,
      borderDownColor: CHART_THEME.bearish,
      wickUpColor: CHART_THEME.bullish,
      wickDownColor: CHART_THEME.bearish,
    });

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);

  // Load history + subscribe whenever symbol or timeframe changes
  useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    const volumeSeries = volumeSeriesRef.current;
    if (!candleSeries || !volumeSeries) return;

    const datafeed: Datafeed = new BinanceDatafeed();
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    candleSeries.setData([]);
    volumeSeries.setData([]);
    callbacksRef.current.onStatusChange?.('loading');

    const to = Date.now();
    const from = to - timeframeWindowMs(timeframe, HISTORY_BARS);

    datafeed
      .getHistory({ symbol, timeframe, from, to, limit: HISTORY_BARS })
      .then((bars) => {
        if (cancelled) return;

        candleSeries.setData(
          bars.map((bar) => {
            const lw = toLightweightCandle(bar);
            return { ...lw, time: lw.time as UTCTimestamp };
          }),
        );
        volumeSeries.setData(
          bars.map((bar) => {
            const lw = toLightweightVolume(bar, CHART_THEME.volumeUp, CHART_THEME.volumeDown);
            return { ...lw, time: lw.time as UTCTimestamp };
          }),
        );

        const last = bars.at(-1);
        if (last) callbacksRef.current.onLatestBarChange?.(last);
        callbacksRef.current.onStatusChange?.('ready');

        unsubscribe = datafeed.subscribeBars({
          symbol,
          timeframe,
          onBar: (bar) => {
            const lw = toLightweightCandle(bar);
            candleSeries.update({ ...lw, time: lw.time as UTCTimestamp });
            const vol = toLightweightVolume(bar, CHART_THEME.volumeUp, CHART_THEME.volumeDown);
            volumeSeries.update({ ...vol, time: vol.time as UTCTimestamp });
            callbacksRef.current.onLatestBarChange?.(bar);
          },
          onError: (err) => {
            console.error('[chart] ws error', err);
          },
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          console.error('[chart] history error', err);
          callbacksRef.current.onStatusChange?.('error');
        }
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [symbol, timeframe]);

  return <div ref={containerRef} className="h-full w-full" />;
}
