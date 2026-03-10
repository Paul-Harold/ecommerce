import React, { useState, useEffect } from 'react';
import { supabase } from '../libs/supabase.js';

export default function NewsletterTab() {
  const [newsletterData, setNewsletterData] = useState({
    subject: '', heading: '', message: '', promo_code: ''
  });
  const [subscribersList, setSubscribersList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchNewsletterData();
  }, []);

  async function fetchNewsletterData() {
    try {
      const { data: templateData, error: templateError } = await supabase
        .from('site_content')
        .select('content_data')
        .eq('page_name', 'newsletter_template')
        .maybeSingle();

      if (templateData && templateData.content_data) {
        setNewsletterData(templateData.content_data);
      } else {
        setNewsletterData({ 
          subject: "Welcome to Midnight OS", 
          heading: "WELCOME TO THE GRID", 
          message: "Thanks for subscribing.", 
          promo_code: "WELCOME10" 
        });
      }

      const { data: subData, error: subError } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (subData) setSubscribersList(subData);
    } catch (error) {
      console.error("Error fetching newsletter data:", error);
    }
  }

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

  return (
    <div className="animate-fadeIn">
      {message.text && (
        <div className={`mb-4 lg:mb-6 px-4 py-3 lg:px-6 lg:py-4 rounded font-bold uppercase tracking-widest text-xs lg:text-sm flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
          {message.text}
        </div>
      )}

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
  );
}