import { motion } from 'framer-motion';
import { Bell, Search, Wifi, Battery, TrendingUp } from 'lucide-react';
import { DASHBOARD_METRICS, ALERTS } from '../lib/mockData';
import { useState } from 'react';

export default function Topbar({ title }: { title: string }) {
  const [showAlerts, setShowAlerts] = useState(false);

  return (
    <div className="topbar" style={{ position: 'relative' }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: "'Space Grotesk'" }}>{title}</h1>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Live status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--accent-green)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', animation: 'pulse-glow 2s infinite' }} />
          <Wifi size={14} /> Live
        </div>

        {/* Sensors */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <TrendingUp size={14} style={{ display: 'inline', marginRight: 4 }} />
          {DASHBOARD_METRICS.activeSensors} sensors
        </div>

        {/* Alerts */}
        <div style={{ position: 'relative' }}>
          <button className="btn-ghost" style={{ padding: '0.4rem 0.6rem', position: 'relative' }}
            onClick={() => setShowAlerts(!showAlerts)}>
            <Bell size={16} />
            <span style={{
              position: 'absolute', top: 2, right: 2,
              width: 16, height: 16, borderRadius: '50%',
              background: 'var(--accent-rose)', color: '#fff',
              fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700,
            }}>{DASHBOARD_METRICS.alertCount}</span>
          </button>

          {showAlerts && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                position: 'absolute', right: 0, top: '110%',
                width: 320, background: 'var(--bg-card)',
                border: '1px solid var(--border)', borderRadius: 12,
                padding: '1rem', zIndex: 100, boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Alerts</div>
              {ALERTS.map(a => (
                <div key={a.id} style={{
                  display: 'flex', gap: '0.75rem', padding: '0.6rem 0',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                    background: a.type === 'error' ? 'var(--accent-rose)' :
                                a.type === 'warning' ? 'var(--accent-amber)' : 'var(--accent-blue)',
                  }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{a.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{a.desc}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '0.85rem', color: '#fff', cursor: 'pointer',
        }}>AF</div>
      </div>
    </div>
  );
}
