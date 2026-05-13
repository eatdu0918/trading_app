import type { OrderBook, TradingSymbol } from '@trading-app/core';
import { WsManager } from '../ws-manager';

export function subscribeOrderBook(
  symbol: TradingSymbol,
  onUpdate: (book: OrderBook) => void,
): () => void {
  const wsSymbol = `${symbol.base}${symbol.quote}`.toLowerCase();
  const url = `wss://stream.binance.com:9443/ws/${wsSymbol}@depth20@100ms`;

  const ws = new WsManager({
    url,
    onMessage(raw) {
      try {
        const d = JSON.parse(raw) as {
          lastUpdateId: number;
          bids: [string, string][];
          asks: [string, string][];
        };
        onUpdate({
          lastUpdateId: d.lastUpdateId,
          bids: d.bids.map(([p, q]) => ({ price: parseFloat(p), quantity: parseFloat(q) })),
          asks: d.asks.map(([p, q]) => ({ price: parseFloat(p), quantity: parseFloat(q) })),
        });
      } catch {
        // ignore parse errors
      }
    },
  });

  return () => ws.close();
}
