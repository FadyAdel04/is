import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

type MapMode = 'health' | 'water' | 'nitrogen' | 'phosphorus';

const MODE_CONFIG: Record<MapMode, { label: string; key: string; low: string; mid: string; high: string }> = {
  health:     { label: 'Crop Health %',    key: 'health',      low: '#f43f5e', mid: '#f59e0b', high: '#22c55e' },
  water:      { label: 'Soil Moisture %',  key: 'soilMoisture',low: '#f59e0b', mid: '#60a5fa', high: '#1d4ed8' },
  nitrogen:   { label: 'Nitrogen (mg/kg)', key: 'nitrogen',    low: '#f43f5e', mid: '#f59e0b', high: '#22c55e' },
  phosphorus: { label: 'Phosphorus',       key: 'phosphorus',  low: '#f43f5e', mid: '#a78bfa', high: '#22c55e' },
};

function lerp(a: string, b: string, t: number): string {
  const hex = (c: string) => parseInt(c.slice(1), 16);
  const r = (c: number) => [(c >> 16) & 255, (c >> 8) & 255, c & 255];
  const [ar, ag, ab] = r(hex(a));
  const [br, bg, bb] = r(hex(b));
  const ri = Math.round(ar + (br - ar) * t);
  const gi = Math.round(ag + (bg - ag) * t);
  const bi = Math.round(ab + (bb - ab) * t);
  return `rgb(${ri},${gi},${bi})`;
}

function getColor(val: number, min: number, max: number, cfg: { low: string; mid: string; high: string }) {
  const t = (max === min) ? 1 : (val - min) / (max - min);
  return t < 0.5 ? lerp(cfg.low, cfg.mid, t * 2) : lerp(cfg.mid, cfg.high, (t - 0.5) * 2);
}

export default function FieldMap() {
  const { zones, setZones } = useApp();
  const [mode, setMode] = useState<MapMode>('health');
  const [selected, setSelected] = useState<any>(null);
  const cfg = MODE_CONFIG[mode];
  const values = zones.map(z => z[cfg.key] as number);
  const minV = Math.min(...values), maxV = Math.max(...values);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '1.3rem' }}>🗺 Variable Rate Prescription Map</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
          Field divided into zones — each shows soil conditions, water/fertilizer needs as interactive heatmaps.
        </p>
      </div>

      {/* Mode selector */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {(Object.keys(MODE_CONFIG) as MapMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={mode === m ? 'btn-primary' : 'btn-ghost'}
            style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}>
            {MODE_CONFIG[m].label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Grid map */}
        <motion.div className="glass-card" style={{ padding: '1.5rem' }}
          key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: '1rem' }}>
            📍 Field Grid — {cfg.label}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {zones.map((z, i) => {
              const val = z[cfg.key] as number;
              const color = getColor(val, minV, maxV, cfg);
              const isSelected = selected?.id === z.id;
              return (
                <motion.div
                  key={z.id}
                  onClick={() => setSelected(isSelected ? null : z)}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.04 }}
                  style={{
                    background: color,
                    borderRadius: 12,
                    padding: '1.25rem 0.75rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: isSelected ? '2px solid #fff' : '2px solid transparent',
                    boxShadow: isSelected ? '0 0 20px rgba(255,255,255,0.2)' : 'none',
                    transition: 'border 0.15s',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                    {val.toFixed(0)}{mode === 'health' || mode === 'water' ? '%' : ''}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.85)', marginTop: 3 }}>{z.label}</div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)', marginTop: 2, textTransform: 'capitalize' }}>{z.crop}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>Low ({minV.toFixed(0)})</span>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: `linear-gradient(to right, ${cfg.low}, ${cfg.mid}, ${cfg.high})` }} />
            <span>High ({maxV.toFixed(0)})</span>
          </div>
        </motion.div>

        {/* Zone detail panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {selected ? (
            <motion.div className="glass-card" style={{ padding: '1.25rem' }}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} key={selected.id}>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>📍 {selected.label}</div>
              {[
                { label: 'Crop',         val: selected.crop,                                    color: 'var(--accent-green)' },
                { label: 'Health',       val: `${selected.health.toFixed(1)}%`,                 color: selected.health > 80 ? 'var(--accent-green)' : selected.health > 60 ? 'var(--accent-amber)' : 'var(--accent-rose)' },
                { label: 'Soil Moisture',val: `${selected.soilMoisture.toFixed(1)}%`,           color: 'var(--accent-blue)' },
                { label: 'Nitrogen',     val: `${selected.nitrogen.toFixed(1)} mg/kg`,          color: 'var(--accent-teal)' },
                { label: 'Phosphorus',   val: `${selected.phosphorus.toFixed(1)} mg/kg`,        color: '#a78bfa' },
                { label: 'Potassium',    val: `${selected.potassium.toFixed(1)} mg/kg`,         color: 'var(--accent-amber)' },
                { label: 'Water Need',   val: selected.waterNeed,                               color: selected.waterNeed === 'high' ? 'var(--accent-rose)' : 'var(--accent-green)' },
                { label: 'Fert. Need',   val: selected.fertNeed,                                color: selected.fertNeed === 'high' ? 'var(--accent-rose)' : 'var(--accent-green)' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.82rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontWeight: 600, color, textTransform: 'capitalize' }}>{val}</span>
                </div>
              ))}

              {/* Prescription */}
              <div style={{ marginTop: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 10, padding: '0.75rem', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>📋 Prescription</div>
                {selected.waterNeed === 'high' && <div style={{ color: 'var(--accent-blue)' }}>• Irrigate 15L/m² today</div>}
                {selected.fertNeed === 'high' && <div style={{ color: 'var(--accent-amber)' }}>• Apply NPK 20-10-10 at 50kg/ha</div>}
                {selected.health < 70 && <div style={{ color: 'var(--accent-rose)' }}>• Schedule pest/disease inspection</div>}
                {selected.health >= 70 && selected.waterNeed !== 'high' && <div style={{ color: 'var(--accent-green)' }}>• Zone is in good condition</div>}
              </div>
            </motion.div>
          ) : (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem' }}>🖱️</div>
              <div style={{ fontWeight: 600, marginTop: '0.75rem' }}>Click a zone</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6 }}>Select any grid cell to view detailed readings and prescriptions</div>
            </div>
          )}

          {/* Zone summary stats */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>📊 Field Summary</div>
            {[
              { label: 'Zones needing water',  val: zones.filter(z => z.waterNeed === 'high').length, color: 'var(--accent-blue)' },
              { label: 'Zones needing fert.',  val: zones.filter(z => (z.fertNeed as string) === 'high').length,  color: 'var(--accent-amber)' },
              { label: 'Critical health',      val: zones.filter(z => z.health < 60).length,          color: 'var(--accent-rose)' },
              { label: 'Healthy zones',        val: zones.filter(z => z.health >= 80).length,         color: 'var(--accent-green)' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.82rem', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontWeight: 700, color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
