import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ArrowRight, Zap, Globe, Shield, Activity as PulseIcon, Map } from 'lucide-react';
// import heroVisual from '../assets/hero_visual.png';
import dashBento from '../assets/dash_bento.png';
import abstractMap from '../assets/abstract_nyc_map.png'

export default function LandingPage() {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden selection:bg-primary-500/30">
      
      {/* Global Immersive Mesh Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary-400/20 mix-blend-multiply filter blur-[120px] animate-float opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-400/20 mix-blend-multiply filter blur-[120px] animate-float opacity-50" style={{ animationDelay: '2s' }} />
        <div className="abstract-bg opacity-30" />
      </div>

      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 animate-fade-in">
        <div className="max-w-7xl mx-auto glass-panel !rounded-full px-6 py-4 flex justify-between items-center bg-white/40 border border-white/60 shadow-glass">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-btn">
               <Activity size={20} className="text-white" />
             </div>
             <span className="text-xl font-extrabold tracking-tight text-slate-800">TaxiPredict<span className="text-primary-500">.</span></span>
           </div>
           
           <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
             <a href="#features" className="hover:text-primary-600 hover:-translate-y-0.5 transition-all">Platform</a>
             <a href="#technology" className="hover:text-primary-600 hover:-translate-y-0.5 transition-all">Neural Engine</a>
           </div>

           <div className="flex items-center gap-4">
             <Link to="/login" className="relative group text-sm font-bold text-slate-700 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-primary-500 hover:to-accent-500 transition-all duration-300 px-2 py-1 mr-2 whitespace-nowrap drop-shadow-sm">
               Log In
               <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300 group-hover:w-full rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
             </Link>
             <Link to="/signup" className="btn-primary !px-6 !py-2.5 !text-xs !shadow-glow-primary hover:scale-105 active:scale-95 hidden sm:flex transition-transform">
               Get Started
             </Link>
           </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-48 pb-20 px-6 md:pt-56 md:pb-32 max-w-7xl mx-auto perspective-1000">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          <div className="space-y-8 animate-fade-in">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-50/50 border border-accent-200/50 backdrop-blur-md text-accent-700 text-xs font-bold uppercase tracking-widest shadow-sm">
               <Zap size={14} className="text-accent-500" /> V2 Engine Now Live
             </div>
             
             <h1 className="text-5xl md:text-7xl xl:text-8xl font-extrabold text-slate-800 tracking-tighter leading-[1.05]">
                Neural <br className="hidden md:block"/> Dispatching. <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-600 filter drop-shadow-md">Redefined.</span>
             </h1>
             
             <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
                Deploy extreme-scale gradient boosting to predict urban mobility durations with sub-20ms latency. The ultimate intelligence layer for modern fleet orchestration.
             </p>
             
             <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/signup" className="btn-primary !px-8 !py-4 text-base shadow-glow-primary flex justify-center hover:scale-105 active:scale-95 transition-all duration-300">
                   Launch Dispatch Hub <ArrowRight size={20} className="ml-2" />
                </Link>
             </div>
             
             <div className="pt-8 flex gap-8 items-center border-t border-slate-200/50">
               <div>
                 <p className="text-3xl font-black text-slate-800 drop-shadow-sm">96.4%</p>
                 <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">R² Accuracy</p>
               </div>
               <div>
                 <p className="text-3xl font-black text-slate-800 drop-shadow-sm">&lt;20<span className="text-xl">ms</span></p>
                 <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Inference Time</p>
               </div>
               <div>
                 <p className="text-3xl font-black text-slate-800 drop-shadow-sm">1.4<span className="text-xl">M</span></p>
                 <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Trips Indexed</p>
               </div>
             </div>
          </div>

          {/* Hero Visual - 3D Tilted Card */}
          <div className="relative isolate animate-fade-in group" style={{ animationDelay: '200ms' }}>
             <div className="absolute inset-0 bg-primary-400/20 blur-[100px] -z-10 rounded-full mix-blend-multiply animate-pulse" />
             <div className="glass-panel p-2 md:p-4 rotate-2 group-hover:rotate-0 group-hover:scale-105 transition-all duration-700 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] bg-white/40 border border-white/60 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                 <img src={abstractMap} alt="Hyper-realistic 3D Neural Map" className="w-full rounded-2xl shadow-inner border border-white/30" />
             </div>
             
             {/* Floating Badge - Extra Depth */}
             <div className="absolute -bottom-6 -left-6 glass-card px-6 py-4 flex items-center gap-4 bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-4 transition-all duration-500 cursor-default">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-pulse" />
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">NYC Model Status</p>
                   <p className="text-sm font-black text-slate-800 mono">ACTIVE & SYNCED</p>
                </div>
             </div>
          </div>
          
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="relative z-10 py-24 md:py-32 px-6 max-w-7xl mx-auto border-t border-slate-200/50">
         <div className="text-center mb-16 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tighter mb-4 pt-4">Spatial Intelligence, <br/>Instantly.</h2>
            <p className="text-slate-500 font-medium">Bypass traditional mapping constraints. Our XGBoost pipeline fuses temporal modifiers with spatial distance vectors directly at the edge.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Main Feature / Graphic - 3D Command Center */}
            <div className="md:col-span-2 md:row-span-2 glass-panel p-0 overflow-hidden group flex flex-col hover:shadow-[0_80px_100px_-40px_rgba(0,0,0,0.3)] transition-all duration-700 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 animate-fade-in relative" style={{ animationDelay: '400ms' }}>
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
               <div className="p-10 pb-0 z-10 relative">
                  <Globe size={28} className="text-primary-400 mb-6 drop-shadow-glow" />
                  <h3 className="text-3xl font-bold text-white mb-3">Command-Level Dashboards</h3>
                  <p className="text-slate-400 font-medium max-w-md text-lg">Orchestrate entire fleets from a unified, hyper-responsive interface. Premium design aesthetics meet enterprise-grade resilience.</p>
               </div>
               <div className="relative mt-auto pt-12 flex justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-primary-500/30 blur-[100px]" />
                  <img src={dashBento} alt="3D Dashboard Bento" className="w-[90%] max-w-[650px] object-cover rounded-t-3xl border border-slate-700/50 shadow-2xl group-hover:scale-105 group-hover:-translate-y-8 transition-transform duration-700 ease-out" />
               </div>
            </div>

            {/* Small Feature 1 */}
            <div className="glass-panel p-8 flex flex-col hover:-translate-y-4 hover:shadow-2xl transition-all duration-500 animate-fade-in bg-white/40 border-white/60" style={{ animationDelay: '500ms' }}>
               <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center mb-8 border border-slate-50">
                 <Shield className="text-accent-500" size={28} />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-4">City-Scale Geofencing</h3>
               <p className="text-base text-slate-500 leading-relaxed font-medium">Strict boundary validation ensures the neural net only processes vectors within confirmed training jurisdictions, preventing hallucinated predictions.</p>
            </div>

            {/* Small Feature 2 */}
            <div className="glass-panel p-8 flex flex-col hover:-translate-y-4 hover:shadow-2xl transition-all duration-500 animate-fade-in bg-white/40 border-white/60" style={{ animationDelay: '600ms' }}>
               <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center mb-8 border border-slate-50">
                 <PulseIcon className="text-primary-500" size={28} />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-4">Zero-Downtime MLOps</h3>
               <p className="text-base text-slate-500 leading-relaxed font-medium">Retrain and deploy customized machine learning models on live infrastructure with zero downtime using our seamless rollout pipeline.</p>
            </div>

            {/* Wide Feature */}
            <div className="md:col-span-3 glass-panel p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-primary-500/10 to-transparent hover:bg-white/60 transition-colors animate-fade-in" style={{ animationDelay: '700ms' }}>
               <div className="flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-6 shadow-btn">
                     <Map className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">Predictive ETA Engine</h3>
                  <p className="text-slate-500 font-medium max-w-xl">
                    Stop relying on simplistic traffic APIs. TaxiPredict leverages advanced historical density matrices and proprietary feature engineering to provide absolute certainty.
                  </p>
               </div>
               <div className="shrink-0 w-full md:w-auto">
                  <div className="p-6 bg-slate-900 rounded-3xl shadow-xl border border-slate-700/50">
                    <pre className="text-[11px] font-mono text-primary-300 leading-loose">
