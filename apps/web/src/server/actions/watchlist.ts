'use server';

import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { getDb, watchlistItems } from '@/lib/db';

export async function getWatchlist(): Promise<string[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const db = getDb();
  const rows = await db
    .select({ symbolId: watchlistItems.symbolId })
    .from(watchlistItems)
    .where(eq(watchlistItems.userId, userId))
    .orderBy(watchlistItems.addedAt);

  return rows.map((r) => r.symbolId);
}

export async function addToWatchlist(symbolId: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthenticated');

  const db = getDb();
  await db.insert(watchlistItems).values({ userId, symbolId }).onConflictDoNothing();
}

export async function removeFromWatchlist(symbolId: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthenticated');

  const db = getDb();
  await db
    .delete(watchlistItems)
    .where(and(eq(watchlistItems.userId, userId), eq(watchlistItems.symbolId, symbolId)));
}
