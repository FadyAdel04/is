import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  activitySelection, jobSequencing, knapsack, huffmanCoding,
  hillClimbing, geneticAlgorithm,
} from '../lib/algorithms';
import { ACTIVITIES, JOBS, RESOURCES, SENSOR_DATA_TEXT } from '../lib/mockData';

const acts = ACTIVITIES;
const jobs = JOBS;
const res  = RESOURCES;
const sensorText = SENSOR_DATA_TEXT;

const TOOLTIP_STYLE = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.8rem', color: 'var(--text-primary)' };

function SectionTitle({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '1.05rem' }}>{icon} {title}</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 3 }}>{desc}</div>
    </div>
  );
}

export default function AlgoGreedy() {
  // ── Activity Selection ──
  const selected = activitySelection(acts);

  // ── Job Sequencing ──
  const { schedule, totalProfit } = jobSequencing(jobs);

  // ── Knapsack ──
  const [capacity, setCapacity] = useState(10);
  const kResult = knapsack(res, capacity);

  // ── Huffman ──
  const hResult = huffmanCoding(sensorText);

  // ── Hill Climbing ──
  const zones = 5;
  const maxWater = [10, 8, 12, 9, 11];
  const hillStates = hillClimbing(zones, maxWater);
  const hillData = hillStates.map((s, i) => ({ iter: i, fitness: +s.fitness.toFixed(3) }));

  // ── Genetic Algorithm ──
  const crops = ['wheat', 'corn', 'rice', 'tomato'];
  const prices = [220, 185, 310, 890];
  const water = [8, 10, 6, 7, 9];
  const [gaRan, setGaRan] = useState(false);
  const gaData = gaRan ? geneticAlgorithm(5, crops, prices, water, 40)
    .map(g => ({ gen: g.gen, best: +g.best.fitness.toFixed(1), avg: +g.avg.toFixed(1) })) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── Activity Selection ── */}
      <motion.div className="glass-card" style={{ padding: '1.5rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <SectionTitle icon="📅" title="Activity Selection – Irrigation Scheduling" desc="Greedy: select max non-overlapping irrigation sessions by earliest finish time" />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {acts.map(a => {
            const isSelected = selected.some(s => s.id === a.id);
            return (
              <div key={a.id} style={{
                position: 'relative', flex: '0 0 auto',
                background: isSelected ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isSelected ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
                borderRadius: 10, padding: '0.6rem 1rem', minWidth: 130,
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isSelected ? 'var(--accent-green)' : 'var(--text-secondary)' }}>{a.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>{a.start}:00 → {a.end}:00 · Zone {a.zone}</div>
                {isSelected && <span className="badge badge-green" style={{ position: 'absolute', top: 6, right: 6, fontSize: '0.6rem' }}>✓</span>}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          ✅ <strong style={{ color: 'var(--accent-green)' }}>{selected.length}</strong> sessions selected out of {acts.length}
        </div>
      </motion.div>

      {/* ── Job Sequencing ── */}
      <motion.div className="glass-card" style={{ padding: '1.5rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <SectionTitle icon="📋" title="Job Sequencing with Deadlines – Farm Task Prioritizer" desc="Maximize total profit by scheduling high-value jobs within their deadlines" />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {schedule.map((j, i) => (
            <div key={i} style={{
              flex: '0 0 auto', minWidth: 120,
              background: j ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${j ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`,
              borderRadius: 10, padding: '0.6rem',
            }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Slot {i + 1}</div>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: j ? 'var(--accent-blue)' : 'var(--text-muted)', marginTop: 2 }}>{j ? j.name : '— Empty —'}</div>
              {j && <div style={{ fontSize: '0.7rem', color: 'var(--accent-amber)' }}>+${j.profit}</div>}
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          💰 Total Profit: <strong style={{ color: 'var(--accent-amber)' }}>${totalProfit}</strong>
        </div>
      </motion.div>

      {/* ── Knapsack ── */}
      <motion.div className="glass-card" style={{ padding: '1.5rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <SectionTitle icon="🎒" title="0/1 Knapsack – Resource Allocation Optimizer" desc="Maximize farm resource value within weight/budget constraints" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Budget / Capacity: <strong style={{ color: 'var(--accent-green)' }}>{capacity}</strong>
          </label>
          <input type="range" min={4} max={20} value={capacity} onChange={e => setCapacity(+e.target.value)}
            style={{ flex: 1, accentColor: 'var(--accent-green)' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {res.map(r => {
            const picked = kResult.selected.some(s => s.name === r.name);
            return (
              <div key={r.name} style={{
                flex: '0 0 auto', minWidth: 130,
                background: picked ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${picked ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
                borderRadius: 10, padding: '0.6rem 0.8rem',
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: picked ? 'var(--accent-amber)' : 'var(--text-secondary)' }}>{r.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>⚖ {r.weight} · 💎 {r.value}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          📦 Selected {kResult.selected.length} items · Total Value: <strong style={{ color: 'var(--accent-amber)' }}>{kResult.value}</strong>
        </div>
      </motion.div>

      {/* ── Huffman ── */}
      <motion.div className="glass-card" style={{ padding: '1.5rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <SectionTitle icon="🔡" title="Huffman Coding – Sensor Data Compression" desc="Build optimal prefix-free codes to compress IoT sensor data streams" />
        <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', background: 'var(--bg-secondary)', borderRadius: 10, padding: '0.75rem', marginBottom: '0.75rem', wordBreak: 'break-all', color: 'var(--accent-teal)' }}>
          {sensorText}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {Object.entries(hResult.codes).slice(0, 18).map(([ch, code]) => (
            <div key={ch} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.35rem 0.6rem', fontSize: '0.72rem' }}>
              <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{ch === ' ' ? '⎵' : ch}</span>
              <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>→</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{code}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          🗜 Compression ratio: <strong style={{ color: 'var(--accent-green)' }}>{hResult.ratio.toFixed(2)}x</strong>
        </div>
      </motion.div>

      {/* ── Hill Climbing ── */}
      <motion.div className="glass-card" style={{ padding: '1.5rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
        <SectionTitle icon="⛰️" title="Hill Climbing – Irrigation Optimizer" desc="Maximize total coverage fitness by adjusting water allocation per zone" />
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={hillData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="iter" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} label={{ value: 'Iterations', position: 'insideBottom', offset: -2, fill: 'var(--text-muted)', fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="fitness" stroke="#22c55e" strokeWidth={2} dot={false} name="Fitness Score" />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Best fitness: <strong style={{ color: 'var(--accent-green)' }}>{hillStates[hillStates.length-1]?.fitness.toFixed(3)}</strong> · {hillStates.length} improvements found
        </div>
      </motion.div>

      {/* ── Genetic Algorithm ── */}
      <motion.div className="glass-card" style={{ padding: '1.5rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <SectionTitle icon="🧬" title="Genetic Algorithm – Crop Layout Optimizer" desc="Evolves optimal crop-to-zone mapping using selection, crossover & mutation" />
        {!gaRan ? (
          <button className="btn-primary" onClick={() => setGaRan(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            ▶ Evolve Population (40 generations)
          </button>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={gaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="gen" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} label={{ value: 'Generation', position: 'insideBottom', offset: -2, fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="best" stroke="#22c55e" strokeWidth={2} dot={false} name="Best Fitness" />
                <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="Avg Fitness" />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Best fitness gen 40: <strong style={{ color: 'var(--accent-green)' }}>{gaData[gaData.length-1]?.best}</strong>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
