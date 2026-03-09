import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state || null;
  const [date, setDate] = useState('');

  useEffect(() => {
    // Snap to top on load
    window.scrollTo(0, 0);
    
    const now = new Date();
    setDate(now.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric', 
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short' 
    }));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-[#050608] flex flex-col items-center justify-center text-white px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-3 md:mb-4">No Recent Order</h2>
        <p className="text-gray-500 mb-6 md:mb-8 font-mono text-xs md:text-sm">No recent transaction data found in current session.</p>
        <Link to="/shop" className="bg-electric text-midnight font-bold uppercase tracking-widest px-8 py-3.5 md:py-4 rounded hover:bg-white transition-colors text-xs md:text-sm">
          Return to Armory
        </Link>
      </div>
    );
  }

  const { cart, total, discount, shipping, tax, customer, orderId } = orderData;
  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity || 1)), 0);

  return (
    <div className="min-h-screen bg-[#050608] text-white pt-16 md:pt-20 pb-16 md:pb-24 px-4 sm:px-6 print:bg-white print:text-black print:pt-0">
      <div className="max-w-2xl mx-auto">
        
        {/* Header Success Message */}
        <div className="text-center mb-8 md:mb-12 print:hidden animate-fadeIn">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-ion/10 text-ion border border-ion rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-[0_0_30px_rgba(57,255,20,0.2)]">
            <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-widest text-white mb-2 leading-tight">
            Thank you! Your order has been successfully placed.
          </h1>
          <p className="text-gray-400 font-mono text-[10px] sm:text-xs md:text-sm mb-6 md:mb-8">
            A confirmation email has been sent to {customer.email}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4 sm:px-0">
            <button onClick={handlePrint} className="w-full sm:w-auto bg-gray-800 text-white hover:bg-white hover:text-black font-bold uppercase tracking-widest text-[10px] md:text-xs px-6 py-3.5 md:py-3 rounded transition-colors flex justify-center items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Save PDF Receipt
            </button>
            <button 
              onClick={() => navigate('/profile', { state: { activeTab: 'orders' } })}
              className="w-full sm:w-auto bg-electric text-midnight hover:bg-white font-bold uppercase tracking-widest text-[10px] md:text-xs px-6 py-3.5 md:py-3 rounded transition-colors flex justify-center items-center"
            >
              Track Order
            </button>
          </div>
        </div>

        {/* Receipt Container */}
        <div className="bg-[#0B0D10] border border-gray-800 p-5 sm:p-8 md:p-12 rounded-xl font-mono text-xs sm:text-sm print:border-none print:p-0 print:bg-white animate-fadeIn shadow-2xl" style={{ animationDelay: '150ms' }}>
          
          {/* Top Receipt Block */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-dashed border-gray-700 pb-6 mb-6 md:pb-8 md:mb-8 print:border-gray-300 gap-4 sm:gap-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-white mb-1 print:text-black">MIDNIGHT_OS</h2>
              <p className="text-gray-500 text-[10px] md:text-xs tracking-widest uppercase print:text-gray-500">Hardware Division</p>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <p className="text-gray-400 font-bold print:text-gray-800 text-[10px] md:text-sm">RECEIPT</p>
              <p className="text-ion print:text-black break-all">#{orderId?.substring(0, 12) || 'PENDING'}</p>
              <p className="text-gray-500 text-[10px] mt-1 print:text-gray-500">{date}</p>
            </div>
          </div>

          {/* Billing / Shipping Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
            <div>
              <p className="text-gray-600 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-1 md:mb-2 print:text-gray-400">Billed To:</p>
              <p className="text-gray-300 font-bold uppercase print:text-black text-xs md:text-sm">{customer.firstName} {customer.lastName}</p>
              <p className="text-gray-500 print:text-gray-600 text-[10px] md:text-xs break-all">{customer.email}</p>
            </div>
            <div>
              <p className="text-gray-600 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-1 md:mb-2 print:text-gray-400">Shipped To:</p>
              <p className="text-gray-300 print:text-black uppercase text-xs md:text-sm">{customer.address}</p>
              <p className="text-gray-500 print:text-gray-600 uppercase text-[10px] md:text-xs">{customer.city}, {customer.zip} {customer.country}</p>
            </div>
          </div>

          {/* Itemized List */}
          <div className="mb-6 md:mb-8">
            <div className="flex justify-between text-gray-600 text-[8px] md:text-[10px] font-bold uppercase tracking-widest border-b border-gray-800 pb-2 mb-3 md:mb-4 print:border-gray-300 print:text-gray-400">
              <span>Item</span>
              <span>Amount</span>
            </div>
            <div className="space-y-3 md:space-y-4">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-start gap-4">
                  <div className="pr-2 md:pr-4">
                    <p className="text-gray-300 font-bold print:text-black text-xs md:text-sm">{item.name}</p>
                    <p className="text-gray-500 text-[10px] md:text-xs print:text-gray-600">QTY: {item.quantity || 1} x ${parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  <span className="text-gray-400 print:text-gray-800 text-xs md:text-sm shrink-0">${(parseFloat(item.price) * parseInt(item.quantity || 1)).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Block */}
          <div className="w-full sm:w-2/3 md:w-1/2 ml-auto border-t border-dashed border-gray-700 pt-5 md:pt-6 space-y-2 md:space-y-3 print:border-gray-300">
            <div className="flex justify-between text-gray-400 print:text-gray-600 text-xs md:text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-ion print:text-black font-bold text-xs md:text-sm">
                <span>Voucher Applied</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-400 print:text-gray-600 text-xs md:text-sm">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400 print:text-gray-600 text-xs md:text-sm">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-black text-lg md:text-xl pt-3 md:pt-4 border-t border-gray-800 mt-2 print:border-gray-300 print:text-black">
              <span className="uppercase tracking-widest">Total</span>
              <span className="text-ion print:text-black">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 md:mt-16 text-center border-t border-gray-800 pt-6 md:pt-8 print:border-gray-300">
            <p className="text-gray-600 text-[8px] md:text-[10px] uppercase tracking-widest print:text-gray-400">Thank you for shopping with Midnight OS</p>
          </div>

        </div>
      </div>
    </div>
  );
}