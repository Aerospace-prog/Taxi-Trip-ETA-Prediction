import { useState, useEffect } from 'react';
import { Upload, CheckCircle2, Circle, Loader, AlertCircle, ArrowDownUp, Zap, XCircle, Settings } from 'lucide-react';
import api from '../../services/api';

export default function RetrainModelPage() {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [candidateVersion, setCandidateVersion] = useState(null);
  const [trainingStatus, setTrainingStatus] = useState('idle'); // idle, uploading, running, finished, failed
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [activeMetrics, setActiveMetrics] = useState(null);
  const [promoteStatus, setPromoteStatus] = useState(''); // '', 'promoting', 'success', 'error'
  const [promoteError, setPromoteError] = useState('');

  // Fetch current active model metrics
  useEffect(() => {
    api.get('/metrics')
      .then((res) => setActiveMetrics(res.data))
      .catch(() => {});
  }, []);

  // Poll training job status when running
  useEffect(() => {
    if (trainingStatus !== 'running' || !jobId) return;

    const interval = setInterval(async () => {
      try {
        const metricsRes = await api.get('/metrics');
        setActiveMetrics(metricsRes.data);

        setProgress((prev) => {
          if (prev < 95) return prev + 5;
          return prev;
        });
      } catch {
        // Silently capture intermittent polling errors
      }
    }, 5000);

    const timeout = setTimeout(() => {
      setProgress(100);
      setTrainingStatus('finished');
      api.get('/metrics').then((res) => setActiveMetrics(res.data)).catch(() => {});
    }, 60000); // Allow up to 60s for training

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [trainingStatus, jobId]);

  const pipelineSteps = [
    { name: 'File Upload & Validation', desc: 'Uploading CSV and checking column integrity.', status: progress >= 15 ? 'done' : progress > 0 ? 'running' : 'pending' },
    { name: 'Data Cleaning', desc: 'Imputing missing values and removing trip outliers.', status: progress >= 35 ? 'done' : progress >= 15 ? 'running' : 'pending' },
    { name: 'Feature Engineering', desc: 'Generating haversine distance, hour of day, and weekend flags.', status: progress >= 55 ? 'done' : progress >= 35 ? 'running' : 'pending' },
    { name: 'XGBoost Training', desc: 'Optimizing hyper-parameters with 5-fold cross-validation.', status: progress >= 80 ? 'done' : progress >= 55 ? 'running' : 'pending' },
    { name: 'Performance Evaluation', desc: 'Calculating MAE, RMSE and R-squared on holdout set.', status: progress >= 100 ? 'done' : progress >= 80 ? 'running' : 'pending' },
  ];

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setUploadError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(f);
      setUploadError('');
    }
  };

  const startTraining = async () => {
    if (!file) return;

    setTrainingStatus('uploading');
    setProgress(5);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/retrain', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      setJobId(res.data.job_id);
      setCandidateVersion(res.data.candidate_version);
      setTrainingStatus('running');
      setProgress(15);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMsg = Array.isArray(detail) ? detail[0]?.msg : detail;
      setUploadError(errorMsg || 'Failed to upload training data. Ensure the file is a valid CSV/Parquet.');
      setTrainingStatus('failed');
      setProgress(0);
    }
  };

  const handlePromote = async (version) => {
    if (!version) return;
    setPromoteStatus('promoting');
    setPromoteError('');

    try {
      await api.post('/promote-model', { candidate_version: version });
      setPromoteStatus('success');
      const res = await api.get('/metrics');
      setActiveMetrics(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setPromoteError(typeof detail === 'string' ? detail : 'Failed to promote model.');
      setPromoteStatus('error');
    }
  };

  const stepIcon = (status) => {
    if (status === 'done') return <div className="w-6 h-6 rounded-full bg-accent-500 shadow-glow-accent flex items-center justify-center"><CheckCircle2 size={12} className="text-white" /></div>;
    if (status === 'running') return <div className="w-6 h-6 rounded-full bg-white border-2 border-primary-500 flex items-center justify-center"><Loader size={12} className="text-primary-500 animate-spin" /></div>;
    return <div className="w-6 h-6 rounded-full bg-white/50 border-2 border-slate-200" />;
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-10 space-y-6 lg:mt-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2.5 rounded-2xl bg-white shadow-sm border border-white">
                <Settings size={24} className="text-primary-500" />
             </div>
             <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 m-0">Model Lifecycle Management</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 m-0 tracking-tighter">Engine Retraining</h1>
        </div>
        <div className="text-left md:text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Active Model Node</p>
          <span className="badge bg-white text-slate-700 shadow-sm border px-3 py-1 font-bold mono">
            {activeMetrics?.active_model_version || '—'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
        
        {/* LEFT COLUMN: UPLOAD & PIPELINE */}
        <div className="space-y-6 flex flex-col">
          
          {/* UPLOAD CARDS */}
          <div className="glass-panel p-6 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-slate-800 m-0 flex items-center gap-2">
               <span className="w-5 h-5 rounded-md bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-[10px] font-black shadow-btn">1</span>
               Data Ingestion
            </h2>
            
            <div
              className={`border-2 border-dashed rounded-3xl transition-all cursor-pointer text-center group relative overflow-hidden
                ${file ? 'border-primary-300 bg-primary-50/30' : 'border-white/60 bg-white/30 hover:border-primary-400 hover:bg-white/50 backdrop-blur-md'}`}
              style={{ padding: file ? '32px' : '48px' }}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input id="file-input" type="file" accept=".csv,.parquet" onChange={handleFileChange} className="hidden" />
              
              {file ? (
                <div className="flex flex-col items-center relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform">
                    <Upload size={24} className="text-primary-500" />
                  </div>
                  <p className="font-extrabold text-slate-800 text-lg mb-1">{file.name}</p>
                  <p className="text-xs font-bold text-slate-400 mb-4 bg-white/60 px-3 py-1 rounded-full border border-white">{(file.size / (1024 * 1024)).toFixed(1)} MB Data Matrix</p>
                  <span className="text-[11px] font-bold text-primary-500 uppercase tracking-widest hover:text-primary-600 transition-colors">Click to replace file</span>
                </div>
              ) : (
                <div className="flex flex-col items-center relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:-translate-y-1 group-hover:shadow-md transition-all">
                    <Upload size={24} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                  <p className="text-sm font-bold text-slate-600 pb-1 m-0 pointer-events-none">Drag & Drop historical CSV/Parquet</p>
                  <p className="text-[11px] text-slate-400 tracking-wider uppercase font-bold pointer-events-none">Or click to browse system</p>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="p-4 bg-red-100/50 backdrop-blur-md border border-red-200 rounded-2xl text-red-600 text-sm font-bold mt-2 shadow-sm flex gap-3 items-center">
                <XCircle size={18} className="shrink-0" />
                <p className="m-0 leading-relaxed group-hover:translate-[0]">{uploadError}</p>
              </div>
            )}
          </div>

          {/* PIPELINE CARDS */}
          <div className="glass-panel p-6 flex flex-col flex-grow">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-slate-800 m-0 flex items-center gap-2">
                   <span className="w-5 h-5 rounded-md bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-[10px] font-black shadow-btn">2</span>
                   Training Execution
                </h2>
                <span className={`badge border-none px-3 py-1 shadow-sm ${
                  trainingStatus === 'running' || trainingStatus === 'uploading' ? 'bg-white text-primary-600' :
                  trainingStatus === 'finished' ? 'bg-white text-accent-600' :
                  trainingStatus === 'failed' ? 'bg-white text-red-600' : 'bg-white/40 text-slate-400'
                }`}>
                  {trainingStatus.toUpperCase()} {jobId && <span className="mono font-bold text-[9px] opacity-60 ml-2">#{jobId.slice(0, 6)}</span>}
                </span>
             </div>

             {/* Stepper */}
             <div className="relative pl-3 flex-grow pb-4">
                {/* Stepper connecting line */}
                <div className="absolute left-[23px] top-4 bottom-8 w-0.5 bg-gradient-to-b from-primary-300 to-transparent" />
                
                <div className="space-y-6 relative z-10">
                  {pipelineSteps.map((step, i) => (
                    <div key={i} className={`flex gap-4 items-start transition-opacity duration-500 ${step.status === 'pending' ? 'opacity-40' : 'opacity-100'}`}>
                      <div className="shrink-0 pt-0.5 bg-background">{stepIcon(step.status)}</div>
                      <div className="flex-grow">
                        <p className={`font-extrabold text-sm m-0 mb-1 ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>{step.name}</p>
                        <p className={`text-xs m-0 leading-relaxed font-medium ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-500'}`}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             <div className="mt-auto pt-6 border-t border-white/50">
               {trainingStatus === 'idle' && file ? (
                 <button className="btn-primary shadow-glow-primary" onClick={startTraining} id="start-training-btn">
                   <Zap size={16} /> Execute Training Pipeline
                 </button>
               ) : trainingStatus === 'failed' ? (
                 <button className="btn-secondary text-red-500 border-red-200 hover:bg-white" onClick={() => { setTrainingStatus('idle'); setProgress(0); setUploadError(''); }}>
                   Reset & Retry
                 </button>
               ) : (
                 <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synthesis Progress</span>
                       <span className="text-xs font-bold text-slate-700 mono">{progress}%</span>
                    </div>
                    <div className="h-3 bg-white/40 backdrop-blur-md rounded-full overflow-hidden border border-white shadow-inner">
                      <div className={`h-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full ${trainingStatus === 'failed' ? 'bg-red-500' : 'bg-gradient-to-r from-primary-400 to-primary-600'}`} style={{ width: `${progress}%` }} />
                    </div>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONFIG & PROMOTION */}
        <div className="space-y-6 flex flex-col">
          
          {/* Config Block */}
          <div className="glass-panel p-6 shadow-sm">
             <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 pb-4 border-b border-white/50">Neural Architecture Spec</h2>
             <div className="space-y-1">
                {[
                  { label: 'Validation Split', value: '80/20' },
                  { label: 'Decision Trees', value: '1500' },
                  { label: 'Tree Depth Max', value: '7' },
                  { label: 'Data Row Cap', value: '200,000' },
                ].map((c, i) => (
                  <div key={c.label} className={`flex justify-between py-3 ${i < 3 ? 'border-b border-white/40' : ''}`}>
                    <span className="text-xs font-bold text-slate-500">{c.label}</span>
                    <span className="mono text-xs font-bold text-slate-700">{c.value}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-amber-100/50 backdrop-blur-sm border border-amber-200/50 rounded-3xl p-6 shadow-sm">
             <div className="flex gap-3 items-start">
                <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 m-0 leading-relaxed font-bold">
                  Training involves asynchronous tensor operations. The engine evaluates candidate models against production targets before enabling promotion.
                </p>
             </div>
          </div>
          
          {/* Promotion Block */}
          <div className="glass-panel p-6 flex-grow flex flex-col justify-between overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-accent-400/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
             
             <div className="relative z-10">
                <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Candidate Assessment</h2>
                
                <div className="space-y-4 mb-8">
                  {[
                    {
                      metric: 'MAE',
                      active: activeMetrics?.mae ? activeMetrics.mae.toFixed(1) : '—',
                      target: '≤ 180s',
                      pass: activeMetrics?.mae != null && activeMetrics.mae <= 180,
                    },
                    {
                      metric: 'RMSE',
                      active: activeMetrics?.rmse ? activeMetrics.rmse.toFixed(1) : '—',
                      target: '≤ 250s',
                      pass: activeMetrics?.rmse != null && activeMetrics.rmse <= 250,
                    },
                    {
                      metric: 'R² Score',
                      active: activeMetrics?.r2_score ? activeMetrics.r2_score.toFixed(3) : '—',
                      target: '≥ 0.80',
                      pass: activeMetrics?.r2_score != null && activeMetrics.r2_score >= 0.80,
                    },
                  ].map((row) => (
                    <div key={row.metric} className="flex flex-col gap-1 p-3 bg-white/40 rounded-2xl border border-white">
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-slate-800">{row.metric}</span>
                          {row.active === '—' ? (
                            <span className="text-slate-300 font-bold text-[10px]">—</span>
                          ) : row.pass ? (
                            <span className="text-accent-600 text-[10px] uppercase font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Pass</span>
                          ) : (
                            <span className="text-red-500 text-[10px] uppercase font-bold flex items-center gap-1"><XCircle size={12}/> Fail</span>
                          )}
                       </div>
                       <div className="flex justify-between items-end">
                          <span className="mono text-xs font-bold text-slate-600">{row.active}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">TGT: {row.target}</span>
                       </div>
                    </div>
                  ))}
                </div>
             </div>

             <div className="relative z-10">
                {promoteError && (
                  <div className="mb-4 p-3 bg-red-100/50 backdrop-blur-md border border-red-200 rounded-2xl text-red-600 text-[11px] font-bold text-center">
                    {promoteError}
                  </div>
                )}
                
                {promoteStatus === 'success' ? (
                  <span className="btn-accent opacity-100 cursor-default bg-gradient-to-r from-accent-500 to-accent-600">
                    <CheckCircle2 size={16} /> Deployed to Production
                  </span>
                ) : (
                  <button
                    className="btn-accent"
                    id="promote-btn"
                    disabled={!candidateVersion || promoteStatus === 'promoting'}
                    onClick={() => handlePromote(candidateVersion)}
                  >
                    {promoteStatus === 'promoting' ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <ArrowDownUp size={16} />
                    )}
                    {promoteStatus === 'promoting' ? 'Executing Swap...' : 'Deploy to Production'}
                  </button>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
