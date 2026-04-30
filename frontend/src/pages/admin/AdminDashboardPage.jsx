import { useState, useEffect, useRef } from 'react';
import { Activity, BarChart3, Settings, Clock, CheckCircle2, Database, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const POLL_INTERVAL = 30000;

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [recentInferences, setRecentInferences] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  const pollRef = useRef(null);

  const fetchAll = () => {
    api.get('/metrics').then((res) => setMetrics(res.data)).catch(() => {});
    api.get('/history', { params: { page: 1, limit: 5 } })
      .then((res) => setRecentInferences(res.data?.records || []))
      .catch(() => {});
    api.get('/health').then((res) => setHealthStatus(res.data)).catch(() => setHealthStatus(null));
  };

  useEffect(() => {
    fetchAll();
    pollRef.current = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, []);

  const trendData = [
    { version: 'v1.0', mae: 280, rmse: 350 },
    { version: 'v1.2', mae: 220, rmse: 290 },
    { version: 'v1.5', mae: 210, rmse: 270 },
    { version: metrics?.active_model_version || 'Live', mae: metrics?.mae || 210, rmse: metrics?.rmse || 270 },
  ];

  const isApiOnline = healthStatus?.status === 'healthy';

  return (
    <div className="animate-fade-in pb-12 w-full max-w-[1400px] mx-auto space-y-6">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2.5 rounded-2xl bg-white shadow-sm border border-white">
                <Database size={24} className="text-violet-500" />
             </div>
             <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 m-0">Admin Terminal</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 m-0 tracking-tighter">System Analytics</h1>
        </div>
        <div className="flex gap-2">
          <div className="glass-card !rounded-full !py-2 !px-4 flex items-center gap-2 !shadow-sm">
            <span className={`w-2 h-2 rounded-full ${isApiOnline ? 'bg-accent-500 shadow-glow-accent pulse-dot' : 'bg-amber-500'}`} />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest text-nowrap">Production Node</span>
          </div>
        </div>
      </header>

      {/* TOP METRICS BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Mean Abs Error', value: metrics?.mae?.toFixed(1) || '—', icon: Activity, color: 'text-primary-500', from: 'from-primary-400/20', to: 'to-primary-400/0', unit: 's' },
          { label: 'Root Sq Error', value: metrics?.rmse?.toFixed(1) || '—', icon: BarChart3, color: 'text-violet-500', from: 'from-violet-400/20', to: 'to-violet-400/0', unit: 's' },
          { label: 'R² Score (Confidence)', value: metrics?.r2_score?.toFixed(3) || '—', icon: CheckCircle2, color: 'text-accent-500', from: 'from-accent-400/20', to: 'to-accent-400/0', unit: '' },
        ].map((m) => (
          <div key={m.label} className={`glass-panel p-6 flex flex-col justify-between group overflow-hidden bg-gradient-to-br ${m.from} ${m.to}`}>
            <div className="flex justify-between items-center mb-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{m.label}</span>
              <div className="w-10 h-10 rounded-full bg-white/60 shadow-glass flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                <m.icon size={18} className={m.color} />
              </div>
            </div>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className={`text-[40px] leading-none font-extrabold tracking-tighter ${m.value === '—' ? 'text-slate-300' : 'text-slate-800'}`}>
                {m.value}
              </span>
              {m.value !== '—' && m.unit && <span className="text-xl font-bold text-slate-400">{m.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS & ENGINE BENTO */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
        
        {/* Dynamic Gradient Area Chart */}
        <div className="glass-panel p-0 flex flex-col">
          <div className="p-6 border-b border-white/40 flex justify-between items-center bg-white/20">
            <h3 className="text-base font-bold text-slate-800 m-0">Error Margin Evolution</h3>
            <span className="badge bg-white text-primary-600 border-none shadow-sm">Live Trend</span>
          </div>
          
          <div className="w-full h-[300px] p-4" style={{ minWidth: 0, minHeight: 300 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRmse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMae" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.4)" vertical={false} />
                <XAxis dataKey="version" fontSize={11} stroke="#94a3b8" tickMargin={15} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} stroke="#94a3b8" tickMargin={10} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '16px', fontSize: '12px', color: '#1e293b', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="rmse" name="RMSE" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRmse)" activeDot={{ r: 6, fill: '#8b5cf6' }} />
                <Area type="monotone" dataKey="mae" name="MAE" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMae)" activeDot={{ r: 6, fill: '#3b82f6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engine Specs */}
        <div className="glass-panel p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent-400/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          
          <div className="mb-8 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-white/50 flex items-center justify-center mb-4">
              <Settings size={24} className="text-accent-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 m-0 leading-none">Core Engine</h3>
            <p className="text-xs text-slate-400 mt-2 font-medium">Active Inference Model specs</p>
          </div>

          <div className="space-y-3 relative z-10 flex-grow">
            {[
              { label: 'Version ID', value: metrics?.active_model_version || '—', highlight: true },
              { label: 'Framework', value: 'XGBoost 2.0 (Scikit)' },
              { label: 'Latency SLA', value: '< 200ms API' },
              { label: 'Base Layer', value: healthStatus?.version || 'FastAPI Core' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-3 border-b border-white/40 last:border-0 relative">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{row.label}</span>
                {row.highlight ? (
                   <span className="badge bg-slate-800 text-white border-none shadow-glow-primary">{row.value}</span>
                ) : (
                   <span className="mono text-xs font-bold text-slate-600">{row.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INFERENCE LOG */}
      <div className="glass-panel p-0 overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/40 bg-white/20">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-slate-400" />
            <h3 className="text-lg font-bold text-slate-800 m-0">Inference Audit Log</h3>
          </div>
          <span className="badge bg-white shadow-sm text-slate-500 border-none px-3 py-1.5 flex items-center gap-2 mt-4 sm:mt-0">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
            Synchronizing
          </span>
        </div>
        
        <div className="overflow-x-auto p-2">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th className="!bg-transparent !border-b-white/50 pl-6">Reference ID</th>
                <th className="!bg-transparent !border-b-white/50">Compute Latency</th>
                <th className="!bg-transparent !border-b-white/50">ETA Return</th>
                <th className="!bg-transparent !border-b-white/50 text-right pr-6">Time (UTC)</th>
              </tr>
            </thead>
            <tbody>
              {recentInferences.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <span className="px-4 py-2 rounded-xl bg-white/50 text-xs font-bold text-slate-400">Scanning telemetry...</span>
                  </td>
                </tr>
              ) : recentInferences.map((log) => (
                <tr key={log.request_id} className="cursor-default group hover:bg-white/40">
                  <td className="pl-6 !py-3">
                     <span className="px-2 py-1 bg-white/60 rounded border border-white text-[11px] font-bold text-slate-500 inline-block group-hover:border-primary-200 transition-colors mono">
                        {log.request_id?.slice(0, 10)}...
                     </span>
                  </td>
                  <td className="mono font-bold text-slate-500 text-xs !py-3">
                     <span className={`${log.system_latency_ms > 200 ? 'text-amber-500' : 'text-slate-500'}`}>
                       {log.system_latency_ms || '—'}ms
                     </span>
                  </td>
                  <td className="!py-3">
                    <span className="flex items-center gap-1.5 text-sm font-extrabold text-slate-800">
                      <Zap size={14} className="text-accent-500" />
                      {log.predicted_duration_minutes?.toFixed(1)} mins
                    </span>
                  </td>
                  <td className="pr-6 text-right font-medium text-slate-400 text-xs !py-3">{new Date(log.created_at).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
