import { readJsonSync, writeJsonSync } from "./data-manager";

/**
 * One-time content migrations for admin-managed data stored in MongoDB.
 *
 * Each migration runs exactly once per database (its id is recorded under the
 * "content_migrations" key), so later edits in the admin panel are never
 * overwritten again.
 */

const KEY = "content_migrations";
let appliedCache: Set<string> | null = null;

async function applied(): Promise<Set<string>> {
  if (appliedCache) return appliedCache;
  appliedCache = new Set((await readJsonSync<string[]>(KEY)) ?? []);
  return appliedCache;
}

export async function runOnce(id: string, fn: () => Promise<void>): Promise<void> {
  const done = await applied();
  if (done.has(id)) return;
  await fn();
  // Re-read before writing so parallel instances don't drop each other's ids.
  const fresh = new Set((await readJsonSync<string[]>(KEY)) ?? []);
  fresh.add(id);
  await writeJsonSync(KEY, [...fresh]);
  done.add(id);
}
