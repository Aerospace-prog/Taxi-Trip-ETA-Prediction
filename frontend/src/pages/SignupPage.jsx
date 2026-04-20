import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight, UserPlus } from 'lucide-react';
import api from '../services/api';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/register', { email, password });
      const u = await login(email, password);
      navigate(u.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErr('Email already registered');
      } else {
        setErr('Error creating account');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Immersive mesh background for auth */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-400/20 mix-blend-multiply filter blur-[100px] animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-400/20 mix-blend-multiply filter blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="abstract-bg" />
      </div>

      <div className="w-full max-w-[420px] px-6 relative z-10">
        <div className="flex flex-col items-center mb-10 animate-fade-in">
          <div className="w-16 h-16 rounded-[28px] bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-glow-accent mb-6 hover:scale-105 transition-transform duration-300">
            <UserPlus size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tighter mb-2 text-center">Join TaxiPredict.</h1>
          <p className="text-slate-500 font-medium text-center text-sm">Create your dispatcher node identity.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-8 md:p-10 animate-fade-in" style={{ animationDelay: '100ms' }}>
          
          {err && (
            <div className="p-4 bg-red-50/80 backdrop-blur-md border border-red-200 rounded-2xl text-red-600 text-sm font-bold text-center shadow-sm mb-6">
              {err}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="label text-[10px]">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent-500 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="dispatcher@taxipredict.ai"
                  className="glass-input pl-11 focus:border-accent-400 focus:shadow-[0_0_0_4px_rgba(6,182,212,0.15)]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label text-[10px]">Security Key</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent-500 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="glass-input pl-11 focus:border-accent-400 focus:shadow-[0_0_0_4px_rgba(6,182,212,0.15)]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-accent mt-8">
            Create Identity <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center text-sm font-bold text-slate-500 mt-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          Already registered? <Link to="/login" className="text-accent-600 hover:text-accent-700 underline decoration-accent-300 underline-offset-4">Sign in securely</Link>
        </p>
      </div>
    </div>
  );
}
