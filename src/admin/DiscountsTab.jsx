import React, { useState, useEffect } from 'react';
import { supabase } from '../libs/supabase.js';
import { useAutoMessage } from './useAdminTools.js';
import { AdminMessage } from './AdminUI.jsx';

export default function DiscountsTab() {
  const emptyDiscount = { product_id: '', discount_percent: '', expires_at: '' };

  const [productsList, setProductsList] = useState([]);
  const [discountForm, setDiscountForm] = useState(emptyDiscount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { message, showSuccess, showError } = useAutoMessage();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProductsList(data || []);
    } catch (error) {
      console.error("Error fetching products for discounts:", error);
    }
  }

  const handleDiscountSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { 
        discount_percent: parseInt(discountForm.discount_percent), 
        expires_at: discountForm.expires_at ? new Date(discountForm.expires_at).toISOString() : null 
      };
      
      const { error } = await supabase.from('products').update(payload).eq('id', discountForm.product_id);
      if (error) throw error;

      showSuccess('Discount applied successfully.');
      setDiscountForm(emptyDiscount);
      fetchProducts(); // Refresh the list
    } catch {
      showError('Failed to apply discount.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveDiscount = async (id) => {
    try {
      const { error } = await supabase.from('products').update({ discount_percent: 0, expires_at: null }).eq('id', id);
      if (error) throw error;
      
      fetchProducts();
      showSuccess('Discount removed.');
    } catch {
      showError('Failed to remove discount.');
    }
  };

  const discountedProducts = productsList.filter(p => p.discount_percent > 0);

  return (
    <div className="animate-fadeIn">
      <AdminMessage message={message} />

      <h1 className="text-2xl lg:text-3xl font-bold uppercase tracking-widest mb-6 lg:mb-8 border-b border-gray-800 pb-4">Manage Discounts</h1>
      
      <form onSubmit={handleDiscountSubmit} className="bg-[#0f1115] border border-gray-800 p-5 lg:p-8 rounded-xl space-y-4 lg:space-y-6 mb-8 lg:mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <div>
            <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Select Product</label>
            <select 
              required 
              value={discountForm.product_id} 
              onChange={e => setDiscountForm({...discountForm, product_id: e.target.value})} 
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-ion transition-colors cursor-pointer text-xs lg:text-sm"
            >
              <option value="">-- Choose Gear --</option>
              {productsList.map(product => (
                <option key={product.id} value={product.id}>[{product.category}] {product.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Discount (%)</label>
            <input required type="number" min="1" max="100" value={discountForm.discount_percent} onChange={e => setDiscountForm({...discountForm, discount_percent: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-ion transition-colors text-xs lg:text-sm" />
          </div>
          <div>
            <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Expiration Date & Time</label>
            <input type="datetime-local" value={discountForm.expires_at} onChange={e => setDiscountForm({...discountForm, expires_at: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-ion transition-colors [color-scheme:dark] text-xs lg:text-sm" />
          </div>
        </div>
        <button type="submit" disabled={isSubmitting} className={`w-full font-bold uppercase tracking-widest py-3 lg:py-4 rounded transition-all duration-300 mt-2 lg:mt-4 text-xs lg:text-sm ${isSubmitting ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-ion text-black hover:bg-white'}`}>
          Apply Discount
        </button>
      </form>

      <h2 className="text-lg lg:text-xl font-bold uppercase tracking-widest mb-4 lg:mb-6 border-b border-gray-800 pb-2 text-gray-400">Active Product Discounts</h2>
      {discountedProducts.length === 0 ? (
        <div className="bg-[#0f1115] border border-gray-800 p-6 lg:p-8 rounded-xl text-center text-gray-500 text-xs lg:text-sm font-mono">
          No active individual product discounts.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
          {discountedProducts.map(p => (
            <div key={p.id} className="bg-gray-900 border border-ion/30 p-3 lg:p-4 rounded flex items-center justify-between">
              <div className="flex-1 pr-2 min-w-0">
                <span className="text-[8px] lg:text-[10px] text-gray-500 font-bold uppercase tracking-widest block">{p.category}</span>
                <p className="font-bold text-xs lg:text-sm truncate w-full text-white">{p.name}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-ion text-[10px] lg:text-xs font-bold">{p.discount_percent}% OFF</span>
                  <span className="text-gray-500 text-[10px] lg:text-xs line-through">₱{p.price.toFixed(2)}</span>
                  <span className="text-white text-[10px] lg:text-xs">₱{(p.price - (p.price * (p.discount_percent / 100))).toFixed(2)}</span>
                </div>
              </div>
              <button onClick={() => handleRemoveDiscount(p.id)} className="shrink-0 text-[10px] lg:text-xs bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-500 hover:text-white px-2 lg:px-3 py-1.5 rounded transition-colors font-bold uppercase tracking-widest">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}