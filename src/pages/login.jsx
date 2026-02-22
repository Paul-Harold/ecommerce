import { useState } from 'react';
import { supabase } from '../libs/supabase.js';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  
  // UI States
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 1. Handle Email/Password Auth
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (activeTab === 'register') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Registration successful! You can now log in.' });
        setActiveTab('login');
        setPassword('');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Access granted. Redirecting...' });
        setTimeout(() => navigate('/admin'), 1000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Google Auth
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        // This tells Supabase where to send the user after they pick their Google account
        options: {
          redirectTo: `${window.location.origin}/admin` 
        }
      });
      if (error) throw error;
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center px-6 pt-10 pb-24">
      <div className="w-full max-w-md bg-[#0f1115] border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-electric to-transparent"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">
            System <span className="text-electric">Access</span>
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-wider">
            Authenticate to continue
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 mb-8">
          <button 
            onClick={() => { setActiveTab('login'); setMessage({ type: '', text: '' }); }}
            className={`flex-1 pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'login' ? 'text-electric border-b-2 border-electric' : 'text-gray-500 hover:text-white'}`}
          >
            Log In
          </button>
          <button 
            onClick={() => { setActiveTab('register'); setMessage({ type: '', text: '' }); }}
            className={`flex-1 pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'register' ? 'text-electric border-b-2 border-electric' : 'text-gray-500 hover:text-white'}`}
          >
            Register
          </button>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded text-sm font-bold tracking-wide text-center border ${
            message.type === 'success' ? 'bg-ion/10 text-ion border-ion/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-6 mb-6">
          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-3 text-white focus:outline-none focus:border-electric transition-colors"
              placeholder="operator@midnight.com"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-3 text-white focus:outline-none focus:border-electric transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full font-bold py-4 rounded uppercase tracking-widest transition-all duration-300 ${
              loading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-electric text-midnight hover:bg-white hover:shadow-[0_0_20px_#40E0FF]'
            }`}
          >
            {loading ? 'Authenticating...' : (activeTab === 'register' ? 'Create Account' : 'Grant Access')}
          </button>
        </form>

        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute w-full border-t border-gray-800"></div>
          <span className="bg-[#0f1115] px-4 text-xs text-gray-500 font-bold uppercase tracking-widest relative z-10">OR</span>
        </div>

        {/* Google Login Button */}
        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="w-full bg-white text-black font-bold py-3 px-4 rounded flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="uppercase tracking-widest text-sm">Continue with Google</span>
        </button>

      </div>
    </div>
  );
}