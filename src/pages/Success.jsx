import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function Success() {
  const location = useLocation();
  const orderData = location.state || null;
  const [orderId, setOrderId] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
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
      <div className="min-h-screen bg-[#050608] flex flex-col items-center justify-center text-white px-4">
        <h2 className="text-3xl font-black uppercase tracking-widest mb-4">No Active Deployment</h2>
        <p className="text-gray-500 mb-8 font-mono text-sm">No recent transaction data found in current session.</p>
        <Link to="/shop" className="bg-electric text-midnight font-bold uppercase tracking-widest px-8 py-4 rounded hover:bg-white transition-colors">
          Return to Armory
        </Link>
      </div>
    );
  }

  const { cart, total, discount, shipping, tax, customer } = orderData;
  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity || 1)), 0);

  return (
    <div className="min-h-screen bg-[#050608] text-white pt-20 pb-24 px-6 print:bg-white print:text-black print:pt-0">
      <div className="max-w-2xl mx-auto">
        
        <div className="text-center mb-12 print:hidden">
          <div className="w-20 h-20 bg-ion/10 text-ion border border-ion rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(57,255,20,0.2)]">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-2">Deployment Authorized</h1>
          <p className="text-gray-400 font-mono text-sm mb-6">Encrypted confirmation has been routed to {customer.email}</p>
          <div className="flex justify-center gap-4">
            <button onClick={handlePrint} className="bg-gray-800 text-white hover:bg-white hover:text-black font-bold uppercase tracking-widest text-xs px-6 py-3 rounded transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Save PDF Receipt
            </button>
            <Link to="/shop" className="bg-ion text-midnight hover:bg-white font-bold uppercase tracking-widest text-xs px-6 py-3 rounded transition-colors">
              Continue Browsing
            </Link>
          </div>
        </div>

        <div className="bg-[#0B0D10] border border-gray-800 p-8 md:p-12 rounded-xl font-mono text-sm print:border-none print:p-0 print:bg-white">
          
          <div className="flex justify-between items-start border-b border-dashed border-gray-700 pb-8 mb-8 print:border-gray-300">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-1 print:text-black">MIDNIGHT_OS</h2>
              <p className="text-gray-500 text-xs tracking-widest uppercase print:text-gray-500">Classified Hardware Division</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 font-bold print:text-gray-800">RECEIPT</p>
              <p className="text-ion print:text-black">{orderId}</p>
              <p className="text-gray-500 text-xs mt-1 print:text-gray-500">{date}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-2 print:text-gray-400">Billed To:</p>
              <p className="text-gray-300 font-bold uppercase print:text-black">{customer.firstName} {customer.lastName}</p>
              <p className="text-gray-500 print:text-gray-600">{customer.email}</p>
            </div>
            <div>
              <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-2 print:text-gray-400">Shipped To:</p>
              <p className="text-gray-300 print:text-black uppercase">{customer.address}</p>
              <p className="text-gray-500 print:text-gray-600 uppercase">{customer.city}, {customer.zip} {customer.country}</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-gray-600 text-[10px] font-bold uppercase tracking-widest border-b border-gray-800 pb-2 mb-4 print:border-gray-300 print:text-gray-400">
              <span>Item Directive</span>
              <span>Amount</span>
            </div>
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="pr-4">
                    <p className="text-gray-300 font-bold print:text-black">{item.name}</p>
                    <p className="text-gray-500 text-xs print:text-gray-600">QTY: {item.quantity || 1} x ${parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  <span className="text-gray-400 print:text-gray-800">${(parseFloat(item.price) * parseInt(item.quantity || 1)).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full md:w-1/2 ml-auto border-t border-dashed border-gray-700 pt-6 space-y-2 print:border-gray-300">
            <div className="flex justify-between text-gray-400 print:text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-ion print:text-black font-bold">
                <span>Voucher Applied</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-400 print:text-gray-600">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400 print:text-gray-600">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-black text-xl pt-4 border-t border-gray-800 mt-2 print:border-gray-300 print:text-black">
              <span className="uppercase tracking-widest">Total</span>
              <span className="text-ion print:text-black">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-16 text-center border-t border-gray-800 pt-8 print:border-gray-300">
            <p className="text-gray-600 text-[10px] uppercase tracking-widest print:text-gray-400">End of Transmission /// Midnight Hardware Division</p>
          </div>

        </div>
      </div>
    </div>
  );
}