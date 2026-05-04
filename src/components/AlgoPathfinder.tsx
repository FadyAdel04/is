import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, StepForward, Pause } from 'lucide-react';
import {
  bfs, dfs, aStar, greedySearch,
  createGrid, cloneGrid, Grid, Point, Cell
} from '../lib/algorithms';

const ROWS = 18, COLS = 28;
const CELL_SIZE = 26;

const CELL_COLORS: Record<Cell, string> = {
  empty:    'var(--bg-secondary)',
  obstacle: '#374151',
  water:    '#1d4ed8',
  start:    '#22c55e',
  end:      '#f43f5e',
  visited:  'rgba(59,130,246,0.35)',
  path:     '#f59e0b',
  crop:     '#15803d',
};

type DrawMode = 'obstacle' | 'start' | 'end' | 'empty';
type AlgoType = 'bfs' | 'dfs' | 'astar' | 'greedy';

function makeDefaultGrid(): Grid {
  const g = createGrid(ROWS, COLS);
  // Some obstacles
  for (let r = 4; r < 14; r++) g[r][8] = 'obstacle';
  for (let c = 10; c < 20; c++) g[5][c] = 'obstacle';
  for (let r = 8; r < 16; r++) g[r][20] = 'obstacle';
  g[2][3] = 'start';
  g[15][25] = 'end';
  return g;
}

export default function AlgoPathfinder() {
  const [grid, setGrid] = useState<Grid>(makeDefaultGrid);
  const [drawMode, setDrawMode] = useState<DrawMode>('obstacle');
  const [algo, setAlgo] = useState<AlgoType>('astar');
  const [steps, setSteps] = useState<{ grid: Grid; stats: any }[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ visited: 0, pathLen: 0, msg: 'Ready' });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isDrawing = useRef(false);

  const findPoint = (g: Grid, cell: Cell): Point | null => {
    for (let r = 0; r < g.length; r++)
      for (let c = 0; c < g[0].length; c++)
        if (g[r][c] === cell) return { row: r, col: c };
    return null;
  };

  const runAlgo = useCallback(() => {
    const start = findPoint(grid, 'start');
    const end = findPoint(grid, 'end');
    if (!start || !end) { setStats(s => ({ ...s, msg: '⚠ Place start & end first' })); return; }
    const fns = { bfs, dfs, astar: aStar, greedy: greedySearch };
    const result = fns[algo](grid, start, end);
    setSteps(result);
    setStepIdx(0);
    setStats(result[0]?.stats ?? stats);

    let i = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(true);
    intervalRef.current = setInterval(() => {
      i++;
      if (i >= result.length) {
        clearInterval(intervalRef.current!);
        setRunning(false);
        setGrid(cloneGrid(result[result.length - 1].grid));
        setStats(result[result.length - 1].stats);
        return;
      }
      setStepIdx(i);
      setGrid(cloneGrid(result[i].grid));
      setStats(result[i].stats);
    }, 35);
  }, [grid, algo]);

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setSteps([]);
    setStepIdx(0);
    setGrid(makeDefaultGrid());
    setStats({ visited: 0, pathLen: 0, msg: 'Ready' });
  };

  const handleCell = (r: number, c: number) => {
    if (running) return;
    setGrid(prev => {
      const g = cloneGrid(prev);
      if (drawMode === 'start') {
        for (let i = 0; i < ROWS; i++) for (let j = 0; j < COLS; j++) if (g[i][j] === 'start') g[i][j] = 'empty';
        g[r][c] = 'start';
      } else if (drawMode === 'end') {
        for (let i = 0; i < ROWS; i++) for (let j = 0; j < COLS; j++) if (g[i][j] === 'end') g[i][j] = 'empty';
        g[r][c] = 'end';
      } else if (drawMode === 'obstacle') {
        if (g[r][c] !== 'start' && g[r][c] !== 'end') g[r][c] = g[r][c] === 'obstacle' ? 'empty' : 'obstacle';
      } else {
        if (g[r][c] !== 'start' && g[r][c] !== 'end') g[r][c] = 'empty';
      }
      return g;
    });
  };

  const ALGOS: { key: AlgoType; label: string; desc: string }[] = [
    { key: 'bfs',    label: 'BFS',    desc: 'Shortest path – explores level by level' },
    { key: 'dfs',    label: 'DFS',    desc: 'Deep dive – not guaranteed shortest' },
    { key: 'astar',  label: 'A★',     desc: 'Optimal heuristic – Manhattan distance' },
    { key: 'greedy', label: 'Greedy', desc: 'Fastest explore – may not be optimal' },
  ];

  const DRAW_MODES: { key: DrawMode; label: string; color: string }[] = [
    { key: 'obstacle', label: '🧱 Wall',  color: '#374151' },
    { key: 'start',    label: '🟢 Start', color: '#22c55e' },
    { key: 'end',      label: '🔴 End',   color: '#f43f5e' },
    { key: 'empty',    label: '🧹 Erase', color: 'var(--bg-secondary)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '1.1rem' }}>🗺 Pathfinding Visualizer</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 3 }}>
          Draw obstacles, place start/end, select algorithm and watch it solve the field irrigation routing.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {ALGOS.map(a => (
            <button key={a.key} onClick={() => setAlgo(a.key)} title={a.desc}
              className={algo === a.key ? 'btn-primary' : 'btn-ghost'}
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}>
              {a.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', marginLeft: 'auto' }}>
          {DRAW_MODES.map(m => (
            <button key={m.key} onClick={() => setDrawMode(m.key)}
              style={{
                padding: '0.4rem 0.8rem', fontSize: '0.78rem', borderRadius: 8, cursor: 'pointer',
                background: drawMode === m.key ? m.color : 'transparent',
                border: `1px solid ${drawMode === m.key ? m.color : 'var(--border)'}`,
                color: drawMode === m.key ? '#fff' : 'var(--text-secondary)',
              }}>
              {m.label}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={runAlgo} disabled={running} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Play size={14} /> Run
        </button>
        <button className="btn-ghost" onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        {[
          { label: 'Cells Visited', val: stats.visited, color: 'var(--accent-blue)' },
          { label: 'Path Length', val: stats.pathLen, color: 'var(--accent-amber)' },
          { label: 'Algorithm', val: ALGOS.find(a => a.key === algo)?.label, color: 'var(--accent-green)' },
          { label: 'Status', val: stats.msg, color: 'var(--text-primary)' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.6rem 1rem' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontWeight: 700, color: s.color, fontSize: '0.95rem', marginTop: 2 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
        gap: 2,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '1rem',
        overflow: 'auto',
        userSelect: 'none',
      }}
        onMouseLeave={() => { isDrawing.current = false; }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              style={{
                width: CELL_SIZE, height: CELL_SIZE,
                background: CELL_COLORS[cell] || CELL_COLORS.empty,
                borderRadius: 4,
                cursor: running ? 'default' : 'crosshair',
                transition: 'background 0.1s',
                border: cell === 'path' ? '1px solid rgba(245,158,11,0.6)' : '1px solid rgba(255,255,255,0.03)',
              }}
              onMouseDown={() => { isDrawing.current = true; handleCell(r, c); }}
              onMouseUp={() => { isDrawing.current = false; }}
              onMouseEnter={() => { if (isDrawing.current) handleCell(r, c); }}
            />
          ))
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        {Object.entries(CELL_COLORS).filter(([k]) => !['crop','water'].includes(k)).map(([k, v]) => (
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: v, display: 'inline-block', border: '1px solid rgba(255,255,255,0.1)' }} />
            {k.charAt(0).toUpperCase() + k.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
}
