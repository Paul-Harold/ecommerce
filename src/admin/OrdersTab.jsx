import React, { useState, useEffect } from 'react';
import { supabase } from "../libs/supabase.js";
import { useAutoMessage } from './useAdminTools.js';
import { AdminMessage } from './AdminUI.jsx';

export default function OrdersTab() {
  const [ordersList, setOrdersList] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const { message, showSuccess, showError } = useAutoMessage();

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      // Protocol Beta: Relational Join
      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setOrdersList(orderData || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      
      fetchOrders(); // Refresh local list
      showSuccess(`Order #${orderId.substring(0, 8)} status updated to ${newStatus}.`);
    } catch {
      showError('Failed to update order status.');
    }
  };

  return (
    <div className="animate-fadeIn">
      <AdminMessage message={message} />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6 lg:mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-2xl lg:text-3xl font-bold uppercase tracking-widest">Order History</h1>
        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest bg-gray-900 px-3 py-1 rounded w-max">
          Total Orders: {ordersList.length}
        </span>
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
                          {order.order_items && order.order_items.map((item, idx) => (
                            <span key={idx} className="block truncate">{item.quantity}x {item.product_name}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 font-bold text-ion">₱{parseFloat(order.total_amount).toFixed(2)}</td>
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
                              <p className="text-xs lg:text-sm text-white mb-1"><span className="text-gray-500 font-mono text-[10px] lg:text-xs mr-2">NAME:</span> <span className="break-all">{order.customer_first_name} {order.customer_last_name}</span></p>
                              <p className="text-xs lg:text-sm text-white mb-1"><span className="text-gray-500 font-mono text-[10px] lg:text-xs mr-2">EMAIL:</span> <span className="break-all">{order.customer_email || 'N/A'}</span></p>
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
                                <div className="flex justify-between"><span>Subtotal:</span> <span className="text-white">₱{order.subtotal ? parseFloat(order.subtotal).toFixed(2) : parseFloat(order.total_amount).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Shipping:</span> <span className="text-white">₱{order.shipping_fee ? parseFloat(order.shipping_fee).toFixed(2) : '0.00'}</span></div>
                                {order.discount_amount > 0 && <div className="flex justify-between text-ion"><span>Discount{order.voucher_used ? ` (${order.voucher_used})` : ''}:</span> <span>-₱{parseFloat(order.discount_amount).toFixed(2)}</span></div>}
                                <div className="flex justify-between border-t border-dashed border-gray-700 pt-2 mt-2 text-white font-bold text-base lg:text-lg">
                                  <span>Total:</span> <span className="text-ion">₱{parseFloat(order.total_amount).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                             <h4 className="text-electric text-[10px] font-bold uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">Itemized Order List</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                               {order.order_items && order.order_items.map((item, idx) => (
                                  <div key={idx} className="bg-gray-900/50 p-3 rounded flex justify-between items-center border border-gray-800">
                                    <div className="flex gap-3 items-center">
                                      {item.image_url ? (
                                          <img src={item.image_url} alt="product" className="w-8 h-8 lg:w-10 lg:h-10 object-contain bg-gray-900 rounded border border-gray-700 p-1" />
                                      ) : (
                                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-900 rounded border border-gray-700 flex items-center justify-center">
                                             <span className="text-gray-700 text-[8px] font-bold tracking-widest">GEAR</span>
                                          </div>
                                      )}
                                      <div>
                                        <p className="text-[10px] lg:text-xs text-white font-bold max-w-[100px] lg:max-w-[120px] truncate">{item.product_name}</p>
                                        <p className="text-[8px] lg:text-[10px] text-gray-500 font-mono">QTY: {item.quantity}</p>
                                      </div>
                                    </div>
                                    <span className="text-xs lg:text-sm font-bold text-ion">₱{(item.price_at_purchase * item.quantity).toFixed(2)}</span>
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
  );
}