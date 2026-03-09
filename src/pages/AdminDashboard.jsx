import React, { useState, useEffect } from 'react';
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
  const [subscribersList, setSubscribersList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  const [editProductId, setEditProductId] = useState(null);
  const [editBundleId, setEditBundleId] = useState(null);
  const [editVoucherId, setEditVoucherId] = useState(null);

  const [pageContent, setPageContent] = useState({ 
    hero_title: '', hero_subtitle: '', hero_image_url: '',
    featured_ids: ['', '', ''], support_email: '', support_phone: '', return_policy: '',
    flagship_id: '', offers_terms: ''
  });

  const [newsletterData, setNewsletterData] = useState({
    subject: '', heading: '', message: '', promo_code: ''
  });

  const emptyProduct = { name: '', category: 'Mouse', price: '', description: '', image: '' };
  const [newProduct, setNewProduct] = useState(emptyProduct);
  
  const emptyBundle = { title: '', description: '', image_url: '', bundle_price: '', bundle_ids: ['', '', ''], is_active: true, expires_at: '', type: 'bundle' };
  const [newBundle, setNewBundle] = useState(emptyBundle);

  const emptyVoucher = { code: '', discount_percent: 10, max_uses: 100, expires_at: '', is_active: true };
  const [newVoucher, setNewVoucher] = useState(emptyVoucher);

  const emptyDiscount = { product_id: '', discount_percent: '', expires_at: '' };
  const [discountForm, setDiscountForm] = useState(emptyDiscount);

  const pages = ['home', 'shop', 'offers', 'global'];

  useEffect(() => {
    fetchInventory();
    fetchNewsletterData();
    fetchOrders();
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

  async function fetchNewsletterData() {
    const { data: templateData } = await supabase.from('site_content').select('content_data').eq('page_name', 'newsletter_template').maybeSingle();
    if (templateData && templateData.content_data) {
      setNewsletterData(templateData.content_data);
    } else {
      setNewsletterData({ subject: "Welcome to Midnight OS", heading: "WELCOME TO THE GRID", message: "Thanks for subscribing.", promo_code: "WELCOME10" });
    }

    const { data: subData } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
    if (subData) setSubscribersList(subData);
  }

  async function fetchOrders() {
    const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (orderData) setOrdersList(orderData);
  }

  async function fetchPageContent(pageName) {
    const { data } = await supabase.from('site_content').select('*').eq('page_name', pageName).maybeSingle();
    if (data) {
      setPageContent({
        hero_title: data.hero_title || '', hero_subtitle: data.hero_subtitle || '', hero_image_url: data.hero_image_url || '',
        featured_ids: data.content_data?.featured_ids || ['', '', ''],
        support_email: data.content_data?.support_email || 'support@midnight.com', support_phone: data.content_data?.support_phone || '1-800-MIDNIGHT', return_policy: data.content_data?.return_policy || '30-day money-back guarantee.',
        flagship_id: data.content_data?.flagship_id || '',
        offers_terms: data.content_data?.offers_terms || 'Standard terms and conditions apply to all promotions.'
      });
    } else {
      setPageContent({ hero_title: '', hero_subtitle: '', hero_image_url: '', featured_ids: ['', '', ''], support_email: '', support_phone: '', return_policy: '', flagship_id: '', offers_terms: '' });
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
    else if (activePage === 'shop') dynamicContentData = { flagship_id: pageContent.flagship_id };
    else if (activePage === 'offers') dynamicContentData = { offers_terms: pageContent.offers_terms };
    else if (activePage === 'global') dynamicContentData = { support_email: pageContent.support_email, support_phone: pageContent.support_phone, return_policy: pageContent.return_policy };

    try {
      const { error } = await supabase.from('site_content').upsert({
        page_name: activePage, hero_title: pageContent.hero_title, hero_subtitle: pageContent.hero_subtitle, hero_image_url: pageContent.hero_image_url, content_data: dynamicContentData, updated_at: new Date()
      }, { onConflict: 'page_name' });
      if (error) throw error;
      setMessage({ type: 'success', text: `${activePage.toUpperCase()} content updated successfully.` });
    } catch (error) { setMessage({ type: 'error', text: 'Failed to update content.' }); } 
    finally { setIsSubmitting(false); setTimeout(() => setMessage({ type: '', text: '' }), 3000); }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('broadcast-newsletter', { body: newsletterData });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Broadcast transmission sent to all subscribers.' });
      setNewsletterData({ subject: '', heading: '', message: '', promo_code: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to broadcast transmission.' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    // Quick validation to ensure image was actually uploaded before submitting
    if (!newProduct.image) {
      setMessage({ type: 'error', text: 'Please upload a product image before saving.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { 
        name: newProduct.name, category: newProduct.category, price: parseFloat(newProduct.price), description: newProduct.description, image: newProduct.image
      };
      if (editProductId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editProductId);
        if (error) throw error;
        setMessage({ type: 'success', text: `Product updated successfully!` });
      } else {
        const insertPayload = { ...payload, discount_percent: 0, expires_at: null };
        const { error } = await supabase.from('products').insert([insertPayload]);
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
    setNewProduct({ name: product.name, category: product.category, price: product.price, description: product.description, image: product.image });
    setEditProductId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDiscountSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { discount_percent: parseInt(discountForm.discount_percent), expires_at: discountForm.expires_at ? new Date(discountForm.expires_at).toISOString() : null };
      const { error } = await supabase.from('products').update(payload).eq('id', discountForm.product_id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Discount applied successfully.' });
      setDiscountForm(emptyDiscount);
      fetchInventory();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to apply discount.' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleRemoveDiscount = async (id) => {
    try {
      const { error } = await supabase.from('products').update({ discount_percent: 0, expires_at: null }).eq('id', id);
      if (error) throw error;
      fetchInventory();
      setMessage({ type: 'success', text: 'Discount removed.' });
    } catch (error) { setMessage({ type: 'error', text: 'Failed to remove discount.' }); }
  };

  const handleBundleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { 
        type: 'bundle', title: newBundle.title, description: newBundle.description, image_url: newBundle.image_url, 
        bundle_price: parseFloat(newBundle.bundle_price) || 0, bundle_ids: newBundle.bundle_ids.filter(id => id !== ''),
        is_active: newBundle.is_active, expires_at: newBundle.expires_at ? new Date(newBundle.expires_at).toISOString() : null
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
      title: bundle.title, description: bundle.description, image_url: bundle.image_url, bundle_price: bundle.bundle_price, 
      bundle_ids: paddedIds, is_active: bundle.is_active, expires_at: bundle.expires_at ? new Date(bundle.expires_at).toISOString().slice(0, 16) : '', type: 'bundle'
    });
    setEditBundleId(bundle.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVoucherSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { 
        code: newVoucher.code.toUpperCase().trim(), discount_percent: parseInt(newVoucher.discount_percent) || 0,
        max_uses: parseInt(newVoucher.max_uses) || 0, is_active: newVoucher.is_active,
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

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      fetchOrders();
      setMessage({ type: 'success', text: `Order #${orderId.substring(0,8)} status updated to ${newStatus}.` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update order status.' });
    } finally {
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const currentBundleValue = newBundle.bundle_ids.reduce((total, id) => {
    const product = productsList.find(p => String(p.id) === String(id));
    return total + (product ? parseFloat(product.price) : 0);
  }, 0);

  const discountedProducts = productsList.filter(p => p.discount_percent > 0);
  const pendingOrdersCount = ordersList.filter(o => o.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col lg:flex-row pt-16 lg:pt-20">
      
      {/* Mobile Horizontal Pill Navigation */}
      <div className="lg:hidden w-full bg-[#0f1115] border-b border-gray-800 sticky top-16 z-40 overflow-x-auto custom-scrollbar flex p-3 gap-2 shadow-md">
        <button onClick={() => setActiveTab('orders')} className={`shrink-0 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'bg-electric text-black' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>
          Orders {pendingOrdersCount > 0 && <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[8px]">{pendingOrdersCount}</span>}
        </button>
        <button onClick={() => setActiveTab('newsletter')} className={`shrink-0 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 ${activeTab === 'newsletter' ? 'bg-electric text-black' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>
          Newsletter {subscribersList.length > 0 && <span className="bg-[#0B0D10] text-electric px-1.5 py-0.5 rounded-full text-[8px]">{subscribersList.length}</span>}
        </button>
        <button onClick={() => setActiveTab('products')} className={`shrink-0 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'products' ? 'bg-white text-black' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>Products</button>
        <button onClick={() => setActiveTab('discounts')} className={`shrink-0 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'discounts' ? 'bg-white text-black' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>Discounts</button>
        <button onClick={() => setActiveTab('bundles')} className={`shrink-0 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'bundles' ? 'bg-white text-black' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>Bundles</button>
        <button onClick={() => setActiveTab('vouchers')} className={`shrink-0 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'vouchers' ? 'bg-white text-black' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>Vouchers</button>
        <button onClick={() => setActiveTab('pages')} className={`shrink-0 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'pages' ? 'bg-white text-black' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>Pages</button>
      </div>

      {/* Desktop Vertical Sidebar */}
      <div className="hidden lg:flex w-64 bg-[#0f1115] border-r border-gray-800 flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold uppercase tracking-widest text-white">Admin Dashboard</h2>
        </div>
        <div className="flex-1 py-6 flex flex-col gap-6 px-4 overflow-y-auto custom-scrollbar pb-24">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3 px-4">Operations</p>
            <button onClick={() => setActiveTab('orders')} className={`w-full px-4 py-2 mb-1 rounded text-left font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-between ${activeTab === 'orders' ? 'bg-electric text-black' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>
              Orders
              {pendingOrdersCount > 0 && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]">{pendingOrdersCount}</span>}
            </button>
            <button onClick={() => setActiveTab('newsletter')} className={`w-full px-4 py-2 rounded text-left font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-between ${activeTab === 'newsletter' ? 'bg-electric text-black' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>
              Newsletter 
              {subscribersList.length > 0 && <span className="bg-[#0B0D10] text-electric px-2 py-0.5 rounded-full text-[10px]">{subscribersList.length}</span>}
            </button>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3 px-4">Inventory</p>
            <button onClick={() => setActiveTab('products')} className={`w-full px-4 py-2 mb-1 rounded text-left font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'products' ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>Products</button>
            <button onClick={() => setActiveTab('discounts')} className={`w-full px-4 py-2 mb-1 rounded text-left font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'discounts' ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>Discounts</button>
            <button onClick={() => setActiveTab('bundles')} className={`w-full px-4 py-2 mb-1 rounded text-left font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'bundles' ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>Bundles</button>
            <button onClick={() => setActiveTab('vouchers')} className={`w-full px-4 py-2 mb-1 rounded text-left font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'vouchers' ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>Vouchers</button>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3 px-4">Content</p>
            <button onClick={() => setActiveTab('pages')} className={`w-full px-4 py-2 mb-1 rounded text-left font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'pages' ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>Pages</button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full lg:ml-64 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto overflow-x-hidden">
        
        {message.text && (
          <div className={`mb-4 lg:mb-6 px-4 py-3 lg:px-6 lg:py-4 rounded font-bold uppercase tracking-widest text-xs lg:text-sm flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
            {message.text}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6 lg:mb-8 border-b border-gray-800 pb-4">
              <h1 className="text-2xl lg:text-3xl font-bold uppercase tracking-widest">Order History</h1>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest bg-gray-900 px-3 py-1 rounded w-max">Total Orders: {ordersList.length}</span>
            </div>

            <div className="bg-[#0f1115] border border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar w-full">
                <table className="w-full text-left text-xs lg:text-sm text-gray-400 min-w-[700px]">
                  <thead className="text-[10px] text-gray-500 uppercase tracking-widest bg-gray-900/50 border-b border-gray-800">
                    <tr>
                      <th className="px-4 lg:px-6 py-4">Order ID / Date</th>
                      <th className="px-4 lg:px-6 py-4">Customer</th>
                      <th className="px-4 lg:px-6 py-4">Items</th>
                      <th className="px-4 lg:px-6 py-4">Total</th>
                      <th className="px-4 lg:px-6 py-4">Status</th>
                      <th className="px-4 lg:px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-mono text-xs lg:text-sm">No orders found in the database.</td>
                      </tr>
                    ) : (
                      ordersList.map((order) => (
                        <React.Fragment key={order.id}>
                          <tr className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors">
                            <td className="px-4 lg:px-6 py-4">
                              <div className="font-mono text-gray-300 mb-1">#{order.id.substring(0, 8)}</div>
                              <div className="text-[10px]">{new Date(order.created_at).toLocaleDateString()}</div>
                            </td>
                            <td className="px-4 lg:px-6 py-4 text-white max-w-[150px] truncate">{order.customer_email || 'Guest User'}</td>
                            <td className="px-4 lg:px-6 py-4">
                              <div className="max-w-[150px] lg:max-w-[200px] truncate text-[10px] lg:text-xs">
                                {order.items && order.items.map((item, idx) => (
                                  <span key={idx} className="block truncate">{item.quantity}x {item.name}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-4 font-bold text-ion">${parseFloat(order.total_amount).toFixed(2)}</td>
                            <td className="px-4 lg:px-6 py-4">
                              <select 
                                value={order.status || 'Pending'} 
                                onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                                className={`text-[10px] lg:text-xs font-bold uppercase tracking-widest rounded px-2 py-1 lg:px-3 lg:py-1.5 focus:outline-none cursor-pointer border ${
                                  order.status === 'Delivered' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
                                  order.status === 'Shipped' ? 'bg-electric/10 text-electric border-electric/30' :
                                  'bg-red-500/10 text-red-500 border-red-500/30'
                                }`}
                              >
                                <option value="Pending" className="bg-gray-900 text-white">Pending</option>
                                <option value="Processing" className="bg-gray-900 text-white">Processing</option>
                                <option value="Shipped" className="bg-gray-900 text-white">Shipped</option>
                                <option value="Delivered" className="bg-gray-900 text-white">Delivered</option>
                                <option value="Cancelled" className="bg-gray-900 text-white">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-4 lg:px-6 py-4 text-right">
                              <button 
                                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                className="text-[10px] font-bold uppercase tracking-widest bg-gray-800 hover:bg-white hover:text-black px-3 py-1.5 lg:px-4 lg:py-2 rounded transition-colors"
                              >
                                {expandedOrderId === order.id ? 'Close' : 'Details'}
                              </button>
                            </td>
                          </tr>
                          
                          {expandedOrderId === order.id && (
                            <tr className="bg-[#0B0D10] border-b border-gray-800/50">
                              <td colSpan="6" className="px-4 py-6 sm:px-8 sm:py-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-8">
                                  <div>
                                    <h4 className="text-electric text-[10px] font-bold uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">Customer Details</h4>
                                    <p className="text-xs lg:text-sm text-white mb-1"><span className="text-gray-500 font-mono text-[10px] lg:text-xs mr-2">NAME:</span> <span className="break-all">{order.customer_name || 'N/A'}</span></p>
                                    <p className="text-xs lg:text-sm text-white mb-1"><span className="text-gray-500 font-mono text-[10px] lg:text-xs mr-2">EMAIL:</span> <span className="break-all">{order.customer_email || 'N/A'}</span></p>
                                    <p className="text-xs lg:text-sm text-white"><span className="text-gray-500 font-mono text-[10px] lg:text-xs mr-2">PHONE:</span> {order.customer_phone || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-electric text-[10px] font-bold uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">Shipping Information</h4>
                                    <p className="text-xs lg:text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                                      {order.shipping_address ? (
                                        typeof order.shipping_address === 'object' ? 
                                          `${order.shipping_address.street}\n${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zip}\n${order.shipping_address.country}` 
                                          : order.shipping_address
                                      ) : 'No shipping address provided.'}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-electric text-[10px] font-bold uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">Financial Breakdown</h4>
                                    <div className="space-y-1 text-xs lg:text-sm font-mono text-gray-400">
                                      <div className="flex justify-between"><span>Subtotal:</span> <span className="text-white">${order.subtotal ? parseFloat(order.subtotal).toFixed(2) : parseFloat(order.total_amount).toFixed(2)}</span></div>
                                      <div className="flex justify-between"><span>Shipping:</span> <span className="text-white">${order.shipping_cost ? parseFloat(order.shipping_cost).toFixed(2) : '0.00'}</span></div>
                                      {order.discount_amount > 0 && <div className="flex justify-between text-ion"><span>Discount{order.voucher_code ? ` (${order.voucher_code})` : ''}:</span> <span>-${parseFloat(order.discount_amount).toFixed(2)}</span></div>}
                                      <div className="flex justify-between border-t border-dashed border-gray-700 pt-2 mt-2 text-white font-bold text-base lg:text-lg">
                                        <span>Total:</span> <span className="text-ion">${parseFloat(order.total_amount).toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                   <h4 className="text-electric text-[10px] font-bold uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">Itemized Order List</h4>
                                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                                     {order.items && order.items.map((item, idx) => (
                                        <div key={idx} className="bg-gray-900/50 p-3 rounded flex justify-between items-center border border-gray-800">
                                          <div className="flex gap-3 items-center">
                                            {item.image && <img src={item.image} alt="product" className="w-8 h-8 lg:w-10 lg:h-10 object-contain bg-gray-900 rounded border border-gray-700" />}
                                            <div>
                                              <p className="text-[10px] lg:text-xs text-white font-bold max-w-[100px] lg:max-w-[120px] truncate">{item.name}</p>
                                              <p className="text-[8px] lg:text-[10px] text-gray-500 font-mono">QTY: {item.quantity}</p>
                                            </div>
                                          </div>
                                          <span className="text-xs lg:text-sm font-bold text-ion">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                     ))}
                                   </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'newsletter' && (
          <div className="animate-fadeIn">
            <h1 className="text-2xl lg:text-3xl font-bold uppercase tracking-widest mb-6 lg:mb-8 border-b border-gray-800 pb-4">Newsletter Command Center</h1>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg lg:text-xl font-bold uppercase tracking-widest mb-4 lg:mb-6 text-gray-400 border-b border-gray-800 pb-2">Welcome Email Template</h2>
                <form onSubmit={handleNewsletterSubmit} className="bg-[#0f1115] border border-gray-800 p-5 lg:p-8 rounded-xl space-y-4 lg:space-y-6">
                  
                  <div>
                    <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1 lg:mb-2">Subject Line</label>
                    <input required type="text" value={newsletterData.subject} onChange={e => setNewsletterData({...newsletterData, subject: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-electric transition-colors text-xs lg:text-sm" />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1 lg:mb-2">Email Headline</label>
                    <input required type="text" value={newsletterData.heading} onChange={e => setNewsletterData({...newsletterData, heading: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-electric transition-colors text-xs lg:text-sm font-bold uppercase tracking-wider" />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1 lg:mb-2">Main Message</label>
                    <textarea required rows="4" value={newsletterData.message} onChange={e => setNewsletterData({...newsletterData, message: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-electric transition-colors resize-none text-xs lg:text-sm"></textarea>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1 lg:mb-2">Promo Code (Included in Box)</label>
                    <input required type="text" value={newsletterData.promo_code} onChange={e => setNewsletterData({...newsletterData, promo_code: e.target.value.toUpperCase()})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-ion focus:outline-none focus:border-ion transition-colors font-mono font-bold tracking-widest text-xs lg:text-sm" />
                  </div>

                  <button type="submit" disabled={isSubmitting} className={`w-full font-bold uppercase tracking-widest py-3 lg:py-4 rounded transition-all duration-300 mt-2 lg:mt-4 text-xs lg:text-sm ${isSubmitting ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-500'}`}>
                    {isSubmitting ? 'Transmitting...' : 'Broadcast to All Subscribers'}
                  </button>
                </form>
              </div>

              <div>
                <div className="flex justify-between items-end mb-4 lg:mb-6 border-b border-gray-800 pb-2">
                  <h2 className="text-lg lg:text-xl font-bold uppercase tracking-widest text-gray-400">Subscriber Grid</h2>
                  <span className="text-electric text-[10px] lg:text-xs font-bold uppercase tracking-widest bg-electric/10 px-2 lg:px-3 py-1 rounded">
                    Total: {subscribersList.length}
                  </span>
                </div>
                
                <div className="bg-[#0f1115] border border-gray-800 rounded-xl overflow-hidden">
                  <div className="max-h-[400px] lg:max-h-[600px] overflow-y-auto custom-scrollbar">
                    {subscribersList.length === 0 ? (
                      <div className="p-6 lg:p-8 text-center text-gray-500 text-xs lg:text-sm font-mono">No users on the grid yet.</div>
                    ) : (
                      subscribersList.map((sub, idx) => (
                        <div key={sub.id} className={`p-3 lg:p-4 flex flex-col gap-1 ${idx !== subscribersList.length - 1 ? 'border-b border-gray-800/50' : ''}`}>
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-xs lg:text-sm text-gray-300 break-all">{sub.email}</span>
                          </div>
                          <span className="text-[8px] lg:text-[10px] text-gray-600 font-mono">JOINED: {new Date(sub.created_at).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pages' && (
          <div className="animate-fadeIn">
            <h1 className="text-2xl lg:text-3xl font-bold uppercase tracking-widest mb-6 lg:mb-8 border-b border-gray-800 pb-4">Page Content Editor</h1>
            <div className="flex gap-2 mb-6 lg:mb-8 border-b border-gray-800 pb-4 overflow-x-auto custom-scrollbar w-full">
              {pages.map(page => (
                <button key={page} onClick={() => setActivePage(page)} className={`px-4 lg:px-6 py-2 rounded text-xs lg:text-sm font-bold uppercase tracking-widest transition-all shrink-0 ${activePage === page ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white hover:bg-gray-900'}`}>{page}</button>
              ))}
            </div>
            
            <form onSubmit={handleCmsSubmit} className="space-y-6 lg:space-y-8">
              
              {activePage !== 'global' && (
                <div className="bg-[#0f1115] border border-gray-800 p-5 lg:p-8 rounded-xl space-y-4 lg:space-y-6">
                  <h3 className="text-electric font-bold text-sm lg:text-base uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Header Section</h3>
                  <div><label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Headline</label><input required type="text" value={pageContent.hero_title} onChange={e => setPageContent({...pageContent, hero_title: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors text-xs lg:text-sm" /></div>
                  <div><label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Subtitle</label><textarea required rows="2" value={pageContent.hero_subtitle} onChange={e => setPageContent({...pageContent, hero_subtitle: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white resize-none text-xs lg:text-sm"></textarea></div>
                  {(activePage === 'home' || activePage === 'offers') && (
                    <div>
                      <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Background Image</label>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'hero_image_url', 'page')} disabled={isUploading} className="block w-full text-xs lg:text-sm text-gray-400 file:mr-2 lg:file:mr-4 file:py-2 lg:file:py-3 file:px-3 lg:file:px-4 file:rounded file:border-0 file:text-[10px] lg:file:text-sm file:font-bold file:uppercase file:tracking-widest file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer" />
                      {pageContent.hero_image_url && (<div className="mt-4 h-32 lg:h-48 rounded overflow-hidden border border-gray-800 relative bg-gray-900"><div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${pageContent.hero_image_url})` }}></div></div>)}
                    </div>
                  )}
                </div>
              )}

              {activePage === 'home' && (
                <div className="bg-[#0f1115] border border-gray-800 p-5 lg:p-8 rounded-xl space-y-4 lg:space-y-6">
                  <h3 className="text-ion font-bold text-sm lg:text-base uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Featured Gear Selection</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[0, 1, 2].map((index) => (
                      <div key={index}>
                        <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1 lg:mb-2">Slot {index + 1}</label>
                        <select value={pageContent.featured_ids[index] || ''} onChange={(e) => handleFeaturedSelection(index, e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-ion transition-colors cursor-pointer text-xs lg:text-sm">
                          <option value="">-- None --</option>
                          {productsList.map(product => (<option key={product.id} value={product.id}>[{product.category}] {product.name}</option>))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activePage === 'shop' && (
                <div className="bg-[#0f1115] border border-gray-800 p-5 lg:p-8 rounded-xl space-y-4 lg:space-y-6">
                  <h3 className="text-ion font-bold text-sm lg:text-base uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Shop Configuration</h3>
                  <div>
                    <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Featured Flagship Product Override</label>
                    <select value={pageContent.flagship_id} onChange={e => setPageContent({...pageContent, flagship_id: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-ion transition-colors cursor-pointer text-xs lg:text-sm">
                      <option value="">-- Auto-select Newest Gear --</option>
                      {productsList.map(product => (<option key={product.id} value={product.id}>[{product.category}] {product.name}</option>))}
                    </select>
                    <p className="text-gray-600 text-[8px] lg:text-[10px] mt-2 font-mono uppercase tracking-widest">Selecting a product forces it to be the giant featured item on the shop page.</p>
                  </div>
                </div>
              )}

              {activePage === 'offers' && (
                <div className="bg-[#0f1115] border border-gray-800 p-5 lg:p-8 rounded-xl space-y-4 lg:space-y-6">
                  <h3 className="text-ion font-bold text-sm lg:text-base uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Offers Configuration</h3>
                  <div>
                    <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Terms & Conditions Disclaimer</label>
                    <textarea rows="3" value={pageContent.offers_terms} onChange={e => setPageContent({...pageContent, offers_terms: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white resize-none text-xs lg:text-sm"></textarea>
                  </div>
                </div>
              )}

              {activePage === 'global' && (
                <div className="bg-[#0f1115] border border-gray-800 p-5 lg:p-8 rounded-xl space-y-4 lg:space-y-6">
                  <h3 className="text-ion font-bold text-sm lg:text-base uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Global Support Settings</h3>
                  <div><label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Support Email</label><input type="email" value={pageContent.support_email} onChange={e => setPageContent({...pageContent, support_email: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors text-xs lg:text-sm" /></div>
                  <div><label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Support Phone Number</label><input type="text" value={pageContent.support_phone} onChange={e => setPageContent({...pageContent, support_phone: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors text-xs lg:text-sm" /></div>
                  <div><label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Return Policy Text</label><textarea rows="3" value={pageContent.return_policy} onChange={e => setPageContent({...pageContent, return_policy: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white resize-none text-xs lg:text-sm"></textarea></div>
                </div>
              )}

              <button type="submit" disabled={isSubmitting || isUploading} className={`w-full font-bold uppercase tracking-widest py-3 lg:py-4 rounded transition-all duration-300 mt-4 text-xs lg:text-sm ${isSubmitting || isUploading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}>
                {isSubmitting ? 'Saving...' : `Update ${activePage} Settings`}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6 lg:mb-8 border-b border-gray-800 pb-4">
              <h1 className="text-2xl lg:text-3xl font-bold uppercase tracking-widest">{editProductId ? 'Edit Product' : 'Add Product'}</h1>
              {editProductId && (
                <button onClick={() => { setEditProductId(null); setNewProduct(emptyProduct); }} className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white bg-gray-900 px-3 py-1.5 rounded">Cancel Edit</button>
              )}
            </div>
            <form onSubmit={handleProductSubmit} className="bg-[#0f1115] border border-gray-800 p-5 lg:p-8 rounded-xl space-y-4 lg:space-y-6 mb-8 lg:mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div><label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Product Name</label><input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors text-xs lg:text-sm" /></div>
                <div><label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Category</label><select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors cursor-pointer text-xs lg:text-sm"><option value="Mouse">Mouse</option><option value="Keyboard">Keyboard</option><option value="Headset">Headset</option><option value="Surfaces">Surfaces</option><option value="Microphones">Microphones</option></select></div>
                <div><label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Price (USD)</label><input required type="number" step="0.01" min="0" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors text-xs lg:text-sm" /></div>
                
                {/* UPGRADED IMAGE UPLOAD FIELD */}
                <div>
                  <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Product Image Upload</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image', 'product')} disabled={isUploading} className="block w-full text-[10px] lg:text-xs text-gray-400 file:mr-2 lg:file:mr-4 file:py-2 lg:file:py-3 file:px-3 lg:file:px-4 file:rounded file:border-0 file:font-bold file:uppercase file:tracking-widest file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer mb-2" />
                  {newProduct.image && (
                    <div className="h-24 lg:h-32 w-32 lg:w-48 rounded border border-gray-800 relative bg-gray-900">
                      <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${newProduct.image})` }}></div>
                    </div>
                  )}
                </div>
                
              </div>
              <div><label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Description</label><textarea required rows="4" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors resize-none text-xs lg:text-sm"></textarea></div>
              <button type="submit" disabled={isSubmitting || isUploading} className={`w-full font-bold uppercase tracking-widest py-3 lg:py-4 rounded transition-all duration-300 mt-2 lg:mt-4 text-xs lg:text-sm ${isSubmitting || isUploading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}>{editProductId ? 'Save Changes' : 'Add Product'}</button>
            </form>

            <h2 className="text-lg lg:text-xl font-bold uppercase tracking-widest mb-4 lg:mb-6 border-b border-gray-800 pb-2 text-gray-400">Inventory Roster</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {productsList.map(p => (
                <div key={p.id} className="bg-gray-900 border border-gray-800 p-3 lg:p-4 rounded flex items-center justify-between">
                  <div className="flex items-center gap-3 w-full overflow-hidden">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-black rounded p-1 border border-gray-800 shrink-0">
                      <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="text-[8px] lg:text-[10px] text-gray-500 font-bold uppercase tracking-widest block">{p.category}</span>
                      <p className="font-bold text-xs lg:text-sm truncate w-full text-white">{p.name}</p>
                      <p className="text-ion text-[10px] lg:text-xs">${p.price}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 lg:gap-2 shrink-0 flex-col sm:flex-row">
                    <button onClick={() => handleEditProduct(p)} className="text-[10px] lg:text-xs bg-gray-800 hover:bg-white hover:text-black px-2 lg:px-3 py-1 lg:py-1.5 rounded transition-colors font-bold uppercase tracking-widest">Edit</button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="text-[10px] lg:text-xs bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-500 hover:text-white px-2 lg:px-3 py-1 lg:py-1.5 rounded transition-colors font-bold uppercase tracking-widest">Del</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'discounts' && (
          <div className="animate-fadeIn">
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
                        <span className="text-gray-500 text-[10px] lg:text-xs line-through">${p.price.toFixed(2)}</span>
                        <span className="text-white text-[10px] lg:text-xs">${(p.price - (p.price * (p.discount_percent / 100))).toFixed(2)}</span>
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
        )}

        {activeTab === 'bundles' && (
          <div className="animate-fadeIn">
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
                            <span className="shrink-0 text-gray-400">${product.price.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-dashed border-gray-700 pt-3 lg:pt-4 flex justify-between items-center text-white font-bold text-sm lg:text-lg">
                      <span className="truncate pr-2">TOTAL VALUE</span>
                      <span>${currentBundleValue.toFixed(2)}</span>
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
                  <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Discounted Bundle Price (USD)</label>
                  <input required type="number" step="0.01" min="0" value={newBundle.bundle_price} onChange={e => setNewBundle({...newBundle, bundle_price: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-ion transition-colors text-xs lg:text-sm" placeholder={`e.g., ${(currentBundleValue * 0.8).toFixed(2)}`} />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Offer Expiration Date & Time</label>
                <input type="datetime-local" value={newBundle.expires_at} onChange={e => setNewBundle({...newBundle, expires_at: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors [color-scheme:dark] text-xs lg:text-sm" />
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Bundle Image Upload</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image_url', 'bundle')} disabled={isUploading} className="block w-full text-[10px] lg:text-xs text-gray-400 file:mr-2 lg:file:mr-4 file:py-2 lg:file:py-3 file:px-3 lg:file:px-4 file:rounded file:border-0 file:font-bold file:uppercase file:tracking-widest file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer mb-2" />
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
                      <p className="text-ion text-[10px] lg:text-xs">${b.bundle_price}</p>
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
        )}

        {activeTab === 'vouchers' && (
          <div className="animate-fadeIn">
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
        )}

      </div>
    </div>
  );
}