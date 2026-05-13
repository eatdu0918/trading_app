import type { TradingSymbol } from '@trading-app/core';

export const SYMBOL_PRESETS: readonly TradingSymbol[] = [
  {
    id: 'BINANCE:BTC-USDT',
    exchange: 'BINANCE',
    kind: 'crypto-spot',
    base: 'BTC',
    quote: 'USDT',
    displayName: 'BTC / USDT',
    pricePrecision: 2,
    quantityPrecision: 5,
  },
  {
    id: 'BINANCE:ETH-USDT',
    exchange: 'BINANCE',
    kind: 'crypto-spot',
    base: 'ETH',
    quote: 'USDT',
    displayName: 'ETH / USDT',
    pricePrecision: 2,
    quantityPrecision: 4,
  },
  {
    id: 'BINANCE:BNB-USDT',
    exchange: 'BINANCE',
    kind: 'crypto-spot',
    base: 'BNB',
    quote: 'USDT',
    displayName: 'BNB / USDT',
    pricePrecision: 2,
    quantityPrecision: 3,
  },
  {
    id: 'BINANCE:SOL-USDT',
    exchange: 'BINANCE',
    kind: 'crypto-spot',
    base: 'SOL',
    quote: 'USDT',
    displayName: 'SOL / USDT',
    pricePrecision: 2,
    quantityPrecision: 2,
  },
  {
    id: 'BINANCE:XRP-USDT',
    exchange: 'BINANCE',
    kind: 'crypto-spot',
    base: 'XRP',
    quote: 'USDT',
    displayName: 'XRP / USDT',
    pricePrecision: 4,
    quantityPrecision: 1,
  },
];

export const BTC_USDT = SYMBOL_PRESETS[0]!;
