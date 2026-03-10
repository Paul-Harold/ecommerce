import React, { useState, useEffect } from 'react';
import { supabase } from '../libs/supabase.js';

export default function VouchersTab() {
  const emptyVoucher = { code: '', discount_percent: 10, max_uses: 100, expires_at: '', is_active: true };
  
  const [vouchersList, setVouchersList] = useState([]);
  const [newVoucher, setNewVoucher] = useState(emptyVoucher);
  const [editVoucherId, setEditVoucherId] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchVouchers();
  }, []);

  async function fetchVouchers() {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setVouchersList(data || []);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    }
  }

  const handleVoucherSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { 
        code: newVoucher.code.toUpperCase().trim(), 
        discount_percent: parseInt(newVoucher.discount_percent) || 0,
        max_uses: parseInt(newVoucher.max_uses) || 0, 
        is_active: newVoucher.is_active,
        expires_at: newVoucher.expires_at ? new Date(newVoucher.expires_at).toISOString() : null
      };
      
      if (editVoucherId) {
        const { error } = await supabase.from('vouchers').update(payload).eq('id', editVoucherId);
        if (error) throw error;
        setMessage({ type: 'success', text: `Voucher updated successfully!` });
      } else {
        const { error } = await supabase.from('vouchers').insert([payload]);
        if (error) throw error;
        setMessage({ type: 'success', text: `Voucher generated successfully!` });
      }
      
      setNewVoucher(emptyVoucher);
      setEditVoucherId(null);
      fetchVouchers(); // Refresh list locally
    } catch (error) { 
      setMessage({ type: 'error', text: error.code === '23505' ? 'Voucher code already exists.' : 'Failed to save voucher.' }); 
    } finally { 
      setIsSubmitting(false); 
      setTimeout(() => setMessage({ type: '', text: '' }), 3000); 
    }
  };

  const handleDeleteVoucher = async (id) => {
    if (!window.confirm("Delete this voucher permanently?")) return;
    try {
      await supabase.from('vouchers').delete().eq('id', id);
      fetchVouchers();
      setMessage({ type: 'success', text: 'Voucher deleted.' });
    } catch (error) { 
      setMessage({ type: 'error', text: 'Failed to delete voucher.' }); 
    }
  };

  const handleEditVoucher = (voucher) => {
    setNewVoucher({
      code: voucher.code, 
      discount_percent: voucher.discount_percent, 
      max_uses: voucher.max_uses,
      is_active: voucher.is_active, 
      expires_at: voucher.expires_at ? new Date(voucher.expires_at).toISOString().slice(0, 16) : ''
    });
    setEditVoucherId(voucher.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="animate-fadeIn">
      {message.text && (
        <div className={`mb-4 lg:mb-6 px-4 py-3 lg:px-6 lg:py-4 rounded font-bold uppercase tracking-widest text-xs lg:text-sm flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-between items-center mb-6 lg:mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-2xl lg:text-3xl font-bold uppercase tracking-widest">{editVoucherId ? 'Edit Voucher' : 'Generate Voucher'}</h1>
        {editVoucherId && (
          <button onClick={() => { setEditVoucherId(null); setNewVoucher(emptyVoucher); }} className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white bg-gray-900 px-3 py-1.5 rounded">Cancel Edit</button>
        )}
      </div>
      
      <form onSubmit={handleVoucherSubmit} className="bg-[#0f1115] border border-gray-800 p-5 lg:p-8 rounded-xl space-y-4 lg:space-y-6 mb-8 lg:mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Voucher Code</label>
            <input required type="text" value={newVoucher.code} onChange={e => setNewVoucher({...newVoucher, code: e.target.value.toUpperCase()})} placeholder="e.g. MIDNIGHT20" className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors font-mono uppercase text-xs lg:text-sm" />
          </div>
          <div>
            <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Discount Amount (%)</label>
            <input required type="number" min="1" max="100" value={newVoucher.discount_percent} onChange={e => setNewVoucher({...newVoucher, discount_percent: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors text-xs lg:text-sm" />
          </div>
          <div>
            <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Maximum Redemptions</label>
            <input required type="number" min="1" value={newVoucher.max_uses} onChange={e => setNewVoucher({...newVoucher, max_uses: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors text-xs lg:text-sm" />
          </div>
          <div>
            <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Expiration Date & Time (Optional)</label>
            <input type="datetime-local" value={newVoucher.expires_at} onChange={e => setNewVoucher({...newVoucher, expires_at: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors [color-scheme:dark] text-xs lg:text-sm" />
          </div>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-3 pt-1 lg:pt-2">
          <input type="checkbox" id="vActive" checked={newVoucher.is_active} onChange={e => setNewVoucher({...newVoucher, is_active: e.target.checked})} className="w-4 h-4 lg:w-5 lg:h-5 accent-white cursor-pointer" />
          <label htmlFor="vActive" className="text-white font-bold uppercase tracking-widest text-xs lg:text-sm cursor-pointer">Set as Active</label>
        </div>

        <button type="submit" disabled={isSubmitting} className={`w-full font-bold uppercase tracking-widest py-3 lg:py-4 rounded transition-all duration-300 mt-2 lg:mt-4 text-xs lg:text-sm ${isSubmitting ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}>
          {editVoucherId ? 'Save Changes' : 'Generate Code'}
        </button>
      </form>

      <h2 className="text-lg lg:text-xl font-bold uppercase tracking-widest mb-4 lg:mb-6 border-b border-gray-800 pb-2 text-gray-400">Voucher Log</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {vouchersList.map(v => (
          <div key={v.id} className={`bg-gray-900 border p-3 lg:p-4 rounded flex items-center justify-between ${v.is_active && v.current_uses < v.max_uses ? 'border-gray-800' : 'border-red-900/30 opacity-70'}`}>
            <div>
              <div className="flex items-center gap-2 lg:gap-3 mb-1">
                <p className="font-bold text-sm lg:text-lg text-white font-mono tracking-widest">{v.code}</p>
                {!v.is_active && <span className="bg-red-500/20 text-red-500 text-[8px] lg:text-[10px] font-bold uppercase tracking-widest px-1.5 lg:px-2 py-0.5 rounded">Disabled</span>}
                {v.current_uses >= v.max_uses && <span className="bg-yellow-500/20 text-yellow-500 text-[8px] lg:text-[10px] font-bold uppercase tracking-widest px-1.5 lg:px-2 py-0.5 rounded">Maxed Out</span>}
              </div>
              <p className="text-gray-400 text-[10px] lg:text-xs font-mono">{v.discount_percent}% OFF | USES: {v.current_uses} / {v.max_uses}</p>
            </div>
            <div className="flex gap-1 lg:gap-2 flex-col sm:flex-row ml-2">
              <button onClick={() => handleEditVoucher(v)} className="text-[10px] lg:text-xs bg-gray-800 hover:bg-white hover:text-black px-2 lg:px-4 py-1.5 lg:py-2 rounded transition-colors font-bold uppercase tracking-widest">Edit</button>
              <button onClick={() => handleDeleteVoucher(v.id)} className="text-[10px] lg:text-xs bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-500 hover:text-white px-2 lg:px-4 py-1.5 lg:py-2 rounded transition-colors font-bold uppercase tracking-widest">Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}