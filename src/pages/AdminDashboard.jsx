import { useState, useEffect } from 'react';
import DashboardTab from '../admin/DashboardTab.jsx';
import NewsletterTab from '../admin/NewsletterTab';
import OrdersTab from '../admin/OrdersTab';
import ProductsTab from '../admin/ProductsTab';
import DiscountsTab from '../admin/DiscountsTab';
import BundlesTab from '../admin/BundlesTab';
import VouchersTab from '../admin/VouchersTab';
import PagesTab from '../admin/PagesTab';

// Single source of truth for the admin navigation, grouped by area.
const NAV_GROUPS = [
  { label: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard' }] },
  { label: 'Operations', items: [
    { id: 'orders', label: 'Orders' },
    { id: 'newsletter', label: 'Newsletter' },
  ] },
  { label: 'Catalog', items: [
    { id: 'products', label: 'Products' },
    { id: 'discounts', label: 'Discounts' },
    { id: 'bundles', label: 'Bundles' },
    { id: 'vouchers', label: 'Vouchers' },
  ] },
  { label: 'Content', items: [{ id: 'pages', label: 'Pages' }] },
];

const ALL_TABS = NAV_GROUPS.flatMap((g) => g.items);

export default function AdminDashboard() {
  // Persist the active tab so a refresh keeps the admin where they were.
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('admin_active_tab');
    return ALL_TABS.some((t) => t.id === saved) ? saved : 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('admin_active_tab', activeTab);
  }, [activeTab]);

  const TABS = {
    dashboard: <DashboardTab onNavigate={setActiveTab} />,
    orders: <OrdersTab />,
    newsletter: <NewsletterTab />,
    products: <ProductsTab />,
    discounts: <DiscountsTab />,
    bundles: <BundlesTab />,
    vouchers: <VouchersTab />,
    pages: <PagesTab />,
  };

  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col lg:flex-row pt-16 lg:pt-20">

      {/* Mobile Horizontal Pill Navigation */}
      <div className="lg:hidden w-full bg-[#0f1115] border-b border-gray-800 sticky top-16 z-40 overflow-x-auto custom-scrollbar flex p-3 gap-2 shadow-md">
        {ALL_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all ${
              activeTab === tab.id ? 'bg-electric text-black' : 'bg-gray-900 text-gray-400 border border-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop Vertical Sidebar */}
      <div className="hidden lg:flex w-64 bg-[#0f1115] border-r border-gray-800 flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold uppercase tracking-widest text-white">Admin Dashboard</h2>
        </div>
        <div className="flex-1 py-6 flex flex-col gap-6 px-4 overflow-y-auto custom-scrollbar pb-24">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3 px-4">{group.label}</p>
              {group.items.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full px-4 py-2 mb-1 rounded text-left font-bold uppercase tracking-widest text-xs transition-all ${
                    activeTab === tab.id ? 'bg-electric text-black' : 'text-gray-400 hover:text-white hover:bg-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full lg:ml-64 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto overflow-x-hidden">
        {TABS[activeTab]}
      </div>
    </div>
  );
}
