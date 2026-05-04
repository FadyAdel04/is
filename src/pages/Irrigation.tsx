import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets, Zap, ThumbsUp, Power, AlertTriangle } from 'lucide-react';
import { WEATHER_DATA, SENSOR_READINGS } from '../lib/mockData';
import { useApp, Zone } from '../context/AppContext';

const TOOLTIP_STYLE = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.8rem', color: 'var(--text-primary)' };

export default function Irrigation() {
  const { zones, setZones } = useApp();
  const [autoAll, setAutoAll] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);

  // Simulate sensor ticking
  useEffect(() => {
    const id = setInterval(() => {
      setZones(zones.map((z: Zone) => ({
        ...z,
        soilMoisture: Math.min(95, Math.max(10,
          z.soilMoisture + (z.irrigationActive ? +0.8 : -0.3) + (Math.random() - 0.5) * 0.5
        )),
        // Auto mode logic
        irrigationActive: z.autoMode
          ? z.soilMoisture < 45
          : z.irrigationActive,
      })));
    }, 2000);
    return () => clearInterval(id);
  }, [zones, setZones]);

  const toggleZone = (id: string) => {
    setLoading(id);
    setTimeout(() => {
      setZones(zones.map((z: Zone) => z.id === id ? { ...z, irrigationActive: !z.irrigationActive, autoMode: false } : z));
      setLoading(null);
    }, 600);
  };

  const toggleAutoZone = (id: string) => {
    setZones(zones.map((z: Zone) => z.id === id ? { ...z, autoMode: !z.autoMode } : z));
  };

  const toggleAutoAll = () => {
    const next = !autoAll;
    setAutoAll(next);
    setZones(zones.map((z: Zone) => ({ ...z, autoMode: next })));
  };

  const activeZonesCount = zones.filter((z: Zone) => z.irrigationActive).length;
  const avgMoisture = zones.reduce((s: number, z: Zone) => s + z.soilMoisture, 0) / zones.length;
  const totalFlow = activeZonesCount * 4.2;
  const w = WEATHER_DATA.current;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '1.3rem' }}>💧 Smart Irrigation Control</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
            Auto-triggers based on soil moisture + weather. Manual override available.
          </p>
        </div>
        <button
          className={autoAll ? 'btn-primary' : 'btn-ghost'}
          onClick={toggleAutoAll}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={15} /> {autoAll ? 'Auto Mode ON' : 'Auto Mode OFF'}
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Active Zones',    val: `${activeZonesCount}/${zones.length}`, color: 'var(--accent-green)',  icon: Power },
          { label: 'Avg Moisture',    val: `${avgMoisture.toFixed(1)}%`,           color: 'var(--accent-blue)',   icon: Droplets },
          { label: 'Flow Rate',       val: `${totalFlow.toFixed(1)} L/h`,          color: 'var(--accent-teal)', icon: Droplets },
          { label: 'Weather Adj.',    val: w.precipitation > 2 ? 'Reduced' : 'Normal', color: w.precipitation > 2 ? 'var(--accent-amber)' : 'var(--accent-green)', icon: AlertTriangle },
        ].map(({ label, val, color, icon: Ic }) => (
          <div key={label} className="metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-label">{label}</div>
                <div style={{ fontWeight: 700, fontSize: '1.4rem', color, marginTop: 4, fontFamily: "'Space Grotesk'" }}>{val}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ic size={20} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Moisture Chart */}
      <div className="chart-container">
        <div style={{ fontWeight: 600, marginBottom: '1rem' }}>📈 Soil Moisture (24h)</div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={SENSOR_READINGS}>
            <defs>
              <linearGradient id="mGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="hour" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval={3} />
            <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} domain={[20, 80]} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="soilMoisture" stroke="#3b82f6" fill="url(#mGrad)" strokeWidth={2} name="Soil Moisture %" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Zone Controls */}
      <div>
        <div style={{ fontWeight: 600, marginBottom: '1rem' }}>🗂 Zone Controls</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {zones.map((z: Zone) => (
            <motion.div key={z.id} className="glass-card" style={{ padding: '1.25rem' }}
              animate={{ borderColor: z.irrigationActive ? 'rgba(34,197,94,0.4)' : 'var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{z.label}</div>
                  <span className={`badge ${z.waterNeed === 'high' ? 'badge-rose' : z.waterNeed === 'medium' ? 'badge-amber' : 'badge-green'}`} style={{ marginTop: 4, fontSize: '0.65rem' }}>
                    {z.waterNeed} need
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => toggleAutoZone(z.id)}
                    style={{
                      padding: '0.3rem 0.6rem', borderRadius: 8, fontSize: '0.7rem', cursor: 'pointer',
                      background: z.autoMode ? 'rgba(245,158,11,0.15)' : 'var(--bg-secondary)',
                      border: `1px solid ${z.autoMode ? 'rgba(245,158,11,0.4)' : 'var(--border)'}`,
                      color: z.autoMode ? 'var(--accent-amber)' : 'var(--text-muted)',
                    }}>Auto</button>
                  <button onClick={() => toggleZone(z.id)}
                    disabled={loading === z.id}
                    style={{
                      padding: '0.3rem 0.6rem', borderRadius: 8, fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600,
                      background: z.irrigationActive ? 'rgba(34,197,94,0.15)' : 'rgba(244,63,94,0.1)',
                      border: `1px solid ${z.irrigationActive ? 'rgba(34,197,94,0.4)' : 'rgba(244,63,94,0.3)'}`,
                      color: z.irrigationActive ? 'var(--accent-green)' : 'var(--accent-rose)',
                      opacity: loading === z.id ? 0.5 : 1,
                    }}>
                    {loading === z.id ? '...' : (z.irrigationActive ? 'ON' : 'OFF')}
                  </button>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                Moisture: <strong style={{ color: z.soilMoisture < 35 ? 'var(--accent-rose)' : z.soilMoisture < 55 ? 'var(--accent-amber)' : 'var(--accent-green)' }}>{z.soilMoisture.toFixed(1)}%</strong>
              </div>
              <div className="progress-bar">
                <motion.div className="progress-fill"
                  animate={{ width: `${z.soilMoisture}%`, background: z.soilMoisture < 35 ? '#f43f5e' : z.soilMoisture < 55 ? '#f59e0b' : 'var(--gradient-primary)' }}
                  transition={{ duration: 0.5 }} style={{ height: '100%', borderRadius: 999 }} />
              </div>
              {z.irrigationActive && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--accent-blue)' }}>
                  <Droplets size={12} />
                  Irrigating at 4.2 L/h
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weather Advisory */}
      <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid var(--accent-amber)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <AlertTriangle size={20} color="var(--accent-amber)" />
          <div>
            <div style={{ fontWeight: 600 }}>Weather Advisory</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 3 }}>
              {w.precipitation > 2
                ? `Rain expected: ${w.precipitation.toFixed(1)}mm. Irrigation reduced by 40% automatically.`
                : `No rain expected. Operating at full irrigation schedule. Temp: ${w.temp.toFixed(1)}°C, Humidity: ${w.humidity.toFixed(0)}%.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
