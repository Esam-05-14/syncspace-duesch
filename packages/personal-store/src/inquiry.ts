import { openPersonalDb } from "./db.js";

const KEY = "inquiry-recent";
const MAX = 12;

function parseRecent(value: string | undefined): string[] {
  if (!value) {
    return [];
  }
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((row): row is string => typeof row === "string" && row.trim().length > 0).slice(0, MAX);
  } catch {
    return [];
  }
}

export async function listRecentInquiries(): Promise<string[]> {
  const db = await openPersonalDb();
  const row = await db.get("settings", KEY);
  return parseRecent(row?.value);
}

export async function rememberInquiry(query: string): Promise<string[]> {
  const next = query.trim();
  if (next.length < 2) {
    return listRecentInquiries();
  }
  const current = await listRecentInquiries();
  const recent = [next, ...current.filter((row) => row.toLocaleLowerCase("de-DE") !== next.toLocaleLowerCase("de-DE"))].slice(
    0,
    MAX,
  );
  const db = await openPersonalDb();
  await db.put("settings", { key: KEY, value: JSON.stringify(recent) });
  return recent;
}

export async function clearRecentInquiries(): Promise<void> {
  const db = await openPersonalDb();
  await db.delete("settings", KEY);
}
