import { useCart } from '../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function CartMenu() {
  // Added updateQuantity to the destructuring
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, activePromo, updateQuantity } = useCart();
  const navigate = useNavigate();

  // 1. Base Subtotal (Accounts for individual item markdowns from the database)
  const subtotal = cartItems.reduce((total, item) => {
    const markdown = item.discount_percent || 0;
    const effectivePrice = item.price * (1 - (markdown / 100));
    return total + (effectivePrice * item.quantity);
  }, 0);
  
  // 2. The Smart Global Promo Engine (Applies ON TOP of the subtotal)
  let globalDiscountAmount = 0;
  if (activePromo) {
    cartItems.forEach(item => {
      let isEligible = false;
      if (activePromo.title.includes('Acoustic') && item.category === 'Headset') isEligible = true;
      else if (activePromo.title.includes('Vanguard') && (item.category === 'Keyboard' || item.category === 'Surfaces')) isEligible = true;
      else if (activePromo.title.includes('Ghost') && ['Mouse', 'Keyboard', 'Surfaces'].includes(item.category)) isEligible = true;

      if (isEligible) {
        // Calculate the cut based on the ALREADY discounted price
        const markdown = item.discount_percent || 0;
        const effectivePrice = item.price * (1 - (markdown / 100));
        globalDiscountAmount += (effectivePrice * item.quantity) * (activePromo.discount_percent / 100);
      }
    });
  }

  const finalTotal = subtotal - globalDiscountAmount;

  // Navigation Helper
  const goToDetails = (id) => {
    setIsCartOpen(false);
    navigate(`/product/${id}`);
  };

  // Quantity Helper
  const handleQuantityChange = (id, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty >= 1 && updateQuantity) {
      updateQuantity(id, newQty);
    }
  };

  return (
    <>
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity"
          onClick={() => setIsCartOpen(false)}
        ></div>
      )}

      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#0f1115] border-l border-gray-800 z-[70] transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-black uppercase tracking-widest text-white">
            Shopping <span className="text-electric">Cart</span>
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-white transition-colors p-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
              <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="font-bold uppercase tracking-widest text-sm text-gray-400">Your cart is empty</p>
            </div>
          ) : (
            cartItems.map((item) => {
              // Calculate specific item display math
              const itemMarkdown = item.discount_percent || 0;
              const effectivePrice = item.price * (1 - (itemMarkdown / 100));
              const rawTotal = item.price * item.quantity;
              const effectiveTotal = effectivePrice * item.quantity;

              return (
                <div key={item.id} className="flex gap-4 bg-gray-900/50 p-3 rounded-lg border border-gray-800/50 relative overflow-hidden group">
                  
                  {/* Subtle glow if item is on sale */}
                  {itemMarkdown > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-ion"></div>}

                  {/* Clickable Image */}
                  <div 
                    onClick={() => goToDetails(item.id)}
                    className="cursor-pointer shrink-0 relative overflow-hidden rounded bg-gray-900 z-10 w-20 h-20 flex items-center justify-center border border-gray-800 hover:border-electric transition-colors"
                  >
                    <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center z-10 py-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{item.category}</p>
                    
                    {/* Clickable Title */}
                    <h3 
                      onClick={() => goToDetails(item.id)}
                      className="text-sm font-bold text-white mb-2 line-clamp-1 cursor-pointer hover:text-electric transition-colors"
                    >
                      {item.name}
                    </h3>
                    
                    <div className="flex items-center justify-between mt-auto">
                      
                      {/* Quantity Editor */}
                      <div className="flex items-center bg-[#0B0D10] border border-gray-700 rounded overflow-hidden">
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          className="px-2.5 py-1 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono font-bold px-2 w-6 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          className="px-2.5 py-1 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Show slashed price if item has individual markdown */}
                      {itemMarkdown > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 line-through text-[10px]">₱{rawTotal.toFixed(2)}</span>
                          <span className="text-ion font-bold text-sm">₱{effectiveTotal.toFixed(2)}</span>
                        </div>
                      ) : (
                        <p className="text-white font-bold text-sm">₱{rawTotal.toFixed(2)}</p>
                      )}
                    </div>
                  </div>

                  <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-red-500 transition-colors p-2 flex items-start z-10 shrink-0" title="Remove Item">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-800 bg-[#0B0D10]">
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 uppercase tracking-widest text-sm font-bold">Subtotal</span>
                <span className="text-white font-bold">₱{subtotal.toFixed(2)}</span>
              </div>
              
              {activePromo && globalDiscountAmount > 0 && (
                <div className="flex items-center justify-between text-ion">
                  <span className="uppercase tracking-widest text-sm font-black line-clamp-1 pr-4">
                    {activePromo.title} ({activePromo.discount_percent}%)
                  </span>
                  <span className="font-black whitespace-nowrap">-₱{globalDiscountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-800/50">
                <span className="text-gray-300 uppercase tracking-widest text-sm font-black">Total</span>
                <span className="text-2xl font-black text-electric">₱{finalTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <button onClick={() => { setIsCartOpen(false); navigate('/checkout'); }} className="w-full bg-electric text-midnight font-black uppercase tracking-widest py-4 rounded hover:bg-white hover:shadow-[0_0_20px_#40E0FF] transition-all duration-300">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}