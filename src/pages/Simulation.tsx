import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Play, RotateCcw, Download, Plus, Trash2, Sprout, History } from 'lucide-react';
import { simulateGrowth, GrowthParams } from '../lib/algorithms';
import { CROPS } from '../lib/mockData';
import { loadFromStorage, saveToStorage, STORAGE_KEYS, addHistoryRecord } from '../lib/persistence';

const TOOLTIP_STYLE = {
  background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: 10, fontSize: '0.8rem', color: 'var(--text-primary)',
};

const DEFAULT_PARAMS: GrowthParams = {
  seedType: 'corn', irrigationLPerDay: 8, spacing: 25,
  soilNitrogen: 45, sunHours: 7, daysToSimulate: 120,
};

const SCENARIO_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#f43f5e', '#a78bfa'];

interface Scenario { id: number; label: string; params: GrowthParams; color: string }

let idCounter = 1;

export default function Simulation() {
  const [scenarios, setScenarios] = useState<Scenario[]>(() => 
    loadFromStorage(STORAGE_KEYS.SCENARIOS, [
      { id: idCounter++, label: 'Scenario A', params: { ...DEFAULT_PARAMS }, color: SCENARIO_COLORS[0] },
    ])
  );
  const [editing, setEditing] = useState(0);
  const [ran, setRan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SCENARIOS, scenarios);
  }, [scenarios]);

  async function runSimulations() {
    setLoading(true);
    setRan(true);
    const newResults = [];
    
    try {
      for (const s of scenarios) {
        const payload = {
          crop: s.params.seedType,
          duration_days: s.params.daysToSimulate,
          avg_temp: 24.5,
          avg_moisture: s.params.irrigationLPerDay * 6,
          nitrogen_level: s.params.soilNitrogen
        };
        
        const res = await fetch("http://localhost:8000/simulate-growth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        
        if (!res.ok) throw new Error("API request failed");
        const data = await res.json();
        
        const chartData = data.growth_curve.map((y: number, idx: number) => ({
          day: Math.min(idx * 10, s.params.daysToSimulate),
          height: y * 18, 
          leafArea: y * 6,
          yieldEst: y
        })).filter((d: any) => d.day <= s.params.daysToSimulate);
        
        newResults.push({ ...s, data: chartData });
      }
      
      setResults(newResults);
      
      if (newResults.length > 0) {
        newResults.forEach(s => {
          addHistoryRecord({
            label: s.label,
            crop: s.params.seedType,
            finalYield: s.data[s.data.length - 1]?.yieldEst || 0,
            params: s.params,
          });
        });
      }
    } catch (err) {
      console.error("Simulation API failed, using local fallback", err);
      const fallbackData = scenarios.map(s => ({ ...s, data: simulateGrowth(s.params) }));
      setResults(fallbackData);
      fallbackData.forEach(s => {
        addHistoryRecord({
          label: s.label,
          crop: s.params.seedType,
          finalYield: s.data[s.data.length - 1]?.yieldEst || 0,
          params: s.params,
        });
      });
    } finally {
      setLoading(false);
    }
  }

  const downloadCSV = () => {
    if (!results.length) return;
    let csv = 'Scenario,Day,Height,LeafArea,YieldEst\n';
    results.forEach(r => {
      r.data.forEach((d: any) => {
        csv += `${r.label},${d.day},${d.height},${d.leafArea},${d.yieldEst}\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agroai_simulation_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const activeScenario = scenarios[editing] || scenarios[0];

  function updateParam(key: keyof GrowthParams, val: string | number) {
    setScenarios(prev => prev.map((s, i) =>
      i === editing ? { ...s, params: { ...s.params, [key]: typeof DEFAULT_PARAMS[key] === 'number' ? +val : val } } : s
    ));
    setRan(false);
  }

  function addScenario() {
    if (scenarios.length >= 5) return;
    const idx = scenarios.length;
    setScenarios(prev => [...prev, {
      id: idCounter++,
      label: `Scenario ${String.fromCharCode(65 + idx)}`,
      params: { ...DEFAULT_PARAMS, seedType: CROPS[idx % CROPS.length] },
      color: SCENARIO_COLORS[idx],
    }]);
    setEditing(idx);
    setRan(false);
  }

  function removeScenario(i: number) {
    if (scenarios.length === 1) return;
    setScenarios(prev => prev.filter((_, j) => j !== i));
    setEditing(Math.max(0, editing - 1));
    setRan(false);
  }

  const finalYields = results.map(r => ({
    name: r.label,
    yield: r.data[r.data.length - 1]?.yieldEst ?? 0,
    maxHeight: Math.max(...r.data.map((d: any) => d.height)),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '1.3rem' }}>🌾 Crop Growth Simulator</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
            Configure multiple scenarios and compare predicted yield & growth
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-ghost" onClick={addScenario} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={15} /> Add Scenario
          </button>
          <button className="btn-primary" onClick={runSimulations} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Play size={15} /> Run Simulation
          </button>
          <button className="btn-ghost" onClick={downloadCSV} disabled={!ran} style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: ran ? 1 : 0.5 }}>
            <Download size={15} /> Export Report
          </button>
          <button className="btn-ghost" onClick={() => setRan(false)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RotateCcw size={15} /> Reset
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem' }}>
        {/* Config Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Scenario Tabs */}
          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>Scenarios</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {scenarios.map((s, i) => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0.75rem', borderRadius: 10, cursor: 'pointer',
                  background: editing === i ? 'var(--bg-card-hover)' : 'transparent',
                  border: editing === i ? '1px solid var(--border)' : '1px solid transparent',
                }} onClick={() => setEditing(i)}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: editing === i ? 600 : 400 }}>{s.label}</span>
                  <span className="badge badge-green" style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>{s.params.seedType}</span>
                  {scenarios.length > 1 && (
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
                      onClick={e => { e.stopPropagation(); removeScenario(i); }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Params */}
          {activeScenario && (
            <motion.div className="glass-card" style={{ padding: '1rem' }} key={editing} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Sprout size={16} color="var(--accent-green)" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{activeScenario.label} Parameters</span>
              </div>

              {/* Seed Type */}
              <label style={{ display: 'block', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 500 }}>Seed Type</div>
                <select value={activeScenario.params.seedType}
                  onChange={e => updateParam('seedType', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                  {CROPS.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </label>

              {/* Sliders */}
              {([
                { key: 'irrigationLPerDay', label: 'Irrigation (L/day)', min: 1, max: 20, step: 0.5 },
                { key: 'spacing',           label: 'Plant Spacing (cm)', min: 10, max: 80, step: 5 },
                { key: 'soilNitrogen',      label: 'Soil Nitrogen (mg/kg)', min: 10, max: 100, step: 5 },
                { key: 'sunHours',          label: 'Sun Hours / Day', min: 2, max: 12, step: 0.5 },
                { key: 'daysToSimulate',    label: 'Days to Simulate', min: 30, max: 360, step: 10 },
              ] as { key: keyof GrowthParams; label: string; min: number; max: number; step: number }[]).map(({ key, label, min, max, step }) => (
                <div key={key} style={{ marginBottom: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{activeScenario.params[key]}</span>
                  </div>
                  <input type="range" min={min} max={max} step={step}
                    value={activeScenario.params[key] as number}
                    onChange={e => updateParam(key, e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--accent-green)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    <span>{min}</span><span>{max}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!ran ? (
            <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '4rem' }}>🌱</div>
              <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>Configure & Run Simulation</div>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 340 }}>
                Adjust the parameters for each scenario, then click <strong>Run Simulation</strong> to see predicted growth curves.
              </p>
              <button className="btn-primary" onClick={runSimulations} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <Play size={16} /> Run Now
              </button>
            </motion.div>
          ) : (
            <>
              {/* Height Chart */}
              <motion.div className="chart-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Plant Height Over Time (cm)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" type="number" domain={['auto','auto']} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} label={{ value: 'Days', position: 'insideBottom', offset: -2, fill: 'var(--text-muted)', fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                    {results.map(r => (
                      <Line key={r.id} data={r.data} dataKey="height" name={r.label} stroke={r.color} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Yield Chart */}
              <motion.div className="chart-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Estimated Yield (t/ha)</div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart>
                    <defs>
                      {results.map((r, i) => (
                        <linearGradient key={r.id} id={`yGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={r.color} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={r.color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" type="number" domain={['auto','auto']} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                    {results.map((r, i) => (
                      <Area key={r.id} data={r.data} dataKey="yieldEst" name={`${r.label} Yield`}
                        stroke={r.color} fill={`url(#yGrad${i})`} strokeWidth={2} dot={false} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Final Yield Comparison */}
              <motion.div className="chart-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Final Yield Comparison</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={finalYields}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="yield" radius={[6,6,0,0]}>
                      {finalYields.map((_, i) => (
                        <rect key={i} fill={scenarios[i]?.color || '#22c55e'} />
                      ))}
                    </Bar>
                    <Bar dataKey="maxHeight" name="Max Height (cm)" fill="#3b82f6" radius={[6,6,0,0]} opacity={0.6} />
                  </BarChart>
                </ResponsiveContainer>
                {/* Summary cards */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  {results.map(r => {
                    const last = r.data[r.data.length - 1];
                    return (
                      <div key={r.id} style={{ flex: '1 1 140px', background: 'var(--bg-secondary)', borderRadius: 10, padding: '0.75rem', borderLeft: `3px solid ${r.color}` }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{r.label}</div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: r.color }}>{last?.yieldEst.toFixed(2)} t/ha</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.params.seedType} · {r.params.daysToSimulate}d</div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
