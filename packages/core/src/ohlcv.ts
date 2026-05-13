import { z } from 'zod';

export const CandleSchema = z.object({
  /** UTC milliseconds at the open of the bar. */
  time: z.number().int().nonnegative(),
  open: z.number().finite(),
  high: z.number().finite(),
  low: z.number().finite(),
  close: z.number().finite(),
  volume: z.number().finite().nonnegative(),
});

export type Candle = z.infer<typeof CandleSchema>;

export const TickSchema = z.object({
  /** UTC milliseconds when the trade happened. */
  time: z.number().int().nonnegative(),
  price: z.number().finite(),
  size: z.number().finite().nonnegative(),
  side: z.enum(['buy', 'sell']).optional(),
});

export type Tick = z.infer<typeof TickSchema>;
