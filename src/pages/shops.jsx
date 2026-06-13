import { useState, useEffect, useRef } from 'react';
import HeartIcon from '../components/HeartIcon.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../libs/supabase.js';
import { useCart } from '../context/CartContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';

export default function Shops() {
  const navigate = useNavigate(); 
  const location = useLocation();
  
  const { activePromo, addToCart, setIsCartOpen } = useCart(); 
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Featured');
  
  // Carousel State & Refs for Dragging/Swiping
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  
  const [cmsContent, setCmsContent] = useState({
    hero_title: 'Shop the <span class="text-electric">Collection</span>',
    hero_subtitle: 'Precision-engineered gear for every setup.',
    carousel_ids: []
  });

  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search') || '';

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: cmsData, error: cmsError } = await supabase
          .from('site_content')
          .select('*')
          .eq('page_name', 'shop')
          .maybeSingle();
          
        if (!cmsError && cmsData) {
          setCmsContent({
            hero_title: cmsData.hero_title || 'Shop the <span class="text-electric">Collection</span>',
            hero_subtitle: cmsData.hero_subtitle || 'Precision-engineered gear for every setup.',
            carousel_ids: cmsData.content_data?.carousel_ids || []
          });
        }

        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (prodError) throw prodError;
        if (prodData) setProducts(prodData);
      } catch (error) {
        console.error(error.message);
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
    const diffInDays = (now.getTime() - addedDate.getTime()) / (1000 * 3600 * 24);
    return diffInDays <= 14; 
  };

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

  const handleAddToCart = (e, product) => {
    e.stopPropagation(); 
    const discountInfo = getDiscountInfo(product);
    const finalPrice = discountInfo ? parseFloat(discountInfo.newPrice) : parseFloat(product.price);

    addToCart({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: product.image,
      quantity: 1
    });
    setIsCartOpen(true);
  };

  const categories = ['All', 'Mouse', 'Keyboard', 'Headset', 'Microphones'];

  const filteredProducts = products.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedAndFilteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    if (sortBy === 'Newest Arrivals') return new Date(b.created_at) - new Date(a.created_at);
    return 0; 
  });

  // --- CAROUSEL LOGIC & CONTROLS ---
  let carouselProducts = [];
  if (products.length > 0) {
    if (cmsContent.carousel_ids && cmsContent.carousel_ids.length > 0) {
      carouselProducts = cmsContent.carousel_ids
        .map(id => products.find(p => String(p.id) === String(id)))
        .filter(Boolean);
      
      if (carouselProducts.length < 3) {
        const pickedIds = carouselProducts.map(p => p.id);
        const fillers = products.filter(p => !pickedIds.includes(p.id)).slice(0, 3 - carouselProducts.length);
        carouselProducts = [...carouselProducts, ...fillers];
      }
    } else {
      carouselProducts = products.slice(0, 3);
    }
  }

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselProducts.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselProducts.length) % carouselProducts.length);

  // Auto-slide effect (Pauses on hover/interaction)
  useEffect(() => {
    if (carouselProducts.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselProducts.length);
    }, 5000); 
    return () => clearInterval(timer);
  }, [carouselProducts.length, isPaused]);

  // Swipe & Drag Handlers
  const handleDragStart = (e) => {
    touchStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };
  
  const handleDragMove = (e) => {
    if (!touchStartX.current) return;
    touchEndX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };
  
  const handleDragEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
    
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="min-h-screen bg-midnight text-white flex flex-col">
      <div className="flex-grow pt-8 md:pt-10 pb-16 md:pb-24 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          
          {/* Header Section */}
          <div className="mb-8 md:mb-10">
            <h1 
              className="text-3xl md:text-6xl font-black uppercase tracking-widest mb-3 md:mb-4 leading-tight"
              dangerouslySetInnerHTML={{ __html: cmsContent.hero_title }}
            ></h1>
            <p className="text-gray-400 text-sm md:text-lg">{cmsContent.hero_subtitle}</p>
            
            {activePromo && (
              <div className="mt-4 md:mt-6 inline-block bg-ion/10 border border-ion/30 text-ion px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                Promo Active: {activePromo.title} — {activePromo.discount_percent}% off eligible gear
              </div>
            )}
          </div>

          {/* Dynamic Interactive Carousel Section */}
          {!isLoading && carouselProducts.length > 0 && activeCategory === 'All' && !searchQuery && (
            <div 
              className="mb-10 md:mb-16 relative rounded-2xl overflow-hidden border border-electric/30 shadow-[0_0_40px_rgba(64,224,255,0.1)] bg-gradient-to-r from-gray-900 to-[#0f1115]"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeaveCapture={handleDragEnd} // Failsafe if cursor leaves component while dragging
            >
              
              {/* Carousel Track */}
              <div 
                className="flex transition-transform duration-700 ease-in-out cursor-grab active:cursor-grabbing"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {carouselProducts.map((slideProduct, index) => (
                  <div 
                    key={slideProduct.id}
                    className="w-full shrink-0 flex flex-col md:flex-row items-center md:hover:shadow-[0_0_60px_rgba(64,224,255,0.2)] transition-shadow duration-500 group select-none"
                  >
                    <div className="p-6 sm:p-8 md:p-16 md:w-1/2 flex flex-col justify-center relative z-10 order-2 md:order-1 w-full">
                      <div className="inline-block px-3 md:px-4 py-1 bg-electric/10 text-electric border border-electric/30 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6 w-max">
                        {index === 0 && cmsContent.carousel_ids.length > 0 ? "Featured Flagship" : "Trending Gear"}
                      </div>
                      <h2 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-widest text-white mb-3 md:mb-4 line-clamp-2 leading-tight">
                        {slideProduct.name}
                      </h2>
                      <p className="text-gray-400 text-sm md:text-base mb-6 md:mb-8 max-w-md line-clamp-3">
                        {slideProduct.description || "Experience uncompromising performance with our top-tier gear."}
                      </p>
                      
                      <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
                        {getDiscountInfo(slideProduct) ? (
                          <div className="flex flex-col">
                            <span className="text-gray-500 line-through text-sm md:text-lg">₱{slideProduct.price}</span>
                            <span className="text-2xl md:text-3xl font-black text-ion">₱{getDiscountInfo(slideProduct).newPrice}</span>
                          </div>
                        ) : (
                          <span className="text-2xl md:text-3xl font-black text-electric">₱{slideProduct.price}</span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 w-full">
                        <button 
                          onClick={(e) => handleAddToCart(e, slideProduct)}
                          className="w-full sm:w-auto justify-center bg-electric text-midnight font-bold py-3.5 md:py-3 px-8 rounded hover:bg-white transition-all duration-300 uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(64,224,255,0.4)] text-xs md:text-sm"
                        >
                          Add to Cart
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${slideProduct.id}`);
                          }}
                          className="w-full sm:w-auto justify-center bg-transparent border border-gray-600 md:border-white text-white font-bold py-3.5 md:py-3 px-8 rounded hover:bg-white hover:text-midnight transition-all duration-300 uppercase tracking-wider flex items-center gap-2 text-xs md:text-sm"
                        >
                          View Specs
                        </button>
                      </div>
                    </div>
                    
                    <div className="md:w-1/2 h-56 sm:h-64 md:h-[400px] w-full relative order-1 md:order-2 bg-[#0B0D10] flex items-center justify-center p-6 md:p-8 pointer-events-none">
                      <div className="absolute inset-0 bg-electric/5 md:group-hover:bg-electric/10 transition-colors duration-500"></div>
                      <img 
                        src={slideProduct.image} 
                        alt={slideProduct.name} 
                        className="max-h-full max-w-full object-contain relative z-10 transition-transform duration-700 md:group-hover:scale-110 drop-shadow-[0_0_30px_rgba(64,224,255,0.15)]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              {carouselProducts.length > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-electric border border-gray-700 hover:border-electric text-white hover:text-midnight p-2 md:p-3 rounded-full transition-all duration-300 z-20 backdrop-blur-sm shadow-lg"
                    aria-label="Previous Slide"
                  >
                    <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-electric border border-gray-700 hover:border-electric text-white hover:text-midnight p-2 md:p-3 rounded-full transition-all duration-300 z-20 backdrop-blur-sm shadow-lg"
                    aria-label="Next Slide"
                  >
                    <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </>
              )}

              {/* Carousel Navigation Dots */}
              {carouselProducts.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20 md:justify-start md:left-16">
                  {carouselProducts.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide(idx);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentSlide === idx ? 'w-8 bg-electric' : 'w-2 bg-gray-600 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Filtering and Sorting Bar */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-800 pb-4 md:pb-6 mb-8 md:mb-12 gap-4 md:gap-6">
            
            <div className="flex flex-row overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 gap-2 md:gap-3 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-4 py-2 md:px-6 md:py-2 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-wider transition-all duration-300 border ${
                    activeCategory === cat 
                      ? 'bg-electric text-midnight border-electric shadow-[0_0_15px_rgba(64,224,255,0.4)]' 
                      : 'bg-transparent text-gray-400 border-gray-700 hover:border-electric hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}

              {searchQuery && (
                <button
                  onClick={() => {
                    setActiveCategory('All');
                    navigate('/shop');
                  }}
                  className="shrink-0 px-4 py-2 md:px-6 md:py-2 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-wider transition-all duration-300 border bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500 hover:text-white flex items-center gap-1 md:gap-2"
                >
                  Clear Search: "{searchQuery}" <span className="text-sm md:text-lg leading-none">×</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between w-full lg:w-auto gap-3 border-t border-gray-800 lg:border-none pt-4 lg:pt-0">
              <span className="text-gray-500 text-[10px] md:text-sm uppercase tracking-widest font-bold whitespace-nowrap">Sort By:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full lg:w-auto bg-[#0f1115] border border-gray-700 text-white text-[10px] md:text-sm rounded px-3 py-2 md:px-4 md:py-2 focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric cursor-pointer"
              >
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-24">
               <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-gray-800 border-t-electric rounded-full animate-spin mb-4"></div>
               <p className="text-gray-500 font-bold tracking-widest uppercase text-[10px] md:text-sm">Loading products...</p>
            </div>
          ) : sortedAndFilteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
              {sortedAndFilteredProducts.map((product) => {
                const discountInfo = getDiscountInfo(product);

                return (
                  <div 
                    key={product.id} 
                    onClick={() => navigate(`/product/${product.id}`)}
                    className={`group bg-[#0f1115] border rounded-xl overflow-hidden transition-all duration-300 md:hover:-translate-y-1 cursor-pointer shadow-lg flex flex-col ${
                      discountInfo ? 'border-ion/50 hover:border-ion md:hover:shadow-[0_10px_40px_-10px_rgba(57,255,20,0.2)]' : 'border-gray-800 hover:border-electric md:hover:shadow-[0_10px_40px_-10px_rgba(64,224,255,0.15)]'
                    }`}
                  >
                    <div className="relative h-56 sm:h-64 md:h-72 bg-gray-900 overflow-hidden shrink-0">
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 md:group-hover:scale-110 p-4"
                        style={{ backgroundImage: `url(${product.image})` }}
                      ></div>

                      <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20 flex flex-col gap-2">
                        {isNewRelease(product.created_at) && (
                          <span className="bg-electric text-midnight text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 md:px-3 md:py-1 rounded shadow-[0_0_10px_rgba(64,224,255,0.3)] w-max">
                            New
                          </span>
                        )}
                        
                        {discountInfo && (
                          <span className="bg-ion text-midnight text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 md:px-3 md:py-1 rounded shadow-[0_0_10px_rgba(57,255,20,0.3)] w-max animate-pulse">
                            {discountInfo.percent}% OFF
                          </span>
                        )}
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); 
                          toggleFavorite(product);
                        }}
                        className="absolute top-3 right-3 md:top-4 md:right-4 z-20 p-2 md:p-2.5 rounded-full bg-black/40 backdrop-blur-sm text-white hover:text-electric transition-all duration-300 focus:outline-none"
                      >
                        <HeartIcon 
                          isFilled={isFavorite(product.id)} 
                          className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${isFavorite(product.id) ? "text-electric" : ""}`} 
                        />
                      </button>
                      
                      <div className="hidden md:flex absolute inset-0 bg-black/60 flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                        <button 
                          onClick={(e) => handleAddToCart(e, product)}
                          className="w-3/4 bg-electric text-midnight font-bold py-3 px-4 rounded hover:bg-white transition-all duration-300 uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 pointer-events-auto text-xs shadow-[0_0_10px_rgba(64,224,255,0.3)]"
                        >
                          Add to Cart
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.id}`);
                          }}
                          className="w-3/4 bg-transparent border border-white text-white font-bold py-2 px-4 rounded hover:bg-white hover:text-midnight transition-all duration-300 uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 pointer-events-auto text-xs"
                        >
                          Details
                        </button>
                      </div>
                    </div>

                    <div className="p-4 md:p-6 flex flex-col flex-1 justify-between">
                      <div>
                        <p className="text-gray-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-1 md:mb-2">{product.category}</p>
                        <h3 className="text-sm md:text-xl font-bold text-white mb-2 line-clamp-1">{product.name}</h3>
                      </div>
                      
                      <div>
                        {discountInfo ? (
                          <div className="flex items-center gap-2 md:gap-3 mt-2 md:mt-4">
                            <span className="text-gray-500 line-through text-xs md:text-sm font-bold">₱{product.price}</span>
                            <span className="text-ion font-black text-lg md:text-xl">₱{discountInfo.newPrice}</span>
                          </div>
                        ) : (
                          <p className="text-electric font-bold text-base md:text-lg mt-2 md:mt-4">₱{product.price}</p>
                        )}

                        <button 
                          onClick={(e) => handleAddToCart(e, product)}
                          className="md:hidden w-full mt-4 bg-gray-800/50 text-white border border-gray-700 hover:bg-electric hover:text-midnight hover:border-electric font-bold py-2.5 rounded uppercase tracking-widest text-[10px] active:bg-electric active:text-midnight transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Quick Add
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 md:py-24 border border-dashed border-gray-800 rounded-xl px-4">
              <p className="text-gray-500 text-base md:text-xl font-bold uppercase tracking-widest mb-2">No products found.</p>
              <p className="text-gray-600 text-xs md:text-sm">Try a different search or category, like "Mouse" or "Keyboard".</p>
            </div>
          )}

        </div>
      </div>

      <footer className="bg-[#050608] w-full pt-12 md:pt-16 pb-6 md:pb-8 px-4 sm:px-6 border-t border-gray-900 text-xs md:text-sm mt-auto">
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