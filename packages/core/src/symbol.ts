import { z } from 'zod';

export const AssetKindSchema = z.enum(['crypto-spot', 'crypto-perp', 'stock', 'fx']);
export type AssetKind = z.infer<typeof AssetKindSchema>;

export const ExchangeIdSchema = z.enum(['BINANCE', 'COINBASE', 'BYBIT', 'POLYGON']);
export type ExchangeId = z.infer<typeof ExchangeIdSchema>;

export const SymbolSchema = z.object({
  id: z.string().min(1),
  exchange: ExchangeIdSchema,
  kind: AssetKindSchema,
  base: z.string().min(1),
  quote: z.string().min(1),
  displayName: z.string().min(1),
  pricePrecision: z.number().int().nonnegative(),
  quantityPrecision: z.number().int().nonnegative(),
});

export type TradingSymbol = z.infer<typeof SymbolSchema>;

export function formatSymbolId(exchange: ExchangeId, base: string, quote: string): string {
  return `${exchange}:${base.toUpperCase()}-${quote.toUpperCase()}`;
}
