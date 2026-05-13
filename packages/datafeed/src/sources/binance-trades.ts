import type { RecentTrade, TradingSymbol } from '@trading-app/core';
import { WsManager } from '../ws-manager';

export function subscribeTrades(
  symbol: TradingSymbol,
  onTrade: (trade: RecentTrade) => void,
): () => void {
  const wsSymbol = `${symbol.base}${symbol.quote}`.toLowerCase();
  const url = `wss://stream.binance.com:9443/ws/${wsSymbol}@aggTrade`;

  const ws = new WsManager({
    url,
    onMessage(raw) {
      try {
        const d = JSON.parse(raw) as {
          a: number;
          p: string;
          q: string;
          T: number;
          m: boolean;
        };
        onTrade({
          id: d.a,
          price: parseFloat(d.p),
          quantity: parseFloat(d.q),
          time: d.T,
          isBuyerMaker: d.m,
        });
      } catch {
        // ignore parse errors
      }
    },
  });

  return () => ws.close();
}
