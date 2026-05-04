/**
 * Generic Persistence Layer using LocalStorage
 */

export const STORAGE_KEYS = {
  SCENARIOS: 'agroai_scenarios',
  SETTINGS: 'agroai_settings',
  HISTORY: 'agroai_history',
  ZONES: 'agroai_zones',
  ALERTS: 'agroai_alerts',
};

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving to localStorage [${key}]:`, e);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error(`Error loading from localStorage [${key}]:`, e);
    return defaultValue;
  }
}

export function clearStorage(key?: string): void {
  if (key) {
    localStorage.removeItem(key);
  } else {
    localStorage.clear();
  }
}

// Continuous Learning: Save simulation results to history
export interface HistoryRecord {
  id: string;
  timestamp: number;
  label: string;
  crop: string;
  finalYield: number;
  params: any;
}

export function addHistoryRecord(record: Omit<HistoryRecord, 'id' | 'timestamp'>) {
  const history = loadFromStorage<HistoryRecord[]>(STORAGE_KEYS.HISTORY, []);
  const newRecord: HistoryRecord = {
    ...record,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
  };
  const updated = [newRecord, ...history].slice(0, 50); // Keep last 50
  saveToStorage(STORAGE_KEYS.HISTORY, updated);
  return updated;
}
