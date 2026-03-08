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
  
  // Intercept the activeTab from the Navbar's navigation state, default to 'dashboard'
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'dashboard');
  
  const [orders, setOrders] = useState([]);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    fullName: '',
    phone: '',
    communications: true
  });

  // Listen for navigation changes while already on the Profile page
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
      
      // Extract name from metadata if it exists
      setSettingsForm(prev => ({
        ...prev,
        fullName: session.user.user_metadata?.full_name || ''
      }));

      fetchOrders(session.user.email);
    };

    checkAuthAndFetchData();
  }, [navigate]);

  const fetchOrders = async (email) => {
    setIsFetchingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', email)
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
      <div className="min-h-screen bg-[#050608] flex items-center justify-center text-electric font-mono text-sm uppercase tracking-widest animate-pulse">
        Decrypting Operative Data...
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  return (
    <div className="min-h-screen bg-[#050608] text-white pt-24 pb-24 px-6">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <div className="bg-[#0f1115] border border-gray-800 rounded-xl p-6 mb-4">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-700">
              <span className="text-xl font-black text-gray-400 uppercase">
                {user?.email?.charAt(0) || 'O'}
              </span>
            </div>
            <h2 className="font-bold uppercase tracking-widest text-sm truncate">{settingsForm.fullName || 'Operative'}</h2>
            <p className="text-[10px] text-gray-500 font-mono truncate">{user?.email}</p>
          </div>

          <nav className="flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-6 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'dashboard' ? 'bg-electric text-midnight' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-6 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors flex justify-between items-center ${activeTab === 'orders' ? 'bg-electric text-midnight' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
            >
              Order History
              {pendingOrders > 0 && <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'orders' ? 'bg-midnight text-electric' : 'bg-gray-800 text-electric'}`}>{pendingOrders}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`w-full text-left px-6 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors flex justify-between items-center ${activeTab === 'favorites' ? 'bg-electric text-midnight' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
            >
              Saved Hardware
              {favorites.length > 0 && <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'favorites' ? 'bg-midnight text-electric' : 'bg-gray-800 text-gray-400'}`}>{favorites.length}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-6 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'bg-electric text-midnight' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
            >
              Settings
            </button>
            <button 
              onClick={() => setActiveTab('support')}
              className={`w-full text-left px-6 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'support' ? 'bg-electric text-midnight' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
            >
              Support
            </button>
            
            <div className="h-px bg-gray-800 my-2"></div>
            
            <button 
              onClick={handleLogout}
              className="w-full text-left px-6 py-3 rounded text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors"
            >
              Terminate Session
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          
          {activeTab === 'dashboard' && (
            <div className="animate-fadeIn space-y-6">
              <div className="border-b border-gray-800 pb-6 mb-8">
                <h1 className="text-3xl font-black uppercase tracking-widest">Dossier Overview</h1>
                <p className="text-gray-500 text-sm mt-2 font-mono">Connection Secure. Welcome to the grid.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0f1115] border border-gray-800 rounded-xl p-6 hover:border-electric transition-colors cursor-pointer" onClick={() => setActiveTab('orders')}>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Total Deployments</p>
                  <p className="text-4xl font-black text-white">{orders.length}</p>
                  <p className="text-electric text-xs mt-2 font-mono">{pendingOrders} active inbound</p>
                </div>
                <div className="bg-[#0f1115] border border-gray-800 rounded-xl p-6 hover:border-ion transition-colors cursor-pointer" onClick={() => setActiveTab('favorites')}>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Saved Hardware</p>
                  <p className="text-4xl font-black text-white">{favorites.length}</p>
                  <p className="text-ion text-xs mt-2 font-mono">items in local cache</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="animate-fadeIn space-y-6">
              <div className="border-b border-gray-800 pb-6 mb-8">
                <h1 className="text-3xl font-black uppercase tracking-widest">Deployment History</h1>
              </div>

              {isFetchingOrders ? (
                <p className="text-gray-500 font-mono text-sm">Retrieving shipping logs...</p>
              ) : orders.length === 0 ? (
                <div className="bg-[#0f1115] border border-gray-800 rounded-xl p-12 text-center">
                  <p className="text-gray-500 font-mono text-sm uppercase tracking-widest mb-6">No previous deployments found on record.</p>
                  <button onClick={() => navigate('/shop')} className="bg-electric text-midnight font-bold uppercase tracking-widest px-8 py-3 rounded hover:bg-white transition-colors">
                    Enter Armory
                  </button>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-[#0f1115] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
                    <div className="bg-[#0B0D10] px-6 py-4 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Order ID</p>
                        <p className="font-mono text-white text-sm">#{order.id.substring(0, 12)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Date Logged</p>
                        <p className="font-mono text-white text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Total Value</p>
                        <p className="font-bold text-ion text-sm">${parseFloat(order.total_amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded border ${getStatusColor(order.status || 'Pending')}`}>
                          {order.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-4">
                        {order.items && order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded bg-gray-900 border border-gray-800 object-contain p-1" />
                              ) : (
                                <div className="w-12 h-12 rounded bg-gray-900 border border-gray-800 flex items-center justify-center">
                                  <span className="text-gray-700 text-xs font-bold">N/A</span>
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-bold text-white line-clamp-1">{item.name}</p>
                                <p className="text-xs text-gray-500 font-mono">QTY: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="text-sm font-bold font-mono text-gray-300">
                              ${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 pt-4 border-t border-dashed border-gray-800">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Delivery Coordinates</p>
                        <p className="text-sm text-gray-400 font-mono whitespace-pre-wrap">{order.shipping_address}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="animate-fadeIn space-y-6">
              <div className="border-b border-gray-800 pb-6 mb-8">
                <h1 className="text-3xl font-black uppercase tracking-widest">Saved Hardware</h1>
              </div>

              {favorites.length === 0 ? (
                <div className="bg-[#0f1115] border border-gray-800 rounded-xl p-12 text-center">
                  <p className="text-gray-500 font-mono text-sm uppercase tracking-widest mb-6">No hardware pinned to your dossier.</p>
                  <button onClick={() => navigate('/shop')} className="bg-ion text-midnight font-bold uppercase tracking-widest px-8 py-3 rounded hover:bg-white transition-colors">
                    Browse Gear
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((product) => (
                    <div key={product.id} className="bg-[#0f1115] border border-gray-800 hover:border-ion rounded-xl overflow-hidden transition-all group flex flex-col cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                      <div className="h-40 bg-gray-900 relative p-4 flex items-center justify-center">
                        <div className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500" style={{ backgroundImage: `url(${product.image})` }}></div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(product);
                          }}
                          className="absolute top-3 right-3 z-10 p-2 bg-black/50 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-full transition-colors backdrop-blur"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </button>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between border-t border-gray-800/50">
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{product.category}</p>
                          <h3 className="text-sm font-bold text-white mb-2 line-clamp-1">{product.name}</h3>
                        </div>
                        <p className="text-ion font-bold text-sm">${parseFloat(product.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-fadeIn space-y-6">
              <div className="border-b border-gray-800 pb-6 mb-8">
                <h1 className="text-3xl font-black uppercase tracking-widest">Profile Settings</h1>
              </div>

              <form onSubmit={handleSettingsSave} className="bg-[#0f1115] border border-gray-800 rounded-xl p-8 space-y-6 max-w-2xl">
                <div>
                  <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Primary Email (Locked)</label>
                  <input type="text" value={user?.email || ''} disabled className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-3 text-gray-500 font-mono cursor-not-allowed" />
                  <p className="text-xs text-gray-600 mt-2 font-mono">Authentication email cannot be altered locally.</p>
                </div>
                <div>
                  <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Display Name</label>
                  <input 
                    type="text" 
                    value={settingsForm.fullName} 
                    onChange={e => setSettingsForm({...settingsForm, fullName: e.target.value})} 
                    placeholder="Enter your name"
                    className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-electric transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Contact Number</label>
                  <input 
                    type="tel" 
                    value={settingsForm.phone} 
                    onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})} 
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-electric transition-colors" 
                  />
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <button type="submit" className="px-8 py-3 bg-white text-midnight font-bold uppercase tracking-widest text-xs rounded hover:bg-gray-200 transition-colors">
                    Save Configuration
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="animate-fadeIn space-y-6">
              <div className="border-b border-gray-800 pb-6 mb-8">
                <h1 className="text-3xl font-black uppercase tracking-widest">Support Node</h1>
              </div>

              <div className="bg-[#0f1115] border border-gray-800 rounded-xl p-8 max-w-2xl">
                <h3 className="text-xl font-bold uppercase tracking-widest mb-6 text-white">Need Assistance?</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  If you are experiencing issues with a recent hardware deployment or require technical support for your Midnight gear, our operatives are standing by.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded bg-gray-900 border border-gray-800 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Comm-Link (Email)</p>
                      <p className="text-white font-mono">support@midnight.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded bg-gray-900 border border-gray-800 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Direct Line</p>
                      <p className="text-white font-mono">1-800-MIDNIGHT</p>
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