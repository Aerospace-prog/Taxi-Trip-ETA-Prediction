import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Activity, Timer, Zap, PlusCircle, 
  Clock, ExternalLink, CheckCircle2, ChevronRight
} from 'lucide-react';
import api from '../../services/api';

const POLL_INTERVAL = 30000;

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState(null);
  const navigate = useNavigate();
  const pollRef = useRef(null);

  useEffect(() => {
    const fetchAll = () => {
      api.get('/metrics').then((res) => setMetrics(res.data)).catch(() => {});
      api.get('/history', { params: { page: 1, limit: 5 } }).then((res) => setRecentPredictions(res.data?.records || [])).catch(() => {});
      api.get('/health').then((res) => setHealthStatus(res.data)).catch(() => {});
    };
    fetchAll();
    pollRef.current = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, []);

  const isApiOnline = healthStatus?.status === 'healthy';

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  };

  return (
    <div className="animate-fade-in pb-12 w-full max-w-7xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2.5 rounded-2xl bg-white shadow-sm border border-white">
                <Activity size={24} className="text-primary-500" />
             </div>
             <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 m-0">Dispatcher Hub</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 m-0 tracking-tighter">System Overview</h1>
        </div>
        
        <div className="flex gap-2">
          {/* Glass pill for connection state */}
          <div className="glass-card !rounded-full !py-2 !px-4 flex items-center gap-2 !shadow-sm">
            <span className={`w-2.5 h-2.5 rounded-full ${isApiOnline ? 'bg-accent-500 pulse-dot shadow-glow-accent' : 'bg-red-500'}`} />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{isApiOnline ? 'Stable' : 'Connecting'}</span>
          </div>
        </div>
      </header>

      {/* BENTO GRID: ROW 1 (Stats & CTA) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Core KPI 1 */}
        <div className="glass-panel p-6 flex flex-col justify-between group cursor-default">
          <div className="flex justify-between items-start mb-6">
            <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Mean Abs Error</span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-primary-600 flex items-center justify-center shadow-btn group-hover:scale-110 transition-transform">
              <Timer size={20} className="text-white" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-slate-800 tracking-tighter mb-1">{metrics?.mae?.toFixed(1) || '—'}<span className="text-xl text-slate-400 ml-1">s</span></p>
            <p className="text-xs font-medium text-slate-500 m-0">Accuracy variance</p>
          </div>
        </div>

        {/* Core KPI 2 */}
        <div className="glass-panel p-6 flex flex-col justify-between group cursor-default">
          <div className="flex justify-between items-start mb-6">
            <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Root Sq Error</span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-[0_4px_14px_rgba(139,92,246,0.3)] group-hover:scale-110 transition-transform">
              <BarChart3 size={20} className="text-white" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-slate-800 tracking-tighter mb-1">{metrics?.rmse?.toFixed(1) || '—'}<span className="text-xl text-slate-400 ml-1">s</span></p>
            <p className="text-xs font-medium text-slate-500 m-0">Outlier sensitivity</p>
          </div>
        </div>

        {/* Primary Call to Action Bento Block (Span 2 cols on desktop) */}
        <div 
          onClick={() => navigate('/predict')}
          className="glass-panel p-8 md:col-span-2 bg-gradient-to-br from-primary-500/10 via-white/50 to-accent-500/10 cursor-pointer group hover:shadow-floating transition-all border-white border hover:border-primary-200 relative overflow-hidden"
        >
          {/* Decorative Background Blob */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary-400/20 rounded-full blur-[60px] group-hover:bg-primary-500/30 transition-colors pointer-events-none" />
          
          <div className="flex justify-between items-start h-full relative z-10">
            <div className="flex flex-col h-full justify-between">
              <div className="mb-4">
                <span className="badge bg-white shadow-sm text-primary-600 mb-4 border-none">Active Engine</span>
                <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">Start New Prediction</h3>
              </div>
              <p className="text-sm font-medium text-slate-500 max-w-sm mt-auto m-0 flex items-center gap-2 group-hover:text-primary-600 transition-colors">
                Run spatial ETA calculation <ChevronRight size={16} />
              </p>
            </div>
            
            <div className="w-16 h-16 rounded-[28px] bg-white shadow-glass flex items-center justify-center group-hover:scale-110 group-hover:rotate-[15deg] transition-all duration-300">
               <PlusCircle size={32} className="text-primary-500" />
            </div>
          </div>
        </div>
      </div>

      {/* BENTO GRID: ROW 2 (History & Environment) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table Block */}
        <div className="glass-panel p-0 lg:col-span-2 flex flex-col">
          <div className="p-6 border-b border-white/50 flex justify-between items-center bg-white/30">
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-slate-400" />
              <h3 className="text-lg font-bold text-slate-800 m-0">Recent Inferences</h3>
            </div>
            <button 
              onClick={() => navigate('/history')}
              className="px-4 py-2 rounded-xl bg-white text-xs font-bold text-primary-600 shadow-sm hover:shadow active:scale-95 transition-all text-center cursor-pointer"
            >
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto flex-grow p-2">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="!bg-transparent !border-b-slate-200">Ref ID</th>
                  <th className="!bg-transparent !border-b-slate-200">Time (UTC)</th>
                  <th className="text-right !bg-transparent !border-b-slate-200">Result ETA</th>
                  <th className="text-right !bg-transparent !border-b-slate-200">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPredictions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10">
                      <span className="px-4 py-2 rounded-xl bg-white/50 text-xs font-bold text-slate-400">Awaiting data...</span>
                    </td>
                  </tr>
                ) : recentPredictions.map((p) => (
                  <tr key={p.request_id} className="cursor-default group">
                    <td className="mono !py-3">
                       <span className="px-2 py-1 bg-white/60 rounded border border-white text-xs font-bold text-slate-600 inline-block group-hover:border-primary-200 transition-colors">
                          {p.request_id?.slice(0, 8)}
                       </span>
                    </td>
                    <td className="text-xs font-medium text-slate-500 !py-3">{new Date(p.created_at).toLocaleTimeString()}</td>
                    <td className="text-right text-lg font-extrabold text-slate-800 !py-3">{formatDuration(p.predicted_duration_seconds)}</td>
                    <td className="text-right !py-3">
                      <CheckCircle2 size={16} className="inline text-accent-500 drop-shadow-sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Environment Info Block */}
        <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-200/30 rounded-bl-full pointer-events-none transition-colors group-hover:bg-slate-200/50" />
          
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-6">Environment Context</p>
            <div className="space-y-4 relative z-10">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Model Engine</p>
                <div className="px-4 py-3 bg-white/60 rounded-2xl border border-white shadow-sm flex items-center justify-between">
                  <span className="mono text-sm font-bold text-slate-700">{metrics?.active_model_version || '—'}</span>
                  <Zap size={14} className="text-accent-500" />
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Node Status</p>
                <div className="px-4 py-3 bg-white/60 rounded-2xl border border-white shadow-sm flex items-center justify-between">
                  <span className={`text-sm font-bold ${isApiOnline ? 'text-slate-700' : 'text-red-500'}`}>{isApiOnline ? 'Healthy' : 'Disconnected'}</span>
                  <Activity size={14} className={isApiOnline ? 'text-accent-500' : 'text-red-500'} />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">API Server</p>
                <div className="px-4 py-3 bg-white/60 rounded-2xl border border-white shadow-sm">
                  <span className="mono text-xs font-bold text-slate-500 block truncate">http://localhost:8000</span>
                </div>
              </div>
            </div>
          </div>
          
          <button
            className="w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 text-white hover:bg-slate-700 hover:shadow-lg transition-all active:scale-95 text-xs font-bold cursor-pointer relative z-10"
            onClick={() => window.open('http://localhost:8000/docs', '_blank')}
          >
            <ExternalLink size={14} /> View Swagger Specs
          </button>
        </div>
      </div>
    </div>
  );
}
