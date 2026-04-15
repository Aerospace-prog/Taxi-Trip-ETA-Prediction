import { Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAdmin } = useAuth();

  return (
    <header style={{
      height: 56,
      background: '#FFFFFF',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
    }}>
      {/* Left: Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: '#1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Activity size={18} color="#FFFFFF" />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>
          {isAdmin ? 'Taxi Trip Duration Prediction' : 'Dispatch ETA System'}
        </span>
        {isAdmin && (
          <span className="badge badge-dark" style={{ fontSize: 10, padding: '2px 8px' }}>
            ADMIN MODE
          </span>
        )}
      </div>

      {/* Right: User Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          padding: '4px 12px',
          border: '1px solid var(--color-border)',
          borderRadius: 6,
          fontSize: 12,
          color: 'var(--color-text-muted)',
        }}>
          Auth: Bearer Token
        </span>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 600,
          color: '#FFFFFF',
        }}>
          {user?.email?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
