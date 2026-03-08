import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../libs/supabase.js';
import { useCart } from '../context/CartContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import HeartIcon from '../components/HeartIcon.jsx';

export default function ProductDetails() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  // Pulling in everything needed from our contexts
  const { addToCart, setIsCartOpen, activePromo } = useCart(); 
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  // Reusing our smart discount engine for consistency
  const getDiscountInfo = (prod) => {
    let finalDiscount = 0;

    if (prod.discount_percent && prod.discount_percent > 0) {
      finalDiscount = prod.discount_percent;
    }

    if (activePromo) {
      let isEligible = false;
      if (activePromo.title.includes('Acoustic') && prod.category === 'Headset') isEligible = true;
      else if (activePromo.title.includes('Vanguard') && (prod.category === 'Keyboard' || prod.category === 'Surfaces')) isEligible = true;
      else if (activePromo.title.includes('Ghost') && ['Mouse', 'Keyboard', 'Surfaces'].includes(prod.category)) isEligible = true;

      if (isEligible && activePromo.discount_percent > finalDiscount) {
        finalDiscount = activePromo.discount_percent;
      }
    }

    if (finalDiscount > 0) {
      const discountAmount = prod.price * (finalDiscount / 100);
      return {
        newPrice: (prod.price - discountAmount).toFixed(2),
        percent: finalDiscount
      };
    }

    return null;
  };

  const handleAddToCart = () => {
    const discountInfo = getDiscountInfo(product);
    const finalPrice = discountInfo ? parseFloat(discountInfo.newPrice) : parseFloat(product.price);

    addToCart({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: product.image,
      quantity: quantity
    });
    
    // Automatically slide the cart open to confirm the action
    setIsCartOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-800 border-t-electric rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-midnight flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-black uppercase tracking-widest mb-4">Product Not Found</h2>
        <button onClick={() => navigate('/shop')} className="text-electric hover:text-white transition-colors uppercase tracking-widest text-sm font-bold">
          Return to Arsenal
        </button>
      </div>
    );
  }

  const discountInfo = getDiscountInfo(product);

  return (
    <div className="min-h-screen bg-midnight text-white pt-10 pb-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-electric transition-colors font-bold uppercase tracking-widest text-xs mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Shop
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* LEFT: Product Image */}
          <div className="bg-[#0f1115] border border-gray-800 rounded-2xl overflow-hidden p-8 flex items-center justify-center relative group min-h-[400px]">
            <div className="absolute inset-0 bg-electric/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Discount Badge */}
            {discountInfo && (
              <span className="absolute top-6 left-6 z-20 bg-ion text-midnight text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded shadow-[0_0_15px_rgba(57,255,20,0.3)] animate-pulse">
                {discountInfo.percent}% OFF
              </span>
            )}

            {/* Favorite Toggle */}
            <button 
              onClick={() => toggleFavorite(product)}
              className="absolute top-6 right-6 z-20 p-3 rounded-full bg-black/40 backdrop-blur-sm text-white hover:text-electric transition-all duration-300 focus:outline-none border border-gray-700 hover:border-electric"
            >
              <HeartIcon 
                isFilled={isFavorite(product.id)} 
                className={`w-6 h-6 transition-colors ${isFavorite(product.id) ? "text-electric" : ""}`} 
              />
            </button>

            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full max-w-md object-contain drop-shadow-[0_0_30px_rgba(64,224,255,0.15)] group-hover:scale-105 transition-transform duration-500 relative z-10"
            />
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex flex-col justify-center">
            
            <p className="text-electric text-xs font-bold uppercase tracking-widest mb-2">{product.category}</p>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              {discountInfo ? (
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 line-through text-2xl font-bold">${product.price}</span>
                  <span className="text-4xl font-black text-ion">${discountInfo.newPrice}</span>
                </div>
              ) : (
                <span className="text-4xl font-black text-white">${product.price}</span>
              )}
              
              <span className="bg-ion/10 text-ion border border-ion/30 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ml-2">
                In Stock - Ready to Ship
              </span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Quantity & Cart Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 border-t border-b border-gray-800 py-6">
              
              {/* Quantity Selector */}
              <div className="flex items-center bg-[#0B0D10] border border-gray-700 rounded-lg overflow-hidden shrink-0">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-5 py-4 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors font-bold text-lg"
                >-</button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-5 py-4 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors font-bold text-lg"
                >+</button>
              </div>

              {/* Fire handleAddToCart instead of direct context call */}
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-electric text-midnight font-black uppercase tracking-widest py-4 px-6 rounded-lg hover:bg-white hover:shadow-[0_0_20px_#40E0FF] transition-all duration-300 flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </button>
            </div>

            {/* Technical Specs */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4">Technical Specifications</h3>
              <ul className="space-y-3">
                <li className="flex justify-between text-sm border-b border-gray-800 pb-2">
                  <span className="text-gray-500 uppercase tracking-wider text-xs">Connectivity</span>
                  <span className="text-white font-bold">Ultra-Low Latency Wireless</span>
                </li>
                <li className="flex justify-between text-sm border-b border-gray-800 pb-2">
                  <span className="text-gray-500 uppercase tracking-wider text-xs">Warranty</span>
                  <span className="text-white font-bold">2-Year Midnight Guarantee</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}