import { motion } from 'framer-motion';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Droplets, Thermometer, Wind, Sun, TrendingUp, TrendingDown,
  Leaf, AlertTriangle, CheckCircle, Clock, Zap, Target
} from 'lucide-react';
import { DASHBOARD_METRICS, WEATHER_DATA, SENSOR_READINGS, FIELD_ZONES, MARKET_PRICES } from '../lib/mockData';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

function MetricCard({ label, value, unit, icon: Icon, color, trend, idx }: any) {
  return (
    <motion.div className="metric-card" variants={cardVariants} custom={idx} initial="hidden" animate="visible">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={{ color, marginTop: '0.4rem' }}>
            {value}<span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 4 }}>{unit}</span>
          </div>
          {trend !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: '0.75rem',
              color: trend >= 0 ? 'var(--accent-green)' : 'var(--accent-rose)' }}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trend)}% vs last week
            </div>
          )}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} color={color} />
        </div>
      </div>
    </motion.div>
  );
}

const CUSTOM_TOOLTIP_STYLE = {
  background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: 10, fontSize: '0.8rem', color: 'var(--text-primary)',
};

export default function Dashboard() {
  const metrics = DASHBOARD_METRICS;
  const w = WEATHER_DATA.current;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
        <MetricCard idx={0} label="Predicted Yield" value={metrics.predictedYield} unit="t/ha" icon={Leaf} color="var(--accent-green)" trend={+4.2} />
        <MetricCard idx={1} label="Harvest In" value={metrics.harvestDaysLeft} unit="days" icon={Clock} color="var(--accent-blue)" trend={null} />
        <MetricCard idx={2} label="Crop Health" value={metrics.cropHealthAvg} unit="%" icon={CheckCircle} color="var(--accent-teal)" trend={+1.8} />
        <MetricCard idx={3} label="Water Used" value={(metrics.waterUsedToday / 1000).toFixed(1)} unit="m³" icon={Droplets} color="#60a5fa" trend={-8.3} />
        <MetricCard idx={4} label="Energy Saved" value={metrics.energySaved} unit="%" icon={Zap} color="var(--accent-amber)" trend={+3.1} />
        <MetricCard idx={5} label="Active Sensors" value={metrics.activeSensors} unit="" icon={Target} color="var(--accent-rose)" trend={null} />
      </div>

      {/* Main charts + Weather */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: '1rem' }}>

        {/* Sensor Chart */}
        <motion.div className="chart-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div style={{ fontWeight: 600, marginBottom: '1rem' }}>24h Sensor Readings</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={SENSOR_READINGS}>
              <defs>
                <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
              <Area type="monotone" dataKey="soilMoisture" stroke="#22c55e" fill="url(#soilGrad)" strokeWidth={2} name="Soil Moisture %" />
              <Area type="monotone" dataKey="temperature" stroke="#3b82f6" fill="url(#tempGrad)" strokeWidth={2} name="Temperature °C" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Market Prices */}
        <motion.div className="chart-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Market Prices ($/ton)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={Object.entries(MARKET_PRICES).map(([k, v]) => ({ crop: k.charAt(0).toUpperCase() + k.slice(1), price: v.price, change: v.change }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="crop" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Bar dataKey="price" fill="url(#barGrad)" radius={[6,6,0,0]}>
                {Object.entries(MARKET_PRICES).map(([k, v]) => (
                  <rect key={k} fill={v.change > 0 ? '#22c55e' : '#f43f5e'} />
                ))}
              </Bar>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" /><stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            {Object.entries(MARKET_PRICES).map(([k, v]) => (
              <span key={k} className={`badge ${v.change > 0 ? 'badge-green' : 'badge-rose'}`}>
                {k} {v.change > 0 ? '+' : ''}{v.change}%
              </span>
            ))}
          </div>
        </motion.div>

        {/* Weather Panel */}
        <motion.div className="glass-card" style={{ padding: '1.5rem' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <div style={{ fontWeight: 600, marginBottom: '1rem' }}>🌤 Weather</div>
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: "'Space Grotesk'", color: 'var(--accent-amber)' }}>
              {w.temp.toFixed(1)}°C
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{w.description}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
            {[
              { icon: Droplets, label: 'Humidity', val: `${w.humidity.toFixed(0)}%`, color: '#60a5fa' },
              { icon: Wind, label: 'Wind', val: `${w.windSpeed.toFixed(1)} km/h`, color: 'var(--accent-teal)' },
              { icon: Sun, label: 'UV Index', val: w.uvIndex, color: 'var(--accent-amber)' },
              { icon: Thermometer, label: 'Precip.', val: `${w.precipitation.toFixed(1)} mm`, color: '#a78bfa' },
            ].map(({ icon: Ic, label, val, color }) => (
              <div key={label} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '0.6rem', textAlign: 'center' }}>
                <Ic size={16} color={color} style={{ marginBottom: 4 }} />
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{label}</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>7-Day Forecast</div>
            {WEATHER_DATA.forecast.map(f => (
              <div key={f.day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.35rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)', width: 32 }}>{f.day}</span>
                {f.rain && <span style={{ color: '#60a5fa', fontSize: '0.7rem' }}>🌧 {f.rainMm.toFixed(1)}mm</span>}
                <span>{f.low.toFixed(0)}° – {f.high.toFixed(0)}°</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Field Zones Heatmap */}
      <motion.div className="chart-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Field Zone Health Overview</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '0.5rem' }}>
          {FIELD_ZONES.map(z => (
            <div key={z.id} title={`${z.label}\nHealth: ${z.health.toFixed(0)}%\nMoisture: ${z.soilMoisture.toFixed(0)}%\nCrop: ${z.crop}`}
              style={{
                borderRadius: 10, padding: '0.75rem 0.5rem', textAlign: 'center', cursor: 'pointer',
                background: z.health > 80 ? 'rgba(34,197,94,0.15)' : z.health > 60 ? 'rgba(245,158,11,0.15)' : 'rgba(244,63,94,0.15)',
                border: `1px solid ${z.health > 80 ? 'rgba(34,197,94,0.3)' : z.health > 60 ? 'rgba(245,158,11,0.3)' : 'rgba(244,63,94,0.3)'}`,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{z.label}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: 2,
                color: z.health > 80 ? 'var(--accent-green)' : z.health > 60 ? 'var(--accent-amber)' : 'var(--accent-rose)' }}>
                {z.health.toFixed(0)}%
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{z.crop}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span><span style={{ color: 'var(--accent-green)' }}>●</span> Healthy (&gt;80%)</span>
          <span><span style={{ color: 'var(--accent-amber)' }}>●</span> Fair (60-80%)</span>
          <span><span style={{ color: 'var(--accent-rose)' }}>●</span> Critical (&lt;60%)</span>
        </div>
      </motion.div>
    </div>
  );
}
