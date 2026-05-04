// ============================================================
//  AgroAI – Algorithms Engine
//  All algorithms are pure TypeScript, no external deps needed
// ============================================================

// ─── Types ───────────────────────────────────────────────────
export type Cell = 'empty' | 'obstacle' | 'water' | 'start' | 'end' | 'visited' | 'path' | 'crop';
export type Grid = Cell[][];
export type Point = { row: number; col: number };
export type AlgoStep = { grid: Grid; stats: { visited: number; pathLen: number; msg: string } };

// ─── Grid helpers ────────────────────────────────────────────
export function createGrid(rows: number, cols: number): Grid {
  return Array.from({ length: rows }, () => Array(cols).fill('empty') as Cell[]);
}

export function cloneGrid(g: Grid): Grid {
  return g.map(row => [...row] as Cell[]);
}

const DIRS = [[-1,0],[1,0],[0,-1],[0,1]];

function neighbors(g: Grid, r: number, c: number): Point[] {
  return DIRS
    .map(([dr, dc]) => ({ row: r + dr, col: c + dc }))
    .filter(({ row, col }) =>
      row >= 0 && row < g.length && col >= 0 && col < g[0].length &&
      g[row][col] !== 'obstacle'
    );
}

// ─── BFS ─────────────────────────────────────────────────────
export function bfs(grid: Grid, start: Point, end: Point): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const g = cloneGrid(grid);
  const visited = new Set<string>();
  const parent = new Map<string, string | null>();
  const key = (p: Point) => `${p.row},${p.col}`;
  const queue: Point[] = [start];
  visited.add(key(start));
  parent.set(key(start), null);
  let found = false;

  while (queue.length && !found) {
    const cur = queue.shift()!;
    if (cur.row !== start.row || cur.col !== start.col)
      if (g[cur.row][cur.col] !== 'end') g[cur.row][cur.col] = 'visited';

    steps.push({ grid: cloneGrid(g), stats: { visited: visited.size, pathLen: 0, msg: 'BFS exploring…' } });

    for (const nb of neighbors(g, cur.row, cur.col)) {
      const k = key(nb);
      if (!visited.has(k)) {
        visited.add(k);
        parent.set(k, key(cur));
        if (nb.row === end.row && nb.col === end.col) { found = true; break; }
        queue.push(nb);
      }
    }
  }

  // Reconstruct path
  const path: Point[] = [];
  let cur: string | null | undefined = key(end);
  while (cur) { const [r,c] = cur.split(',').map(Number); path.unshift({row:r,col:c}); cur = parent.get(cur); }
  for (const p of path) if (g[p.row][p.col] !== 'start' && g[p.row][p.col] !== 'end') g[p.row][p.col] = 'path';
  steps.push({ grid: cloneGrid(g), stats: { visited: visited.size, pathLen: path.length, msg: 'BFS complete – shortest path found' } });
  return steps;
}

// ─── DFS ─────────────────────────────────────────────────────
export function dfs(grid: Grid, start: Point, end: Point): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const g = cloneGrid(grid);
  const visited = new Set<string>();
  const parent = new Map<string, string | null>();
  const key = (p: Point) => `${p.row},${p.col}`;
  const stack: Point[] = [start];
  visited.add(key(start));
  parent.set(key(start), null);
  let found = false;

  while (stack.length && !found) {
    const cur = stack.pop()!;
    if (cur.row !== start.row || cur.col !== start.col)
      if (g[cur.row][cur.col] !== 'end') g[cur.row][cur.col] = 'visited';
    steps.push({ grid: cloneGrid(g), stats: { visited: visited.size, pathLen: 0, msg: 'DFS exploring…' } });
    if (cur.row === end.row && cur.col === end.col) { found = true; break; }

    for (const nb of neighbors(g, cur.row, cur.col)) {
      const k = key(nb);
      if (!visited.has(k)) {
        visited.add(k);
        parent.set(k, key(cur));
        stack.push(nb);
      }
    }
  }

  const path: Point[] = [];
  let cur: string | null | undefined = key(end);
  while (cur) { const [r,c] = cur.split(',').map(Number); path.unshift({row:r,col:c}); cur = parent.get(cur); }
  for (const p of path) if (g[p.row][p.col] !== 'start' && g[p.row][p.col] !== 'end') g[p.row][p.col] = 'path';
  steps.push({ grid: cloneGrid(g), stats: { visited: visited.size, pathLen: path.length, msg: 'DFS complete – path found (not shortest)' } });
  return steps;
}

