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

interface ChartProps {
  symbol: TradingSymbol;
  timeframe: Timeframe;
  onLatestBarChange?: (bar: Candle) => void;
}

const CHART_THEME = {
  background: '#0b0e11',
  textPrimary: '#e6e9ef',
  textMuted: '#5f6878',
  border: '#232a36',
  bullish: '#22c55e',
  bearish: '#ef4444',
  volumeUp: 'rgba(34, 197, 94, 0.35)',
  volumeDown: 'rgba(239, 68, 68, 0.35)',
} as const;

const HISTORY_BARS = 500;

function timeframeWindowMs(timeframe: Timeframe, bars: number): number {
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const TF: Record<Timeframe, number> = {
    '1m': minute,
    '3m': 3 * minute,
    '5m': 5 * minute,
    '15m': 15 * minute,
    '30m': 30 * minute,
    '1h': hour,
    '2h': 2 * hour,
    '4h': 4 * hour,
    '6h': 6 * hour,
    '8h': 8 * hour,
    '12h': 12 * hour,
    '1d': day,
    '3d': 3 * day,
    '1w': 7 * day,
    '1M': 30 * day,
  };
  return TF[timeframe] * bars;
}

export function Chart({ symbol, timeframe, onLatestBarChange }: ChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const onLatestBarChangeRef = useRef(onLatestBarChange);

  useEffect(() => {
    onLatestBarChangeRef.current = onLatestBarChange;
  }, [onLatestBarChange]);

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
      priceScaleId: 'volume',
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

  useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    const volumeSeries = volumeSeriesRef.current;
    if (!candleSeries || !volumeSeries) return;

    const datafeed: Datafeed = new BinanceDatafeed();
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    candleSeries.setData([]);
    volumeSeries.setData([]);

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
        if (last) onLatestBarChangeRef.current?.(last);

        unsubscribe = datafeed.subscribeBars({
          symbol,
          timeframe,
          onBar: (bar) => {
            const lw = toLightweightCandle(bar);
            candleSeries.update({ ...lw, time: lw.time as UTCTimestamp });

            const vol = toLightweightVolume(bar, CHART_THEME.volumeUp, CHART_THEME.volumeDown);
            volumeSeries.update({ ...vol, time: vol.time as UTCTimestamp });

            onLatestBarChangeRef.current?.(bar);
          },
          onError: (err) => {
            console.error('[chart] subscribe error', err);
          },
        });
      })
      .catch((err: unknown) => {
        console.error('[chart] history error', err);
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [symbol, timeframe]);

  return <div ref={containerRef} className="h-full w-full" />;
}
