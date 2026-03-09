import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../libs/supabase.js';
import { useCart } from '../context/CartContext.jsx';

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); 
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { activePromo } = useCart();
  
  const [newReleases, setNewReleases] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [cmsContent, setCmsContent] = useState({
    hero_title: 'Dominate the <span class="text-electric">Game</span>', 
    hero_subtitle: 'Premium gaming peripherals built for precision, speed, and absolute control. Upgrade your setup with Midnight gear.',
    hero_image_url: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=2070'
  });

  const getDiscountInfo = (product) => {
    let finalDiscount = 0;

    if (product.discount_percent && product.discount_percent > 0) {
      finalDiscount = product.discount_percent;
    }

    if (activePromo) {
      let isEligible = false;
      if (activePromo.title.includes('Acoustic') && product.category === 'Headset') isEligible = true;
      else if (activePromo.title.includes('Vanguard') && (product.category === 'Keyboard' || product.category === 'Surfaces')) isEligible = true;
      else if (activePromo.title.includes('Ghost') && ['Mouse', 'Keyboard', 'Surfaces'].includes(product.category)) isEligible = true;

      if (isEligible && activePromo.discount_percent > finalDiscount) {
        finalDiscount = activePromo.discount_percent;
      }
    }

    if (finalDiscount > 0) {
      const discountAmount = product.price * (finalDiscount / 100);
      return {
        newPrice: (product.price - discountAmount).toFixed(2),
        percent: finalDiscount
      };
    }

    return null;
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') {
          throw new Error('This email is already on the grid.');
        }
        throw new Error('Transmission failed. Try again.');
      }

      setStatus('success');
      setMessage('Welcome to the grid. Check your inbox.');
      setEmail(''); 
      
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  useEffect(() => {
    async function fetchAllData() {
      try {
        const { data: siteData, error: siteError } = await supabase
          .from('site_content')
          .select('*')
          .eq('page_name', 'home')
          .single();

        let featuredIds = [];

        if (!siteError && siteData) {
          setCmsContent({
            hero_title: siteData.hero_title || cmsContent.hero_title,
            hero_subtitle: siteData.hero_subtitle || cmsContent.hero_subtitle,
            hero_image_url: siteData.hero_image_url || cmsContent.hero_image_url,
          });
          featuredIds = siteData.content_data?.featured_ids || [];
        }

        if (featuredIds.length > 0) {
          const { data: featuredData } = await supabase
            .from('products')
            .select('*')
            .in('id', featuredIds);
          
          if (featuredData) setFeaturedProducts(featuredData);
        }

        const { data: newProdData } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);
          
        if (newProdData) setNewReleases(newProdData);

      } catch (error) {
        console.error('Error fetching data:', error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllData();
  }, []);

  return (
    <div className="min-h-screen bg-midnight text-white">
      
      {/* Hero Section */}
      <div 
        className="relative h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-fixed bg-center bg-cover transition-all duration-1000"
        style={{ backgroundImage: `url('${cmsContent.hero_image_url}')` }}
      >
        <div className="absolute inset-0 bg-[#0B0D10]/70 z-0"></div>

        <div className="text-center max-w-4xl relative z-10 mt-0 md:mt-[-5vh] px-4 w-full">
          <h1 
            className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-widest mb-4 md:mb-6 leading-tight"
            dangerouslySetInnerHTML={{ __html: cmsContent.hero_title }}
          ></h1>
          
          <p className="text-gray-300 text-sm sm:text-lg md:text-xl mb-8 md:mb-10 max-w-2xl mx-auto drop-shadow-lg px-2">
            {cmsContent.hero_subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full sm:w-auto px-4 sm:px-0">
            <button 
              onClick={() => navigate('/shop')}
              className="w-full sm:w-auto bg-electric text-midnight font-bold py-4 px-8 md:px-10 rounded hover:bg-white hover:shadow-[0_0_20px_#40E0FF] transition-all duration-300 uppercase tracking-wider text-sm md:text-base"
            >
              Shop Gear
            </button>
            <button 
              onClick={() => navigate('/offers')}
              className="w-full sm:w-auto border border-gray-400 backdrop-blur-sm bg-black/30 text-white font-bold py-4 px-8 md:px-10 rounded hover:border-electric hover:text-electric transition-all duration-300 uppercase tracking-wider text-sm md:text-base"
            >
              View Offers
            </button>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="relative z-20 bg-midnight w-full flex justify-center py-12 md:py-20 px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 text-center border-t border-gray-800 pt-8 md:pt-12 w-full max-w-5xl">
          <div className="flex flex-col items-center group">
            <p className="text-ion text-3xl md:text-4xl mb-2 md:mb-3 group-hover:scale-110 transition-transform">🚀</p>
            <p className="text-white font-bold text-base md:text-lg">Lightning Shipping</p>
            <p className="text-gray-500 text-xs md:text-sm mt-1">Dispatched within 24h</p>
          </div>
          <div className="flex flex-col items-center group">
            <p className="text-ion text-3xl md:text-4xl mb-2 md:mb-3 group-hover:scale-110 transition-transform">🛡️</p>
            <p className="text-white font-bold text-base md:text-lg">2-Year Warranty</p>
            <p className="text-gray-500 text-xs md:text-sm mt-1">Zero questions asked</p>
          </div>
          <div className="flex flex-col items-center group">
            <p className="text-ion text-3xl md:text-4xl mb-2 md:mb-3 group-hover:scale-110 transition-transform">🎧</p>
            <p className="text-white font-bold text-base md:text-lg">24/7 Pro Support</p>
            <p className="text-gray-500 text-xs md:text-sm mt-1">Expert technical assistance</p>
          </div>
        </div>
      </div>
      
      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div className="relative z-20 bg-midnight w-full py-16 md:py-24 px-4 sm:px-6 border-t border-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <div className="inline-block px-3 py-1 bg-ion/10 text-ion border border-ion/30 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6">
                Curated Selection
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest mb-2 md:mb-4">
                Featured <span className="text-ion">Hardware</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {featuredProducts.map((product) => {
                const discountInfo = getDiscountInfo(product);

                return (
                  <div 
                    key={product.id} 
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="group bg-[#0f1115] border border-gray-800 rounded-xl overflow-hidden hover:border-ion transition-all duration-300 lg:hover:-translate-y-2 lg:hover:shadow-[0_10px_40px_-10px_rgba(57,255,20,0.2)] cursor-pointer flex flex-col"
                  >
                    <div className="relative h-56 sm:h-64 md:h-72 bg-[#0B0D10] overflow-hidden flex-shrink-0 flex items-center justify-center p-6 md:p-8">
                      {discountInfo && (
                        <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-ion text-midnight text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded z-20 animate-pulse">
                          {discountInfo.percent}% OFF
                        </div>
                      )}
                      <div className="absolute inset-0 bg-ion/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden lg:block"></div>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="max-h-full max-w-full object-contain relative z-10 transition-transform duration-700 lg:group-hover:scale-110 drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                      />
                    </div>
                    <div className="p-6 md:p-8 flex flex-col flex-1 justify-between text-center border-t border-gray-800/50">
                      <div>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2 md:mb-3">{product.category}</p>
                        <h3 className="text-xl md:text-2xl font-black text-white mb-3 md:mb-4 line-clamp-1">{product.name}</h3>
                      </div>
                      
                      {discountInfo ? (
                        <div className="flex items-center gap-2 md:gap-3 justify-center">
                          <span className="text-gray-500 line-through text-xs md:text-sm font-bold">${product.price}</span>
                          <span className="text-ion font-black text-lg md:text-xl">${discountInfo.newPrice}</span>
                        </div>
                      ) : (
                        <p className="text-white font-bold text-lg md:text-xl">${product.price}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* New Releases */}
      <div className="relative z-20 bg-midnight w-full py-16 md:py-24 px-4 sm:px-6 border-t border-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 border-b border-gray-800 pb-4 md:pb-6">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest text-white mb-1 md:mb-2">
                New <span className="text-electric">Releases</span>
              </h2>
              <p className="text-gray-400 uppercase tracking-widest text-[10px] md:text-sm">Recently declassified gear</p>
            </div>
            <button onClick={() => navigate('/shop')} className="hidden sm:block text-electric text-xs md:text-sm font-bold uppercase tracking-widest hover:text-white transition-colors">
              View All Gear →
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 md:w-12 md:h-12 border-4 border-gray-800 border-t-electric rounded-full animate-spin"></div></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {newReleases.map((product) => {
                const discountInfo = getDiscountInfo(product);

                return (
                  <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="group bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-xl overflow-hidden lg:hover:border-electric transition-all duration-300 lg:hover:-translate-y-1 lg:hover:shadow-[0_10px_40px_-10px_rgba(64,224,255,0.15)] cursor-pointer shadow-lg flex flex-col">
                    <div className="relative h-56 md:h-64 bg-[#0B0D10] overflow-hidden flex-shrink-0">
                      <div className="absolute inset-0 bg-contain bg-no-repeat bg-center transition-transform duration-500 lg:group-hover:scale-110 p-4" style={{ backgroundImage: `url(${product.image})` }}></div>
                      <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-electric text-midnight text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">New</div>
                      {discountInfo && (
                        <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-ion text-midnight text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded z-20 animate-pulse">
                          {discountInfo.percent}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-4 md:p-6 flex flex-col flex-1 justify-between border-t border-gray-800/50">
                      <div>
                        <p className="text-gray-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-1 md:mb-2">{product.category}</p>
                        <h3 className="text-base md:text-lg font-bold text-white mb-2 line-clamp-1">{product.name}</h3>
                      </div>
                      
                      {discountInfo ? (
                        <div className="flex items-center gap-2 md:gap-3 mt-2 md:mt-4">
                          <span className="text-gray-500 line-through text-xs md:text-sm font-bold">${product.price}</span>
                          <span className="text-ion font-black text-base md:text-lg">${discountInfo.newPrice}</span>
                        </div>
                      ) : (
                        <p className="text-electric font-bold text-base md:text-lg mt-2 md:mt-4">${product.price}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Mobile "View All Gear" button */}
          <button onClick={() => navigate('/shop')} className="sm:hidden w-full mt-6 border border-gray-800 text-gray-300 font-bold uppercase tracking-widest py-4 rounded hover:bg-gray-800 hover:text-white transition-colors text-xs">
            View All Gear
          </button>
        </div>
      </div>

      {/* Category Grid */}
      <div className="relative z-20 bg-midnight w-full py-16 md:py-24 px-4 sm:px-6 border-t border-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest mb-2">Upgrade Your <span className="text-electric">Experience</span></h2>
              <p className="text-gray-400 mt-2 md:mt-4 text-sm md:text-lg">Precision-engineered gear for every playstyle.</p>
            </div>
            <button onClick={() => navigate('/shop')} className="hidden md:block text-white font-bold uppercase tracking-widest border-b-2 border-electric pb-1 hover:text-electric transition-colors text-sm">View All Gear</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-[250px] md:auto-rows-[300px]">
            <div onClick={() => navigate('/shop')} className="group relative overflow-hidden rounded-xl lg:col-span-2 cursor-pointer shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 lg:group-hover:scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1200')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/50 to-transparent opacity-90 lg:group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white mb-1 md:mb-2">Keyboards</h3>
                <p className="text-electric font-bold uppercase tracking-wider text-xs md:text-sm flex items-center gap-2 transform lg:translate-y-4 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-300">Shop Now <span className="text-lg md:text-xl">→</span></p>
              </div>
            </div>
            <div onClick={() => navigate('/shop')} className="group relative overflow-hidden rounded-xl cursor-pointer shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 lg:group-hover:scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=800')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/50 to-transparent opacity-90 lg:group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white mb-1 md:mb-2">Mice</h3>
                <p className="text-electric font-bold uppercase tracking-wider text-xs md:text-sm flex items-center gap-2 transform lg:translate-y-4 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-300">Shop Now <span className="text-lg md:text-xl">→</span></p>
              </div>
            </div>
            <div onClick={() => navigate('/shop')} className="group relative overflow-hidden rounded-xl cursor-pointer shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 lg:group-hover:scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/50 to-transparent opacity-90 lg:group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white mb-1 md:mb-2">Audio</h3>
                <p className="text-electric font-bold uppercase tracking-wider text-xs md:text-sm flex items-center gap-2 transform lg:translate-y-4 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-300">Shop Now <span className="text-lg md:text-xl">→</span></p>
              </div>
            </div>
            <div onClick={() => navigate('/shop')} className="group relative overflow-hidden rounded-xl lg:col-span-2 cursor-pointer shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 lg:group-hover:scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=1200')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/50 to-transparent opacity-90 lg:group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white mb-1 md:mb-2">Surfaces</h3>
                <p className="text-electric font-bold uppercase tracking-wider text-xs md:text-sm flex items-center gap-2 transform lg:translate-y-4 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-300">Shop Now <span className="text-lg md:text-xl">→</span></p>
              </div>
            </div>
          </div>
          
          <button onClick={() => navigate('/shop')} className="md:hidden w-full mt-6 border border-gray-800 text-gray-300 font-bold uppercase tracking-widest py-4 rounded hover:bg-gray-800 hover:text-white transition-colors text-xs">
            View All Categories
          </button>
        </div>
      </div>

      {/* Value Props */}
      <div className="bg-black w-full py-16 md:py-20 px-4 sm:px-6 border-t border-gray-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-12 text-center">
          <div className="flex flex-col items-center">
            <svg className="w-10 h-10 md:w-12 md:h-12 text-electric mb-4 md:mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
            <h4 className="text-lg md:text-xl font-black uppercase tracking-widest text-white mb-2">Zero Latency</h4>
            <p className="text-gray-500 text-xs md:text-sm max-w-xs">Our proprietary Slipstream wireless tech guarantees pixel-perfect registration under 1ms.</p>
          </div>
          <div className="flex flex-col items-center">
            <svg className="w-10 h-10 md:w-12 md:h-12 text-electric mb-4 md:mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h4 className="text-lg md:text-xl font-black uppercase tracking-widest text-white mb-2">Tournament Grade</h4>
            <p className="text-gray-500 text-xs md:text-sm max-w-xs">Built with aerospace-grade aluminum and switches rated for 100 million clicks.</p>
          </div>
          <div className="flex flex-col items-center">
            <svg className="w-10 h-10 md:w-12 md:h-12 text-electric mb-4 md:mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /></svg>
            <h4 className="text-lg md:text-xl font-black uppercase tracking-widest text-white mb-2">Perfect Ergonomics</h4>
            <p className="text-gray-500 text-xs md:text-sm max-w-xs">Designed with biometric data to eliminate fatigue during marathon gaming sessions.</p>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-gradient-to-b from-black to-midnight w-full py-16 md:py-24 px-4 sm:px-6 border-t border-gray-900 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 bg-electric/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none"></div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest mb-3 md:mb-4">Unlock <span className="text-electric">10% Off</span></h2>
          <p className="text-gray-400 mb-6 md:mb-8 text-sm md:text-lg px-2">Subscribe to our newsletter for exclusive hardware drops, setup inspiration, and a discount on your first order.</p>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4 sm:px-0">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              placeholder="Enter your email address" 
              className="bg-gray-900 border border-gray-700 text-white px-4 md:px-6 py-3 md:py-4 rounded focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric transition-all flex-grow sm:max-w-md placeholder-gray-500 text-sm md:text-base w-full" 
              required
            />
            <button 
              type="submit"
              disabled={status === 'loading'}
              className="w-full sm:w-auto bg-electric text-midnight font-bold py-3 md:py-4 px-6 md:px-8 rounded hover:bg-white hover:shadow-[0_0_20px_#40E0FF] transition-all duration-300 uppercase tracking-wider disabled:opacity-50 text-sm md:text-base shrink-0"
            >
              {status === 'loading' ? 'Routing...' : 'Subscribe'}
            </button>
          </form>

          {status === 'success' && (
            <p className="mt-4 text-ion text-[10px] md:text-sm font-bold tracking-widest uppercase animate-fadeIn">{message}</p>
          )}
          {status === 'error' && (
            <p className="mt-4 text-red-500 text-[10px] md:text-sm font-bold tracking-widest uppercase animate-fadeIn">{message}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#050608] w-full pt-12 md:pt-16 pb-6 md:pb-8 px-4 sm:px-6 border-t border-gray-900 text-xs md:text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-16">
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <h3 className="text-xl md:text-2xl font-black tracking-widest uppercase text-white mb-4 md:mb-6">Midnight<span className="text-electric">.</span></h3>
            <p className="text-gray-500 mb-4 md:mb-6 pr-4 lg:pr-0">Equipping the next generation of digital athletes with uncompromising hardware.</p>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-4 md:mb-6">Shop</h4>
            <ul className="space-y-3 md:space-y-4 text-gray-500">
              <li><button onClick={() => navigate('/shop')} className="hover:text-electric transition-colors">Keyboards</button></li>
              <li><button onClick={() => navigate('/shop')} className="hover:text-electric transition-colors">Mice</button></li>
              <li><button onClick={() => navigate('/shop')} className="hover:text-electric transition-colors">Audio</button></li>
              <li><button onClick={() => navigate('/shop')} className="hover:text-electric transition-colors">Accessories</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-4 md:mb-6">Support</h4>
            <ul className="space-y-3 md:space-y-4 text-gray-500">
              <li><a href="#" className="hover:text-electric transition-colors">Warranty Info</a></li>
              <li><a href="#" className="hover:text-electric transition-colors">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-4 md:mb-6">Store</h4>
            <ul className="space-y-3 md:space-y-4 text-gray-500">
              <li><a href="#" className="hover:text-electric transition-colors">About Midnight</a></li>
              <li><a href="#" className="hover:text-electric transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-electric transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-electric transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-6 md:pt-8 border-t border-gray-900 text-gray-600 text-[10px] md:text-xs">
          <p className="mb-4 md:mb-0 text-center md:text-left">&copy; {new Date().getFullYear()} Midnight Hardware. All rights reserved.</p>
          <div className="flex gap-4 sm:gap-6">
            <span className="hover:text-white cursor-pointer transition-colors uppercase tracking-widest font-bold">Twitter</span>
            <span className="hover:text-white cursor-pointer transition-colors uppercase tracking-widest font-bold">Instagram</span>
            <span className="hover:text-white cursor-pointer transition-colors uppercase tracking-widest font-bold">Discord</span>
          </div>
        </div>
      </footer>

    </div>
  );
}