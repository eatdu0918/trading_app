import type { Ticker24h, TradingSymbol } from '@trading-app/core';
import { WsManager } from '../ws-manager';

export function subscribeTicker24h(
  symbol: TradingSymbol,
  onTicker: (ticker: Ticker24h) => void,
): () => void {
  const wsSymbol = `${symbol.base}${symbol.quote}`.toLowerCase();
  const url = `wss://stream.binance.com:9443/ws/${wsSymbol}@miniTicker`;

  const ws = new WsManager({
    url,
    onMessage(raw) {
      try {
        const d = JSON.parse(raw) as {
          s: string;
          o: string;
          h: string;
          l: string;
          c: string;
          v: string;
        };
        const open = parseFloat(d.o);
        const last = parseFloat(d.c);
        onTicker({
          symbol: d.s,
          openPrice: open,
          highPrice: parseFloat(d.h),
          lowPrice: parseFloat(d.l),
          lastPrice: last,
          volume: parseFloat(d.v),
          priceChange: last - open,
          priceChangePercent: open !== 0 ? ((last - open) / open) * 100 : 0,
        });
      } catch {
        // ignore parse errors
      }
    },
  });

  return () => ws.close();
}
