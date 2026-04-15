import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Clock, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Sidebar() {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const pollRef = useRef(null);

  const checkHealth = () => {
    api.get('/health')
      .then((res) => setHealth(res.data))
      .catch(() => setHealth(null));
  };

  useEffect(() => {
    checkHealth();
    pollRef.current = setInterval(checkHealth, 30000);
    return () => clearInterval(pollRef.current);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const base = isAdmin ? '/admin' : '';
  const navItems = [
    { to: `${base}/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
    { to: `${base}/predict`, icon: PlusCircle, label: 'New Prediction' },
    { to: `${base}/history`, icon: Clock, label: 'Prediction History' },
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin/retrain', icon: RefreshCw, label: 'Retrain Model' });
  }

  const isOnline = health?.status === 'healthy';

  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: '#FFFFFF',
      borderRight: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 56,
      left: 0,
      bottom: 0,
      zIndex: 40,
    }}>
      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
              background: isActive ? 'var(--color-sidebar-active)' : 'transparent',
              textDecoration: 'none',
              marginBottom: 2,
              transition: 'background 150ms',
              cursor: 'pointer',
            })}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
        <button
          onClick={handleLogout}
          id="logout-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            color: 'var(--color-danger)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            padding: '8px 0',
          }}
        >
          <LogOut size={16} />
          Logout
        </button>

        <div style={{
          marginTop: 16,
          padding: '10px 12px',
          background: '#F8FAFC',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          <span style={{ color: 'var(--color-text-muted)' }}>API Status</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="pulse-dot" style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isOnline ? 'var(--color-accent)' : '#EF4444',
            }} />
            <span className="mono" style={{ fontSize: 10, color: isOnline ? 'var(--color-text-muted)' : '#EF4444' }}>
              {isOnline ? health.version || 'Online' : 'Offline'}
            </span>
          </span>
        </div>
      </div>
    </aside>
  );
}
