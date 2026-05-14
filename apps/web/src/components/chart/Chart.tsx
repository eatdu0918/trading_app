'use client';

import type { Candle, Timeframe, TradingSymbol } from '@trading-app/core';
import { bollingerBands, detectPatterns, ema, sma } from '@trading-app/core';
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
  type SeriesMarker,
  type UTCTimestamp,
} from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import { type DrawingMode, type IndicatorsConfig, useChartStore } from '@/store/chart';

export type ChartStatus = 'loading' | 'ready' | 'error';

interface ChartProps {
  symbol: TradingSymbol;
  timeframe: Timeframe;
  onLatestBarChange?: (bar: Candle) => void;
  onStatusChange?: (status: ChartStatus) => void;
  onBarsLoad?: (bars: Candle[]) => void;
}

const THEME = {
  background: '#0b0e11',
  textPrimary: '#e6e9ef',
  border: '#232a36',
  bullish: '#22c55e',
  bearish: '#ef4444',
  volumeUp: 'rgba(34, 197, 94, 0.35)',
  volumeDown: 'rgba(239, 68, 68, 0.35)',
  ma5: '#fbbf24',
  ma20: '#3b82f6',
  ema20: '#8b5cf6',
  bbUpper: 'rgba(156,163,175,0.6)',
  bbMiddle: 'rgba(156,163,175,0.4)',
  bbLower: 'rgba(156,163,175,0.6)',
  trendline: '#fbbf24',
  hline: '#94a3b8',
  fib: ['#ef4444', '#f97316', '#fbbf24', '#22c55e', '#3b82f6', '#8b5cf6', '#ef4444'],
} as const;

const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1] as const;
const HISTORY_BARS = 500;

function timeframeWindowMs(timeframe: Timeframe, bars: number): number {
  const m = 60_000;
  const h = 60 * m;
  const d = 24 * h;
  const spans: Record<Timeframe, number> = {
    '1m': m,
    '3m': 3 * m,
    '5m': 5 * m,
    '15m': 15 * m,
    '30m': 30 * m,
    '1h': h,
    '2h': 2 * h,
    '4h': 4 * h,
    '6h': 6 * h,
    '8h': 8 * h,
    '12h': 12 * h,
    '1d': d,
    '3d': 3 * d,
    '1w': 7 * d,
    '1M': 30 * d,
  };
  return spans[timeframe] * bars;
}

function setIndicatorData(
  series: ISeriesApi<'Line'> | null,
  times: UTCTimestamp[],
  vals: (number | null)[],
) {
  if (!series) return;
  series.setData(
    vals
      .map((v, i) => (v !== null ? { time: times[i]!, value: v } : null))
      .filter((d): d is NonNullable<typeof d> => d !== null),
  );
}

