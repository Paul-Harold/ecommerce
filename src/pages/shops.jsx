import { useState, useEffect } from 'react';
import HeartIcon from '../components/HeartIcon.jsx';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../libs/supabase.js';
import { useCart } from '../context/CartContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';

export default function Shops() {
  const navigate = useNavigate(); 
  const { activePromo } = useCart(); 
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Featured');
  
  const [cmsContent, setCmsContent] = useState({
    hero_title: 'Midnight <span class="text-electric">Arsenal</span>',
    hero_subtitle: 'Equip yourself with precision-engineered hardware.'
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: cmsData, error: cmsError } = await supabase
          .from('site_content')
          .select('*')
          .eq('page_name', 'shop')
          .single();
          
        if (!cmsError && cmsData) {
          setCmsContent(cmsData);
        }

        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*');
          
        if (prodError) throw prodError;
        if (prodData) setProducts(prodData);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const isNewRelease = (createdAt) => {
    if (!createdAt) return false;
    const addedDate = new Date(createdAt);
    const now = new Date();
    const diffInTime = now.getTime() - addedDate.getTime();
    const diffInDays = diffInTime / (1000 * 3600 * 24);
    return diffInDays <= 14; 
  };

  const getDiscountInfo = (product) => {
    if (!activePromo) return null;

    let isEligible = false;
    if (activePromo.title.includes('Acoustic') && product.category === 'Headset') isEligible = true;
    else if (activePromo.title.includes('Vanguard') && (product.category === 'Keyboard' || product.category === 'Surfaces')) isEligible = true;
    else if (activePromo.title.includes('Ghost') && ['Mouse', 'Keyboard', 'Surfaces'].includes(product.category)) isEligible = true;

    if (isEligible) {
      const discountAmount = product.price * (activePromo.discount_percent / 100);
      return {
        newPrice: (product.price - discountAmount).toFixed(2),
        percent: activePromo.discount_percent
      };
    }
    return null;
  };

  const categories = ['All', 'Mouse', 'Keyboard', 'Headset', 'Microphones'];

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(item => item.category === activeCategory);

  const sortedAndFilteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    if (sortBy === 'Newest Arrivals') return new Date(b.created_at) - new Date(a.created_at);
    return 0; 
  });

  const featuredProduct = products.length > 0 ? products[0] : null;

  return (
    <div className="min-h-screen bg-midnight text-white pt-10 pb-24 px-6">
      <div className="max-w-[1400px] mx-auto">
        
        <div className="mb-10">
          <h1 
            className="text-4xl md:text-6xl font-black uppercase tracking-widest mb-4"
            dangerouslySetInnerHTML={{ __html: cmsContent.hero_title }}
          ></h1>
          <p className="text-gray-400 text-lg">{cmsContent.hero_subtitle}</p>
          
          {activePromo && (
            <div className="mt-6 inline-block bg-ion/10 border border-ion/30 text-ion px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(57,255,20,0.2)]">
              Active Link: {activePromo.title} ({activePromo.discount_percent}% Applied to Eligible Gear)
            </div>
          )}
        </div>

        {!isLoading && featuredProduct && activeCategory === 'All' && (
          <div 
            onClick={() => navigate(`/product/${featuredProduct.id}`)}
            className="mb-16 group relative bg-gradient-to-r from-gray-900 to-[#0f1115] border border-electric/30 rounded-2xl overflow-hidden cursor-pointer shadow-[0_0_40px_rgba(64,224,255,0.1)] hover:shadow-[0_0_60px_rgba(64,224,255,0.2)] transition-all duration-500 flex flex-col md:flex-row items-center"
          >
            <div className="p-8 md:p-16 md:w-1/2 flex flex-col justify-center relative z-10 order-2 md:order-1">
              <div className="inline-block px-4 py-1 bg-electric/10 text-electric border border-electric/30 rounded-full text-xs font-bold uppercase tracking-widest mb-6 w-max">
                Featured Flagship
              </div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-white mb-4 line-clamp-2">
                {featuredProduct.name}
              </h2>
              <p className="text-gray-400 mb-8 max-w-md line-clamp-3">
                {featuredProduct.description || "Experience uncompromising performance with our flagship gear."}
              </p>
              <div className="flex items-center gap-6">
                {getDiscountInfo(featuredProduct) ? (
                  <div className="flex flex-col">
                    <span className="text-gray-500 line-through text-lg">${featuredProduct.price}</span>
                    <span className="text-3xl font-black text-ion">${getDiscountInfo(featuredProduct).newPrice}</span>
                  </div>
                ) : (
                  <span className="text-3xl font-black text-electric">${featuredProduct.price}</span>
                )}
                <button className="bg-white text-midnight font-bold py-3 px-8 rounded hover:bg-electric hover:text-midnight transition-all duration-300 uppercase tracking-wider flex items-center gap-2">
                  View Specs <span className="text-xl leading-none">→</span>
                </button>
              </div>
            </div>
            <div className="md:w-1/2 h-64 md:h-[400px] w-full relative order-1 md:order-2 bg-[#0B0D10] flex items-center justify-center p-8">
              <div className="absolute inset-0 bg-electric/5 group-hover:bg-electric/10 transition-colors duration-500"></div>
              <img 
                src={featuredProduct.image} 
                alt={featuredProduct.name} 
                className="max-h-full max-w-full object-contain relative z-10 transition-transform duration-700 group-hover:scale-110 drop-shadow-[0_0_30px_rgba(64,224,255,0.15)]"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-6 mb-12 gap-6">
          <div className="flex flex-wrap gap-3 md:gap-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 border ${
                  activeCategory === cat 
                    ? 'bg-electric text-midnight border-electric shadow-[0_0_15px_rgba(64,224,255,0.4)]' 
                    : 'bg-transparent text-gray-400 border-gray-700 hover:border-electric hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm uppercase tracking-widest font-bold">Sort By:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#0f1115] border border-gray-700 text-white text-sm rounded px-4 py-2 focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric cursor-pointer"
            >
              <option>Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest Arrivals</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
             <div className="w-12 h-12 border-4 border-gray-800 border-t-electric rounded-full animate-spin mb-4"></div>
             <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">Loading Arsenal...</p>
          </div>
        ) : sortedAndFilteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedAndFilteredProducts.map((product) => {
              
              const discountInfo = getDiscountInfo(product);

              return (
                <div 
                  key={product.id} 
                  onClick={() => navigate(`/product/${product.id}`)}
                  className={`group bg-[#0f1115] border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg ${
                    discountInfo ? 'border-ion/50 hover:border-ion hover:shadow-[0_10px_40px_-10px_rgba(57,255,20,0.2)]' : 'border-gray-800 hover:border-electric hover:shadow-[0_10px_40px_-10px_rgba(64,224,255,0.15)]'
                  }`}
                >
                  <div className="relative h-72 bg-gray-900 overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url(${product.image})` }}
                    ></div>

                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                      {isNewRelease(product.created_at) && (
                        <span className="bg-electric text-midnight text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded shadow-[0_0_10px_rgba(64,224,255,0.3)] w-max">
                          New
                        </span>
                      )}
                      
                      {discountInfo && (
                        <span className="bg-ion text-midnight text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded shadow-[0_0_10px_rgba(57,255,20,0.3)] w-max animate-pulse">
                          {discountInfo.percent}% OFF
                        </span>
                      )}
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        toggleFavorite(product);
                      }}
                      className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:text-electric transition-all duration-300 focus:outline-none"
                    >
                      <HeartIcon 
                        isFilled={isFavorite(product.id)} 
                        className={`w-5 h-5 transition-colors ${isFavorite(product.id) ? "text-electric" : ""}`} 
                      />
                    </button>
                    
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                      <button className="bg-electric text-midnight font-bold py-3 px-8 rounded hover:bg-white transition-all duration-300 uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 pointer-events-auto">
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">{product.category}</p>
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{product.name}</h3>
                    
                    {discountInfo ? (
                      <div className="flex items-center gap-3 mt-4">
                        <span className="text-gray-500 line-through text-sm font-bold">${product.price}</span>
                        <span className="text-ion font-black text-xl">${discountInfo.newPrice}</span>
                      </div>
                    ) : (
                      <p className="text-electric font-bold text-lg mt-4">${product.price}</p>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 border border-dashed border-gray-800 rounded-xl">
            <p className="text-gray-500 text-xl font-bold uppercase tracking-widest">No gear found in this category.</p>
          </div>
        )}

      </div>
    </div>
  );
}