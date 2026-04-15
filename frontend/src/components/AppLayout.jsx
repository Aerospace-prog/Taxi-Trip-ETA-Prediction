import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar />
      <Sidebar />
      <main style={{
        marginLeft: 220,
        marginTop: 56,
        padding: '28px 32px',
        minHeight: 'calc(100vh - 56px)',
      }}>
        <Outlet />
      </main>
    </div>
  );
}
