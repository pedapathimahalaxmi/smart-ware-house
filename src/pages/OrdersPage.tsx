import React, { useState } from 'react';
import { Order, PriorityLevel, FulfillmentStatus } from '../types';
import { formatCurrency, getPriorityBadge, getCustomerTierBadge, getFulfillmentStatusBadge, getAllocationStatusBadge } from '../utils/formatters';
import { formatSlaCountdown } from '../engine/priorityEngine';
import { sound } from '../utils/audio';

interface OrdersPageProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onAdvanceStatus: (orderId: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  orders,
  onSelectOrder,
  onAdvanceStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredOrders = orders.filter((order) => {
    // Search
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(i => i.sku.toLowerCase().includes(searchQuery.toLowerCase()) || i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Priority filter
    const matchesPriority = priorityFilter === 'ALL' || order.priority === priorityFilter;

    // Status filter
    const matchesStatus = statusFilter === 'ALL' || order.fulfillmentStatus === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Control Bar: Search & Filter Tabs */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3.5 top-3 text-slate-400 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search by Order ID (ORD-1042), Customer, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Priority Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'Critical', 'High', 'Normal', 'Low'].map((p) => {
            const isSelected = priorityFilter === p;
            return (
              <button
                key={p}
                onClick={() => {
                  sound.playClick();
                  setPriorityFilter(p);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {p === 'ALL' ? 'All Priorities' : p}
              </button>
            );
          })}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-mono">Stage:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              sound.playClick();
              setStatusFilter(e.target.value);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Stages</option>
            <option value="Created">Created</option>
            <option value="Allocated">Allocated</option>
            <option value="Picking">Picking</option>
            <option value="Packed">Packed</option>
            <option value="Quality Check">Quality Check</option>
            <option value="Dispatched">Dispatched</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Customer & Tier</th>
                <th className="py-3 px-4 font-semibold">Priority</th>
                <th className="py-3 px-4 font-semibold">SLA Deadline</th>
                <th className="py-3 px-4 font-semibold">Items</th>
                <th className="py-3 px-4 font-semibold">Stock Allocation</th>
                <th className="py-3 px-4 font-semibold">Fulfillment Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredOrders.map((order) => {
                const priBadge = getPriorityBadge(order.priority);
                const tierBadge = getCustomerTierBadge(order.customerTier);
                const fulBadge = getFulfillmentStatusBadge(order.fulfillmentStatus);
                const allocBadge = getAllocationStatusBadge(order.allocationStatus);
                const slaInfo = formatSlaCountdown(order.minutesRemaining);
                const totalUnits = order.items.reduce((s, i) => s + i.quantityRequested, 0);

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-800/40 transition group cursor-pointer"
                    onClick={() => onSelectOrder(order)}
                  >
                    {/* Order ID */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-100 group-hover:text-cyan-400 transition">
                        {order.id}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {order.createdAt} • Zone {order.zone}
                      </div>
                    </td>

                    {/* Customer & Tier */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{order.customerName}</div>
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-medium border ${tierBadge.bg} ${tierBadge.text} ${tierBadge.border} mt-0.5`}>
                        {order.customerTier} Tier
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${priBadge.bg} ${priBadge.text} ${priBadge.border} ${priBadge.glow}`}>
                          {order.priority}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({order.priorityScore})
                        </span>
                      </div>
                    </td>

                    {/* SLA Countdown */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-200">{order.slaDeadline}</div>
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold ${
                        slaInfo.isOverdue
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : slaInfo.isWarning
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {slaInfo.text}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">
                        {order.items.length} SKU{order.items.length > 1 ? 's' : ''} ({totalUnits} pcs)
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono">
                        {formatCurrency(order.totalValue)}
                      </div>
                    </td>

                    {/* Allocation Status */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${allocBadge.bg} ${allocBadge.text} ${allocBadge.border}`}>
                        {order.allocationStatus}
                      </span>
                    </td>

                    {/* Fulfillment Status */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${fulBadge.bg} ${fulBadge.text} ${fulBadge.border}`}>
                        {order.fulfillmentStatus}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            sound.playClick();
                            onSelectOrder(order);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                        >
                          Details
                        </button>
                        {order.fulfillmentStatus !== 'Dispatched' && (
                          <button
                            onClick={() => {
                              sound.playSuccess();
                              onAdvanceStatus(order.id);
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition"
                            title="Advance to next workflow stage"
                          >
                            ⚡ Advance
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