// ─── A* ──────────────────────────────────────────────────────
function heuristic(a: Point, b: Point) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

interface ANode { point: Point; g: number; f: number; parent: string | null }

export function aStar(grid: Grid, start: Point, end: Point): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const g = cloneGrid(grid);
  const key = (p: Point) => `${p.row},${p.col}`;
  const open = new Map<string, ANode>();
  const closed = new Set<string>();
  const parent = new Map<string, string | null>();

  open.set(key(start), { point: start, g: 0, f: heuristic(start, end), parent: null });
  parent.set(key(start), null);

  while (open.size) {
    // Pick node with lowest f
    let best: ANode | null = null;
    for (const node of open.values()) if (!best || node.f < best.f) best = node;
    if (!best) break;
    const cur = best.point;
    const ck = key(cur);
    open.delete(ck);
    closed.add(ck);

    if (cur.row !== start.row || cur.col !== start.col)
      if (g[cur.row][cur.col] !== 'end') g[cur.row][cur.col] = 'visited';
    steps.push({ grid: cloneGrid(g), stats: { visited: closed.size, pathLen: 0, msg: `A* f=${best.f.toFixed(1)}` } });

    if (cur.row === end.row && cur.col === end.col) break;

    for (const nb of neighbors(g, cur.row, cur.col)) {
      const nk = key(nb);
      if (closed.has(nk)) continue;
      const ng = best.g + 1;
      const existing = open.get(nk);
      if (!existing || ng < existing.g) {
        open.set(nk, { point: nb, g: ng, f: ng + heuristic(nb, end), parent: ck });
        parent.set(nk, ck);
      }
    }
  }

  const path: Point[] = [];
  let cur: string | null | undefined = key(end);
  while (cur) { const [r,c] = cur.split(',').map(Number); path.unshift({row:r,col:c}); cur = parent.get(cur); }
  for (const p of path) if (g[p.row][p.col] !== 'start' && g[p.row][p.col] !== 'end') g[p.row][p.col] = 'path';
  steps.push({ grid: cloneGrid(g), stats: { visited: closed.size, pathLen: path.length, msg: 'A* complete – optimal path' } });
  return steps;
}

// ─── Greedy Best-First Search ─────────────────────────────────
export function greedySearch(grid: Grid, start: Point, end: Point): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const g = cloneGrid(grid);
  const key = (p: Point) => `${p.row},${p.col}`;
  const visited = new Set<string>();
  const parent = new Map<string, string | null>();
  // Priority queue (min-heap by heuristic)
  const open: { point: Point; h: number }[] = [{ point: start, h: heuristic(start, end) }];
  visited.add(key(start));
  parent.set(key(start), null);
  let found = false;

  while (open.length && !found) {
    open.sort((a, b) => a.h - b.h);
    const { point: cur } = open.shift()!;
    if (cur.row !== start.row || cur.col !== start.col)
      if (g[cur.row][cur.col] !== 'end') g[cur.row][cur.col] = 'visited';
    steps.push({ grid: cloneGrid(g), stats: { visited: visited.size, pathLen: 0, msg: 'Greedy exploring…' } });
    if (cur.row === end.row && cur.col === end.col) { found = true; break; }
    for (const nb of neighbors(g, cur.row, cur.col)) {
      const k = key(nb);
      if (!visited.has(k)) {
        visited.add(k); parent.set(k, key(cur));
        open.push({ point: nb, h: heuristic(nb, end) });
      }
    }
  }

  const path: Point[] = [];
  let cur: string | null | undefined = key(end);
  while (cur) { const [r,c] = cur.split(',').map(Number); path.unshift({row:r,col:c}); cur = parent.get(cur); }
  for (const p of path) if (g[p.row][p.col] !== 'start' && g[p.row][p.col] !== 'end') g[p.row][p.col] = 'path';
  steps.push({ grid: cloneGrid(g), stats: { visited: visited.size, pathLen: path.length, msg: 'Greedy complete' } });
  return steps;
}

