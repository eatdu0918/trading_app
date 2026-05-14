'use server';

import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { getDb, portfolioHoldings, type PortfolioHolding } from '@/lib/db';

export async function getHoldings(): Promise<PortfolioHolding[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const db = getDb();
  return db
    .select()
    .from(portfolioHoldings)
    .where(eq(portfolioHoldings.userId, userId))
    .orderBy(portfolioHoldings.createdAt);
}

export async function upsertHolding(data: {
  symbolId: string;
  symbolBase: string;
  symbolQuote: string;
  quantity: number;
  avgCost: number;
}): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthenticated');

  const db = getDb();
  await db
    .insert(portfolioHoldings)
    .values({ userId, ...data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [portfolioHoldings.userId, portfolioHoldings.symbolId],
      set: {
        quantity: data.quantity,
        avgCost: data.avgCost,
        updatedAt: new Date(),
      },
    });
}

export async function removeHolding(symbolId: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthenticated');

  const db = getDb();
  await db
    .delete(portfolioHoldings)
    .where(and(eq(portfolioHoldings.userId, userId), eq(portfolioHoldings.symbolId, symbolId)));
}
