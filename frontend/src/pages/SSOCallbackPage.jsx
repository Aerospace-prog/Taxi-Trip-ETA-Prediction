import { AuthenticateWithRedirectCallback } from '@clerk/react';

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-500">Verifying Google identity...</p>
      </div>
      <AuthenticateWithRedirectCallback 
        signInForceRedirectUrl="/sso-bridge"
        signUpForceRedirectUrl="/sso-bridge"
      />
    </div>
  );
}
