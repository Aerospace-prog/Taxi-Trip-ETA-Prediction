import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, MapPin, Calendar, ArrowLeft, Target, Zap, Server } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PredictionResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  
  const { prediction, payload } = location.state || {};

  if (!prediction) {
    return (
      <div className="animate-fade-in p-8 text-center max-w-lg mx-auto mt-20 glass-panel">
        <div className="w-16 h-16 bg-red-100 rounded-2xl mx-auto flex items-center justify-center mb-6">
          <Server size={32} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-4 tracking-tight">No Telemetry Available</h2>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">Could not find prediction results in memory. Please initiate a new inference request to view results.</p>
        <button className="btn-primary" onClick={() => navigate(isAdmin ? '/admin/predict' : '/predict')}>
          Start New Inference
        </button>
      </div>
    );
  }

  const durationMin = prediction.predicted_duration_minutes?.toFixed(1);
  const durationSec = prediction.predicted_duration_seconds;

  return (
    <div className="pb-12 w-full max-w-4xl mx-auto lg:mt-4">
      {/* Heavy Blur Reveal Container */}
      <div className="glass-panel p-8 md:p-12 mb-8 relative overflow-hidden animate-fade-in text-center">
        {/* Decorative Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 via-transparent to-accent-400/20 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col items-center">
          <span className="badge bg-white shadow-sm text-accent-600 border-none mb-6 px-4 py-1.5 flex items-center gap-2">
            <Zap size={14} /> AI SYNTHESIS COMPLETE
          </span>
          
          <h1 className="text-[80px] md:text-[120px] font-extrabold text-slate-800 tracking-tighter leading-none drop-shadow-xl mb-4">
            {durationMin}
            <span className="text-3xl md:text-5xl text-slate-400 ml-2 font-bold tracking-tight">min</span>
          </h1>
          
          <p className="text-lg md:text-xl font-bold text-slate-500 max-w-md">
             Estimated time of arrival based on real-time neural computation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
        
        {/* Route Details Card */}
        <div className="glass-panel p-0 flex flex-col h-full group hover:shadow-floating transition-shadow">
          <div className="p-5 border-b border-white/50 bg-white/30 flex items-center gap-3">
             <MapPin size={20} className="text-primary-500" />
             <h3 className="font-bold text-slate-800 m-0">Spatial Coordinates</h3>
          </div>
          <div className="p-6 space-y-5 flex-grow bg-gradient-to-b from-white/40 to-transparent">
            <div>
              <p className="label">Origin Reference</p>
              <p className="mono font-bold text-slate-700 text-sm bg-white/60 px-4 py-2.5 rounded-2xl border border-white shadow-sm inline-block">
                {payload.pickup_latitude}, {payload.pickup_longitude}
              </p>
            </div>
            <div>
              <p className="label">Destination Reference</p>
              <p className="mono font-bold text-slate-700 text-sm bg-white/60 px-4 py-2.5 rounded-2xl border border-white shadow-sm inline-block">
                {payload.dropoff_latitude}, {payload.dropoff_longitude}
              </p>
            </div>
            <div className="mt-auto pt-2">
               <p className="label">Scheduled Departure</p>
               <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                 <Calendar size={16} className="text-slate-400" />
                 {new Date(payload.pickup_datetime).toLocaleString()}
               </div>
            </div>
          </div>
        </div>

        {/* Technical Telemetry Card */}
        <div className="glass-panel p-0 flex flex-col h-full group hover:shadow-floating transition-shadow">
          <div className="p-5 border-b border-white/50 bg-white/30 flex items-center gap-3">
             <Server size={20} className="text-accent-500" />
             <h3 className="font-bold text-slate-800 m-0">Inference Telemetry</h3>
          </div>
          <div className="p-6 space-y-5 flex-grow bg-gradient-to-b from-white/40 to-transparent">
             <div className="flex justify-between items-center py-2 border-b border-white/40">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Duration</span>
                <span className="text-sm font-extrabold text-slate-800">{durationSec} <span className="text-slate-400 text-xs font-medium">seconds</span></span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-white/40">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Model Payload ID</span>
                <span className="mono text-xs font-bold text-slate-600 bg-white/50 px-2 py-1 rounded-md">{prediction.request_id?.slice(0, 8)}</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-white/40">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">API Latency</span>
                <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> &lt;20ms
                </span>
             </div>
             <div className="flex justify-between items-center py-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Node Status</span>
                <span className="text-xs font-bold tracking-widest uppercase text-accent-600">Active</span>
             </div>
          </div>
        </div>

      </div>

      <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: '250ms' }}>
        <button 
           className="btn-secondary w-full md:w-auto px-8 py-3.5"
           onClick={() => navigate(isAdmin ? '/admin/predict' : '/predict')}
        >
          <ArrowLeft size={18} /> Initialize New Request
        </button>
      </div>
    </div>
  );
}
