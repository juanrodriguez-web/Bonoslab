// Client-side scenario persistence. No backend, no database -- scenarios
// live in the browser's localStorage, per the project's "no database" rule.

export type SavedScenario = {
  id: string;
  name: string;
  savedAt: string; // ISO timestamp
  price: number;
  minutes: number;
  wholesale: number;
  usage: number;
  targetCustomers: number;
  capex: number;
};

const STORAGE_KEY = "productlab-prepago:scenarios";

export function listScenarios(): SavedScenario[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveScenario(scenario: Omit<SavedScenario, "id" | "savedAt">): SavedScenario {
  const entry: SavedScenario = {
    ...scenario,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: new Date().toISOString(),
  };
  const list = [entry, ...listScenarios()];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return entry;
}

export function deleteScenario(id: string): void {
  const list = listScenarios().filter((s) => s.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