<span className="text-slate-500">POST</span> /api/v1/predict<br/>
<span className="text-accent-400">{'{'}</span><br/>
  "pickup_lat": 40.7128,<br/>
  "pickup_lng": -74.0060,<br/>
  "datetime": "2026-04-18T16:00:00Z"<br/>
<span className="text-accent-400">{'}'}</span>
                    </pre>
                  </div>
               </div>
            </div>

         </div>
      </section>

      {/* Footer Banner */}
      <section className="relative z-10 px-6 pb-24 max-w-7xl mx-auto">
         <div className="rounded-[40px] overflow-hidden bg-gradient-to-r from-primary-500 to-accent-600 p-12 md:p-20 text-center relative shadow-glow-primary">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
            
            <div className="relative z-10">
               <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6 drop-shadow-md">Ready to accelerate?</h2>
               <p className="text-primary-100 font-medium max-w-lg mx-auto mb-10 text-lg">Join the next generation of fleet dispatching. Register your node or log in to the admin terminal today.</p>
               
               <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Link to="/signup" className="btn-primary !bg-white !text-primary-700 !shadow-none hover:shadow-xl hover:scale-105 active:scale-95 !px-8 !py-4 text-base transition-all duration-300">
                    Create Dispatcher Node
                  </Link>
               </div>
               
               <p className="mt-8 text-xs font-bold uppercase tracking-widest text-primary-200">
                  Powered by FastAPI & React
               </p>
            </div>
         </div>
      </section>

    </div>
  );
}
