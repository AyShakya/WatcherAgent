import { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Loader2 } from 'lucide-react';

export default function SignUp({
  setView,
  authName,
  authEmail,
  authPassword,
  authError,
  setAuthError,
  authLoading,
  handleAuthSubmit
}) {
  const [name, setName] = useState(authName || '');
  const [email, setEmail] = useState(authEmail || '');
  const [password, setPassword] = useState(authPassword || '');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAuthSubmit(e, 'SIGN_UP', email, password, name);
  };

  const renderError = (errorText) => {
    if (!errorText) return null;
    
    const blocks = errorText.split('\n\n').filter(Boolean);
    
    return (
      <div className="flex flex-col gap-3 mb-6">
        {blocks.map((block, idx) => {
          const issueMatch = block.match(/Issue:\s*(.*)/i);
          const solutionMatch = block.match(/Solution:\s*(.*)/i);
          
          if (issueMatch || solutionMatch) {
            const issue = issueMatch ? issueMatch[1] : '';
            const solution = solutionMatch ? solutionMatch[1] : '';
            
            return (
              <div key={idx} className="bg-danger/5 border-l-4 border-danger p-4 rounded-r-lg text-left text-xs font-sans shadow-sm">
                {issue && (
                  <div className="mb-2 flex flex-col gap-0.5">
                    <span className="font-bold text-danger uppercase tracking-wider text-[9px] bg-danger/10 px-1.5 py-0.5 rounded w-max">Issue</span>
                    <span className="text-on-surface font-medium mt-0.5">{issue}</span>
                  </div>
                )}
                {solution && (
                  <div className="flex flex-col gap-0.5 mt-1.5">
                    <span className="font-bold text-success uppercase tracking-wider text-[9px] bg-success/10 px-1.5 py-0.5 rounded w-max">Solution</span>
                    <span className="text-on-surface-variant font-medium mt-0.5">{solution}</span>
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <div key={idx} className="bg-danger/10 border border-danger/20 text-danger text-[13px] p-3 rounded-md text-center font-medium">
              {block}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-margin-mobile md:p-12 relative animate-fade">
      <div className="w-full max-w-[440px] bg-surface-container-lowest border border-warm-gray/20 rounded-xl p-8 md:p-10 z-10 shadow-[0_15px_30px_rgba(36,34,32,0.04)] animate-fade">
        <div className="text-center mb-8">
          <Eye className="w-10 h-10 text-primary mb-4 mx-auto" />
          <h2 className="font-display text-2xl md:text-3xl text-ink-black mb-2">Create Account</h2>
          <p className="text-sm text-on-surface-variant">Configure details to initialize local observability.</p>
        </div>

        {renderError(authError)}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 text-left">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-warm-gray" /> Full Name
            </label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Ayush Shakya" 
              required 
              className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
            />
          </div>
          <div className="flex flex-col gap-2 text-left">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-warm-gray" /> Email Address
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@company.com" 
              required 
              className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
            />
          </div>
          <div className="flex flex-col gap-2 text-left">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-warm-gray" /> Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="At least 6 characters" 
                required 
                className="bg-paper-surface border border-warm-gray/20 rounded-lg pl-4 pr-10 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-warm-gray hover:text-ink-black cursor-pointer flex items-center justify-center p-1 outline-none transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            className="bg-primary text-on-primary border-none rounded-lg py-3.5 text-[14px] font-semibold cursor-pointer mt-2.5 transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed w-full flex items-center justify-center gap-2" 
            disabled={authLoading}
          >
            {authLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : 'Initialize Onboarding'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-on-surface-variant">
          Already have an account? <span className="text-primary font-semibold cursor-pointer hover:underline" onClick={() => { setView('SIGN_IN'); setAuthError(''); }}>Log In</span>
        </div>
      </div>
    </div>
  );
}
