import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../libs/supabase.js';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Check if someone is already logged in when the page loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. Set up the "Listener" to watch for logins/logouts in real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#0B0D10]/90 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* ================= LEFT SIDE ================= */}
        <div className="flex items-center gap-12">
          {/* 1. Logo */}
          <Link to="/" className="text-3xl font-black tracking-widest uppercase text-white hover:text-electric transition-colors">
            Midnight<span className="text-electric">.</span>
          </Link>

          {/* 2. Page Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/shop" className="text-sm font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors">
              Shop
            </Link>
            <Link to="/offers" className="text-sm font-bold uppercase tracking-widest text-gray-300 hover:text-ion transition-colors">
              Offers
            </Link>
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="flex items-center gap-6">

          {/* 1. Search Bar */}
          <div className="hidden lg:flex items-center relative">
            <input 
              type="text" 
              placeholder="Search gear..." 
              className="bg-gray-900 border border-gray-700 text-sm rounded-full pl-5 pr-10 py-2 focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric text-white placeholder-gray-500 transition-all w-64"
            />
            {/* Search Icon inside the input */}
            <svg className="w-5 h-5 text-gray-400 absolute right-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* 2. Favorites */}
          <button className="text-gray-300 hover:text-electric transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>

          {/* 3. Login / User (DYNAMIC) */}
          {user ? (
            // If Logged In: Show Logout Icon
            <button 
              onClick={handleLogout} 
              title="Sign Out"
              className="text-gray-300 hover:text-red-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          ) : (
            // If Guest: Show original User Icon linking to Login page
            <Link to="/login" title="Sign In" className="text-gray-300 hover:text-electric transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>
          )}

          {/* 4. Cart */}
          <button className="text-gray-300 hover:text-electric transition-colors relative group">
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {/* Notification Dot for Cart */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-electric"></span>
            </span>
          </button>

        </div>
      </div>
    </nav>
  );
}