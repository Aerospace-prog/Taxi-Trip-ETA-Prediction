import { useState, useCallback } from 'react';
import { Clock, ArrowRight, Trash2, Cpu, AlertTriangle, Disc, Target, Navigation, Loader2 } from 'lucide-react';
import api from '../../services/api';

import MapSelector from '../../components/MapSelector';
import AddressSearch from '../../components/AddressSearch';

// City Configurations
const CITIES = {
  NYC: {
    name: "New York City",
    currency: "USD",
    symbol: "$",
    bounds: { lat_min: 40.5, lat_max: 41.0, lng_min: -74.3, lng_max: -73.7 }
  },
  BLR: {
    name: "Bengaluru",
    currency: "INR",
    symbol: "₹",
    bounds: { lat_min: 12.7, lat_max: 13.2, lng_min: 77.4, lng_max: 77.8 }
  }
};

function isValidCoord(lat, lng, bounds) {
  return (
    lat >= bounds.lat_min && lat <= bounds.lat_max &&
    lng >= bounds.lng_min && lng <= bounds.lng_max
  );
}

export default function NewPredictionPage() {

  const [activeCity, setActiveCity] = useState('NYC');
  const cityConfig = CITIES[activeCity];

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
  const [predictionResult, setPredictionResult] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [originAddressText, setOriginAddressText] = useState('');

  const handleCoordinatesChange = useCallback((pickup, dropoff) => {
    setForm(prev => ({
      ...prev,
      pickup_latitude: pickup ? pickup.lat.toFixed(6) : '',
      pickup_longitude: pickup ? pickup.lng.toFixed(6) : '',
      dropoff_latitude: dropoff ? dropoff.lat.toFixed(6) : '',
      dropoff_longitude: dropoff ? dropoff.lng.toFixed(6) : '',
    }));
    setPredictionResult(null); // Clear previous result on change
  }, []);

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

    if (!e.pickup_latitude && !e.pickup_longitude && !isValidCoord(lat, lng, cityConfig.bounds)) {
        e.pickup_latitude = `Out of Range`;
    }
    if (!e.dropoff_latitude && !e.dropoff_longitude && !isValidCoord(dLat, dLng, cityConfig.bounds)) {
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
      setPredictionResult(res.data);
      // Optional: still navigate to result page, or keep it inline
      // const resultPath = isAdmin ? '/admin/result' : '/result';
      // navigate(resultPath, { state: { prediction: res.data, payload } });
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
    setPredictionResult(null);
    setOriginAddressText('');
    setLocationError('');
  };

  const handleFetchCurrentLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Validate against city bounds
        if (!isValidCoord(latitude, longitude, cityConfig.bounds)) {
          setIsFetchingLocation(false);
          setLocationError(`Current location is outside the active city bounds (${cityConfig.name}).`);
          return;
        }

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const address = data.display_name || 'Current Location';
          
          setForm(prev => ({
            ...prev,
            pickup_latitude: latitude.toFixed(6),
            pickup_longitude: longitude.toFixed(6),
          }));
          setOriginAddressText(address);
          setPredictionResult(null);
        } catch (err) {
          console.error("Reverse geocoding failed", err);
          setLocationError('Failed to fetch address for current location.');
          setForm(prev => ({
            ...prev,
            pickup_latitude: latitude.toFixed(6),
            pickup_longitude: longitude.toFixed(6),
          }));
          setOriginAddressText('Current Location');
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error", error);
        setLocationError('Failed to access location. Please check browser permissions.');
        setIsFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
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
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 m-0 tracking-tighter">AI ETA & Fare</h1>
        </div>
        
        {/* City Selector */}
        <div className="flex bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 shadow-sm p-1">
          {Object.keys(CITIES).map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                setActiveCity(city);
                clearForm();
              }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeCity === city ? 'bg-primary-500 text-white shadow-md' : 'text-slate-500 hover:bg-white'
              }`}
            >
              {CITIES[city].name}
            </button>
          ))}
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
              Geofence Active: Coordinates must fall within {cityConfig.name} limits.
            </p>
          </div>

          {/* Graphical Map Setup */}
          <div className="mb-10 relative">
            <MapSelector 
              bounds={cityConfig.bounds}
              onCoordinatesChange={handleCoordinatesChange}
              pickup={form.pickup_latitude ? {lat: parseFloat(form.pickup_latitude), lng: parseFloat(form.pickup_longitude)} : null}
              dropoff={form.dropoff_latitude ? {lat: parseFloat(form.dropoff_latitude), lng: parseFloat(form.dropoff_longitude)} : null}
            />
          </div>

          {/* Origin Point */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 m-0">
                <Disc size={16} className="text-primary-500" /> Origin Point
              </h3>
              <button 
                type="button" 
                onClick={handleFetchCurrentLocation}
                disabled={isFetchingLocation}
                className="flex items-center gap-1.5 text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors border border-primary-100 disabled:opacity-50"
              >
                {isFetchingLocation ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                {isFetchingLocation ? 'Locating...' : 'Use Current Location'}
              </button>
            </div>
            
            {locationError && (
              <p className="text-xs text-red-500 font-semibold mb-3">{locationError}</p>
            )}

            <AddressSearch 
              placeholder="Search pickup location..." 
              bounds={cityConfig.bounds} 
              externalValue={originAddressText}
              onSelect={(loc) => {
                setOriginAddressText(loc.address);
                handleCoordinatesChange(loc, form.dropoff_latitude ? {lat: parseFloat(form.dropoff_latitude), lng: parseFloat(form.dropoff_longitude)} : null);
              }}
            />
            <div className="grid grid-cols-2 gap-4 mt-4">
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


          {/* Destination Point */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Target size={16} className="text-slate-500" /> Destination Point
            </h3>
            <AddressSearch 
              placeholder="Search destination location..." 
              bounds={cityConfig.bounds} 
              onSelect={(loc) => handleCoordinatesChange(form.pickup_latitude ? {lat: parseFloat(form.pickup_latitude), lng: parseFloat(form.pickup_longitude)} : null, loc)}
            />
            <div className="grid grid-cols-2 gap-4 mt-4">
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

      {/* Inline Prediction Results Overlay */}
      {predictionResult && (
        <div className="glass-panel p-8 mb-6 border-emerald-500/30 bg-emerald-50/40 animate-fade-in shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[11px] font-bold tracking-widest uppercase text-emerald-600 mb-1">Inference Complete</p>
              <h2 className="text-2xl font-extrabold text-slate-800">Dynamic Estimation</h2>
            </div>
            <div className="badge bg-emerald-500 text-white border-none shadow-md">
              {predictionResult.confidence} Confidence
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/80 rounded-3xl p-6 shadow-sm border border-emerald-100 flex flex-col items-center justify-center">
              <Clock size={32} className="text-emerald-500 mb-3" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Predicted ETA</p>
              <p className="text-4xl font-black text-slate-800">{predictionResult.predicted_duration_minutes} <span className="text-xl text-slate-500">min</span></p>
            </div>
            <div className="bg-white/80 rounded-3xl p-6 shadow-sm border border-emerald-100 flex flex-col items-center justify-center">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold mb-3">{cityConfig.symbol}</div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Predicted Fare</p>
              <p className="text-4xl font-black text-slate-800">{cityConfig.symbol}{predictionResult.predicted_fare_amount}</p>
            </div>
          </div>
        </div>
      )}

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
