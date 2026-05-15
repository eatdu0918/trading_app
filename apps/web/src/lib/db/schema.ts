import {
  doublePrecision,
  index,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

export const watchlistItems = pgTable(
  'watchlist_items',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    symbolId: text('symbol_id').notNull(),
    addedAt: timestamp('added_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('watchlist_user_symbol').on(t.userId, t.symbolId),
    index('watchlist_user_idx').on(t.userId),
  ],
);

export type WatchlistItem = typeof watchlistItems.$inferSelect;
export type NewWatchlistItem = typeof watchlistItems.$inferInsert;

export const portfolioHoldings = pgTable(
  'portfolio_holdings',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    symbolId: text('symbol_id').notNull(),
    symbolBase: text('symbol_base').notNull(),
    symbolQuote: text('symbol_quote').notNull(),
    quantity: doublePrecision('quantity').notNull(),
    avgCost: doublePrecision('avg_cost').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('portfolio_user_symbol').on(t.userId, t.symbolId),
    index('portfolio_user_idx').on(t.userId),
  ],
);

export type PortfolioHolding = typeof portfolioHoldings.$inferSelect;
export type NewPortfolioHolding = typeof portfolioHoldings.$inferInsert;
