import React, { useState } from 'react';
import NewsletterTab from '../admin/NewsletterTab';
import OrdersTab from '../admin/OrdersTab';
import ProductsTab from '../admin/ProductsTab';
import DiscountsTab from '../admin/DiscountsTab';
import BundlesTab from '../admin/BundlesTab';
import VouchersTab from '../admin/VouchersTab';
import PagesTab from '../admin/PagesTab';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col lg:flex-row pt-16 lg:pt-20">
      
      {/* Mobile Horizontal Pill Navigation */}
      <div className="lg:hidden w-full bg-[#0f1115] border-b border-gray-800 sticky top-16 z-40 overflow-x-auto custom-scrollbar flex p-3 gap-2 shadow-md">
        <button onClick={() => setActiveTab('orders')} className={`shrink-0 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'orders' ? 'bg-electric text-black' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>Orders</button>
        <button onClick={() => setActiveTab('newsletter')} className={`shrink-0 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'newsletter' ? 'bg-electric text-black' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>Newsletter</button>
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
            <button onClick={() => setActiveTab('orders')} className={`w-full px-4 py-2 mb-1 rounded text-left font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'orders' ? 'bg-electric text-black' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>Orders</button>
            <button onClick={() => setActiveTab('newsletter')} className={`w-full px-4 py-2 rounded text-left font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'newsletter' ? 'bg-electric text-black' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>Newsletter</button>
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

      {/* Main Content Area - Component Router */}
      <div className="flex-1 w-full lg:ml-64 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto overflow-x-hidden">
        {activeTab === 'orders' && <OrdersTab />}
        
        {/* Placeholder components to prevent crashes until we build them */}
        {activeTab === 'newsletter' && <div className="text-gray-500 font-mono">Newsletter Module Loading...</div>}
        {activeTab === 'products' && <div className="text-gray-500 font-mono">Products Module Loading...</div>}
        {activeTab === 'discounts' && <div className="text-gray-500 font-mono">Discounts Module Loading...</div>}
        {activeTab === 'bundles' && <div className="text-gray-500 font-mono">Bundles Module Loading...</div>}
        {activeTab === 'vouchers' && <div className="text-gray-500 font-mono">Vouchers Module Loading...</div>}
        {activeTab === 'pages' && <div className="text-gray-500 font-mono">Pages Module Loading...</div>}
        {activeTab === 'newsletter' && <NewsletterTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'discounts' && <DiscountsTab />}
        {activeTab === 'bundles' && <BundlesTab />}
        {activeTab === 'vouchers' && <VouchersTab />}
        {activeTab === 'pages' && <PagesTab />}
      </div>
    </div>
  );
}