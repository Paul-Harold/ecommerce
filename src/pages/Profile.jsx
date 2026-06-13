import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../libs/supabase.js';
import { useFavorites } from '../context/FavoritesContext.jsx';

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites, toggleFavorite } = useFavorites();
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'dashboard');
  
  const [orders, setOrders] = useState([]);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);

  const [settingsForm, setSettingsForm] = useState({
    fullName: '',
    phone: '',
    communications: true
  });

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }
      
      setUser(session.user);
      
      setSettingsForm(prev => ({
        ...prev,
        fullName: session.user.user_metadata?.full_name || ''
      }));

      // 🚨 STRICT AUTH FETCH: Passing the UUID instead of the email
      fetchOrders(session.user.id);
    };

    checkAuthAndFetchData();
  }, [navigate]);

  // 🚨 Updated to accept and filter strictly by userId
  const fetchOrders = async (userId) => {
    setIsFetchingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', userId) // Binds strictly to the authenticated account
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsFetchingOrders(false);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSettingsSave = (e) => {
    e.preventDefault();
    alert("Profile settings updated securely.");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'Shipped': return 'text-electric bg-electric/10 border-electric/30';
      case 'Processing': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'Cancelled': return 'text-red-500 bg-red-500/10 border-red-500/30';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050608] flex items-center justify-center text-electric font-mono text-xs md:text-sm uppercase tracking-widest animate-pulse px-4 text-center">
        Loading your account...
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  return (
    <div className="min-h-screen bg-[#050608] text-white pt-20 pb-16 md:pt-24 md:pb-24 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-6 md:gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          {/* User ID Card */}
          <div className="bg-[#0f1115] border border-gray-800 rounded-xl p-4 md:p-6 mb-2 md:mb-4 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0">
            <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 bg-gray-800 rounded-full flex items-center justify-center md:mb-4 border border-gray-700">
              <span className="text-lg md:text-xl font-black text-gray-400 uppercase">
                {user?.email?.charAt(0) || 'O'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold uppercase tracking-widest text-xs md:text-sm truncate">{settingsForm.fullName || 'Customer'}</h2>
              <p className="text-[10px] md:text-[10px] text-gray-500 font-mono truncate">{user?.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-row md:flex-col gap-2 md:gap-1 overflow-x-auto pb-2 md:pb-0 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`shrink-0 md:w-full text-left px-5 py-3 md:px-6 md:py-3 rounded text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'dashboard' ? 'bg-electric text-midnight' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`shrink-0 md:w-full text-left px-5 py-3 md:px-6 md:py-3 rounded text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors flex justify-between items-center gap-3 md:gap-0 ${activeTab === 'orders' ? 'bg-electric text-midnight' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
            >
              Order History
              {pendingOrders > 0 && <span className={`px-2 py-0.5 rounded-full text-[9px] md:text-[10px] ${activeTab === 'orders' ? 'bg-midnight text-electric' : 'bg-gray-800 text-electric'}`}>{pendingOrders}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`shrink-0 md:w-full text-left px-5 py-3 md:px-6 md:py-3 rounded text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors flex justify-between items-center gap-3 md:gap-0 ${activeTab === 'favorites' ? 'bg-electric text-midnight' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
            >
              Favorites
              {favorites.length > 0 && <span className={`px-2 py-0.5 rounded-full text-[9px] md:text-[10px] ${activeTab === 'favorites' ? 'bg-midnight text-electric' : 'bg-gray-800 text-gray-400'}`}>{favorites.length}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`shrink-0 md:w-full text-left px-5 py-3 md:px-6 md:py-3 rounded text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'bg-electric text-midnight' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
            >
              Settings
            </button>
            <button 
              onClick={() => setActiveTab('support')}
              className={`shrink-0 md:w-full text-left px-5 py-3 md:px-6 md:py-3 rounded text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'support' ? 'bg-electric text-midnight' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
            >
              Support
            </button>
            
            <div className="hidden md:block h-px bg-gray-800 my-2"></div>
            
            <button 
              onClick={handleLogout}
              className="shrink-0 md:w-full text-left px-5 py-3 md:px-6 md:py-3 rounded text-[10px] md:text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors"
            >
              Log-Out
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          
          {activeTab === 'dashboard' && (
            <div className="animate-fadeIn space-y-4 md:space-y-6">
              <div className="border-b border-gray-800 pb-4 md:pb-6 mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest">Account Overview</h1>
                <p className="text-gray-500 text-xs md:text-sm mt-1 md:mt-2 font-mono">Welcome back.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-[#0f1115] border border-gray-800 rounded-xl p-5 md:p-6 hover:border-electric transition-colors cursor-pointer shadow-lg" onClick={() => setActiveTab('orders')}>
                  <p className="text-gray-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-1 md:mb-2">Total Orders</p>
                  <p className="text-3xl md:text-4xl font-black text-white">{orders.length}</p>
                  <p className="text-electric text-[10px] md:text-xs mt-1 md:mt-2 font-mono">{pendingOrders} in progress</p>
                </div>
                <div className="bg-[#0f1115] border border-gray-800 rounded-xl p-5 md:p-6 hover:border-ion transition-colors cursor-pointer shadow-lg" onClick={() => setActiveTab('favorites')}>
                  <p className="text-gray-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-1 md:mb-2">Saved Hardware</p>
                  <p className="text-3xl md:text-4xl font-black text-white">{favorites.length}</p>
                  <p className="text-ion text-[10px] md:text-xs mt-1 md:mt-2 font-mono">items saved</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="animate-fadeIn space-y-4 md:space-y-6">
              <div className="border-b border-gray-800 pb-4 md:pb-6 mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest">Order History</h1>
              </div>

              {isFetchingOrders ? (
                <p className="text-gray-500 font-mono text-xs md:text-sm">Loading your orders...</p>
              ) : orders.length === 0 ? (
                <div className="bg-[#0f1115] border border-gray-800 rounded-xl p-8 md:p-12 text-center shadow-lg">
                  <p className="text-gray-500 font-mono text-xs md:text-sm uppercase tracking-widest mb-6">You haven't placed any orders yet.</p>
                  <button onClick={() => navigate('/shop')} className="w-full sm:w-auto bg-electric text-midnight font-bold uppercase tracking-widest px-8 py-3.5 md:py-3 rounded hover:bg-white transition-colors text-xs md:text-sm">
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-[#0f1115] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors shadow-lg">
                      <div className="bg-[#0B0D10] px-4 py-4 md:px-6 border-b border-gray-800 grid grid-cols-2 md:flex md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
                        <div>
                          <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Order ID</p>
                          <p className="font-mono text-white text-xs md:text-sm">#{order.id.substring(0, 8)}<span className="hidden sm:inline">{order.id.substring(8, 12)}</span></p>
                        </div>
                        <div>
                          <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Date Logged</p>
                          <p className="font-mono text-white text-xs md:text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Total Value</p>
                          <p className="font-bold text-ion text-xs md:text-sm">₱{parseFloat(order.total_amount).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 md:px-3 md:py-1.5 rounded border ${getStatusColor(order.status || 'Pending')}`}>
                            {order.status || 'Pending'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4 md:p-6">
                        <div className="space-y-3 md:space-y-4">
                          {order.order_items && order.order_items.length > 0 ? (
                            order.order_items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-3 md:gap-4">
                                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                  {item.image_url ? (
                                    <img src={item.image_url} alt={item.product_name} className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded bg-gray-900 border border-gray-800 object-contain p-1" />
                                  ) : (
                                    <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded bg-gray-900 border border-gray-800 flex items-center justify-center">
                                      <span className="text-gray-700 text-[10px] md:text-xs font-bold tracking-widest">GEAR</span>
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-xs md:text-sm font-bold text-white line-clamp-1">{item.product_name}</p>
                                    <p className="text-[10px] md:text-xs text-gray-500 font-mono">QTY: {item.quantity}</p>
                                  </div>
                                </div>
                                <p className="text-xs md:text-sm font-bold font-mono text-gray-300 shrink-0">
                                  ₱{(parseFloat(item.price_at_purchase) * parseInt(item.quantity)).toFixed(2)}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className="text-gray-500 font-mono text-xs">Item details are unavailable for this order.</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-dashed border-gray-800">
                          <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mb-1 md:mb-2">Delivery Address</p>
                          <p className="text-xs md:text-sm text-gray-400 font-mono whitespace-pre-wrap">{order.shipping_address || 'Address on file'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="animate-fadeIn space-y-4 md:space-y-6">
              <div className="border-b border-gray-800 pb-4 md:pb-6 mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest">Saved Hardware</h1>
              </div>

              {favorites.length === 0 ? (
                <div className="bg-[#0f1115] border border-gray-800 rounded-xl p-8 md:p-12 text-center shadow-lg">
                  <p className="text-gray-500 font-mono text-xs md:text-sm uppercase tracking-widest mb-6">You haven't saved any items yet.</p>
                  <button onClick={() => navigate('/shop')} className="w-full sm:w-auto bg-ion text-midnight font-bold uppercase tracking-widest px-8 py-3.5 md:py-3 rounded hover:bg-white transition-colors text-xs md:text-sm">
                    Browse Gear
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {favorites.map((product) => (
                    <div key={product.id} className="bg-[#0f1115] border border-gray-800 hover:border-ion rounded-xl overflow-hidden transition-all group flex flex-col cursor-pointer shadow-lg" onClick={() => navigate(`/product/${product.id}`)}>
                      <div className="h-40 md:h-48 bg-gray-900 relative p-4 flex items-center justify-center shrink-0">
                        <div className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-80 group-hover:opacity-100 transition-opacity md:group-hover:scale-105 duration-500" style={{ backgroundImage: `url(${product.image})` }}></div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(product);
                          }}
                          className="absolute top-2 right-2 md:top-3 md:right-3 z-10 p-2 md:p-2 bg-black/50 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-full transition-colors backdrop-blur"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </button>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between border-t border-gray-800/50">
                        <div>
                          <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{product.category}</p>
                          <h3 className="text-xs md:text-sm font-bold text-white mb-2 line-clamp-1">{product.name}</h3>
                        </div>
                        <p className="text-ion font-bold text-sm">₱{parseFloat(product.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-fadeIn space-y-4 md:space-y-6">
              <div className="border-b border-gray-800 pb-4 md:pb-6 mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest">Profile Settings</h1>
              </div>

              <form onSubmit={handleSettingsSave} className="bg-[#0f1115] border border-gray-800 rounded-xl p-5 md:p-8 space-y-5 md:space-y-6 max-w-2xl shadow-lg">
                <div>
                  <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1.5 md:mb-2">Primary Email (Locked)</label>
                  <input type="text" value={user?.email || ''} disabled className="w-full bg-gray-900 border border-gray-800 rounded px-3 md:px-4 py-3 text-gray-500 font-mono cursor-not-allowed text-[16px] md:text-sm" />
                  <p className="text-[10px] md:text-xs text-gray-600 mt-1.5 md:mt-2 font-mono">Authentication email cannot be altered locally.</p>
                </div>
                <div>
                  <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1.5 md:mb-2">Display Name</label>
                  <input 
                    type="text" 
                    value={settingsForm.fullName} 
                    onChange={e => setSettingsForm({...settingsForm, fullName: e.target.value})} 
                    placeholder="Enter your name"
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 md:px-4 py-3 text-white focus:outline-none focus:border-electric transition-colors text-[16px] md:text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1.5 md:mb-2">Contact Number</label>
                  <input 
                    type="tel" 
                    value={settingsForm.phone} 
                    onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})} 
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 md:px-4 py-3 text-white focus:outline-none focus:border-electric transition-colors text-[16px] md:text-sm" 
                  />
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <button type="submit" className="w-full md:w-auto px-8 py-3.5 md:py-3 bg-white text-midnight font-bold uppercase tracking-widest text-xs md:text-sm rounded hover:bg-gray-200 transition-colors">
                    Save Configuration
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="animate-fadeIn space-y-4 md:space-y-6">
              <div className="border-b border-gray-800 pb-4 md:pb-6 mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest">Support</h1>
              </div>

              <div className="bg-[#0f1115] border border-gray-800 rounded-xl p-5 md:p-8 max-w-2xl shadow-lg">
                <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest mb-4 md:mb-6 text-white">Need Assistance?</h3>
                <p className="text-gray-400 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                  If you have a question about a recent order or need technical support for your Midnight gear, our team is here to help.
                </p>

                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center md:items-start gap-3 md:gap-4">
                    <div className="w-10 h-10 rounded bg-gray-900 border border-gray-800 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5 md:mb-1">Email</p>
                      <p className="text-white font-mono text-xs md:text-base">paulharold.batiles@gmail.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center md:items-start gap-3 md:gap-4">
                    <div className="w-10 h-10 rounded bg-gray-900 border border-gray-800 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5 md:mb-1">Phone</p>
                      <p className="text-white font-mono text-xs md:text-base">09205278696</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}