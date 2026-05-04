import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Simulation from './pages/Simulation';
import Algorithms from './pages/Algorithms';
import ImageAnalysis from './pages/ImageAnalysis';
import Irrigation from './pages/Irrigation';
import FieldMap from './pages/FieldMap';
import Settings from './pages/Settings';

const PAGE_TITLES: Record<string, string> = {
  dashboard:  '📊 Dashboard',
  simulation: '🌾 Crop Simulation',
  algorithms: '🤖 Algorithms Engine',
  analysis:   '🌿 Image Analysis',
  irrigation: '💧 Smart Irrigation',
  fieldmap:   '🗺 Field Map',
  settings:   '⚙️ Settings',
};

const PAGES: Record<string, React.ComponentType> = {
  dashboard:  Dashboard,
  simulation: Simulation,
  algorithms: Algorithms,
  analysis:   ImageAnalysis,
  irrigation: Irrigation,
  fieldmap:   FieldMap,
  settings:   Settings,
};

function AppInner() {
  const { activePage, sidebarOpen } = useApp();
  const Page = PAGES[activePage] || Dashboard;
  const title = PAGE_TITLES[activePage] || 'Dashboard';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: sidebarOpen ? 260 : 72, flex: 1, transition: 'margin-left 0.3s', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Topbar title={title} />
        <main style={{ flex: 1, padding: '2rem', background: 'var(--bg-primary)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Page />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
