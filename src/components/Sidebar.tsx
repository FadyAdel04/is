import { motion } from 'framer-motion';
import {
  LayoutDashboard, FlaskConical, Cpu, Camera,
  Settings, Leaf, Sun, Moon, ChevronLeft, ChevronRight, Bell, Droplets, Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'simulation',  label: 'Crop Simulation', icon: FlaskConical },
  { id: 'algorithms',  label: 'Algorithms',      icon: Cpu },
  { id: 'analysis',    label: 'Image Analysis',  icon: Camera },
  { id: 'irrigation',  label: 'Irrigation',      icon: Droplets },
  { id: 'fieldmap',    label: 'Field Map',       icon: Activity },
  { id: 'settings',    label: 'Settings',        icon: Settings },
];

export default function Sidebar() {
  const { activePage, setActivePage, theme, toggleTheme, sidebarOpen, setSidebarOpen } = useApp();

  return (
    <motion.div
      className="sidebar"
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ duration: 0.3 }}
      style={{ overflow: 'hidden' }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Leaf size={20} color="#fff" />
        </div>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-green)', lineHeight: 1 }}>AgroAI</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Smart Farming Platform</div>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            className={`nav-item ${activePage === id ? 'active' : ''}`}
            onClick={() => setActivePage(id)}
            style={{ border: 'none', width: '100%', textAlign: 'left', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.97 }}
            title={!sidebarOpen ? label : undefined}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>{label}</span>}
          </motion.button>
        ))}
      </nav>

      {/* Bottom controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
        <button className="btn-ghost" onClick={toggleTheme}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: sidebarOpen ? 'flex-start' : 'center', fontSize: '0.8rem' }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {sidebarOpen && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
        </button>
        <button className="btn-ghost" onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: sidebarOpen ? 'flex-start' : 'center', fontSize: '0.8rem' }}
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          {sidebarOpen && 'Collapse'}
        </button>
      </div>
    </motion.div>
  );
}
