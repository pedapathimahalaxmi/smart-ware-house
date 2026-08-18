import React from 'react';
import { Order } from '../../types';
import { formatCurrency, getPriorityBadge, getCustomerTierBadge, getFulfillmentStatusBadge, getAllocationStatusBadge } from '../../utils/formatters';
import { formatSlaCountdown } from '../../engine/priorityEngine';
import { sound } from '../../utils/audio';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onAdvanceStatus: (orderId: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onAdvanceStatus
}) => {
  if (!isOpen || !order) return null;

  const priBadge = getPriorityBadge(order.priority);
  const tierBadge = getCustomerTierBadge(order.customerTier);
  const fulBadge = getFulfillmentStatusBadge(order.fulfillmentStatus);
  const allocBadge = getAllocationStatusBadge(order.allocationStatus);
  const slaInfo = formatSlaCountdown(order.minutesRemaining);

  const getNextStageName = (status: Order['fulfillmentStatus']): string | null => {
    switch (status) {
      case 'Created': return 'Allocate Stock';
      case 'Allocated': return 'Start Picking';
      case 'Picking': return 'Complete Packing';
      case 'Packed': return 'Send to QC Inspection';
      case 'Quality Check': return 'Dispatch Order';
      default: return null;
    }
  };

  const nextStage = getNextStageName(order.fulfillmentStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold">
              📦
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-slate-100 font-mono">{order.id}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priBadge.bg} ${priBadge.text} ${priBadge.border} ${priBadge.glow}`}>
                  {order.priority} (Score: {order.priorityScore})
                </span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${tierBadge.bg} ${tierBadge.text} ${tierBadge.border}`}>
                  {order.customerTier} Tier
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">{order.customerName}</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 text-slate-200 text-sm">
          {/* Top Metric Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">SLA Deadline</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-100">{order.slaDeadline}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${slaInfo.isOverdue ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'}`}>
                  {slaInfo.text}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Fulfillment Stage</span>
              <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold border ${fulBadge.bg} ${fulBadge.text} ${fulBadge.border}`}>
                {order.fulfillmentStatus}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Stock Allocation</span>
              <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold border ${allocBadge.bg} ${allocBadge.text} ${allocBadge.border}`}>
                {order.allocationStatus}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Total Order Value</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">{formatCurrency(order.totalValue)}</span>
            </div>
          </div>

          {/* Priority Engine Score Breakdown */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950/90 to-cyan-950/20 border border-cyan-900/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-cyan-400 font-bold">⚡ AI Priority Score Engine</span>
                <span className="text-xs text-slate-400">Total Calculated Weight: <strong className="text-cyan-300 font-mono">{order.priorityScore}/100</strong></span>
              </div>
              <span className="text-xs text-cyan-300/80 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">Dynamic Rule Evaluator</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block">Customer Tier</span>
                <span className="font-mono text-cyan-300 font-bold text-sm">+{order.priorityFactors.tierScore} pts</span>
                <span className="text-[10px] text-slate-500 block">({order.customerTier})</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block">SLA Urgency</span>
                <span className="font-mono text-rose-400 font-bold text-sm">+{order.priorityFactors.slaScore} pts</span>
                <span className="text-[10px] text-slate-500 block">({slaInfo.text})</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block">Order Value</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">+{order.priorityFactors.valueScore} pts</span>
                <span className="text-[10px] text-slate-500 block">({formatCurrency(order.totalValue)})</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block">Operational Urgency</span>
                <span className="font-mono text-amber-400 font-bold text-sm">+{order.priorityFactors.urgencyScore} pts</span>
                <span className="text-[10px] text-slate-500 block">(Line-down check)</span>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Order Line Items ({order.items.length})</span>
              <span className="text-xs font-normal text-slate-400">Warehouse Zone: <strong className="text-slate-200">{order.zone}</strong></span>
            </h3>
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">SKU & Item Name</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Zone</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Req / Alloc</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Unit Price</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {order.items.map((item, idx) => {
                    const isFullyAllocated = item.quantityAllocated >= item.quantityRequested;
                    return (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-200">{item.sku}</div>
                          <div className="text-slate-400 font-sans text-xs">{item.name}</div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                            {item.zone}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={isFullyAllocated ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {item.quantityAllocated} / {item.quantityRequested}
                          </span>
                          {!isFullyAllocated && (
                            <span className="block text-[10px] text-rose-400/90 font-sans">Deficit: {item.quantityRequested - item.quantityAllocated}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-300 font-mono">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-3 px-3 text-right text-cyan-400 font-mono font-bold">{formatCurrency(item.unitPrice * item.quantityRequested)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes & Operational Remarks */}
          {order.notes && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Operational Dispatch Notes:</span>
              <p className="text-xs text-slate-300 italic">{order.notes}</p>
            </div>
          )}

          {/* Audit History Timeline */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">Audit Trail & System Events</h3>
            <div className="space-y-2.5 border-l-2 border-slate-800 pl-4 ml-2">
              {order.history.map((hist, idx) => (
                <div key={idx} className="relative text-xs">
                  <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-cyan-500 border-2 border-slate-900"></div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-slate-400 font-semibold">{hist.timestamp}</span>
                    <span className="text-slate-500">•</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-cyan-300">{hist.actor}</span>
                  </div>
                  <p className="text-slate-300 mt-0.5">{hist.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Assigned Picker: <strong className="text-slate-200">{order.assignedPicker || 'Unassigned / Auto-Queue'}</strong>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Close
            </button>

            {nextStage && order.fulfillmentStatus !== 'Dispatched' && (
              <button
                onClick={() => {
                  sound.playSuccess();
                  onAdvanceStatus(order.id);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition flex items-center space-x-1.5"
              >
                <span>⚡ {nextStage}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