export function Chart({
  symbol,
  timeframe,
  onLatestBarChange,
  onStatusChange,
  onBarsLoad,
}: ChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  // Indicator series refs
  const ma5Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const ma20Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const ema20Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const bbUpperRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbMiddleRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbLowerRef = useRef<ISeriesApi<'Line'> | null>(null);

  // Drawing state
  const pendingPointRef = useRef<{ time: UTCTimestamp; price: number } | null>(null);
  const trendlineSeriesRefs = useRef<ISeriesApi<'Line'>[]>([]);
  const priceLineRefs = useRef<ReturnType<ISeriesApi<'Candlestick'>['createPriceLine']>[]>([]);

  // Stable refs for callbacks and config
  const callbacksRef = useRef({ onLatestBarChange, onStatusChange, onBarsLoad });
  useEffect(() => {
    callbacksRef.current = { onLatestBarChange, onStatusChange, onBarsLoad };
  }, [onLatestBarChange, onStatusChange, onBarsLoad]);

  const barsRef = useRef<Candle[]>([]);
  const { indicators, drawingMode, drawingsClearedAt, showPatterns } = useChartStore();
  const indicatorsRef = useRef(indicators);
  const drawingModeRef = useRef<DrawingMode>(drawingMode);
  const showPatternsRef = useRef(showPatterns);
  useEffect(() => {
    indicatorsRef.current = indicators;
  }, [indicators]);
  useEffect(() => {
    drawingModeRef.current = drawingMode;
  }, [drawingMode]);
  useEffect(() => {
    showPatternsRef.current = showPatterns;
    applyPatternMarkers(barsRef.current, showPatterns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPatterns]);

  // Helper: get-or-create indicator series
  function getOrCreate(
    ref: React.MutableRefObject<ISeriesApi<'Line'> | null>,
    color: string,
    lineWidth: 1 | 2 = 1,
  ): ISeriesApi<'Line'> {
    const chart = chartRef.current!;
    if (!ref.current) {
      ref.current = chart.addLineSeries({
        color,
        lineWidth,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
    }
    return ref.current;
  }

  function removeRef(ref: React.MutableRefObject<ISeriesApi<'Line'> | null>) {
    if (ref.current) {
      chartRef.current?.removeSeries(ref.current);
      ref.current = null;
    }
  }

  function applyPatternMarkers(bars: Candle[], enabled: boolean) {
    const candleSeries = candleSeriesRef.current;
    if (!candleSeries) return;
    if (!enabled || bars.length === 0) {
      candleSeries.setMarkers([]);
      return;
    }
    const patterns = detectPatterns(bars);
    const markers: SeriesMarker<UTCTimestamp>[] = patterns.map((p) => ({
      time: (p.time / 1000) as UTCTimestamp,
      position: p.bullish ? 'belowBar' : 'aboveBar',
      shape: p.bullish ? 'arrowUp' : 'arrowDown',
      color: p.bullish ? THEME.bullish : THEME.bearish,
      text: p.label,
      size: 1,
    }));
    candleSeries.setMarkers(markers);
  }

  function applyIndicators(bars: Candle[]) {
    const chart = chartRef.current;
    if (!chart || bars.length === 0) return;
    const cfg = indicatorsRef.current;
    const closes = bars.map((b) => b.close);
    const times = bars.map((b) => toLightweightCandle(b).time as UTCTimestamp);

    if (cfg.ma5) setIndicatorData(getOrCreate(ma5Ref, THEME.ma5), times, sma(closes, 5));
    else removeRef(ma5Ref);

    if (cfg.ma20) setIndicatorData(getOrCreate(ma20Ref, THEME.ma20), times, sma(closes, 20));
    else removeRef(ma20Ref);

    if (cfg.ema20) setIndicatorData(getOrCreate(ema20Ref, THEME.ema20), times, ema(closes, 20));
    else removeRef(ema20Ref);

    if (cfg.bb) {
      const bands = bollingerBands(closes, 20, 2);
      setIndicatorData(
        getOrCreate(bbUpperRef, THEME.bbUpper),
        times,
        bands.map((b) => b.upper),
      );
      setIndicatorData(
        getOrCreate(bbMiddleRef, THEME.bbMiddle),
        times,
        bands.map((b) => b.middle),
      );
      setIndicatorData(
        getOrCreate(bbLowerRef, THEME.bbLower),
        times,
        bands.map((b) => b.lower),
      );
    } else {
      removeRef(bbUpperRef);
      removeRef(bbMiddleRef);
      removeRef(bbLowerRef);
    }
  }

  // Create chart once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: THEME.background },
        textColor: THEME.textPrimary,
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: THEME.border, style: LineStyle.Dotted },
        horzLines: { color: THEME.border, style: LineStyle.Dotted },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: {
        borderColor: THEME.border,
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: THEME.border,
        timeVisible: true,
        secondsVisible: false,
      },
      autoSize: true,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: THEME.bullish,
      downColor: THEME.bearish,
      borderUpColor: THEME.bullish,
      borderDownColor: THEME.bearish,
      wickUpColor: THEME.bullish,
      wickDownColor: THEME.bearish,
    });

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // Drawing: handle clicks
    chart.subscribeClick((param) => {
      if (!param.point || !param.time || drawingModeRef.current === 'none') return;

      const price = candleSeriesRef.current?.coordinateToPrice(param.point.y);
      if (price === null || price === undefined) return;
      const time = param.time as UTCTimestamp;

      if (drawingModeRef.current === 'hline') {
        const pl = candleSeriesRef.current!.createPriceLine({
          price,
          color: THEME.hline,
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: '',
        });
        priceLineRefs.current.push(pl);
      } else if (drawingModeRef.current === 'trendline') {
        if (!pendingPointRef.current) {
          pendingPointRef.current = { time, price };
        } else {
          const p1 = pendingPointRef.current;
          const tl = chartRef.current!.addLineSeries({
            color: THEME.trendline,
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
          });
          tl.setData([
            { time: p1.time, value: p1.price },
            { time, value: price },
          ]);
          trendlineSeriesRefs.current.push(tl);
          pendingPointRef.current = null;
          useChartStore.getState().setDrawingMode('none');
        }
      } else if (drawingModeRef.current === 'fibonacci') {
        if (!pendingPointRef.current) {
          pendingPointRef.current = { time, price };
        } else {
          const p1Price = pendingPointRef.current.price;
          const high = Math.max(p1Price, price);
          const low = Math.min(p1Price, price);
          const range = high - low;
          FIB_LEVELS.forEach((level, i) => {
            const levelPrice = low + range * (1 - level);
            const pl = candleSeriesRef.current!.createPriceLine({
              price: levelPrice,
              color: THEME.fib[i] ?? '#94a3b8',
              lineWidth: 1,
              lineStyle: LineStyle.Dashed,
              axisLabelVisible: true,
              title: `${(level * 100).toFixed(1)}%`,
            });
            priceLineRefs.current.push(pl);
          });
          pendingPointRef.current = null;
          useChartStore.getState().setDrawingMode('none');
        }
      }
    });

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      ma5Ref.current = null;
      ma20Ref.current = null;
      ema20Ref.current = null;
      bbUpperRef.current = null;
      bbMiddleRef.current = null;
      bbLowerRef.current = null;
      trendlineSeriesRefs.current = [];
      priceLineRefs.current = [];
    };
  }, []);

  // Clear drawings when store fires clearDrawings()
  useEffect(() => {
    if (drawingsClearedAt === 0) return;
    const cSeries = candleSeriesRef.current;
    if (cSeries) {
      priceLineRefs.current.forEach((pl) => cSeries.removePriceLine(pl));
      priceLineRefs.current = [];
    }
    trendlineSeriesRefs.current.forEach((tl) => chartRef.current?.removeSeries(tl));
    trendlineSeriesRefs.current = [];
    pendingPointRef.current = null;
  }, [drawingsClearedAt]);

  // Reload data on symbol / timeframe change
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

        barsRef.current = bars;
        candleSeries.setData(
          bars.map((bar) => {
            const lw = toLightweightCandle(bar);
            return { ...lw, time: lw.time as UTCTimestamp };
          }),
        );
        volumeSeries.setData(
          bars.map((bar) => {
            const lw = toLightweightVolume(bar, THEME.volumeUp, THEME.volumeDown);
            return { ...lw, time: lw.time as UTCTimestamp };
          }),
        );

        applyIndicators(bars);
        applyPatternMarkers(bars, showPatternsRef.current);

        const last = bars.at(-1);
        if (last) callbacksRef.current.onLatestBarChange?.(last);
        callbacksRef.current.onStatusChange?.('ready');
        callbacksRef.current.onBarsLoad?.(bars);

        unsubscribe = datafeed.subscribeBars({
          symbol,
          timeframe,
          onBar: (bar) => {
            const lw = toLightweightCandle(bar);
            candleSeries.update({ ...lw, time: lw.time as UTCTimestamp });
            const vol = toLightweightVolume(bar, THEME.volumeUp, THEME.volumeDown);
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

  // Reapply indicators when config changes (without reloading history)
  useEffect(() => {
    applyIndicators(barsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indicators]);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full ${drawingMode !== 'none' ? 'cursor-crosshair' : ''}`}
    />
  );
}
