import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../libs/supabase.js';
import { useCart } from '../context/CartContext.jsx';

export default function Offers() {
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  
  const [bundles, setBundles] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [now, setNow] = useState(new Date());

  const [cmsContent, setCmsContent] = useState({
    hero_title: 'Active <span class="text-electric">Directives</span>',
    hero_subtitle: 'Classified promotions, bundles, and limited-time hardware drops.',
    hero_image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070'
  });

  useEffect(() => {
    async function fetchOffersData() {
      try {
        const { data: cmsData } = await supabase.from('site_content').select('*').eq('page_name', 'offers').single();
        if (cmsData) {
          setCmsContent({
            hero_title: cmsData.hero_title || cmsContent.hero_title,
            hero_subtitle: cmsData.hero_subtitle || cmsContent.hero_subtitle,
            hero_image_url: cmsData.hero_image_url || cmsContent.hero_image_url
          });
        }

        const { data: promoData, error: promoError } = await supabase.from('promotions').select('*').eq('type', 'bundle').eq('is_active', true).order('created_at', { ascending: false });
        if (promoError) throw promoError;

        const { data: productData, error: productError } = await supabase.from('products').select('*');
        if (productError) throw productError;

        if (promoData && productData) {
          const hydratedBundles = promoData.map(bundle => {
            const items = (bundle.bundle_ids || []).map(id => productData.find(p => String(p.id) === String(id))).filter(Boolean);
            const originalValue = items.reduce((sum, item) => sum + parseFloat(item.price), 0);
            return { ...bundle, items, originalValue };
          });

          setBundles(hydratedBundles);
          setSaleProducts(productData.filter(p => p.discount_percent > 0));
        }
      } catch (error) {
        console.error("Error fetching offers data:", error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOffersData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeLeft = (dateString) => {
    if (!dateString) return null;
    const target = new Date(dateString).getTime();
    const current = now.getTime();
    const diff = target - current;

    if (diff <= 0) return '00:00:00';

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const paddedH = String(h).padStart(2, '0');
    const paddedM = String(m).padStart(2, '0');
    const paddedS = String(s).padStart(2, '0');

    if (d > 0) return `${d}d ${paddedH}:${paddedM}:${paddedS}`;
    return `${paddedH}:${paddedM}:${paddedS}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-800 border-t-electric rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight text-white pt-10 pb-24 px-6">
      <div className="max-w-[1400px] mx-auto">
        
        <div className="relative h-[40vh] flex flex-col items-center justify-center p-6 bg-cover bg-center mb-16 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl" style={{ backgroundImage: `url('${cmsContent.hero_image_url}')` }}>
          <div className="absolute inset-0 bg-[#0B0D10]/80 z-0 backdrop-blur-sm"></div>
          <div className="text-center max-w-3xl relative z-10 border border-gray-800 bg-[#0f1115]/50 p-8 md:p-12 rounded-2xl backdrop-blur-md">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest mb-4" dangerouslySetInnerHTML={{ __html: cmsContent.hero_title }}></h1>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed">{cmsContent.hero_subtitle}</p>
          </div>
        </div>

        {bundles.length > 0 && (
          <>
            <h3 className="text-2xl font-black uppercase tracking-widest mb-6 text-white border-b border-gray-800 pb-4">
              Tactical <span className="text-ion">Bundles</span>
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {bundles.map(bundle => (
                <div key={bundle.id} className="bg-[#0f1115] border border-ion/30 rounded-xl overflow-hidden group flex flex-col sm:flex-row hover:border-ion hover:shadow-[0_10px_40px_-10px_rgba(57,255,20,0.15)] transition-all duration-300">
                  
                  <div className="sm:w-2/5 bg-gray-900 relative min-h-[250px] overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" style={{ backgroundImage: `url('${bundle.image_url}')` }}></div>
                    <div className="absolute top-4 left-4 bg-ion text-midnight text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-[0_0_15px_rgba(57,255,20,0.5)]">Complete Setup</div>
                    
                    {bundle.expires_at && (
                      <div className="absolute bottom-4 left-4 bg-black/80 text-white font-mono text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded border border-gray-700 backdrop-blur w-max">
                        Ends in: <span className="text-ion">{formatTimeLeft(bundle.expires_at)}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 sm:w-3/5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-2xl font-black uppercase tracking-widest text-white mb-2">{bundle.title}</h4>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{bundle.description}</p>
                      <div className="space-y-2 mb-6">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Included Hardware:</p>
                        {bundle.items.map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-gray-900/50 px-3 py-2 rounded border border-gray-800">
                            <span className="text-sm text-gray-300">[{item.category}] {item.name}</span>
                            <span className="text-xs text-gray-500">${item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between mt-auto">
                      <div>
                        <p className="text-gray-500 line-through text-sm font-bold">${bundle.originalValue.toFixed(2)}</p>
                        <p className="text-ion font-black text-2xl">${parseFloat(bundle.bundle_price).toFixed(2)}</p>
                      </div>
                      <button 
                        onClick={() => { 
                          addToCart({
                            id: `bundle-${bundle.id}`,
                            name: bundle.title,
                            price: bundle.bundle_price,
                            image: bundle.image_url,
                            category: 'Bundle',
                            quantity: 1
                          }); 
                          setIsCartOpen(true);
                        }} 
                        className="bg-ion/10 text-ion border border-ion/30 hover:bg-ion hover:text-midnight font-bold uppercase tracking-widest text-xs py-3 px-6 rounded transition-all"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {saleProducts.length > 0 && (
          <>
            <h3 className="text-2xl font-black uppercase tracking-widest mb-6 text-white border-b border-gray-800 pb-4">
              Individual <span className="text-ion">Markdowns</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {saleProducts.map(product => {
                const discountedPrice = (product.price - (product.price * (product.discount_percent / 100))).toFixed(2);
                return (
                  <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="group bg-[#0f1115] border border-ion/30 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-[0_0_20px_rgba(57,255,20,0.05)] hover:shadow-[0_10px_40px_-10px_rgba(57,255,20,0.2)] hover:border-ion flex flex-col relative">
                    <div className="relative h-56 bg-gray-900 overflow-hidden flex-shrink-0">
                      <div className="absolute inset-0 bg-contain bg-no-repeat bg-center transition-transform duration-500 group-hover:scale-110 p-4" style={{ backgroundImage: `url(${product.image})` }}></div>
                      <div className="absolute top-4 left-4 bg-ion text-midnight text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-[0_0_10px_rgba(57,255,20,0.3)] animate-pulse">{product.discount_percent}% OFF</div>
                      
                      {product.expires_at && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/90 text-white font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-gray-700 backdrop-blur w-max shadow-xl">
                          Ends: <span className="text-ion">{formatTimeLeft(product.expires_at)}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1 justify-between border-t border-gray-800/50">
                      <div>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">{product.category}</p>
                        <h3 className="text-sm font-bold text-white mb-2 line-clamp-1">{product.name}</h3>
                      </div>
                      <div className="flex items-center gap-3 mt-4">
                        <span className="text-gray-500 line-through text-xs font-bold">${product.price}</span>
                        <span className="text-ion font-black text-lg">${discountedPrice}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </div>
  );
}