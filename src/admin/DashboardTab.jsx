import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../libs/supabase.js';
import { Card, ListHeading } from './AdminUI.jsx';

const peso = (n) =>
  `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_STYLES = {
  Pending: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
  Processing: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  Shipped: 'text-electric bg-electric/10 border-electric/30',
  Delivered: 'text-green-500 bg-green-500/10 border-green-500/30',
  Cancelled: 'text-red-500 bg-red-500/10 border-red-500/30',
};
const STATUS_ORDER = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function StatCard({ label, value, sub, accent = 'text-white', onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`text-left bg-[#0f1115] border border-gray-800 rounded-xl p-4 lg:p-6 transition-colors ${
        onClick ? 'hover:border-electric cursor-pointer' : 'cursor-default'
      }`}
    >
      <p className="text-gray-500 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest mb-1 lg:mb-2">{label}</p>
      <p className={`text-2xl lg:text-4xl font-black ${accent}`}>{value}</p>
      {sub && <p className="text-gray-500 text-[10px] lg:text-xs mt-1 lg:mt-2 font-mono">{sub}</p>}
    </button>
  );
}

export default function DashboardTab({ onNavigate }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    revenue: 0,
    revenueThisMonth: 0,
    orderCount: 0,
    ordersThisMonth: 0,
    openOrders: 0,
    productCount: 0,
    subscriberCount: 0,
    activeVouchers: 0,
    statusBreakdown: {},
    recentOrders: [],
  });

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [ordersRes, productsRes, subscribersRes, vouchersRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, total_amount, status, created_at, customer_email')
          .order('created_at', { ascending: false }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('subscribers').select('id', { count: 'exact', head: true }),
        supabase.from('vouchers').select('is_active, current_uses, max_uses'),
      ]);

      if (ordersRes.error) throw ordersRes.error;

      const orders = ordersRes.data || [];
      const statusBreakdown = {};
      let revenue = 0;
      let revenueThisMonth = 0;
      let ordersThisMonth = 0;
      let openOrders = 0;

      for (const o of orders) {
        const status = o.status || 'Pending';
        statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;

        // Cancelled orders don't count toward revenue.
        if (status !== 'Cancelled') {
          const amount = parseFloat(o.total_amount) || 0;
          revenue += amount;
          if (o.created_at && new Date(o.created_at) >= startOfMonth) {
            revenueThisMonth += amount;
            ordersThisMonth += 1;
          }
        }
        if (status === 'Pending' || status === 'Processing') openOrders += 1;
      }

      const vouchers = vouchersRes.data || [];
      const activeVouchers = vouchers.filter(
        (v) => v.is_active && (v.max_uses == null || v.current_uses < v.max_uses)
      ).length;

      setStats({
        revenue,
        revenueThisMonth,
        orderCount: orders.length,
        ordersThisMonth,
        openOrders,
        productCount: productsRes.count || 0,
        subscriberCount: subscribersRes.count || 0,
        activeVouchers,
        statusBreakdown,
        recentOrders: orders.slice(0, 6),
      });
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError('Could not load store statistics. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (isLoading) {
    return (
      <div className="animate-fadeIn flex flex-col items-center justify-center py-24 text-gray-500">
        <div className="w-10 h-10 border-4 border-gray-800 border-t-electric rounded-full animate-spin mb-4"></div>
        <p className="font-mono text-xs uppercase tracking-widest">Loading store overview...</p>
      </div>
    );
  }

  const maxStatus = Math.max(1, ...Object.values(stats.statusBreakdown));

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center gap-3 mb-6 lg:mb-8 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold uppercase tracking-widest">Dashboard</h1>
          <p className="text-gray-500 text-[10px] lg:text-xs font-mono mt-1">Live store overview</p>
        </div>
        <button
          onClick={loadStats}
          className="shrink-0 flex items-center gap-2 text-[10px] lg:text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-electric bg-gray-900 border border-gray-800 hover:border-electric px-3 lg:px-4 py-2 rounded transition-colors"
        >
          <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 lg:px-6 lg:py-4 rounded font-bold uppercase tracking-widest text-xs lg:text-sm border bg-red-500/10 text-red-500 border-red-500/30">
          {error}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
        <StatCard
          label="Total Revenue"
          value={peso(stats.revenue)}
          sub={`${peso(stats.revenueThisMonth)} this month`}
          accent="text-ion"
        />
        <StatCard
          label="Total Orders"
          value={stats.orderCount}
          sub={`${stats.openOrders} awaiting fulfillment`}
          onClick={onNavigate ? () => onNavigate('orders') : undefined}
        />
        <StatCard
          label="Products"
          value={stats.productCount}
          sub="Manage inventory"
          onClick={onNavigate ? () => onNavigate('products') : undefined}
        />
        <StatCard
          label="Subscribers"
          value={stats.subscriberCount}
          sub={`${stats.activeVouchers} active vouchers`}
          accent="text-electric"
          onClick={onNavigate ? () => onNavigate('newsletter') : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Order status breakdown */}
        <div>
          <ListHeading>Orders by Status</ListHeading>
          <Card className="p-5 lg:p-6">
            {stats.orderCount === 0 ? (
              <p className="text-gray-500 font-mono text-xs lg:text-sm text-center py-6">No orders yet.</p>
            ) : (
              <div className="space-y-3 lg:space-y-4">
                {STATUS_ORDER.filter((s) => stats.statusBreakdown[s]).map((status) => {
                  const count = stats.statusBreakdown[status];
                  const pct = Math.round((count / maxStatus) * 100);
                  return (
                    <div key={status}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${STATUS_STYLES[status] || 'text-gray-400 bg-gray-800 border-gray-700'}`}>
                          {status}
                        </span>
                        <span className="text-white font-bold text-xs lg:text-sm font-mono">{count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-electric/60 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Quick actions */}
          {onNavigate && (
            <>
              <ListHeading>Quick Actions</ListHeading>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { tab: 'products', label: '+ Add Product' },
                  { tab: 'vouchers', label: '+ New Voucher' },
                  { tab: 'bundles', label: '+ New Bundle' },
                  { tab: 'pages', label: 'Edit Pages' },
                ].map((a) => (
                  <button
                    key={a.tab}
                    onClick={() => onNavigate(a.tab)}
                    className="bg-gray-900 border border-gray-800 hover:border-electric hover:text-electric text-gray-300 font-bold uppercase tracking-widest text-[10px] lg:text-xs py-3 lg:py-4 rounded transition-colors"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent orders */}
        <div>
          <ListHeading>Recent Orders</ListHeading>
          <Card className="overflow-hidden">
            {stats.recentOrders.length === 0 ? (
              <p className="text-gray-500 font-mono text-xs lg:text-sm text-center py-10">No orders yet.</p>
            ) : (
              <div className="divide-y divide-gray-800/60">
                {stats.recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between gap-3 p-3 lg:p-4">
                    <div className="min-w-0">
                      <p className="font-mono text-white text-xs lg:text-sm">#{String(o.id).substring(0, 8)}</p>
                      <p className="text-gray-500 text-[10px] lg:text-xs truncate">{o.customer_email || 'Guest'}</p>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                      <span className="font-bold text-ion text-xs lg:text-sm">{peso(o.total_amount)}</span>
                      <span className={`text-[8px] lg:text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${STATUS_STYLES[o.status] || STATUS_STYLES.Pending}`}>
                        {o.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {onNavigate && stats.recentOrders.length > 0 && (
              <button
                onClick={() => onNavigate('orders')}
                className="w-full border-t border-gray-800 py-3 text-[10px] lg:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-electric hover:bg-gray-900/50 transition-colors"
              >
                View All Orders →
              </button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
