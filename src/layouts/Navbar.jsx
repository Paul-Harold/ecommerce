import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { supabase } from '../libs/supabase.js';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  
  const { cartCount, setIsCartOpen } = useCart();
  const { favorites } = useFavorites();

  useEffect(() => {
    const verifyAdminStatus = async (userId) => {
      try {
        const { data, error } = await supabase
          .from('admins')
          .select('user_id')
          .eq('user_id', userId)
          .single();
          
        if (!error && data) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      }
    };

    const handleSession = (sessionUser) => {
      setUser(sessionUser);
      if (sessionUser) {
        verifyAdminStatus(sessionUser.id);
      } else {
        setIsAdmin(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutModal(false);
    navigate('/login');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#0B0D10]/90 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-12">
            <Link to="/" className="text-3xl font-black tracking-widest uppercase text-white hover:text-electric transition-colors">
              Midnight<span className="text-electric">.</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors">Home</Link>
              <Link to="/shop" className="text-sm font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors">Shop</Link>
              <Link to="/offers" className="text-sm font-bold uppercase tracking-widest text-gray-300 hover:text-ion transition-colors">Offers</Link>
            </div>
          </div>

          <div className="flex items-center gap-6">

            <div className="hidden lg:flex items-center relative">
              <input 
                type="text" 
                placeholder="Search gear..." 
                className="bg-gray-900 border border-gray-700 text-sm rounded-full pl-5 pr-10 py-2 focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric text-white placeholder-gray-500 transition-all w-64"
              />
              <svg className="w-5 h-5 text-gray-400 absolute right-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {isAdmin && (
              <Link 
                to="/Admin" 
                className="hidden md:flex items-center gap-2 bg-electric/10 border border-electric/30 text-electric px-4 py-1.5 rounded-full hover:bg-electric hover:text-midnight transition-all shadow-[0_0_10px_rgba(64,224,255,0.2)]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
              </Link>
            )}

            <Link to="/favorites" className="text-gray-300 hover:text-ion transition-colors relative group">
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {favorites.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-ion text-midnight text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(57,255,20,0.5)]">
                  {favorites.length}
                </span>
              )}
            </Link>

            {user ? (
              <button 
                onClick={() => setShowLogoutModal(true)} 
                title="Sign Out"
                className="text-gray-300 hover:text-electric transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            ) : (
              <Link to="/login" title="Sign In" className="text-gray-300 hover:text-electric transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>
            )}

            <button 
              onClick={() => setIsCartOpen(true)}
              className="text-gray-300 hover:text-electric transition-colors relative group"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-electric text-midnight text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(64,224,255,0.5)]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#0f1115] border border-gray-800 p-8 rounded-xl shadow-2xl max-w-sm w-full animate-fadeIn">
            
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gray-800/50 border border-gray-700 rounded-full flex items-center justify-center text-gray-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </div>
            </div>

            <h3 className="text-2xl font-black uppercase tracking-widest text-white text-center mb-2">Sign Out</h3>
            <p className="text-gray-400 text-center text-sm mb-8">
              Are you sure you want to sign out?
            </p>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 px-4 bg-gray-900 border border-gray-700 text-gray-300 rounded font-bold uppercase tracking-widest text-xs hover:bg-gray-800 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 py-3 px-4 bg-electric text-midnight rounded font-bold uppercase tracking-widest text-xs hover:bg-white transition-all"
              >
                Sign Out
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}