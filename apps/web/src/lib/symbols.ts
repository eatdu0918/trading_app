import type { TradingSymbol } from '@trading-app/core';

export const BTC_USDT: TradingSymbol = {
  id: 'BINANCE:BTC-USDT',
  exchange: 'BINANCE',
  kind: 'crypto-spot',
  base: 'BTC',
  quote: 'USDT',
  displayName: 'BTC / USDT',
  pricePrecision: 2,
  quantityPrecision: 5,
};
