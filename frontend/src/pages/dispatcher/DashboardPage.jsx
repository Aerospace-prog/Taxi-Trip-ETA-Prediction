import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Activity, Timer, Zap, PlusCircle, Clock, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const POLL_INTERVAL = 30000; // 30 seconds

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState(null);
  const navigate = useNavigate();
  const pollRef = useRef(null);

  const fetchMetrics = () => {
    api.get('/metrics')
      .then((res) => setMetrics(res.data))
      .catch(() => setMetrics(null));
  };

  const fetchRecentPredictions = () => {
    api.get('/history', { params: { page: 1, limit: 5 } })
      .then((res) => {
        const records = res.data?.records || [];
        setRecentPredictions(records);
      })
      .catch(() => setRecentPredictions([]));
  };

  const fetchHealth = () => {
    api.get('/health')
      .then((res) => setHealthStatus(res.data))
      .catch(() => setHealthStatus(null));
  };

  useEffect(() => {
    Promise.all([
      api.get('/metrics').then((res) => setMetrics(res.data)).catch(() => {}),
      api.get('/history', { params: { page: 1, limit: 5 } }).then((res) => setRecentPredictions(res.data?.records || [])).catch(() => {}),
      api.get('/health').then((res) => setHealthStatus(res.data)).catch(() => {}),
    ]).finally(() => setLoading(false));

    // Start polling
    pollRef.current = setInterval(() => {
      fetchMetrics();
      fetchRecentPredictions();
      fetchHealth();
    }, POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, []);

  const metricCards = [
    { label: 'MAE', sublabel: 'Mean Absolute Error (sec)', value: metrics?.mae?.toFixed(1) || '—', icon: Timer, tag: 'LIVE' },
    { label: 'RMSE', sublabel: 'Root Mean Square Error', value: metrics?.rmse?.toFixed(1) || '—', icon: Activity, tag: 'LIVE' },
    { label: 'R-Squared', sublabel: 'Variance explained by model', value: metrics?.r2_score?.toFixed(2) || '—', icon: CheckCircle2, tag: 'LIVE' },
    { label: 'Active Version', sublabel: `Model currently deployed`, value: metrics?.active_model_version || '—', icon: Zap, tag: 'LIVE' },
  ];

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  };

  const isApiOnline = healthStatus?.status === 'healthy';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Dispatcher / Dashboard
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>System Overview</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge badge-info" style={{ padding: '4px 10px', fontSize: 11 }}>Authorization: Bearer Token Required</span>
          <span className={`badge ${isApiOnline ? 'badge-success' : 'badge-warning'}`}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isApiOnline ? '#10B981' : '#F59E0B' }} />
            {isApiOnline ? 'MODEL LOADED' : 'CONNECTING...'}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="section-title"><BarChart3 size={16} /> MODEL PERFORMANCE METRICS <span className="mono" style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 400, color: 'var(--color-text-muted)' }}>Endpoint: GET /metrics · Polling: 30s</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {loading ? (
          <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>Loading metrics...</div>
        ) : metricCards.map((m) => (
          <div key={m.label} className="card" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{m.label}</span>
                <span className="badge" style={{ marginLeft: 6, padding: '1px 6px', fontSize: 9, background: '#ECFDF5', color: '#059669' }}>{m.tag}</span>
              </div>
              <m.icon size={16} color="var(--color-text-muted)" />
            </div>
            <p style={{ fontSize: 32, fontWeight: 700, margin: '0 0 4px', color: 'var(--color-text)' }}>{m.value}</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>{m.sublabel}</p>
          </div>
        ))}
      </div>

      {/* Quick Access + Environment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
        {/* New Prediction Card (dark) */}
        <div
          onClick={() => navigate('/predict')}
          style={{
            background: '#1E293B',
            borderRadius: 8,
            padding: 24,
            cursor: 'pointer',
            transition: 'transform 150ms',
            position: 'relative',
          }}
        >
          <span style={{
            position: 'absolute', top: 16, right: 16,
            background: 'var(--color-accent)', color: '#FFF',
            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.05em',
          }}>FAST PATH</span>
          <PlusCircle size={28} color="#FFFFFF" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px' }}>New Prediction</h3>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>Enter coordinates and timing to estimate trip duration.</p>
        </div>

        {/* View History Card */}
        <div
          onClick={() => navigate('/history')}
          className="card"
          style={{ cursor: 'pointer', transition: 'box-shadow 150ms' }}
        >
          <Clock size={28} color="var(--color-text-muted)" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>View History</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>Review past predictions and actual outcome comparisons.</p>
        </div>

        {/* Environment Details (Live) */}
        <div className="card">
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 12 }}>Environment Details</p>
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 4px' }}>API Base URL</p>
            <div className="mono" style={{ padding: '8px 12px', background: '#F8FAFC', borderRadius: 4, fontSize: 12, color: 'var(--color-text)' }}>
              http://localhost:8000
            </div>
          </div>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 8px' }}>Status Checks</p>
          {[
            { label: 'Inference Engine', value: isApiOnline ? 'STABLE' : 'OFFLINE', color: isApiOnline ? '#10B981' : '#EF4444' },
            { label: 'Active Model', value: metrics?.active_model_version || '—', color: '#10B981' },
            { label: 'API Version', value: healthStatus?.version || '—', color: '#10B981' },
          ].map((s) => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
              <span style={{ color: 'var(--color-text)' }}>{s.label}</span>
              <span className="mono" style={{ fontWeight: 600, color: s.color, fontSize: 12 }}>{s.value}</span>
            </div>
          ))}
          <button
            className="btn-secondary"
            style={{ marginTop: 12, padding: '8px 12px', fontSize: 12, width: '100%', gap: 6 }}
            onClick={() => window.open('http://localhost:8000/docs', '_blank')}
          >
            <ExternalLink size={14} /> View API Documentation
          </button>
        </div>
      </div>

      {/* Recent Prediction Log (LIVE) */}
      <div className="section-title">
        <Clock size={16} /> RECENT PREDICTION LOG
        <span className="mono" style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 400, color: 'var(--color-text-muted)' }}>Endpoint: GET /history · Auto-refresh: 30s</span>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Timestamp (UTC)</th>
              <th>Pickup → Dropoff</th>
              <th>Predicted ETA</th>
              <th style={{ textAlign: 'right' }}>Model</th>
            </tr>
          </thead>
          <tbody>
            {recentPredictions.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-muted)' }}>
                  {loading ? 'Loading...' : 'No predictions yet. Make your first prediction!'}
                </td>
              </tr>
            ) : recentPredictions.map((p) => (
              <tr key={p.request_id}>
                <td style={{ fontWeight: 600 }} className="mono">{p.request_id?.slice(0, 8)}...</td>
                <td style={{ color: 'var(--color-text-muted)' }}>{new Date(p.created_at).toLocaleString()}</td>
                <td className="mono" style={{ fontSize: 12 }}>
                  {p.pickup_latitude?.toFixed(4)}, {p.pickup_longitude?.toFixed(4)} → {p.dropoff_latitude?.toFixed(4)}, {p.dropoff_longitude?.toFixed(4)}
                </td>
                <td style={{ fontWeight: 700 }}>{formatDuration(p.predicted_duration_seconds)}</td>
                <td style={{ textAlign: 'right' }}>
                  <span className="badge badge-info" style={{ fontSize: 11 }}>{p.model_version}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid var(--color-border)', cursor: 'pointer' }}
          onClick={() => navigate('/history')}
        >
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Load Full Prediction History →
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, padding: '16px 0', borderTop: '1px solid var(--color-border)' }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>© 2026 Dispatch ETA System {healthStatus?.version || 'v1.0'}</span>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>System Status: <strong style={{ color: isApiOnline ? 'var(--color-accent)' : '#EF4444' }}>{isApiOnline ? 'ONLINE' : 'OFFLINE'}</strong></span>
      </div>
    </div>
  );
}
