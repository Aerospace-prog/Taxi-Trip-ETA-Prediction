import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Clock, Info, ArrowRight, Trash2, Cpu, AlertTriangle, Disc, Target } from 'lucide-react';
import api from '../../services/api';

// NYC bounding box
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

    if (!e.pickup_latitude && !e.pickup_longitude && !isValidNYCCoord(lat, lng)) {
        e.pickup_latitude = `Out of Range`;
    }
    if (!e.dropoff_latitude && !e.dropoff_longitude && !isValidNYCCoord(dLat, dLng)) {
        e.dropoff_latitude = `Out of Range`;
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
    <div className="animate-fade-in pb-12 w-full max-w-4xl mx-auto space-y-6 lg:mt-4">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2.5 rounded-2xl bg-white shadow-sm border border-white">
                <Target size={24} className="text-primary-500" />
             </div>
             <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 m-0">Inference Request</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 m-0 tracking-tighter">New ETA Prediction</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="glass-panel p-6 md:p-8 mb-6 overflow-visible">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-white/50 pb-6 gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">Route Parameters</h2>
              <p className="text-sm text-slate-500 mt-1 max-w-md line-clamp-2 md:line-clamp-none">Enter spatial coordinates to ping the active production model.</p>
            </div>
            <div className="badge bg-white shadow-sm text-primary-600 border border-white">LIVE CALCULATOR</div>
          </div>

          <div className="bg-amber-100/50 backdrop-blur-sm border border-amber-200/50 rounded-2xl p-4 flex gap-3 items-start mb-8 shadow-sm">
            <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 m-0 leading-relaxed font-medium">
              Geofence Active: Coordinates must fall within New York City limits (Lat: {NYC_BOUNDS.lat.min} to {NYC_BOUNDS.lat.max}, Lng: {NYC_BOUNDS.lng.min} to {NYC_BOUNDS.lng.max}).
            </p>
          </div>

          {/* Graphical Route Setup */}
          <div className="relative mb-10 pb-10 border-b border-white/50">
            {/* The SVG dashed line connecting pickup to dropoff */}
            <div className="absolute left-8 top-12 bottom-6 w-0.5 z-0" style={{ backgroundImage: 'linear-gradient(#cbd5e1 40%, rgba(255,255,255,0) 0%)', backgroundPosition: 'right', backgroundSize: '2px 8px', backgroundRepeat: 'repeat-y' }} />

            <div className="space-y-10 relative z-10 w-full">
               
               {/* PICKUP */}
               <div className="flex flex-col lg:flex-row gap-6 w-full">
                 <div className="w-16 flex justify-center shrink-0">
                   <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-white/80 flex items-center justify-center relative">
                     <span className="w-3 h-3 rounded-full bg-primary-500 absolute" />
                     <span className="w-3 h-3 rounded-full bg-primary-500 animate-ping absolute opacity-75" />
                   </div>
                 </div>
                 
                 <div className="flex-1 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 p-6 shadow-sm hover:bg-white/60 transition-colors">
                   <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                     <Disc size={16} className="text-primary-500" /> Origin Point
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="label">Latitude</label>
                       <input id="pickup-lat" className={`glass-input ${errors.pickup_latitude ? 'error' : ''}`} placeholder="40.7128" value={form.pickup_latitude} onChange={(e) => update('pickup_latitude', e.target.value)} />
                       {errors.pickup_latitude && <p className="text-[10px] font-bold text-red-500 mt-2 uppercase tracking-wide">{errors.pickup_latitude}</p>}
                     </div>
                     <div>
                       <label className="label">Longitude</label>
                       <input id="pickup-lng" className={`glass-input ${errors.pickup_longitude ? 'error' : ''}`} placeholder="-74.0060" value={form.pickup_longitude} onChange={(e) => update('pickup_longitude', e.target.value)} />
                       {errors.pickup_longitude && <p className="text-[10px] font-bold text-red-500 mt-2 uppercase tracking-wide">{errors.pickup_longitude}</p>}
                     </div>
                   </div>
                 </div>
               </div>

               {/* DROPOFF */}
               <div className="flex flex-col lg:flex-row gap-6 w-full">
                 <div className="w-16 flex justify-center shrink-0">
                   <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center shadow-lg relative bottom-1">
                     <MapPin size={20} className="text-white" />
                   </div>
                 </div>
                 
                 <div className="flex-1 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 p-6 shadow-sm hover:bg-white/60 transition-colors">
                   <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                     <Target size={16} className="text-slate-500" /> Destination Point
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="label">Latitude</label>
                       <input id="dropoff-lat" className={`glass-input ${errors.dropoff_latitude ? 'error' : ''}`} placeholder="40.7580" value={form.dropoff_latitude} onChange={(e) => update('dropoff_latitude', e.target.value)} />
                       {errors.dropoff_latitude && <p className="text-[10px] font-bold text-red-500 mt-2 uppercase tracking-wide">{errors.dropoff_latitude}</p>}
                     </div>
                     <div>
                       <label className="label">Longitude</label>
                       <input id="dropoff-lng" className={`glass-input ${errors.dropoff_longitude ? 'error' : ''}`} placeholder="-73.9855" value={form.dropoff_longitude} onChange={(e) => update('dropoff_longitude', e.target.value)} />
                       {errors.dropoff_longitude && <p className="text-[10px] font-bold text-red-500 mt-2 uppercase tracking-wide">{errors.dropoff_longitude}</p>}
                     </div>
                   </div>
                 </div>
               </div>

            </div>
          </div>

          {/* Temporal Data */}
          <div className="mb-10 pl-2">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" /> Temporal Modifiers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Departure Date</label>
                <input id="pickup-date" type="date" className={`glass-input ${errors.pickup_date ? 'error' : ''}`} value={form.pickup_date} onChange={(e) => update('pickup_date', e.target.value)} />
              </div>
              <div>
                <label className="label">Departure Time</label>
                <input id="pickup-time" type="time" className={`glass-input ${errors.pickup_time ? 'error' : ''}`} value={form.pickup_time} onChange={(e) => update('pickup_time', e.target.value)} />
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="p-4 mb-8 bg-red-100/50 backdrop-blur-md border border-red-200 rounded-2xl text-red-600 text-sm font-bold shadow-sm">
              {errors.submit}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button type="button" className="btn-secondary sm:w-1/3" onClick={clearForm}>
              <Trash2 size={18} /> Reset Fields
            </button>
            <button type="submit" className="btn-primary sm:w-2/3 shadow-glow-primary" disabled={loading} id="predict-button">
              {loading ? 'Processing Tensor...' : 'Calculate AI ETA'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      </form>

      {/* Developer Context Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {payload && (
          <div className="glass-panel p-6 border-white/50 group">
            <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 m-0">JSON Payload</p>
              <span className="badge bg-white shadow-sm border text-slate-500">POST /predict</span>
            </div>
            <pre className="mono p-4 bg-white/40 rounded-2xl border border-white/60 text-xs text-slate-600 overflow-auto shadow-inner">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        )}
        <div className="glass-panel p-6 border-white/50 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-white/80 flex items-center justify-center">
                 <Cpu size={20} className="text-slate-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 m-0">High-Performance Routing</h4>
                <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mt-1">XGBoost Embedded Models</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed m-0">Inputs are converted to Haversine distance and merged with historical temporal nodes (weather, traffic density, holidays) to generate ultra-precise ETAs within milliseconds.</p>
        </div>
      </div>
    </div>
  );
}
