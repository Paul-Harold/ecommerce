import React, { useState, useEffect } from 'react';
import { supabase } from '../libs/supabase.js';

export default function PagesTab() {
  const pages = ['home', 'shop', 'offers', 'global'];
  
  const [activePage, setActivePage] = useState('home');
  const [productsList, setProductsList] = useState([]);
  
  const [pageContent, setPageContent] = useState({ 
    hero_title: '', hero_subtitle: '', hero_image_url: '',
    featured_ids: ['', '', ''], carousel_ids: ['', '', ''], support_email: '', support_phone: '', return_policy: '',
    offers_terms: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchPageContent(activePage);
  }, [activePage]);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProductsList(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  async function fetchPageContent(pageName) {
    try {
      const { data, error } = await supabase.from('site_content').select('*').eq('page_name', pageName).maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPageContent({
          hero_title: data.hero_title || '', 
          hero_subtitle: data.hero_subtitle || '', 
          hero_image_url: data.hero_image_url || '',
          featured_ids: data.content_data?.featured_ids || ['', '', ''],
          carousel_ids: data.content_data?.carousel_ids || ['', '', ''],
          support_email: data.content_data?.support_email || 'support@midnight.com', 
          support_phone: data.content_data?.support_phone || '1-800-MIDNIGHT', 
          return_policy: data.content_data?.return_policy || '30-day money-back guarantee.',
          offers_terms: data.content_data?.offers_terms || 'Standard terms and conditions apply to all promotions.'
        });
      } else {
        setPageContent({ 
          hero_title: '', hero_subtitle: '', hero_image_url: '', 
          featured_ids: ['', '', ''], carousel_ids: ['', '', ''], support_email: '', support_phone: '', 
          return_policy: '', offers_terms: '' 
        });
      }
    } catch (error) {
      console.error("Error fetching page content:", error);
    }
  }

  const handleFeaturedSelection = (index, value) => {
    const newIds = [...pageContent.featured_ids];
    newIds[index] = value;
    setPageContent({ ...pageContent, featured_ids: newIds });
  };

  const handleCarouselSelection = (index, value) => {
    const newIds = [...pageContent.carousel_ids];
    newIds[index] = value;
    setPageContent({ ...pageContent, carousel_ids: newIds });
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
      
      setPageContent(prev => ({ ...prev, hero_image_url: data.publicUrl }));
      setMessage({ type: 'success', text: 'Image successfully uploaded.' });
    } catch (error) { 
      setMessage({ type: 'error', text: 'Upload failed.' }); 
    } finally { 
      setIsUploading(false); 
    }
  };

  const handleCmsSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let dynamicContentData = {};
    if (activePage === 'home') dynamicContentData = { featured_ids: pageContent.featured_ids.filter(id => id !== '') };
    else if (activePage === 'shop') dynamicContentData = { carousel_ids: pageContent.carousel_ids.filter(id => id !== '') };
    else if (activePage === 'offers') dynamicContentData = { offers_terms: pageContent.offers_terms };
    else if (activePage === 'global') dynamicContentData = { support_email: pageContent.support_email, support_phone: pageContent.support_phone, return_policy: pageContent.return_policy };

    try {
      const { error } = await supabase.from('site_content').upsert({
        page_name: activePage, 
        hero_title: pageContent.hero_title, 
        hero_subtitle: pageContent.hero_subtitle, 
        hero_image_url: pageContent.hero_image_url, 
        content_data: dynamicContentData, 
        updated_at: new Date()
      }, { onConflict: 'page_name' });
      
      if (error) throw error;
      setMessage({ type: 'success', text: `${activePage.toUpperCase()} content updated successfully.` });
    } catch (error) { 
      setMessage({ type: 'error', text: 'Failed to update content.' }); 
    } finally { 
      setIsSubmitting(false); 
      setTimeout(() => setMessage({ type: '', text: '' }), 3000); 
    }
  };

  return (
    <div className="animate-fadeIn">
      {message.text && (
        <div className={`mb-4 lg:mb-6 px-4 py-3 lg:px-6 lg:py-4 rounded font-bold uppercase tracking-widest text-xs lg:text-sm flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
          {message.text}
        </div>
      )}

      <h1 className="text-2xl lg:text-3xl font-bold uppercase tracking-widest mb-6 lg:mb-8 border-b border-gray-800 pb-4">Page Content Editor</h1>
      
      <div className="flex gap-2 mb-6 lg:mb-8 border-b border-gray-800 pb-4 overflow-x-auto custom-scrollbar w-full">
        {pages.map(page => (
          <button 
            key={page} 
            onClick={() => setActivePage(page)} 
            className={`px-4 lg:px-6 py-2 rounded text-xs lg:text-sm font-bold uppercase tracking-widest transition-all shrink-0 ${activePage === page ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white hover:bg-gray-900'}`}
          >
            {page}
          </button>
        ))}
      </div>
      
      <form onSubmit={handleCmsSubmit} className="space-y-6 lg:space-y-8">
        
        {activePage !== 'global' && (
          <div className="bg-[#0f1115] border border-gray-800 p-5 lg:p-8 rounded-xl space-y-4 lg:space-y-6">
            <h3 className="text-electric font-bold text-sm lg:text-base uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Header Section</h3>
            <div>
              <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Headline</label>
              <input required type="text" value={pageContent.hero_title} onChange={e => setPageContent({...pageContent, hero_title: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors text-xs lg:text-sm" />
            </div>
            <div>
              <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Subtitle</label>
              <textarea required rows="2" value={pageContent.hero_subtitle} onChange={e => setPageContent({...pageContent, hero_subtitle: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white resize-none text-xs lg:text-sm"></textarea>
            </div>
            {(activePage === 'home' || activePage === 'offers') && (
              <div>
                <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Background Image</label>
                <input type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} className="block w-full text-xs lg:text-sm text-gray-400 file:mr-2 lg:file:mr-4 file:py-2 lg:file:py-3 file:px-3 lg:file:px-4 file:rounded file:border-0 file:text-[10px] lg:file:text-sm file:font-bold file:uppercase file:tracking-widest file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer" />
                {pageContent.hero_image_url && (<div className="mt-4 h-32 lg:h-48 rounded overflow-hidden border border-gray-800 relative bg-gray-900"><div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${pageContent.hero_image_url})` }}></div></div>)}
              </div>
            )}
          </div>
        )}

        {/* Home Page Specifics */}
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

        {/* Shop Page Specifics (NEW CAROUSEL CONTROL) */}
        {activePage === 'shop' && (
          <div className="bg-[#0f1115] border border-gray-800 p-5 lg:p-8 rounded-xl space-y-4 lg:space-y-6">
            <h3 className="text-ion font-bold text-sm lg:text-base uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Shop Carousel Gear</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index}>
                  <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1 lg:mb-2">Carousel Slot {index + 1}</label>
                  <select value={pageContent.carousel_ids[index] || ''} onChange={(e) => handleCarouselSelection(index, e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-ion transition-colors cursor-pointer text-xs lg:text-sm">
                    <option value="">-- Auto-fill Newest --</option>
                    {productsList.map(product => (<option key={product.id} value={product.id}>[{product.category}] {product.name}</option>))}
                  </select>
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-[8px] lg:text-[10px] font-mono uppercase tracking-widest mt-2">Pick up to 3 specific products to rotate in the shop. Empty slots will automatically pull the newest database entries.</p>
          </div>
        )}

        {/* Offers Page Specifics */}
        {activePage === 'offers' && (
          <div className="bg-[#0f1115] border border-gray-800 p-5 lg:p-8 rounded-xl space-y-4 lg:space-y-6">
            <h3 className="text-ion font-bold text-sm lg:text-base uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Offers Configuration</h3>
            <div>
              <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Terms & Conditions Disclaimer</label>
              <textarea rows="3" value={pageContent.offers_terms} onChange={e => setPageContent({...pageContent, offers_terms: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white resize-none text-xs lg:text-sm"></textarea>
            </div>
          </div>
        )}

        {/* Global Settings */}
        {activePage === 'global' && (
          <div className="bg-[#0f1115] border border-gray-800 p-5 lg:p-8 rounded-xl space-y-4 lg:space-y-6">
            <h3 className="text-ion font-bold text-sm lg:text-base uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Global Support Settings</h3>
            <div>
              <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Support Email</label>
              <input type="email" value={pageContent.support_email} onChange={e => setPageContent({...pageContent, support_email: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors text-xs lg:text-sm" />
            </div>
            <div>
              <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Support Phone Number</label>
              <input type="text" value={pageContent.support_phone} onChange={e => setPageContent({...pageContent, support_phone: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors text-xs lg:text-sm" />
            </div>
            <div>
              <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Return Policy Text</label>
              <textarea rows="3" value={pageContent.return_policy} onChange={e => setPageContent({...pageContent, return_policy: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white resize-none text-xs lg:text-sm"></textarea>
            </div>
          </div>
        )}

        <button type="submit" disabled={isSubmitting || isUploading} className={`w-full font-bold uppercase tracking-widest py-3 lg:py-4 rounded transition-all duration-300 mt-4 text-xs lg:text-sm ${isSubmitting || isUploading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}>
          {isSubmitting ? 'Saving...' : `Update ${activePage} Settings`}
        </button>
      </form>
    </div>
  );
}