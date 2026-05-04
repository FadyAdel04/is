import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Bell, Globe, Database, Shield, AlertTriangle } from 'lucide-react';

import { useApp } from '../context/AppContext';

export default function Settings() {
  const { settings, setSettings, history } = useApp();
  const [saved, setSaved] = useState(false);

  function update(field: string, val: any) {
    setSettings({ ...settings, [field]: val });
  }

  function updateNotif(key: keyof typeof settings.notif) {
    setSettings({ ...settings, notif: { ...settings.notif, [key]: !settings.notif[key] } });
  }

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2500); }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 720 }}>
      <div>
        <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '1.3rem' }}>⚙️ Settings</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>Platform configuration and preferences</p>
      </div>

      {/* Farm Info */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.25rem' }}>
          <Globe size={18} color="var(--accent-green)" />
          <span style={{ fontWeight: 600 }}>Farm Profile</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 500 }}>Farm Name</div>
            <input value={settings.farmName} onChange={e => update('farmName', e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text-primary)', fontSize: '0.88rem' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 500 }}>Latitude</div>
            <input value={settings.lat} onChange={e => update('lat', e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text-primary)', fontSize: '0.88rem' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 500 }}>Longitude</div>
            <input value={settings.lon} onChange={e => update('lon', e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text-primary)', fontSize: '0.88rem' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 500 }}>Units</div>
            <select value={settings.unit} onChange={e => update('unit', e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
              <option value="metric">Metric (°C, mm, kg)</option>
              <option value="imperial">Imperial (°F, in, lb)</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 500 }}>Language</div>
            <select value={settings.lang} onChange={e => update('lang', e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.25rem' }}>
          <Bell size={18} color="var(--accent-amber)" />
          <span style={{ fontWeight: 600 }}>Notifications</span>
        </div>
        {[
          { key: 'alerts' as const, label: 'Critical Alerts',    desc: 'Sensor failures, extreme moisture levels' },
          { key: 'rain'   as const, label: 'Rain Forecasts',     desc: 'Precipitation alerts from weather API' },
          { key: 'harvest'as const, label: 'Harvest Reminders',  desc: 'Predicted harvest date notifications' },
          { key: 'weekly' as const, label: 'Weekly Report',      desc: 'Sunday summary of farm performance' },
        ].map(({ key, label, desc }) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{desc}</div>
            </div>
            <button onClick={() => updateNotif(key)}
              style={{
                width: 46, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer',
                background: settings.notif[key] ? 'var(--accent-green)' : 'var(--border)',
                position: 'relative', transition: 'background 0.2s',
              }}>
              <div style={{
                position: 'absolute', top: 3,
                left: settings.notif[key] ? 22 : 3,
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s',
              }} />
            </button>
          </div>
        ))}
      </div>

      {/* Continuous Learning Statistics */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.25rem' }}>
          <Shield size={18} color="var(--accent-teal)" />
          <span style={{ fontWeight: 600 }}>Continuous Learning System</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Historical Data Points</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-teal)' }}>{history.length}</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg. Yield Improvement</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-green)' }}>+14.2%</div>
          </div>
        </div>
        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          The platform uses historical simulation data stored in <strong>localStorage</strong> to refine growth models and prediction accuracy.
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(244,63,94,0.3)' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
          <AlertTriangle size={18} color="var(--accent-rose)" />
          <span style={{ fontWeight: 600, color: 'var(--accent-rose)' }}>Danger Zone</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Reset Platform Data</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Wipe all simulation history, settings, and saved scenarios.</div>
          </div>
          <button className="btn-ghost" onClick={() => { if(confirm('Are you sure you want to wipe all data?')) { localStorage.clear(); window.location.reload(); } }}
            style={{ color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.3)' }}>
            Reset All
          </button>
        </div>
      </div>

      {/* Data & APIs */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.25rem' }}>
          <Database size={18} color="var(--accent-blue)" />
          <span style={{ fontWeight: 600 }}>API Connections</span>
        </div>
        {[
          { label: 'OpenWeather API', status: 'Connected', color: 'var(--accent-green)', key: 'OWM_API_KEY' },
          { label: 'Mapbox GL',       status: 'Connected', color: 'var(--accent-green)', key: 'MAPBOX_TOKEN' },
          { label: 'Market Data API', status: 'Mock Mode', color: 'var(--accent-amber)', key: 'MARKET_API_KEY' },
          { label: 'AI Inference',    status: 'Simulated', color: 'var(--accent-amber)', key: 'AI_SERVICE_URL' },
        ].map(({ label, status, color, key }) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
            <div>
              <span style={{ fontWeight: 500 }}>{label}</span>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{key}</div>
            </div>
            <span className="badge" style={{ background: `${color}20`, color, fontSize: '0.7rem' }}>{status}</span>
          </div>
        ))}
      </div>

      {/* Save */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <motion.button className="btn-primary" onClick={save}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          whileTap={{ scale: 0.97 }}>
          {saved ? '✅ Saved!' : <><Save size={15} /> Save Settings</>}
        </motion.button>
        <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={15} /> Reset Defaults
        </button>
      </div>
    </div>
  );
}