// ─── Hill Climbing (irrigation optimization) ─────────────────
export interface HillState { water: number[]; fitness: number }

export function hillClimbing(zones: number, maxWater: number[]): HillState[] {
  const states: HillState[] = [];
  // Fitness: maximize coverage (sum of sqrt(water)) – concave to show diminishing returns
  const fitness = (w: number[]) => w.reduce((s, v) => s + Math.sqrt(v), 0);

  let current: number[] = maxWater.map(m => Math.floor(m / 2));
  let currentFit = fitness(current);
  states.push({ water: [...current], fitness: currentFit });

  for (let iter = 0; iter < 100; iter++) {
    const i = Math.floor(Math.random() * zones);
    const delta = Math.random() > 0.5 ? 1 : -1;
    const next = [...current];
    next[i] = Math.max(0, Math.min(maxWater[i], next[i] + delta));
    const nextFit = fitness(next);
    if (nextFit > currentFit) {
      current = next;
      currentFit = nextFit;
      states.push({ water: [...current], fitness: currentFit });
    }
  }
  return states;
}

// ─── Genetic Algorithm (crop layout optimizer) ────────────────
export interface Chromosome { genes: number[]; fitness: number }

function evalFitness(genes: number[], prices: number[], water: number[]): number {
  return genes.reduce((s, cropIdx, i) => s + prices[cropIdx] * Math.sqrt(water[i] + 1), 0);
}

export function geneticAlgorithm(
  zones: number, crops: string[], prices: number[], water: number[], generations = 40
): { gen: number; best: Chromosome; avg: number }[] {
  const POP = 20;
  const MUTATION = 0.15;
  const history: { gen: number; best: Chromosome; avg: number }[] = [];

  // Init population
  let pop: Chromosome[] = Array.from({ length: POP }, () => {
    const genes = Array.from({ length: zones }, () => Math.floor(Math.random() * crops.length));
    return { genes, fitness: evalFitness(genes, prices, water) };
  });

  for (let gen = 0; gen < generations; gen++) {
    pop.sort((a, b) => b.fitness - a.fitness);
    const best = pop[0];
    const avg = pop.reduce((s, c) => s + c.fitness, 0) / POP;
    history.push({ gen, best: { ...best, genes: [...best.genes] }, avg });

    // Selection (top 50%) + crossover
    const parents = pop.slice(0, POP / 2);
    const newPop: Chromosome[] = [...parents];
    while (newPop.length < POP) {
      const a = parents[Math.floor(Math.random() * parents.length)];
      const b = parents[Math.floor(Math.random() * parents.length)];
      const split = Math.floor(Math.random() * zones);
      const genes = [...a.genes.slice(0, split), ...b.genes.slice(split)];
      // Mutation
      for (let i = 0; i < genes.length; i++)
        if (Math.random() < MUTATION) genes[i] = Math.floor(Math.random() * crops.length);
      newPop.push({ genes, fitness: evalFitness(genes, prices, water) });
    }
    pop = newPop;
  }
  return history;
}

// ─── Activity Selection (irrigation scheduling) ───────────────
export interface Activity { id: number; name: string; start: number; end: number; zone: string }

export function activitySelection(activities: Activity[]): Activity[] {
  const sorted = [...activities].sort((a, b) => a.end - b.end);
  const selected: Activity[] = [];
  let lastEnd = -Infinity;
  for (const act of sorted) {
    if (act.start >= lastEnd) { selected.push(act); lastEnd = act.end; }
  }
  return selected;
}

// ─── Job Sequencing (farm tasks) ─────────────────────────────
export interface Job { id: number; name: string; deadline: number; profit: number }

export function jobSequencing(jobs: Job[]): { schedule: (Job|null)[]; totalProfit: number } {
  const sorted = [...jobs].sort((a, b) => b.profit - a.profit);
  const maxD = Math.max(...jobs.map(j => j.deadline));
  const slots: (Job|null)[] = Array(maxD).fill(null);
  for (const job of sorted) {
    for (let d = Math.min(job.deadline, maxD) - 1; d >= 0; d--) {
      if (!slots[d]) { slots[d] = job; break; }
    }
  }
  const totalProfit = slots.reduce((s, j) => s + (j ? j.profit : 0), 0);
  return { schedule: slots, totalProfit };
}

