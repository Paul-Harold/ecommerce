import React, { useState, useEffect } from 'react';
import { supabase } from '../libs/supabase.js';

export default function BundlesTab() {
  const emptyBundle = { 
    title: '', description: '', image_url: '', 
    bundle_price: '', bundle_ids: ['', '', ''], 
    is_active: true, expires_at: '', type: 'bundle' 
  };
  
  const [bundlesList, setBundlesList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [newBundle, setNewBundle] = useState(emptyBundle);
  const [editBundleId, setEditBundleId] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [productsRes, bundlesRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('promotions').select('*').eq('type', 'bundle').order('created_at', { ascending: false })
      ]);
      
      if (productsRes.error) throw productsRes.error;
      if (bundlesRes.error) throw bundlesRes.error;

      setProductsList(productsRes.data || []);
      setBundlesList(bundlesRes.data || []);
    } catch (error) {
      console.error("Error fetching bundle data:", error);
    }
  }

  const handleBundleSelection = (index, value) => {
    const newIds = [...newBundle.bundle_ids];
    newIds[index] = value;
    setNewBundle({ ...newBundle, bundle_ids: newIds });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `images/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('assets').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
      setNewBundle(prev => ({ ...prev, image_url: data.publicUrl }));
      setMessage({ type: 'success', text: 'Image successfully uploaded.' });
    } catch (error) { 
      setMessage({ type: 'error', text: 'Upload failed.' }); 
    } finally { 
      setIsUploading(false); 
    }
  };

  const handleBundleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Clean the array to ensure we don't send empty strings to the database
      const cleanBundleIds = newBundle.bundle_ids.filter(id => id && String(id).trim() !== '');
      
      const payload = { 
        type: 'bundle', 
        title: newBundle.title, 
        description: newBundle.description, 
        image_url: newBundle.image_url, 
        bundle_price: parseFloat(newBundle.bundle_price) || 0, 
        bundle_ids: cleanBundleIds,
        is_active: newBundle.is_active, 
        expires_at: newBundle.expires_at ? new Date(newBundle.expires_at).toISOString() : null
      };
      
      if (editBundleId) {
        const { error } = await supabase.from('promotions').update(payload).eq('id', editBundleId);
        if (error) throw error;
        setMessage({ type: 'success', text: `Bundle updated successfully!` });
      } else {
        const { error } = await supabase.from('promotions').insert([payload]);
        if (error) throw error;
        setMessage({ type: 'success', text: `Bundle launched successfully!` });
      }
      
      setNewBundle(emptyBundle);
      setEditBundleId(null);
      fetchData();
    } catch (error) { 
      setMessage({ type: 'error', text: 'Failed to save bundle.' }); 
      console.error(error);
    } finally { 
      setIsSubmitting(false); 
      setTimeout(() => setMessage({ type: '', text: '' }), 3000); 
    }
  };

  const handleDeleteBundle = async (id) => {
    if (!window.confirm("Delete this bundle permanently?")) return;
    try {
      await supabase.from('promotions').delete().eq('id', id);
      fetchData();
      setMessage({ type: 'success', text: 'Bundle deleted.' });
    } catch (error) { 
      setMessage({ type: 'error', text: 'Failed to delete.' }); 
    }
  };

  const handleEditBundle = (bundle) => {
    // 1. Safely extract and format the array of IDs
    let parsedIds = [];
    try {
      if (typeof bundle.bundle_ids === 'string') {
        parsedIds = JSON.parse(bundle.bundle_ids);
      } else if (Array.isArray(bundle.bundle_ids)) {
        parsedIds = bundle.bundle_ids;
      }
    } catch (e) {
      parsedIds = [];
    }
    
    // Force them into strings so the HTML <select> recognizes them perfectly
    const stringifiedIds = parsedIds.map(id => String(id));
    const paddedIds = [...stringifiedIds, '', '', ''].slice(0, 3);
    
    // 2. Safely extract and timezone-adjust the expiration date
    let safeDate = '';
    if (bundle.expires_at) {
      const d = new Date(bundle.expires_at);
      if (!isNaN(d.getTime())) {
        // Adjust for local timezone so it displays correctly in the input
        const offset = d.getTimezoneOffset() * 60000;
        safeDate = new Date(d.getTime() - offset).toISOString().slice(0, 16);
      }
    }

    setNewBundle({
      title: bundle.title || '', 
      description: bundle.description || '', 
      image_url: bundle.image_url || '', 
      bundle_price: bundle.bundle_price || '', 
      bundle_ids: paddedIds, 
      is_active: bundle.is_active ?? true, 
      expires_at: safeDate, 
      type: 'bundle'
    });
    setEditBundleId(bundle.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentBundleValue = newBundle.bundle_ids.reduce((total, id) => {
    const product = productsList.find(p => String(p.id) === String(id));
    return total + (product ? parseFloat(product.price) : 0);
  }, 0);

  return (
    <div className="animate-fadeIn">
      {message.text && (
        <div className={`mb-4 lg:mb-6 px-4 py-3 lg:px-6 lg:py-4 rounded font-bold uppercase tracking-widest text-xs lg:text-sm flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-between items-center mb-6 lg:mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-2xl lg:text-3xl font-bold uppercase tracking-widest">{editBundleId ? 'Edit Bundle' : 'Create Bundle'}</h1>
        {editBundleId && (
          <button onClick={() => { setEditBundleId(null); setNewBundle(emptyBundle); }} className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white bg-gray-900 px-3 py-1.5 rounded">Cancel Edit</button>
        )}
      </div>
      
      <form onSubmit={handleBundleSubmit} className="bg-[#0f1115] border border-gray-800 p-5 lg:p-8 rounded-xl space-y-4 lg:space-y-6 mb-8 lg:mb-12">
        <div className="bg-gray-900/50 border border-gray-800 p-4 lg:p-8 rounded-xl mb-4 lg:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-8">
            {[0, 1, 2].map((index) => (
              <div key={index}>
                <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 lg:mb-2">Item {index + 1}</label>
                <select value={newBundle.bundle_ids[index] || ''} onChange={(e) => handleBundleSelection(index, e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-ion transition-colors cursor-pointer text-xs lg:text-sm">
                  <option value="">-- Optional --</option>
                  {productsList.map(product => (<option key={product.id} value={product.id}>{product.name}</option>))}
                </select>
              </div>
            ))}
          </div>

          {newBundle.bundle_ids.some(id => id !== '') && (
            <div className="bg-[#0B0D10] border border-gray-800 rounded p-4 lg:p-6 font-mono text-xs lg:text-sm max-w-2xl mx-auto w-full">
              <div className="space-y-2 lg:space-y-3 mb-4">
                {newBundle.bundle_ids.map((id, index) => {
                  if (!id) return null;
                  const product = productsList.find(p => String(p.id) === String(id));
                  if (!product) return null;
                  return (
                    <div key={`${id}-${index}`} className="flex justify-between items-center text-gray-300 gap-2">
                      <span className="truncate flex-1">{product.name}</span>
                      <span className="shrink-0 text-gray-400">₱{product.price.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-dashed border-gray-700 pt-3 lg:pt-4 flex justify-between items-center text-white font-bold text-sm lg:text-lg">
                <span className="truncate pr-2">TOTAL VALUE</span>
                <span>₱{currentBundleValue.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Bundle Name</label>
            <input required type="text" value={newBundle.title} onChange={e => setNewBundle({...newBundle, title: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors text-xs lg:text-sm" />
          </div>
          <div>
            <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Discounted Bundle Price (PHP)</label>
            <input required type="number" step="0.01" min="0" value={newBundle.bundle_price} onChange={e => setNewBundle({...newBundle, bundle_price: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-ion transition-colors text-xs lg:text-sm" placeholder={`e.g., ${(currentBundleValue * 0.8).toFixed(2)}`} />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Offer Expiration Date & Time</label>
          <input type="datetime-local" value={newBundle.expires_at} onChange={e => setNewBundle({...newBundle, expires_at: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors [color-scheme:dark] text-xs lg:text-sm" />
        </div>

        <div>
          <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Bundle Image Upload</label>
          <input type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} className="block w-full text-[10px] lg:text-xs text-gray-400 file:mr-2 lg:file:mr-4 file:py-2 lg:file:py-3 file:px-3 lg:file:px-4 file:rounded file:border-0 file:font-bold file:uppercase file:tracking-widest file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer mb-2" />
          {newBundle.image_url && (<div className="h-24 lg:h-32 w-32 lg:w-48 rounded border border-gray-800 relative bg-gray-900"><div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${newBundle.image_url})` }}></div></div>)}
        </div>

        <div>
          <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Description</label>
          <textarea required rows="3" value={newBundle.description} onChange={e => setNewBundle({...newBundle, description: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors resize-none text-xs lg:text-sm"></textarea>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-3 pt-1 lg:pt-2">
          <input type="checkbox" id="isActive" checked={newBundle.is_active} onChange={e => setNewBundle({...newBundle, is_active: e.target.checked})} className="w-4 h-4 lg:w-5 lg:h-5 accent-white cursor-pointer" />
          <label htmlFor="isActive" className="text-white font-bold uppercase tracking-widest text-xs lg:text-sm cursor-pointer">Set as Active</label>
        </div>

        <button type="submit" disabled={isSubmitting || isUploading} className={`w-full font-bold uppercase tracking-widest py-3 lg:py-4 rounded transition-all duration-300 mt-2 lg:mt-4 text-xs lg:text-sm ${isSubmitting || isUploading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}>
          {editBundleId ? 'Save Bundle Changes' : 'Create Bundle'}
        </button>
      </form>

      <h2 className="text-lg lg:text-xl font-bold uppercase tracking-widest mb-4 lg:mb-6 border-b border-gray-800 pb-2 text-gray-400">Active Bundles</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
        {bundlesList.map(b => (
          <div key={b.id} className="bg-gray-900 border border-gray-800 p-3 lg:p-4 rounded flex items-center justify-between">
            <div className="flex items-center gap-3 lg:gap-4 overflow-hidden w-full">
              <div className="w-12 h-12 lg:w-16 lg:h-16 shrink-0 bg-gray-800 rounded bg-cover bg-center border border-gray-700" style={{ backgroundImage: `url(${b.image_url})` }}></div>
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-bold text-xs lg:text-sm text-white uppercase tracking-widest truncate">{b.title}</p>
                <p className="text-ion text-[10px] lg:text-xs">₱{b.bundle_price}</p>
              </div>
            </div>
            <div className="flex gap-1 lg:gap-2 shrink-0 flex-col sm:flex-row">
              <button onClick={() => handleEditBundle(b)} className="text-[10px] lg:text-xs bg-gray-800 hover:bg-white hover:text-black px-2 lg:px-4 py-1.5 lg:py-2 rounded transition-colors font-bold uppercase tracking-widest">Edit</button>
              <button onClick={() => handleDeleteBundle(b.id)} className="text-[10px] lg:text-xs bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-500 hover:text-white px-2 lg:px-4 py-1.5 lg:py-2 rounded transition-colors font-bold uppercase tracking-widest">Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}