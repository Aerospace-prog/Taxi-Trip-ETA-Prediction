import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(email, password);
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMsg = Array.isArray(detail) ? detail[0]?.msg : detail;
      setError(errorMsg || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div className="animate-fade-in" style={{
        width: '100%',
        maxWidth: 440,
        background: '#FFFFFF',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: '48px 40px 32px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Activity size={24} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text)' }}>
              TaxiPredict
            </span>
          </div>
          <h1 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text)', margin: 0 }}>
            DISPATCH TERMINAL
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '6px 0 0' }}>
            Taxi Trip Duration Prediction – Dispatch ETA System v2.0
          </p>
        </div>

        {/* Secure Access Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <span className="badge" style={{
            padding: '6px 16px',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}>
            <Shield size={14} />
            SECURE ENTERPRISE ACCESS
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label className="label" htmlFor="email-input">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }} />
              <input
                id="email-input"
                type="email"
                className="input-field"
                placeholder="test@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="label" htmlFor="password-input" style={{ margin: 0 }}>Password</label>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                Forgot password?
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }} />
              <input
                id="password-input"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 6,
              color: '#DC2626',
              fontSize: 13,
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button
            id="sign-in-button"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ height: 48, fontSize: 15 }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* System Notice */}
        <div style={{
          marginTop: 24,
          paddingLeft: 12,
          borderLeft: '3px solid var(--color-border)',
        }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 }}>
            "System maintenance scheduled for Sunday 02:00 AM UTC. Model version XGB-v2.1 will be deployed."
          </p>
        </div>

        {/* Footer Links */}
        <div style={{ marginTop: 24, borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12 }}>
            {['System Status', 'Privacy Policy', 'Technical Support'].map((link) => (
              <span key={link} style={{ fontSize: 12, color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                {link}
              </span>
            ))}
          </div>
          <p className="mono" style={{
            textAlign: 'center',
            fontSize: 10,
            color: '#94A3B8',
            letterSpacing: '0.03em',
          }}>
            SECURE NODE: 192.168.1.104 · ENCRYPTION: AES-256
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 11,
        color: '#94A3B8',
        letterSpacing: '0.02em',
      }}>
        <span>© 2026 TAXI PREDICT ANALYTICS · INFRASTRUCTURE SECURED BY XGBOOST CLOUD</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#CBD5E1' }}>LOCAL CLUSTER<br /><strong style={{ color: '#94A3B8' }}>DC-NORTH-01</strong></span>
          <span style={{ width: 1, height: 24, background: '#E2E8F0' }} />
          <span style={{ fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>OPERATIONAL</span>
        </div>
      </div>
    </div>
  );
}
