import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Clock, RefreshCw, LogOut, X, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const pollRef = useRef(null);

  const checkHealth = () => {
    api.get('/health')
      .then((res) => setHealth(res.data))
      .catch(() => setHealth(null));
  };

  useEffect(() => {
    checkHealth();
    pollRef.current = setInterval(checkHealth, 30000);
    return () => clearInterval(pollRef.current);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const base = isAdmin ? '/admin' : '';
  const navItems = [
    { to: `${base}/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
    { to: `${base}/predict`, icon: PlusCircle, label: 'New Prediction' },
    { to: `${base}/history`, icon: Clock, label: 'History' },
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin/retrain', icon: RefreshCw, label: 'Retrain' });
  }

  const isOnline = health?.status === 'healthy';

  return (
    <>
      {/* ===== Desktop: Floating Glass Rail ===== */}
      <aside className="hidden md:flex flex-col items-center w-[84px] h-[calc(100vh-48px)] glass-panel py-6 shrink-0 z-30 transition-all duration-500 ease-out hover:shadow-[0_20px_60px_-10px_rgba(59,130,246,0.15)]">
        {/* Logo */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-10 shadow-btn">
          <Activity size={24} className="text-white" />
        </div>

        {/* Nav Icons */}
        <nav className="flex-1 flex flex-col items-center gap-3 w-full px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) => `
                w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer group relative
                ${isActive
                  ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] text-primary-600 border border-white scale-105'
                  : 'text-slate-400 hover:bg-white/40 hover:text-slate-700 hover:scale-[1.03] active:scale-95 border border-transparent'}
              `}
            >
              <item.icon size={22} className={`transition-transform duration-300 ${item.label === 'Dashboard' ? 'group-hover:rotate-6' : ''}`} />
            </NavLink>
          ))}
        </nav>

        {/* Bottom: Status + Logout */}
        <div className="flex flex-col items-center gap-4 mt-auto pt-4 relative">
          {/* Glass divider */}
          <div className="w-8 h-px bg-slate-200/50 mb-2" />
          
          <div title={isOnline ? 'API Operational' : 'API Offline'} className="relative cursor-help">
            <span className={`block w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-accent-500 shadow-glow-accent pulse-dot' : 'bg-red-500 shadow-none'}`} />
          </div>

          <div className="w-10 h-10 rounded-full bg-white border border-white/50 shadow-sm flex items-center justify-center text-sm font-bold text-slate-700 relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-accent-100 opacity-0 group-hover:opacity-100 transition-opacity" />
             <span className="relative z-10">{user?.email?.charAt(0)?.toUpperCase() || 'U'}</span>
          </div>

          <button
            onClick={handleLogout}
            id="logout-button"
            title="Logout"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 hover:shadow-sm border border-transparent hover:border-red-100 transition-all cursor-pointer mt-1"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* ===== Mobile: Slide-out Glass Panel ===== */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 glass-panel rounded-l-none rounded-r-4xl border-l-0
        transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pt-16 flex flex-col md:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="absolute top-4 right-4">
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white/50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-white/50">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => onClose()}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-300 cursor-pointer border
                ${isActive
                  ? 'text-primary-600 bg-white shadow-sm border-white font-bold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40 border-transparent font-medium'}
              `}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-5 border-t border-white/30">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-2xl transition-all cursor-pointer shadow-sm"
          >
            <LogOut size={18} />
            Secure Logout
          </button>
        </div>
      </aside>
    </>
  );
}
