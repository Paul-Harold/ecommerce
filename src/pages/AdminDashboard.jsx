import { useState, useEffect } from 'react';
import { supabase } from '../libs/supabase.js';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pages');
  const [activePage, setActivePage] = useState('home');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [productsList, setProductsList] = useState([]);
  const [bundlesList, setBundlesList] = useState([]);
  const [vouchersList, setVouchersList] = useState([]);
  
  const [editProductId, setEditProductId] = useState(null);
  const [editBundleId, setEditBundleId] = useState(null);
  const [editVoucherId, setEditVoucherId] = useState(null);

  const [pageContent, setPageContent] = useState({ 
    hero_title: '', hero_subtitle: '', hero_image_url: '',
    featured_ids: ['', '', ''], support_email: '', support_phone: '', return_policy: ''
  });

  const emptyProduct = { name: '', category: 'Mouse', price: '', description: '', image: '', discount_percent: 0, expires_at: '' };
  const [newProduct, setNewProduct] = useState(emptyProduct);
  
  const emptyBundle = { title: '', description: '', image_url: '', bundle_price: '', bundle_ids: ['', '', ''], is_active: true, expires_at: '', type: 'bundle' };
  const [newBundle, setNewBundle] = useState(emptyBundle);

  const emptyVoucher = { code: '', discount_percent: 10, max_uses: 100, expires_at: '', is_active: true };
  const [newVoucher, setNewVoucher] = useState(emptyVoucher);

  const pages = ['home', 'shop', 'offers', 'checkout'];

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (activeTab === 'pages') fetchPageContent(activePage);
  }, [activeTab, activePage]);

  async function fetchInventory() {
    const { data: pData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (pData) setProductsList(pData);

    const { data: bData } = await supabase.from('promotions').select('*').eq('type', 'bundle').order('created_at', { ascending: false });
    if (bData) setBundlesList(bData);

    const { data: vData } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false });
    if (vData) setVouchersList(vData);
  }

  async function fetchPageContent(pageName) {
    const { data } = await supabase.from('site_content').select('*').eq('page_name', pageName).single();
    if (data) {
      setPageContent({
        hero_title: data.hero_title || '', hero_subtitle: data.hero_subtitle || '', hero_image_url: data.hero_image_url || '',
        featured_ids: data.content_data?.featured_ids || ['', '', ''],
        support_email: data.content_data?.support_email || 'support@midnight.com', support_phone: data.content_data?.support_phone || '1-800-MIDNIGHT', return_policy: data.content_data?.return_policy || '30-day money-back guarantee.'
      });
    } else {
      setPageContent({ hero_title: '', hero_subtitle: '', hero_image_url: '', featured_ids: ['', '', ''], support_email: '', support_phone: '', return_policy: '' });
    }
  }

  const handleFeaturedSelection = (index, value) => {
    const newIds = [...pageContent.featured_ids];
    newIds[index] = value;
    setPageContent({ ...pageContent, featured_ids: newIds });
  };

  const handleBundleSelection = (index, value) => {
    const newIds = [...newBundle.bundle_ids];
    newIds[index] = value;
    setNewBundle({ ...newBundle, bundle_ids: newIds });
  };

  const handleFileUpload = async (event, targetField, context) => {
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
      
      if (context === 'bundle') {
        setNewBundle(prev => ({ ...prev, [targetField]: data.publicUrl }));
      } else if (context === 'product') {
        setNewProduct(prev => ({ ...prev, [targetField]: data.publicUrl }));
      } else {
        setPageContent(prev => ({ ...prev, [targetField]: data.publicUrl }));
      }
      setMessage({ type: 'success', text: 'Image successfully uploaded.' });
    } catch (error) { setMessage({ type: 'error', text: 'Upload failed.' }); } 
    finally { setIsUploading(false); }
  };

  const handleCmsSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let dynamicContentData = {};
    if (activePage === 'home') dynamicContentData = { featured_ids: pageContent.featured_ids.filter(id => id !== '') };
    else if (activePage === 'checkout') dynamicContentData = { support_email: pageContent.support_email, support_phone: pageContent.support_phone, return_policy: pageContent.return_policy };

    try {
      const { error } = await supabase.from('site_content').upsert({
        page_name: activePage, hero_title: pageContent.hero_title, hero_subtitle: pageContent.hero_subtitle, hero_image_url: pageContent.hero_image_url, content_data: dynamicContentData, updated_at: new Date()
      });
      if (error) throw error;
      setMessage({ type: 'success', text: `${activePage.toUpperCase()} content updated successfully.` });
    } catch (error) { setMessage({ type: 'error', text: 'Failed to update content.' }); } 
    finally { setIsSubmitting(false); setTimeout(() => setMessage({ type: '', text: '' }), 3000); }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { 
        ...newProduct, 
        price: parseFloat(newProduct.price), 
        discount_percent: parseInt(newProduct.discount_percent) || 0,
        expires_at: newProduct.expires_at ? new Date(newProduct.expires_at).toISOString() : null
      };

      if (editProductId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editProductId);
        if (error) throw error;
        setMessage({ type: 'success', text: `Product updated successfully!` });
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        setMessage({ type: 'success', text: `Product added successfully!` });
      }
      
      setNewProduct(emptyProduct);
      setEditProductId(null);
      fetchInventory();
    } catch (error) { setMessage({ type: 'error', text: 'Failed to save product.' }); } 
    finally { setIsSubmitting(false); setTimeout(() => setMessage({ type: '', text: '' }), 3000); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await supabase.from('products').delete().eq('id', id);
      fetchInventory();
      setMessage({ type: 'success', text: 'Product deleted.' });
    } catch (error) { setMessage({ type: 'error', text: 'Failed to delete.' }); }
  };

  const handleEditProduct = (product) => {
    setNewProduct({
      name: product.name, category: product.category, price: product.price, description: product.description, 
      image: product.image, discount_percent: product.discount_percent, 
      expires_at: product.expires_at ? new Date(product.expires_at).toISOString().slice(0, 16) : ''
    });
    setEditProductId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBundleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { 
        type: 'bundle',
        title: newBundle.title, 
        description: newBundle.description, 
        image_url: newBundle.image_url, 
        bundle_price: parseFloat(newBundle.bundle_price) || 0,
        bundle_ids: newBundle.bundle_ids.filter(id => id !== ''),
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
      fetchInventory();
    } catch (error) { setMessage({ type: 'error', text: 'Failed to save bundle.' }); } 
    finally { setIsSubmitting(false); setTimeout(() => setMessage({ type: '', text: '' }), 3000); }
  };

  const handleDeleteBundle = async (id) => {
    if (!window.confirm("Delete this bundle permanently?")) return;
    try {
      await supabase.from('promotions').delete().eq('id', id);
      fetchInventory();
      setMessage({ type: 'success', text: 'Bundle deleted.' });
    } catch (error) { setMessage({ type: 'error', text: 'Failed to delete.' }); }
  };

  const handleEditBundle = (bundle) => {
    const paddedIds = [...bundle.bundle_ids, '', '', ''].slice(0, 3);
    setNewBundle({
      title: bundle.title, description: bundle.description, image_url: bundle.image_url, 
      bundle_price: bundle.bundle_price, bundle_ids: paddedIds, is_active: bundle.is_active, 
      expires_at: bundle.expires_at ? new Date(bundle.expires_at).toISOString().slice(0, 16) : '', type: 'bundle'
    });
    setEditBundleId(bundle.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      fetchInventory();
    } catch (error) { 
      setMessage({ type: 'error', text: error.code === '23505' ? 'Voucher code already exists.' : 'Failed to save voucher.' }); 
    } 
    finally { setIsSubmitting(false); setTimeout(() => setMessage({ type: '', text: '' }), 3000); }
  };

  const handleDeleteVoucher = async (id) => {
    if (!window.confirm("Delete this voucher permanently?")) return;
    try {
      await supabase.from('vouchers').delete().eq('id', id);
      fetchInventory();
      setMessage({ type: 'success', text: 'Voucher deleted.' });
    } catch (error) { setMessage({ type: 'error', text: 'Failed to delete voucher.' }); }
  };

  const handleEditVoucher = (voucher) => {
    setNewVoucher({
      code: voucher.code, discount_percent: voucher.discount_percent, max_uses: voucher.max_uses,
      is_active: voucher.is_active, expires_at: voucher.expires_at ? new Date(voucher.expires_at).toISOString().slice(0, 16) : ''
    });
    setEditVoucherId(voucher.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentBundleValue = newBundle.bundle_ids.reduce((total, id) => {
    const product = productsList.find(p => String(p.id) === String(id));
    return total + (product ? parseFloat(product.price) : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-[#050608] text-white flex pt-20">
      
      <div className="w-64 bg-[#0f1115] border-r border-gray-800 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold uppercase tracking-widest text-white">Admin Dashboard</h2>
        </div>
        <div className="flex-1 py-6 flex flex-col gap-6 px-4">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3 px-4">Content Management</p>
            <button onClick={() => setActiveTab('pages')} className={`w-full px-4 py-2 mb-1 rounded text-left font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'pages' ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>Edit Pages</button>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3 px-4">Inventory</p>
            <button onClick={() => setActiveTab('products')} className={`w-full px-4 py-2 mb-1 rounded text-left font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'products' ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>Products</button>
            <button onClick={() => setActiveTab('bundles')} className={`w-full px-4 py-2 mb-1 rounded text-left font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'bundles' ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>Bundles</button>
            <button onClick={() => setActiveTab('vouchers')} className={`w-full px-4 py-2 rounded text-left font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'vouchers' ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>Vouchers</button>
          </div>
        </div>
      </div>

      <div className="flex-1 ml-64 p-10 max-w-5xl">
        
        {message.text && (
          <div className={`mb-6 px-6 py-4 rounded font-bold uppercase tracking-widest text-sm flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
            {message.text}
          </div>
        )}

        {activeTab === 'pages' && (
          <div className="animate-fadeIn">
            <h1 className="text-3xl font-bold uppercase tracking-widest mb-8 border-b border-gray-800 pb-4">Page Content Editor</h1>
            <div className="flex gap-2 mb-8 border-b border-gray-800 pb-4">
              {pages.map(page => (
                <button key={page} onClick={() => setActivePage(page)} className={`px-6 py-2 rounded text-sm font-bold uppercase tracking-widest transition-all ${activePage === page ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white hover:bg-gray-900'}`}>{page}</button>
              ))}
            </div>
            <form onSubmit={handleCmsSubmit} className="space-y-8">
              {activePage !== 'checkout' && (
                <div className="bg-[#0f1115] border border-gray-800 p-8 rounded-xl space-y-6">
                  <h3 className="text-electric font-bold uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Header Section</h3>
                  <div><label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Headline</label><input required type="text" value={pageContent.hero_title} onChange={e => setPageContent({...pageContent, hero_title: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white transition-colors" /></div>
                  <div><label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Subtitle</label><textarea required rows="2" value={pageContent.hero_subtitle} onChange={e => setPageContent({...pageContent, hero_subtitle: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white resize-none"></textarea></div>
                  {activePage !== 'shop' && (
                    <div>
                      <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Background Image</label>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'hero_image_url', 'page')} disabled={isUploading} className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-4 file:rounded file:border-0 file:text-sm file:font-bold file:uppercase file:tracking-widest file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer" />
                      {pageContent.hero_image_url && (<div className="mt-4 h-48 rounded overflow-hidden border border-gray-800 relative bg-gray-900"><div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${pageContent.hero_image_url})` }}></div></div>)}
                    </div>
                  )}
                </div>
              )}
              {activePage === 'home' && (
                <div className="bg-[#0f1115] border border-gray-800 p-8 rounded-xl space-y-6">
                  <h3 className="text-ion font-bold uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Featured Gear Selection</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[0, 1, 2].map((index) => (
                      <div key={index}>
                        <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Slot {index + 1}</label>
                        <select value={pageContent.featured_ids[index] || ''} onChange={(e) => handleFeaturedSelection(index, e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-ion transition-colors cursor-pointer text-sm">
                          <option value="">-- None --</option>
                          {productsList.map(product => (<option key={product.id} value={product.id}>[{product.category}] {product.name}</option>))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activePage === 'checkout' && (
                <div className="bg-[#0f1115] border border-gray-800 p-8 rounded-xl space-y-6">
                  <h3 className="text-ion font-bold uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Support & Policy Information</h3>
                  <div><label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Support Email</label><input type="email" value={pageContent.support_email} onChange={e => setPageContent({...pageContent, support_email: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white transition-colors" /></div>
                  <div><label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Support Phone Number</label><input type="text" value={pageContent.support_phone} onChange={e => setPageContent({...pageContent, support_phone: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white transition-colors" /></div>
                  <div><label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Return Policy Text</label><textarea rows="3" value={pageContent.return_policy} onChange={e => setPageContent({...pageContent, return_policy: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white resize-none"></textarea></div>
                </div>
              )}
              <button type="submit" disabled={isSubmitting || isUploading} className={`w-full font-bold uppercase tracking-widest py-4 rounded transition-all duration-300 mt-4 ${isSubmitting || isUploading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}>
                {isSubmitting ? 'Saving...' : `Update ${activePage} Page`}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
              <h1 className="text-3xl font-bold uppercase tracking-widest">{editProductId ? 'Edit Product' : 'Add Product'}</h1>
              {editProductId && (
                <button onClick={() => { setEditProductId(null); setNewProduct(emptyProduct); }} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white">Cancel Edit</button>
              )}
            </div>
            <form onSubmit={handleProductSubmit} className="bg-[#0f1115] border border-gray-800 p-8 rounded-xl space-y-6 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Product Name</label><input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white transition-colors" /></div>
                <div><label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Category</label><select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white transition-colors cursor-pointer"><option value="Mouse">Mouse</option><option value="Keyboard">Keyboard</option><option value="Headset">Headset</option><option value="Surfaces">Surfaces</option><option value="Microphones">Microphones</option></select></div>
                <div><label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Price (USD)</label><input required type="number" step="0.01" min="0" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white transition-colors" /></div>
                <div><label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Discount (%)</label><input type="number" min="0" max="100" value={newProduct.discount_percent} onChange={e => setNewProduct({...newProduct, discount_percent: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white transition-colors" /></div>
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Sale Expiration Date & Time</label>
                <input type="datetime-local" value={newProduct.expires_at} onChange={e => setNewProduct({...newProduct, expires_at: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white transition-colors [color-scheme:dark]" />
              </div>
              <div><label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Image URL</label><input required type="url" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white transition-colors" /></div>
              <div><label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Description</label><textarea required rows="4" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white transition-colors resize-none"></textarea></div>
              <button type="submit" disabled={isSubmitting} className={`w-full font-bold uppercase tracking-widest py-4 rounded transition-all duration-300 mt-4 ${isSubmitting ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}>{editProductId ? 'Save Changes' : 'Add Product'}</button>
            </form>

            <h2 className="text-xl font-bold uppercase tracking-widest mb-6 border-b border-gray-800 pb-2 text-gray-400">Inventory Roster</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productsList.map(p => (
                <div key={p.id} className="bg-gray-900 border border-gray-800 p-4 rounded flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{p.category}</span>
                    <p className="font-bold text-sm truncate w-48">{p.name}</p>
                    <p className="text-ion text-xs">${p.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditProduct(p)} className="text-xs bg-gray-800 hover:bg-white hover:text-black px-3 py-1 rounded transition-colors font-bold uppercase tracking-widest">Edit</button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="text-xs bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-500 hover:text-white px-3 py-1 rounded transition-colors font-bold uppercase tracking-widest">Del</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bundles' && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
              <h1 className="text-3xl font-bold uppercase tracking-widest">{editBundleId ? 'Edit Bundle' : 'Create Bundle'}</h1>
              {editBundleId && (
                <button onClick={() => { setEditBundleId(null); setNewBundle(emptyBundle); }} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white">Cancel Edit</button>
              )}
            </div>
            
            <form onSubmit={handleBundleSubmit} className="bg-[#0f1115] border border-gray-800 p-8 rounded-xl space-y-6 mb-12">
              <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-xl mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[0, 1, 2].map((index) => (
                    <div key={index}>
                      <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Item {index + 1}</label>
                      <select value={newBundle.bundle_ids[index] || ''} onChange={(e) => handleBundleSelection(index, e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-ion transition-colors cursor-pointer text-sm">
                        <option value="">-- Optional --</option>
                        {productsList.map(product => (<option key={product.id} value={product.id}>{product.name}</option>))}
                      </select>
                    </div>
                  ))}
                </div>

                {newBundle.bundle_ids.some(id => id !== '') && (
                  <div className="bg-[#0B0D10] border border-gray-800 rounded p-6 font-mono text-sm max-w-2xl mx-auto w-full">
                    <div className="space-y-3 mb-4">
                      {newBundle.bundle_ids.map((id, index) => {
                        if (!id) return null;
                        const product = productsList.find(p => String(p.id) === String(id));
                        if (!product) return null;
                        return (
                          <div key={`${id}-${index}`} className="flex justify-between items-center text-gray-300">
                            <span className="truncate pr-4">{product.name}</span>
                            <span className="shrink-0 text-gray-400">${product.price.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-dashed border-gray-700 pt-4 flex justify-between items-center text-white font-bold text-lg">
                      <span>TOTAL REGULAR VALUE</span>
                      <span>${currentBundleValue.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Bundle Name</label>
                  <input required type="text" value={newBundle.title} onChange={e => setNewBundle({...newBundle, title: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white transition-colors" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Discounted Bundle Price (USD)</label>
                  <input required type="number" step="0.01" min="0" value={newBundle.bundle_price} onChange={e => setNewBundle({...newBundle, bundle_price: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-ion transition-colors" placeholder={`e.g., ${(currentBundleValue * 0.8).toFixed(2)}`} />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Offer Expiration Date & Time</label>
                <input type="datetime-local" value={newBundle.expires_at} onChange={e => setNewBundle({...newBundle, expires_at: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white transition-colors [color-scheme:dark]" />
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Bundle Image Upload</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image_url', 'bundle')} disabled={isUploading} className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-4 file:rounded file:border-0 file:text-sm file:font-bold file:uppercase file:tracking-widest file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer mb-2" />
                {newBundle.image_url && (<div className="h-32 w-48 rounded border border-gray-800 relative bg-gray-900"><div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${newBundle.image_url})` }}></div></div>)}
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Description</label>
                <textarea required rows="3" value={newBundle.description} onChange={e => setNewBundle({...newBundle, description: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white transition-colors resize-none"></textarea>
              </div>
              
              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="isActive" checked={newBundle.is_active} onChange={e => setNewBundle({...newBundle, is_active: e.target.checked})} className="w-5 h-5 accent-white cursor-pointer" />
                <label htmlFor="isActive" className="text-white font-bold uppercase tracking-widest text-sm cursor-pointer">Set as Active</label>
              </div>

              <button type="submit" disabled={isSubmitting || isUploading} className={`w-full font-bold uppercase tracking-widest py-4 rounded transition-all duration-300 mt-4 ${isSubmitting || isUploading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}>
                {editBundleId ? 'Save Bundle Changes' : 'Create Bundle'}
              </button>
            </form>

            <h2 className="text-xl font-bold uppercase tracking-widest mb-6 border-b border-gray-800 pb-2 text-gray-400">Active Bundles</h2>
            <div className="grid grid-cols-1 gap-4">
              {bundlesList.map(b => (
                <div key={b.id} className="bg-gray-900 border border-gray-800 p-4 rounded flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-800 rounded bg-cover bg-center border border-gray-700" style={{ backgroundImage: `url(${b.image_url})` }}></div>
                    <div>
                      <p className="font-bold text-sm text-white uppercase tracking-widest">{b.title}</p>
                      <p className="text-ion text-xs">${b.bundle_price}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditBundle(b)} className="text-xs bg-gray-800 hover:bg-white hover:text-black px-4 py-2 rounded transition-colors font-bold uppercase tracking-widest">Edit</button>
                    <button onClick={() => handleDeleteBundle(b.id)} className="text-xs bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-500 hover:text-white px-4 py-2 rounded transition-colors font-bold uppercase tracking-widest">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'vouchers' && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
              <h1 className="text-3xl font-bold uppercase tracking-widest">{editVoucherId ? 'Edit Voucher' : 'Generate Voucher'}</h1>
              {editVoucherId && (
                <button onClick={() => { setEditVoucherId(null); setNewVoucher(emptyVoucher); }} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white">Cancel Edit</button>
              )}
            </div>
            
            <form onSubmit={handleVoucherSubmit} className="bg-[#0f1115] border border-gray-800 p-8 rounded-xl space-y-6 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Voucher Code</label>
                  <input required type="text" value={newVoucher.code} onChange={e => setNewVoucher({...newVoucher, code: e.target.value.toUpperCase()})} placeholder="e.g. MIDNIGHT20" className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white transition-colors font-mono uppercase" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Discount Amount (%)</label>
                  <input required type="number" min="1" max="100" value={newVoucher.discount_percent} onChange={e => setNewVoucher({...newVoucher, discount_percent: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white transition-colors" />
                </div>
                <div>
                  <input required type="number" min="1" value={newVoucher.max_uses} onChange={e => setNewVoucher({...newVoucher, max_uses: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white transition-colors" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Expiration Date & Time (Optional)</label>
                  <input type="datetime-local" value={newVoucher.expires_at} onChange={e => setNewVoucher({...newVoucher, expires_at: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-white transition-colors [color-scheme:dark]" />
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="vActive" checked={newVoucher.is_active} onChange={e => setNewVoucher({...newVoucher, is_active: e.target.checked})} className="w-5 h-5 accent-white cursor-pointer" />
                <label htmlFor="vActive" className="text-white font-bold uppercase tracking-widest text-sm cursor-pointer">Set as Active</label>
              </div>

              <button type="submit" disabled={isSubmitting} className={`w-full font-bold uppercase tracking-widest py-4 rounded transition-all duration-300 mt-4 ${isSubmitting ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}>
                {editVoucherId ? 'Save Changes' : 'Generate Code'}
              </button>
            </form>

            <h2 className="text-xl font-bold uppercase tracking-widest mb-6 border-b border-gray-800 pb-2 text-gray-400">Voucher Log</h2>
            <div className="grid grid-cols-1 gap-4">
              {vouchersList.map(v => (
                <div key={v.id} className={`bg-gray-900 border p-4 rounded flex items-center justify-between ${v.is_active && v.current_uses < v.max_uses ? 'border-gray-800' : 'border-red-900/30 opacity-70'}`}>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-bold text-lg text-white font-mono tracking-widest">{v.code}</p>
                      {!v.is_active && <span className="bg-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">Disabled</span>}
                      {v.current_uses >= v.max_uses && <span className="bg-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">Maxed Out</span>}
                    </div>
                    <p className="text-gray-400 text-xs font-mono">{v.discount_percent}% OFF | USES: {v.current_uses} / {v.max_uses}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditVoucher(v)} className="text-xs bg-gray-800 hover:bg-white hover:text-black px-4 py-2 rounded transition-colors font-bold uppercase tracking-widest">Edit</button>
                    <button onClick={() => handleDeleteVoucher(v.id)} className="text-xs bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-500 hover:text-white px-4 py-2 rounded transition-colors font-bold uppercase tracking-widest">Del</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}