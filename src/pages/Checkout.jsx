import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../libs/supabase.js';
import { useCart } from '../context/CartContext.jsx';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartItems, clearCart } = useCart() || {};
  
  const activeCart = cart || cartItems || [];
  
  const calculatedTotal = activeCart.reduce((sum, item) => {
    const itemPrice = parseFloat(item.price) || 0;
    const itemQty = parseInt(item.quantity) || 1;
    return sum + (itemPrice * itemQty);
  }, 0);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [voucherMessage, setVoucherMessage] = useState('');

  const [supportInfo, setSupportInfo] = useState({
    email: 'paulharold.batiles@gmail.com',
    phone: '09205278696',
    policy: '30-day money-back guarantee. All items must be returned in their original packaging.'
  });

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',
    address: '', city: '', zip: '', country: 'PH',
    cardNumber: '', expiry: '', cvc: ''
  });

  useEffect(() => {
    async function fetchSupportData() {
      try {
        const { data } = await supabase.from('site_content').select('content_data').eq('page_name', 'checkout').maybeSingle();
        if (data && data.content_data) {
          setSupportInfo(prev => ({
            email: data.content_data.support_email || prev.email,
            phone: data.content_data.support_phone || prev.phone,
            policy: data.content_data.return_policy || prev.policy
          }));
        }
      } catch (err) {
        console.error("Error loading checkout data:", err);
      }
    }
    fetchSupportData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    } else if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2, 4)}`;
      }
    } else if (name === 'cvc') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (name === 'zip') {
      formattedValue = value.replace(/[^a-zA-Z0-9 -]/g, '').slice(0, 10);
    }

    setFormData({ ...formData, [name]: formattedValue });
    setError('');
  };

  const handleApplyVoucher = async (e) => {
    e.preventDefault();
    setVoucherError('');
    setVoucherMessage('');
    
    const normalizedCode = voucherCode.trim().toUpperCase();
    if (!normalizedCode) return;

    try {
      const { data, error: vError } = await supabase.from('vouchers').select('*').ilike('code', normalizedCode).single();

      if (vError || !data) {
        setVoucherError('Invalid voucher code.');
        return;
      }

      if (!data.is_active) {
        setVoucherError('This voucher is no longer active.');
        return;
      }

      if (data.current_uses >= data.max_uses) {
        setVoucherError('This voucher has reached its maximum usage limit.');
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setVoucherError('This voucher has expired.');
        return;
      }

      setAppliedVoucher(data);
      setVoucherMessage(`${data.discount_percent}% discount applied successfully!`);
    } catch {
      setVoucherError('System error verifying voucher.');
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherMessage('');
    setVoucherError('');
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (formData.cardNumber.length < 19) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }

    const [month] = formData.expiry.split('/');
    if (formData.expiry.length < 5 || parseInt(month) < 1 || parseInt(month) > 12) {
      setError('Please enter a valid expiration date (MM/YY).');
      return;
    }

    if (formData.cvc.length < 3) {
      setError('Please enter a valid security code (CVC).');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Grab the currently logged-in user's ID so the order is tied to their account
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id || null;

      // STEP 1: Insert the main order record WITH the user_id attached
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: currentUserId, // Binds this order directly to the user's account
          customer_email: formData.email,
          customer_first_name: formData.firstName,
          customer_last_name: formData.lastName,
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_zip: formData.zip,
          shipping_country: formData.country,
          subtotal: calculatedTotal,
          discount_amount: discountAmount,
          tax_amount: tax,
          shipping_fee: shipping,
          total_amount: finalTotal,
          voucher_used: appliedVoucher ? appliedVoucher.code : null
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItemsPayload = activeCart.map(item => ({
        order_id: orderData.id,
        product_name: item.name,
        quantity: item.quantity || 1,
        price_at_purchase: parseFloat(item.price) || 0,
        image_url: item.image
      }));

      // STEP 3: Insert into the order_items table
      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);
      if (itemsError) throw itemsError;

      if (appliedVoucher) {
        await supabase.from('vouchers').update({ current_uses: appliedVoucher.current_uses + 1 }).eq('id', appliedVoucher.id);
      }

      if (clearCart) clearCart();
      setIsProcessing(false);

      navigate('/success', {
        state: {
          orderId: orderData.id,
          cart: activeCart,
          total: finalTotal,
          discount: discountAmount,
          shipping: shipping,
          tax: tax,
          customer: formData
        }
      });

    } catch (err) {
      console.error("Checkout error:", err);
      setError('Something went wrong while placing your order. Please try again.');
      setIsProcessing(false);
    }
  };

  if (activeCart.length === 0) {
    return (
      <div className="min-h-screen bg-[#050608] flex flex-col items-center justify-center text-white px-4">
        <svg className="w-16 h-16 md:w-24 md:h-24 text-gray-800 mb-4 md:mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-3 md:mb-4 text-center">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6 md:mb-8 font-mono text-xs md:text-sm text-center">You haven't added anything to your cart yet.</p>
        <Link to="/shop" className="w-full sm:w-auto text-center bg-electric text-midnight font-bold uppercase tracking-widest px-8 py-4 rounded hover:bg-white transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Localized Shipping Fee
  const shipping = 59.00; 
  
  const discountAmount = appliedVoucher ? (calculatedTotal * (appliedVoucher.discount_percent / 100)) : 0;
  const subtotalAfterDiscount = calculatedTotal - discountAmount;
  
  const tax = subtotalAfterDiscount * 0.08;
  const finalTotal = subtotalAfterDiscount + tax + shipping;

  return (
    <div className="min-h-screen bg-[#050608] text-white pt-8 md:pt-10 pb-16 md:pb-24 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        
        <div className="mb-6 md:mb-10 border-b border-gray-800 pb-4 md:pb-6">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-widest">Secure Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 flex-col-reverse lg:flex-row">
          
          <div className="lg:col-span-7 order-2 lg:order-1">
            <form onSubmit={handleCheckout} className="space-y-6 md:space-y-8">
              
              {/* Shipping Section */}
              <div className="bg-[#0f1115] border border-gray-800 p-5 md:p-8 rounded-xl">
                <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest mb-4 md:mb-6 border-b border-gray-800 pb-3 md:pb-4">1. Shipping Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">First Name</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-electric transition-colors" />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Last Name</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-electric transition-colors" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Email Address</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-electric transition-colors" />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Street Address</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-electric transition-colors" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">City</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-electric transition-colors" />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">ZIP / Postal</label>
                    <input required type="text" name="zip" value={formData.zip} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-electric transition-colors uppercase" />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-[#0f1115] border border-gray-800 p-5 md:p-8 rounded-xl">
                <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest mb-4 md:mb-6 border-b border-gray-800 pb-3 md:pb-4">2. Payment Details</h3>
                <div className="mb-4">
                  <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Card Number</label>
                  <input required type="text" placeholder="XXXX XXXX XXXX XXXX" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-ion transition-colors" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Expiration (MM/YY)</label>
                    <input required type="text" placeholder="MM/YY" name="expiry" value={formData.expiry} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-ion transition-colors" />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Security Code (CVC)</label>
                    <input required type="password" placeholder="CVC" name="cvc" value={formData.cvc} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-ion transition-colors tracking-widest" />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 font-bold uppercase tracking-widest text-xs p-4 rounded flex items-center gap-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isProcessing}
                className={`w-full py-4 md:py-5 rounded font-black uppercase tracking-widest text-base md:text-lg transition-all ${isProcessing ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-ion text-midnight hover:bg-white shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]'}`}
              >
                {isProcessing ? 'Processing...' : `Pay ₱${finalTotal.toFixed(2)}`}
              </button>

            </form>
          </div>

          <div className="lg:col-span-5 space-y-6 md:space-y-8 order-1 lg:order-2">
            
            {/* Manifest / Cart Summary */}
            <div className="bg-[#0B0D10] border border-gray-800 rounded-xl p-5 md:p-8 lg:top-28">
              <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest mb-4 md:mb-6 border-b border-gray-800 pb-3 md:pb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-6 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {activeCart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex gap-3 md:gap-4">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-900 rounded border border-gray-800 flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }}></div>
                    <div className="flex-1 flex flex-col justify-center overflow-hidden">
                      <p className="font-bold text-xs md:text-sm truncate">{item.name}</p>
                      <p className="text-gray-500 text-[10px] md:text-xs font-mono">QTY: {item.quantity || 1}</p>
                    </div>
                    <div className="font-mono text-xs md:text-sm font-bold pt-1">
                      ₱{((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-700 pt-5 pb-2">
                <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Discount / Voucher Code</label>
                {!appliedVoucher ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={voucherCode} 
                      onChange={e => setVoucherCode(e.target.value)} 
                      placeholder="ENTER CODE" 
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="characters"
                      spellCheck="false"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 md:px-4 py-2.5 md:py-3 text-white focus:outline-none focus:border-electric transition-colors font-mono uppercase text-xs md:text-sm" 
                    />
                    <button onClick={handleApplyVoucher} className="bg-gray-800 text-white hover:bg-white hover:text-black font-bold uppercase tracking-widest text-[10px] md:text-xs px-4 md:px-6 rounded transition-colors">Apply</button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-ion/10 border border-ion/30 px-3 md:px-4 py-2.5 md:py-3 rounded">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <svg className="w-4 h-4 text-ion shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="font-mono text-ion font-bold text-xs md:text-sm truncate">{appliedVoucher.code} ({appliedVoucher.discount_percent}% OFF)</span>
                    </div>
                    <button onClick={removeVoucher} className="shrink-0 text-gray-500 hover:text-white font-bold uppercase tracking-widest text-[10px]">Remove</button>
                  </div>
                )}
                {voucherError && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2">{voucherError}</p>}
                {voucherMessage && <p className="text-ion text-[10px] font-bold uppercase tracking-widest mt-2">{voucherMessage}</p>}
              </div>

              <div className="border-t border-dashed border-gray-700 pt-4 space-y-2 font-mono text-xs md:text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₱{calculatedTotal.toFixed(2)}</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-ion">
                    <span>Discount ({appliedVoucher.discount_percent}%)</span>
                    <span>-₱{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span>₱{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Shipping</span>
                  <span>₱{shipping.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-gray-800 mt-4 pt-4 flex justify-between items-center">
                <span className="font-bold uppercase tracking-widest text-sm md:text-base">Total Due</span>
                <span className="text-xl md:text-2xl font-black text-white">₱{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Support Info */}
            <div className="bg-[#0f1115] border border-gray-800 rounded-xl p-5 md:p-6 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                <div>
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white mb-1">Customer Support</p>
                  <p className="text-gray-500 text-xs md:text-sm">{supportInfo.email} <br/> {supportInfo.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <div>
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white mb-1">Return Policy</p>
                  <p className="text-gray-500 text-xs md:text-sm">{supportInfo.policy}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}