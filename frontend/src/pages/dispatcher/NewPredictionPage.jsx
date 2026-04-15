import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Clock, Info, ArrowRight, Trash2, Shield, Crosshair, Cpu, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

// NYC bounding box — all valid taxi coordinates must fall within this range
const NYC_BOUNDS = {
  lat: { min: 40.4774, max: 40.9176 },
  lng: { min: -74.2591, max: -73.7004 },
};

function isValidNYCCoord(lat, lng) {
  return (
    lat >= NYC_BOUNDS.lat.min && lat <= NYC_BOUNDS.lat.max &&
    lng >= NYC_BOUNDS.lng.min && lng <= NYC_BOUNDS.lng.max
  );
}

export default function NewPredictionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const [form, setForm] = useState({
    pickup_latitude: '',
    pickup_longitude: '',
    dropoff_latitude: '',
    dropoff_longitude: '',
    pickup_date: '',
    pickup_time: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    const lat = parseFloat(form.pickup_latitude);
    const lng = parseFloat(form.pickup_longitude);
    const dLat = parseFloat(form.dropoff_latitude);
    const dLng = parseFloat(form.dropoff_longitude);

    // Required checks
    if (!form.pickup_latitude) e.pickup_latitude = 'Latitude is required';
    else if (isNaN(lat)) e.pickup_latitude = 'Must be a valid number';
    if (!form.pickup_longitude) e.pickup_longitude = 'Longitude is required';
    else if (isNaN(lng)) e.pickup_longitude = 'Must be a valid number';
    if (!form.dropoff_latitude) e.dropoff_latitude = 'Latitude is required';
    else if (isNaN(dLat)) e.dropoff_latitude = 'Must be a valid number';
    if (!form.dropoff_longitude) e.dropoff_longitude = 'Longitude is required';
    else if (isNaN(dLng)) e.dropoff_longitude = 'Must be a valid number';
    if (!form.pickup_date) e.pickup_date = 'Required';
    if (!form.pickup_time) e.pickup_time = 'Required';

    // NYC bounds checks (only if values are valid numbers)
    if (!e.pickup_latitude && !e.pickup_longitude && !isValidNYCCoord(lat, lng)) {
      e.pickup_latitude = `Pickup must be within NYC (Lat: ${NYC_BOUNDS.lat.min}–${NYC_BOUNDS.lat.max})`;
      e.pickup_longitude = `Lng: ${NYC_BOUNDS.lng.min} to ${NYC_BOUNDS.lng.max}`;
    }
    if (!e.dropoff_latitude && !e.dropoff_longitude && !isValidNYCCoord(dLat, dLng)) {
      e.dropoff_latitude = `Dropoff must be within NYC (Lat: ${NYC_BOUNDS.lat.min}–${NYC_BOUNDS.lat.max})`;
      e.dropoff_longitude = `Lng: ${NYC_BOUNDS.lng.min} to ${NYC_BOUNDS.lng.max}`;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = () => ({
    pickup_latitude: parseFloat(form.pickup_latitude),
    pickup_longitude: parseFloat(form.pickup_longitude),
    dropoff_latitude: parseFloat(form.dropoff_latitude),
    dropoff_longitude: parseFloat(form.dropoff_longitude),
    pickup_datetime: `${form.pickup_date}T${form.pickup_time}:00`,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = buildPayload();
      const res = await api.post('/predict', payload);
      const resultPath = isAdmin ? '/admin/result' : '/result';
      navigate(resultPath, { state: { prediction: res.data, payload } });
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMsg = Array.isArray(detail) ? detail[0]?.msg : detail;
      setErrors({ submit: errorMsg || 'Prediction failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setForm({ pickup_latitude: '', pickup_longitude: '', dropoff_latitude: '', dropoff_longitude: '', pickup_date: '', pickup_time: '' });
    setErrors({});
  };

  const payload = form.pickup_latitude ? buildPayload() : null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Breadcrumb */}
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '0 0 4px' }}>
        {isAdmin ? 'Admin' : 'Dispatcher'} <span style={{ margin: '0 6px' }}>›</span> New Prediction
      </p>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>New Trip ETA Prediction</h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: '0 0 32px' }}>
        Enter precise coordinates and timing to calculate the estimated arrival duration using the active production model.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Trip Details</h2>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>Required fields for spatial calculation</p>
            </div>
            <span className="badge badge-dark" style={{ fontSize: 11 }}>Live API</span>
          </div>

          {/* NYC Bounds Info */}
          <div style={{ padding: '10px 14px', background: '#FEF3C7', borderRadius: 6, display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 20 }}>
            <AlertTriangle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12, color: '#92400E', margin: 0 }}>
              Coordinates must be within NYC bounds — Lat: {NYC_BOUNDS.lat.min}–{NYC_BOUNDS.lat.max}, Lng: {NYC_BOUNDS.lng.min}–{NYC_BOUNDS.lng.max}
            </p>
          </div>

          {/* Pickup Location */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#1E293B' }} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Pickup Location</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} /> Latitude
                </label>
                <input
                  id="pickup-lat"
                  className={`input-plain ${errors.pickup_latitude ? 'error' : ''}`}
                  placeholder="40.7128"
                  value={form.pickup_latitude}
                  onChange={(e) => update('pickup_latitude', e.target.value)}
                  style={errors.pickup_latitude ? { borderColor: 'var(--color-danger)' } : {}}
                />
                {errors.pickup_latitude && <p style={{ fontSize: 12, color: 'var(--color-danger)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><Info size={12} /> {errors.pickup_latitude}</p>}
              </div>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} /> Longitude
                </label>
                <input
                  id="pickup-lng"
                  className="input-plain"
                  placeholder="-74.0060"
                  value={form.pickup_longitude}
                  onChange={(e) => update('pickup_longitude', e.target.value)}
                  style={errors.pickup_longitude ? { borderColor: 'var(--color-danger)' } : {}}
                />
                {errors.pickup_longitude && <p style={{ fontSize: 12, color: 'var(--color-danger)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><Info size={12} /> {errors.pickup_longitude}</p>}
              </div>
            </div>
          </div>

          {/* Dropoff Location */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-danger)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Dropoff Location</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} /> Latitude
                </label>
                <input
                  id="dropoff-lat"
                  className="input-plain"
                  placeholder="e.g. 40.7580"
                  value={form.dropoff_latitude}
                  onChange={(e) => update('dropoff_latitude', e.target.value)}
                  style={errors.dropoff_latitude ? { borderColor: 'var(--color-danger)' } : {}}
                />
                {errors.dropoff_latitude && <p style={{ fontSize: 12, color: 'var(--color-danger)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><Info size={12} /> {errors.dropoff_latitude}</p>}
              </div>
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} /> Longitude
                </label>
                <input
                  id="dropoff-lng"
                  className="input-plain"
                  placeholder="e.g. -73.9855"
                  value={form.dropoff_longitude}
                  onChange={(e) => update('dropoff_longitude', e.target.value)}
                  style={errors.dropoff_longitude ? { borderColor: 'var(--color-danger)' } : {}}
                />
                {errors.dropoff_longitude && <p style={{ fontSize: 12, color: 'var(--color-danger)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><Info size={12} /> {errors.dropoff_longitude}</p>}
              </div>
            </div>
          </div>

          {/* Temporal Data */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Clock size={14} color="var(--color-text-muted)" />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Temporal Data</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="label">Pickup Date</label>
                <input id="pickup-date" type="date" className="input-plain" value={form.pickup_date} onChange={(e) => update('pickup_date', e.target.value)} />
              </div>
              <div>
                <label className="label">Pickup Time</label>
                <input id="pickup-time" type="time" className="input-plain" value={form.pickup_time} onChange={(e) => update('pickup_time', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div style={{ padding: '12px 16px', background: '#EFF6FF', borderRadius: 6, display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 24 }}>
            <Info size={16} color="#3B82F6" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 13, color: '#1D4ED8', margin: 0 }}>
              Coordinates are validated against NYC metro area bounds. The backend processes datetime in ISO 8601 format without timezone suffix.
            </p>
          </div>

          {errors.submit && (
            <div style={{ padding: '12px 16px', background: '#FEF2F2', borderRadius: 6, color: '#DC2626', fontSize: 13, marginBottom: 16 }}>
              {errors.submit}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button type="button" className="btn-secondary" onClick={clearForm}>
              <Trash2 size={16} /> Clear Form
            </button>
            <button type="submit" className="btn-primary" disabled={loading} id="predict-button">
              {loading ? 'Processing...' : 'Predict Trip Duration'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </form>

      {/* Developer Preview */}
      {payload && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Info size={12} /> Developer Preview: POST /predict PAYLOAD
            </p>
            <span className="badge" style={{ background: '#F1F5F9', color: 'var(--color-text-muted)', fontSize: 10 }}>application/json</span>
          </div>
          <pre className="mono" style={{
            padding: 20,
            background: '#F8FAFC',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            fontSize: 13,
            overflow: 'auto',
            color: 'var(--color-text)',
          }}>
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      )}

      {/* Bottom Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 32 }}>
        {[
          { icon: Shield, title: 'API Integrity', desc: 'Validated against schema v1.0. Inputs are sanitized before POST request.' },
          { icon: Crosshair, title: 'NYC Bounds Check', desc: `Lat: ${NYC_BOUNDS.lat.min}–${NYC_BOUNDS.lat.max}, Lng: ${NYC_BOUNDS.lng.min}–${NYC_BOUNDS.lng.max}` },
          { icon: Cpu, title: 'Compute Tier', desc: 'Priority processing enabled for dispatcher-role requests.' },
        ].map((c) => (
          <div key={c.title} className="card-compact">
            <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 4px' }}>{c.title}</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
