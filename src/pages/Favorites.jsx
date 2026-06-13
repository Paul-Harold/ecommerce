import { useFavorites } from '../context/FavoritesContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import HeartIcon from '../components/HeartIcon.jsx';

export default function Favorites() {
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart, activePromo } = useCart();
  const navigate = useNavigate();

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

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-midnight flex flex-col items-center justify-center text-white px-4 sm:px-6">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-3 md:mb-4 text-center">No Saved Items</h2>
        <p className="text-gray-500 mb-6 md:mb-8 text-center max-w-md text-sm md:text-base">You haven't added any gear to your favorites yet.</p>
        <Link to="/shop" className="text-electric hover:text-midnight hover:bg-electric transition-colors uppercase tracking-widest text-xs md:text-sm font-bold border border-electric/30 px-6 py-3 md:py-4 rounded w-full sm:w-auto text-center">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight text-white pt-8 md:pt-10 pb-16 md:pb-24 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8 md:mb-12 border-b border-gray-800 pb-4 md:pb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-widest mb-2 md:mb-4">
            Saved <span className="text-electric">Hardware</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base lg:text-lg">Your saved items, ready whenever you are.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {favorites.map((product) => {
            const discountInfo = getDiscountInfo(product);

            return (
              <div 
                key={product.id} 
                onClick={() => navigate(`/product/${product.id}`)}
                className={`group bg-[#0f1115] border rounded-xl overflow-hidden transition-all duration-300 lg:hover:-translate-y-1 cursor-pointer shadow-lg flex flex-col ${
                  discountInfo ? 'border-ion/50 hover:border-ion' : 'border-gray-800 hover:border-electric'
                }`}
              >
                <div className="relative h-56 sm:h-64 md:h-72 bg-gray-900 overflow-hidden shrink-0">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 lg:group-hover:scale-110"
                    style={{ backgroundImage: `url(${product.image})` }}
                  ></div>

                  <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20 flex flex-col gap-2">
                    {discountInfo && (
                      <span className="bg-ion text-midnight text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 md:px-3 py-1 rounded shadow-[0_0_10px_rgba(57,255,20,0.3)] animate-pulse">
                        {discountInfo.percent}% OFF
                      </span>
                    )}
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      toggleFavorite(product);
                    }}
                    className="absolute top-3 right-3 md:top-4 md:right-4 z-20 p-2 rounded-full bg-black/40 backdrop-blur-sm text-electric hover:text-white transition-all duration-300"
                  >
                    <HeartIcon isFilled={true} className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  
                  {/* Desktop Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 items-center justify-center opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 z-10 hidden lg:flex">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="bg-electric text-midnight font-bold py-3 px-8 rounded hover:bg-white transition-all duration-300 uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>

                <div className="p-4 md:p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 md:mb-2">{product.category}</p>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2 line-clamp-1">{product.name}</h3>
                    
                    {discountInfo ? (
                      <div className="flex items-center gap-2 md:gap-3 mt-2 md:mt-4">
                        <span className="text-gray-500 line-through text-xs md:text-sm font-bold">₱{product.price}</span>
                        <span className="text-ion font-black text-lg md:text-xl">₱{discountInfo.newPrice}</span>
                      </div>
                    ) : (
                      <p className="text-electric font-bold text-base md:text-lg mt-2 md:mt-4">₱{product.price}</p>
                    )}
                  </div>

                  {/* Mobile Add to Cart Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    className="lg:hidden w-full mt-4 bg-electric/10 border border-electric/30 text-electric hover:bg-electric hover:text-midnight font-bold py-3 px-4 rounded transition-all duration-300 uppercase tracking-widest text-xs"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}