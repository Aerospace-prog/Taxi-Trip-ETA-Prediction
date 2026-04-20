import { Activity, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenuToggle }) {
  const { user, isAdmin } = useAuth();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-[72px] bg-white/70 backdrop-blur-2xl border-b border-white flex items-center justify-between px-4 z-40 transition-all shadow-sm">
      {/* Left: Logo & Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-100 hover:shadow-sm"
          aria-label="Toggle Menu"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-btn">
            <Activity size={18} className="text-white" />
          </div>
          <span className="text-base font-extrabold text-slate-800 tracking-tight">
            TaxiPredict
          </span>
          {isAdmin && (
            <span className="badge bg-white/80 text-primary-600 border border-primary-100 py-0.5 shadow-sm">
              ADMIN
            </span>
          )}
        </div>
      </div>

      {/* Right: User Avatar */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 border-2 border-white rounded-full bg-white shadow-sm flex items-center justify-center text-sm font-bold text-slate-700 relative">
          {user?.email?.charAt(0)?.toUpperCase() || 'U'}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-500 rounded-full border-2 border-white shadow-glow-accent"></div>
        </div>
      </div>
    </header>
  );
}
