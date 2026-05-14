import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function SSOBridgePage() {
  const { user: clerkUser, isLoaded } = useUser();
  const { setSocialUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoaded) return;

    if (!clerkUser) {
      navigate('/login');
      return;
    }

    const bridgeAuth = async () => {
      try {
        const email = clerkUser.primaryEmailAddress?.emailAddress;
        if (!email) {
          setError('No email found from Google account.');
          return;
        }

        // Call our backend to get a JWT for this Google-verified email
        const res = await api.post('/auth/social', { email });
        const { access_token, role } = res.data;

        // Store in existing AuthContext (same as normal login)
        setSocialUser({ email, role }, access_token);

        // Navigate to the appropriate dashboard
        navigate(role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
      } catch (err) {
        console.error('Social auth bridge failed:', err);
        setError('Failed to connect your Google account. Please try again.');
      }
    };

    bridgeAuth();
  }, [isLoaded, clerkUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {error ? (
          <div className="glass-panel p-8 text-center max-w-sm">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-xl">✕</span>
            </div>
            <p className="text-sm font-bold text-red-600 mb-4">{error}</p>
            <button onClick={() => navigate('/login')} className="btn-primary !px-6 !py-2 !text-xs">
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-500">Setting up your dispatch node...</p>
          </>
        )}
      </div>
    </div>
  );
}
