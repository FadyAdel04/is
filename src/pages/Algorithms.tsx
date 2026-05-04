import { useState } from 'react';
import { motion } from 'framer-motion';
import AlgoPathfinder from '../components/AlgoPathfinder';
import AlgoGreedy from '../components/AlgoGreedy';

const TABS = [
  { id: 'pathfinding', label: '🗺 Pathfinding',  desc: 'BFS · DFS · A★ · Greedy Search' },
  { id: 'greedy',      label: '🧠 Optimization', desc: 'Activity · Knapsack · Huffman · GA · Hill' },
];

export default function Algorithms() {
  const [tab, setTab] = useState('pathfinding');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '1.3rem' }}>🤖 Algorithms Engine</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
          Visual demonstrations of all AI/algorithmic techniques applied to smart farming.
        </p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '0.65rem 1.4rem', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem',
              background: tab === t.id ? 'var(--gradient-primary)' : 'var(--bg-card)',
              border: `1px solid ${tab === t.id ? 'transparent' : 'var(--border)'}`,
              color: tab === t.id ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}>
            {t.label}
            <div style={{ fontSize: '0.65rem', fontWeight: 400, marginTop: 2, opacity: 0.7 }}>{t.desc}</div>
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {tab === 'pathfinding' ? <AlgoPathfinder /> : <AlgoGreedy />}
      </motion.div>
    </div>
  );
}
