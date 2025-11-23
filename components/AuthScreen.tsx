import React, { useState } from 'react';
import { Film, Mail, Lock, User, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { UserProfile } from '../types';
import { ADMIN_CREDENTIALS } from '../constants';

interface Props {
  onLogin: (user: UserProfile) => void;
  onRegister: (user: UserProfile) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const AuthScreen: React.FC<Props> = ({ onLogin, onRegister, showToast }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendResetLink = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }
    
    setLoading(true);

    // Simulate Network Request
    setTimeout(() => {
      setLoading(false);
      showToast(`Password reset link sent to ${email}`, 'success');
      setIsResetMode(false); // Return to login
      setIsLogin(true);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate Network Request
    setTimeout(() => {
      setLoading(false);

      // --- STEALTH ADMIN CHECK ---
      if (email.trim().toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase()) {
         if (!isLogin) {
             setError("Reserved email address. Please switch to Sign In.");
             return;
         }

         if (password === ADMIN_CREDENTIALS.password) {
             onLogin({
                id: 'admin-001',
                name: 'Administrator',
                email: email,
                isPremium: true,
                role: 'admin',
                joinedAt: new Date().toISOString().split('T')[0],
                status: 'active'
             });
             return;
         } else {
             setError("Invalid credentials.");
             return;
         }
      }

      // --- STANDARD USER VALIDATION ---
      if (!email.includes('@') || password.length < 6) {
        setError("Invalid email or password (min 6 chars)");
        return;
      }

      if (!isLogin && !name) {
        setError("Name is required for sign up");
        return;
      }

      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: isLogin ? 'CineVault Member' : name,
        email: email,
        isPremium: false,
        role: 'user',
        joinedAt: new Date().toISOString().split('T')[0],
        status: 'active'
      };

      // If registering, trigger the register callback to add to list
      if (!isLogin) {
        onRegister(newUser);
      }

      onLogin(newUser);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-cine-bg">
      
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle,rgba(229,9,20,0.1)_0%,rgba(15,16,20,1)_70%)] pointer-events-none" />

      <div className="z-10 w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 rounded-full mb-4 shadow-lg border border-white/5 shadow-cine-accent/20 bg-cine-card transition-transform hover:scale-105 duration-500">
             <Film className="text-cine-accent" size={48} />
          </div>
          <h1 className="text-3xl font-black tracking-wider text-white">
            Cine<span className="text-cine-accent">Vault</span>
          </h1>
          <p className="text-cine-muted mt-2 text-sm tracking-widest uppercase">
            Your Cinematic Universe
          </p>
        </div>

        <div className="bg-cine-card border border-white/10 p-8 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <h2 className="text-2xl font-bold mb-2 text-center text-white">
            {isResetMode ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
          </h2>
          
          {isResetMode && (
             <p className="text-center text-cine-muted text-sm mb-6">Enter your registered email address and we'll send you a link to reset your password.</p>
          )}

          {!isResetMode ? (
            // Standard Login/Register Form
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                {/* Name field only for User Signup */}
                {!isLogin && (
                <div className="relative animate-slide-up">
                    <User className="absolute left-3 top-3.5 text-cine-muted" size={18} />
                    <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-cine-muted focus:outline-none focus:border-cine-accent transition-colors"
                    />
                </div>
                )}

                <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-cine-muted" size={18} />
                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-cine-muted focus:outline-none focus:border-cine-accent transition-colors"
                />
                </div>

                <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-cine-muted" size={18} />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-cine-muted focus:outline-none focus:border-cine-accent transition-colors"
                />
                </div>

                {/* Forgot Password Link */}
                {isLogin && (
                <div className="flex justify-end">
                    <button 
                    type="button" 
                    onClick={() => { setError(''); setIsResetMode(true); }}
                    className="text-xs text-cine-muted hover:text-white transition-colors"
                    >
                    Forgot Password?
                    </button>
                </div>
                )}

                {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded p-2 flex items-center gap-2 animate-fade-in">
                    <AlertCircle size={14} className="text-red-500" />
                    <p className="text-red-500 text-xs">{error}</p>
                </div>
                )}

                <button
                type="submit"
                disabled={loading}
                className="w-full bg-cine-accent hover:bg-red-700 text-white shadow-cine-accent/20 font-bold py-3 rounded-lg transition-all flex items-center justify-center space-x-2 shadow-lg"
                >
                {loading ? (
                    <span className="animate-pulse">Processing...</span>
                ) : (
                    <>
                    <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                    <ArrowRight size={18} />
                    </>
                )}
                </button>
            </form>
          ) : (
             // Dedicated Reset Form
             <form onSubmit={handleSendResetLink} className="space-y-4">
                 <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-cine-muted" size={18} />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-cine-muted focus:outline-none focus:border-cine-accent transition-colors"
                    />
                 </div>

                 {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded p-2 flex items-center gap-2 animate-fade-in">
                        <AlertCircle size={14} className="text-red-500" />
                        <p className="text-red-500 text-xs">{error}</p>
                    </div>
                 )}

                 <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-cine-accent hover:bg-red-700 text-white shadow-cine-accent/20 font-bold py-3 rounded-lg transition-all flex items-center justify-center space-x-2 shadow-lg"
                 >
                     {loading ? <span className="animate-pulse">Sending...</span> : <span>Send Reset Link</span>}
                 </button>

                 <button 
                     type="button" 
                     onClick={() => setIsResetMode(false)}
                     className="w-full text-sm text-cine-muted py-2 hover:text-white flex items-center justify-center gap-2 transition-colors"
                 >
                     <ArrowLeft size={14} /> Back to Sign In
                 </button>
             </form>
          )}

          {!isResetMode && (
            <div className="mt-6 text-center">
                <p className="text-cine-muted text-sm">
                {isLogin ? "New to CineVault?" : "Already have an account?"}
                <button
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    className="ml-2 text-white font-bold hover:text-cine-accent transition-colors underline decoration-cine-accent/50"
                >
                    {isLogin ? 'Join Now' : 'Sign In'}
                </button>
                </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;