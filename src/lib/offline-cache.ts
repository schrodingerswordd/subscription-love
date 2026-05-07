/**
 * Lightweight IndexedDB-backed cache for read-only offline rendering.
 * Keyed per user. Writes still require a network connection.
 */
import { get, set, del } from "idb-keyval";

const VERSION = 1;
const k = (scope: string, userId: string) => `subtrack:v${VERSION}:${scope}:${userId}`;

export interface CachedPayload<T> {
  data: T;
  fetchedAt: number;
}

export async function readCache<T>(scope: string, userId: string): Promise<CachedPayload<T> | null> {
  try {
    const v = await get<CachedPayload<T>>(k(scope, userId));
    return v ?? null;
  } catch {
    return null;
  }
}

export async function writeCache<T>(scope: string, userId: string, data: T): Promise<void> {
  try {
    await set(k(scope, userId), { data, fetchedAt: Date.now() } satisfies CachedPayload<T>);
  } catch {
    /* quota / private mode — ignore */
  }
}

export async function clearCache(scope: string, userId: string): Promise<void> {
  try {
    await del(k(scope, userId));
  } catch {
    /* ignore */
  }
}

export function formatSyncedAt(ts: number | null | undefined): string {
  if (!ts) return "never";
  const d = new Date(ts);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
