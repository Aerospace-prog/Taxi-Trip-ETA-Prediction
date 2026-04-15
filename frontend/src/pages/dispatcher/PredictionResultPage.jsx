import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Settings, Target, Clock, RefreshCw, ArrowLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function PredictionResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showPayload, setShowPayload] = useState(false);
  const isAdmin = location.pathname.startsWith('/admin');

  const prediction = state?.prediction;
  const payload = state?.payload;

  if (!prediction) {
    const predictPath = isAdmin ? '/admin/predict' : '/predict';
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <p style={{ fontSize: 16, color: 'var(--color-text-muted)' }}>No prediction data. Please make a prediction first.</p>
        <button className="btn-primary" style={{ width: 'auto', marginTop: 16 }} onClick={() => navigate(predictPath)}>Make a Prediction</button>
      </div>
    );
  }

  // Map to backend response schema: predicted_duration_seconds, predicted_duration_minutes, model_version, confidence, request_id
  const seconds = prediction.predicted_duration_seconds || 0;
  const minutes = prediction.predicted_duration_minutes || Math.round(seconds / 60);
  const model = prediction.model_version || '—';
  const confidence = prediction.confidence || 'Unknown';
  const requestId = prediction.request_id || '—';

  const predictPath = isAdmin ? '/admin/predict' : '/predict';
  const dashboardPath = isAdmin ? '/admin/dashboard' : '/dashboard';

  return (
    <div className="animate-fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Success Icon */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <CheckCircle2 size={40} color="var(--color-accent)" />
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', margin: '0 0 4px' }}>Prediction Results</h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', textAlign: 'center', margin: '0 0 32px' }}>
        Calculated trip duration · Request ID: <span className="mono">{requestId.slice(0, 12)}...</span>
      </p>

      {/* Main Result Card */}
      <div className="card" style={{ textAlign: 'center', padding: '40px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', right: -20, bottom: -20, width: 120, height: 120,
          borderRadius: '50%', background: '#F1F5F9', opacity: 0.6,
        }} />
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent)', letterSpacing: '0.05em', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)' }} />
          PREDICTION SUCCESSFUL
        </p>
        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-text)', margin: '0 0 16px' }}>
          PREDICTED DURATION
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 72, fontWeight: 800, color: 'var(--color-accent)', lineHeight: 1 }}>{minutes}</span>
          <span style={{ fontSize: 28, fontWeight: 600, color: 'var(--color-text-muted)' }}>MINUTES</span>
        </div>
        <p className="mono" style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '16px 0 0' }}>
          SOURCE: POST /predict (Raw: {seconds}s)
        </p>
      </div>

      {/* Detail Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div className="card-compact" style={{ textAlign: 'center' }}>
          <Settings size={18} color="var(--color-text-muted)" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', margin: '0 0 4px' }}>Model Version</p>
          <p className="mono" style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{model}</p>
        </div>
        <div className="card-compact" style={{ textAlign: 'center' }}>
          <Target size={18} color="var(--color-text-muted)" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', margin: '0 0 4px' }}>Confidence Score</p>
          <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{confidence}</p>
        </div>
        <div className="card-compact" style={{ textAlign: 'center' }}>
          <Clock size={18} color="var(--color-text-muted)" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', margin: '0 0 4px' }}>Prediction Time</p>
          <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{new Date().toISOString().replace('T', ' ').split('.')[0]} UTC</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320, margin: '0 auto 32px' }}>
        <button className="btn-primary" onClick={() => navigate(predictPath)} id="new-prediction-btn">
          <RefreshCw size={16} /> Make Another Prediction
        </button>
        <button className="btn-secondary" onClick={() => navigate(dashboardPath)}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {/* Backend Response Log */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <button
          onClick={() => setShowPayload(!showPayload)}
          style={{
            width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: 14, color: 'var(--color-text)',
          }}
        >
          View Raw Inference Payload
          <ChevronDown size={18} style={{ transform: showPayload ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
        </button>
        {showPayload && (
          <pre className="mono" style={{
            padding: '16px 20px', margin: 0,
            background: '#F8FAFC', borderTop: '1px solid var(--color-border)',
            fontSize: 12, overflow: 'auto', maxHeight: 300,
          }}>
            {JSON.stringify({ request: payload, response: prediction }, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
