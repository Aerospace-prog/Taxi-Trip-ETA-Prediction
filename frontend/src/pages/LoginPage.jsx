import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight } from 'lucide-react';
import { useSignIn } from '@clerk/react';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const { signIn, fetchStatus } = useSignIn();
  const isClerkReady = !!signIn && fetchStatus === 'idle';

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const u = await login(email, password);
      navigate(u.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch {
      setErr('Invalid credentials');
    }
  };

  const handleGoogleSignIn = async () => {
    if (!signIn) return;
    setGoogleLoading(true);
    setErr('');
    try {
      const callbackUrl = `${window.location.origin}/sso-callback`;
      const finalUrl = `${window.location.origin}/sso-bridge`;
      const result = await signIn.sso({
        strategy: 'oauth_google',
        redirectUrl: finalUrl,
        redirectCallbackUrl: callbackUrl,
      });
      if (result?.error || result?.errors) {
        throw result.error || result.errors;
      }
    } catch (error) {
      console.error('Clerk Google Login Error:', error);
      
      const isAlreadySignedIn = 
        error?.errors?.[0]?.code === 'session_exists' || 
        error?.message?.toLowerCase().includes('already signed in') ||
        error?.toString().toLowerCase().includes('already signed in');

      if (isAlreadySignedIn && window.Clerk) {
        await window.Clerk.signOut();
        setErr('Previous session cleared. Please click Continue with Google again.');
      } else {
        setErr('Google sign-in failed. Please try again.');
      }
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Immersive mesh background for auth */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-400/20 mix-blend-multiply filter blur-[100px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-400/20 mix-blend-multiply filter blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="abstract-bg" />
      </div>

      <div className="w-full max-w-[420px] px-6 relative z-10">
        <div className="flex flex-col items-center mb-10 animate-fade-in">
          <div className="w-16 h-16 rounded-[28px] bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-btn mb-6 hover:scale-105 transition-transform duration-300">
            <Activity size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tighter mb-2 text-center">Welcome Back.</h1>
          <p className="text-slate-500 font-medium text-center text-sm">Sign in to access your dispatch hub.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-8 md:p-10 animate-fade-in" style={{ animationDelay: '100ms' }}>
          
          {err && (
            <div className="p-4 bg-red-50/80 backdrop-blur-md border border-red-200 rounded-2xl text-red-600 text-sm font-bold text-center shadow-sm mb-6">
              {err}
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            id="clerk-google-login-button"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || !isClerkReady}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-lg active:scale-[0.98] transition-all duration-300 font-bold text-slate-700 text-sm mb-6 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-slate-300 border-t-primary-500 rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">or use email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="space-y-5">
            <div>
              <label className="label text-[10px]">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="admin@taxipredict.ai"
                  className="glass-input pl-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label text-[10px]">Security Key</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="glass-input pl-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary mt-8 shadow-glow-primary">
            Authenticate <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center text-sm font-bold text-slate-500 mt-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          New dispatcher? <Link to="/signup" className="text-primary-600 hover:text-primary-700 underline decoration-primary-300 underline-offset-4">Create account</Link>
        </p>

      </div>
    </div>
  );
}