// ─── 0/1 Knapsack (resource allocation) ──────────────────────
export interface Resource { name: string; weight: number; value: number }

export function knapsack(resources: Resource[], capacity: number): { selected: Resource[]; value: number; table: number[][] } {
  const n = resources.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    const { weight, value } = resources[i - 1];
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i-1][w];
      if (weight <= w) dp[i][w] = Math.max(dp[i][w], dp[i-1][w-weight] + value);
    }
  }
  // Backtrack
  const selected: Resource[] = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i-1][w]) { selected.push(resources[i-1]); w -= resources[i-1].weight; }
  }
  return { selected, value: dp[n][capacity], table: dp };
}

// ─── Huffman Coding (sensor data compression) ─────────────────
export interface HuffNode { char: string; freq: number; left?: HuffNode; right?: HuffNode }

export function huffmanCoding(text: string): { codes: Record<string, string>; tree: HuffNode; ratio: number } {
  const freq: Record<string, number> = {};
  for (const c of text) freq[c] = (freq[c] || 0) + 1;
  let nodes: HuffNode[] = Object.entries(freq).map(([char, f]) => ({ char, freq: f }));

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift()!;
    const right = nodes.shift()!;
    nodes.push({ char: '', freq: left.freq + right.freq, left, right });
  }
  const tree = nodes[0];

  const codes: Record<string, string> = {};
  function traverse(node: HuffNode, code: string) {
    if (!node.left && !node.right) { codes[node.char] = code || '0'; return; }
    if (node.left) traverse(node.left, code + '0');
    if (node.right) traverse(node.right, code + '1');
  }
  traverse(tree, '');

  const origBits = text.length * 8;
  const compBits = text.split('').reduce((s, c) => s + codes[c].length, 0);
  return { codes, tree, ratio: origBits / compBits };
}

// ─── Crop Growth Simulation ───────────────────────────────────
export interface GrowthParams {
  seedType: string; irrigationLPerDay: number; spacing: number;
  soilNitrogen: number; sunHours: number; daysToSimulate: number;
}
export interface GrowthDay { day: number; height: number; leafArea: number; yieldEst: number }

const SEED_PROFILES: Record<string, { growthRate: number; maxHeight: number; yieldFactor: number }> = {
  wheat:  { growthRate: 0.8, maxHeight: 120, yieldFactor: 3.2 },
  corn:   { growthRate: 1.1, maxHeight: 250, yieldFactor: 8.5 },
  rice:   { growthRate: 0.9, maxHeight: 100, yieldFactor: 4.1 },
  tomato: { growthRate: 1.3, maxHeight: 180, yieldFactor: 12.0 },
  potato: { growthRate: 0.7, maxHeight:  60, yieldFactor: 15.0 },
};

export function simulateGrowth(params: GrowthParams): GrowthDay[] {
  const seed = SEED_PROFILES[params.seedType] || SEED_PROFILES.wheat;
  const days: GrowthDay[] = [];
  const waterFactor = Math.min(1, params.irrigationLPerDay / 10);
  const spacingFactor = Math.min(1, 30 / params.spacing);
  const nitrogenFactor = Math.min(1, params.soilNitrogen / 60);
  const sunFactor = Math.min(1, params.sunHours / 8);
  const growthMod = seed.growthRate * waterFactor * spacingFactor * nitrogenFactor * sunFactor;

  for (let d = 1; d <= params.daysToSimulate; d++) {
    const progress = d / params.daysToSimulate;
    // Sigmoidal growth
    const sig = 1 / (1 + Math.exp(-10 * (progress - 0.5)));
    const height = seed.maxHeight * sig;
    const leafArea = height * 0.4 * growthMod;
    const yieldEst = progress > 0.7 ? seed.yieldFactor * growthMod * (progress - 0.7) / 0.3 : 0;
    days.push({ day: d, height: +(height * growthMod).toFixed(1), leafArea: +leafArea.toFixed(1), yieldEst: +yieldEst.toFixed(2) });
  }
  return days;
}
