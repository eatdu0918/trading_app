import type { Candle, Timeframe, TradingSymbol } from '@trading-app/core';
import type { Datafeed, HistoryRequest, SubscribeOptions, Unsubscribe } from '../types';

const REST_BASE = 'https://api.binance.com';
const WS_BASE = 'wss://stream.binance.com:9443/ws';

const BINANCE_INTERVAL: Record<Timeframe, string> = {
  '1m': '1m',
  '3m': '3m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '2h': '2h',
  '4h': '4h',
  '6h': '6h',
  '8h': '8h',
  '12h': '12h',
  '1d': '1d',
  '3d': '3d',
  '1w': '1w',
  '1M': '1M',
};

function toBinanceSymbol(symbol: TradingSymbol): string {
  return `${symbol.base}${symbol.quote}`.toUpperCase();
}

type RawKline = [
  openTime: number,
  open: string,
  high: string,
  low: string,
  close: string,
  volume: string,
  closeTime: number,
  quoteVolume: string,
  trades: number,
  takerBuyBaseVolume: string,
  takerBuyQuoteVolume: string,
  ignored: string,
];

function parseKline(raw: RawKline): Candle {
  return {
    time: raw[0],
    open: Number.parseFloat(raw[1]),
    high: Number.parseFloat(raw[2]),
    low: Number.parseFloat(raw[3]),
    close: Number.parseFloat(raw[4]),
    volume: Number.parseFloat(raw[5]),
  };
}

interface BinanceKlineMessage {
  e: 'kline';
  E: number;
  s: string;
  k: {
    t: number;
    o: string;
    h: string;
    l: string;
    c: string;
    v: string;
    x: boolean;
  };
}

export class BinanceDatafeed implements Datafeed {
  async getHistory(req: HistoryRequest): Promise<Candle[]> {
    const params = new URLSearchParams({
      symbol: toBinanceSymbol(req.symbol),
      interval: BINANCE_INTERVAL[req.timeframe],
      startTime: String(req.from),
      endTime: String(req.to),
      limit: String(req.limit ?? 500),
    });

    const res = await fetch(`${REST_BASE}/api/v3/klines?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Binance klines request failed: ${res.status} ${res.statusText}`);
    }
    const raw = (await res.json()) as RawKline[];
    return raw.map(parseKline);
  }

  subscribeBars({ symbol, timeframe, onBar, onError }: SubscribeOptions): Unsubscribe {
    const stream = `${toBinanceSymbol(symbol).toLowerCase()}@kline_${BINANCE_INTERVAL[timeframe]}`;
    const ws = new WebSocket(`${WS_BASE}/${stream}`);

    ws.addEventListener('message', (event) => {
      try {
        const payload = JSON.parse(event.data as string) as BinanceKlineMessage;
        if (payload.e !== 'kline') return;
        onBar({
          time: payload.k.t,
          open: Number.parseFloat(payload.k.o),
          high: Number.parseFloat(payload.k.h),
          low: Number.parseFloat(payload.k.l),
          close: Number.parseFloat(payload.k.c),
          volume: Number.parseFloat(payload.k.v),
        });
      } catch (err) {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    });

    ws.addEventListener('error', () => {
      onError?.(new Error('Binance websocket error'));
    });

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }
}
