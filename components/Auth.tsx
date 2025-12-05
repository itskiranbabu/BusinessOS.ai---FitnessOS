import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';

interface AuthProps {
  onLogin: (email: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('demo@businessos.ai');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      let result;
      if (isLogin) {
        result = await authService.signIn(email, password);
      } else {
        result = await authService.signUp(email, password);
      }

      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        onLogin(result.user.email);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-stretch transition-colors duration-300">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-900 dark:bg-black p-12 relative overflow-hidden border-r border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-slate-900 to-slate-900 dark:to-black opacity-80 z-0"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white tracking-tight">BusinessOS.ai</h1>
            <p className="text-primary-200 mt-2">Fitness Vertical</p>
        </div>

        <div className="relative z-10 max-w-lg">
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
                Build your coaching empire in minutes.
            </h2>
            <div className="space-y-4">
                {[
                    "AI Business Blueprint Generator",
                    "Automated Client Check-ins",
                    "One-Click Website Builder",
                    "Intelligent CRM & Analytics"
                ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-300">
                        <CheckCircle2 className="text-primary-400" size={20} />
                        <span>{feature}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="relative z-10 text-slate-500 text-sm">
            © 2024 BusinessOS Inc.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-md w-full">
            <div className="text-center lg:text-left mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    {isLogin ? 'Enter your details to access your dashboard.' : 'Start your 14-day free trial today.'}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-sm text-red-600 dark:text-red-400 animate-fade-in">
                <AlertCircle size={18} />
                {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors" size={18} />
                    <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white bg-white dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-500 transition-all outline-none"
                    placeholder="coach@example.com"
                    />
                </div>
                </div>

                <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors" size={18} />
                    <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white bg-white dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-500 transition-all outline-none"
                    placeholder="••••••••"
                    />
                </div>
                </div>

                <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 active:scale-[0.98] transition-all shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
                >
                {loading ? (
                    <>
                    <Loader2 className="animate-spin" size={20} /> Processing...
                    </>
                ) : (
                    <>
                    {isLogin ? 'Sign In' : 'Get Started'} <ArrowRight size={20} />
                    </>
                )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setError(null);
                    }}
                    className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 hover:underline transition-colors"
                    >
                    {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                {process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL ? 
                    'Connected to Supabase Secure Auth' : 
                    'Demo Mode (Default credentials pre-filled)'}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;