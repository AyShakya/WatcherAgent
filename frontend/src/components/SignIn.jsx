import { Eye, Mail, Lock } from 'lucide-react';

export default function SignIn({
  setView,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authError,
  setAuthError,
  authLoading,
  handleAuthSubmit
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-margin-mobile md:p-12 relative animate-fade">
      <div className="w-full max-w-[440px] bg-surface-container-lowest border border-warm-gray/20 rounded-xl p-8 md:p-10 z-10 shadow-[0_15px_30px_rgba(36,34,32,0.04)] animate-fade">
        <div className="text-center mb-8">
          <Eye className="w-10 h-10 text-primary mb-4 mx-auto" />
          <h2 className="font-display text-2xl md:text-3xl text-ink-black mb-2">Welcome Back</h2>
          <p className="text-sm text-on-surface-variant">Access your Watcher incident control tower.</p>
        </div>
        
        {authError && (
          <div className="bg-danger/10 border border-danger/20 text-danger text-[13px] p-3 rounded-md mb-6 text-center font-medium">
            {authError}
          </div>
        )}
        
        <form onSubmit={(e) => handleAuthSubmit(e, 'SIGN_IN')} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 text-left">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-warm-gray" /> Email Address
            </label>
            <input 
              type="email" 
              value={authEmail} 
              onChange={(e) => setAuthEmail(e.target.value)} 
              placeholder="name@company.com" 
              required 
              className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
            />
          </div>
          <div className="flex flex-col gap-2 text-left">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-warm-gray" /> Password
            </label>
            <input 
              type="password" 
              value={authPassword} 
              onChange={(e) => setAuthPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
              className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
            />
          </div>
          <button 
            type="submit" 
            className="bg-primary text-on-primary border-none rounded-lg py-3.5 text-[14px] font-semibold cursor-pointer mt-2.5 transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed w-full" 
            disabled={authLoading}
          >
            {authLoading ? 'Signing In...' : 'Access Dashboard'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-on-surface-variant">
          Don't have an account? <span className="text-primary font-semibold cursor-pointer hover:underline" onClick={() => { setView('SIGN_UP'); setAuthError(''); }}>Sign Up</span>
        </div>
      </div>
    </div>
  );
}
