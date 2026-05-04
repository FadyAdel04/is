import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadFromStorage, saveToStorage, STORAGE_KEYS, HistoryRecord } from '../lib/persistence';
import { FIELD_ZONES } from '../lib/mockData';

export interface Zone {
  id: string;
  label: string;
  soilMoisture: number;
  health: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  irrigationActive: boolean;
  autoMode: boolean;
  waterNeed: string;
  crop: string;
  [key: string]: string | number | boolean;
}

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activePage: string;
  setActivePage: (p: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  settings: any;
  setSettings: (s: any) => void;
  zones: Zone[];
  setZones: (z: Zone[]) => void;
  history: HistoryRecord[];
  refreshHistory: () => void;
}

const DEFAULT_SETTINGS = {
  farmName: 'Green Valley Farm',
  lat: '31.2001',
  lon: '29.9187',
  unit: 'metric',
  lang: 'en',
  notif: { alerts: true, rain: true, harvest: true, weekly: false },
};

const AppContext = createContext<AppContextType>({} as AppContextType);

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>(loadFromStorage('agroai_theme', 'dark'));
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [settings, setSettingsState] = useState(loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS));
  const [zones, setZonesState] = useState(loadFromStorage(STORAGE_KEYS.ZONES, FIELD_ZONES));
  const [history, setHistory] = useState<HistoryRecord[]>(loadFromStorage(STORAGE_KEYS.HISTORY, []));

  const setSettings = (s: any) => { setSettingsState(s); saveToStorage(STORAGE_KEYS.SETTINGS, s); };
  const setZones = (z: any[]) => { setZonesState(z); saveToStorage(STORAGE_KEYS.ZONES, z); };
  const refreshHistory = () => { setHistory(loadFromStorage(STORAGE_KEYS.HISTORY, [])); };

  useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'light' : '';
    saveToStorage('agroai_theme', theme);
  }, [theme]);

  return (
    <AppContext.Provider value={{
      theme, toggleTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark'),
      activePage, setActivePage,
      sidebarOpen, setSidebarOpen,
      settings, setSettings,
      zones, setZones,
      history, refreshHistory,
    }}>
      {children}
    </AppContext.Provider>
  );
}
