import React from 'react';
import { AllocationConflict, Order, InventoryItem } from '../types';
import { getCustomerTierBadge, getPriorityBadge } from '../utils/formatters';
import { sound } from '../utils/audio';

interface AllocationPageProps {
  conflicts: AllocationConflict[];
  orders: Order[];
  inventory: InventoryItem[];
  onApproveReallocation: (conflictId: string) => void;
  onAllocatePartial: (conflictId: string) => void;
  onCreateReorderRequest: (sku: string) => void;
  onSelectOrder: (order: Order) => void;
}

export const AllocationPage: React.FC<AllocationPageProps> = ({
  conflicts,
  orders,
  inventory,
  onApproveReallocation,
  onAllocatePartial,
  onCreateReorderRequest,
  onSelectOrder
}) => {
  const activeConflicts = conflicts.filter(c => !c.resolved);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Explanation Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-cyan-950/30 border border-rose-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 text-2xl shrink-0">
            ⚡
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-100">Stock Allocation & Priority Arbitration Engine</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
                {activeConflicts.length} Active Conflicts Detected
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Automatic cross-order inventory arbitration protecting high-urgency and Enterprise customer SLAs by safely transferring non-dispatched reserves from lower-priority orders.
            </p>
          </div>
        </div>
      </div>

      {/* Active Conflict Cards */}
      {activeConflicts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="text-4xl">🎉</div>
          <h3 className="text-lg font-bold text-slate-100 font-mono">All Allocation Conflicts Resolved</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All critical orders have secured required stock reservations. Inventories are balanced across all active warehouse zones.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeConflicts.map((conflict, index) => {
            const critOrder = orders.find(o => o.id === conflict.criticalOrderId);
            const lowOrder = orders.find(o => o.id === conflict.lowerOrderId);
            const invItem = inventory.find(i => i.sku === conflict.sku);

            const isDemoScenario = conflict.criticalOrderId === 'ORD-1042';

            return (
              <div
                key={conflict.id}
                id={isDemoScenario ? 'demo-card-critical-order' : undefined}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-2xl ${
                  isDemoScenario
                    ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                {/* Conflict Header */}
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-lg border border-rose-800">
                      CONFLICT #{index + 1}: {conflict.criticalOrderId} vs {conflict.lowerOrderId}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      SKU: <strong className="text-cyan-300">{conflict.sku}</strong> ({conflict.skuName})
                    </span>
                  </div>

                  {isDemoScenario && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md">
                      ★ GUIDED DEMO PRIMARY SCENARIO
                    </span>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-6 text-xs text-slate-200">
                  {/* Side-by-Side Order Comparison */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Critical Order Card */}
                    <div
                      id={isDemoScenario ? 'demo-card-stock-deficit' : undefined}
                      className="p-4 rounded-xl bg-slate-950/80 border border-rose-900/60 space-y-3 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 px-3 py-1 bg-rose-950/90 text-rose-300 text-[10px] font-mono font-bold rounded-bl-xl border-l border-b border-rose-800">
                        CRITICAL RECIPIENT
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-extrabold text-sm text-slate-100">{conflict.criticalOrderId}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                          {conflict.criticalTier} Tier
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          SLA: {conflict.criticalSlaMinutes} mins remaining
                        </span>
                      </div>

                      <div className="text-xs text-slate-300">
                        Customer: <strong className="text-slate-100">{conflict.criticalCustomer}</strong>
                      </div>

                      {/* Stock Deficit Visual */}
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Total Units Needed:</span>
                          <span className="font-mono font-bold text-slate-100">{conflict.unitsNeededByCritical} units</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Available on Shelf:</span>
                          <span className="font-mono font-bold text-amber-400">{conflict.unitsAvailableOnShelf} units</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-800">
                          <span className="text-rose-400 font-bold">Unfulfilled Deficit:</span>
                          <span className="font-mono font-extrabold text-rose-400">
                            -{conflict.unitsNeededByCritical - (critOrder?.items.find(i => i.sku === conflict.sku)?.quantityAllocated || 0)} units
                          </span>
                        </div>
                      </div>

                      {critOrder && (
                        <button
                          onClick={() => {
                            sound.playClick();
                            onSelectOrder(critOrder);
                          }}
                          className="text-xs text-cyan-400 hover:underline pt-1 block"
                        >
                          View Full Order Details →
                        </button>
                      )}
                    </div>

                    {/* Lower-Priority Order Card */}
                    <div
                      id={isDemoScenario ? 'demo-card-lower-order' : undefined}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 px-3 py-1 bg-slate-800 text-slate-400 text-[10px] font-mono font-bold rounded-bl-xl border-l border-b border-slate-700">
                        CURRENT RESERVATION HOLDER
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-extrabold text-sm text-slate-100">{conflict.lowerOrderId}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {conflict.lowerTier} Tier
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                          SLA in 4h+
                        </span>
                      </div>

                      <div className="text-xs text-slate-300">
                        Customer: <strong className="text-slate-100">{conflict.lowerCustomer}</strong>
                      </div>

                      {/* Lower order holding units */}
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Currently Reserved:</span>
                          <span className="font-mono font-bold text-amber-400">{conflict.unitsReservedByLower} units</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Recommended Transfer:</span>
                          <span className="font-mono font-bold text-cyan-300">+{conflict.recommendedTransferUnits} units</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-800">
                          <span className="text-emerald-400">Post-Transfer Balance:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {conflict.unitsReservedByLower - conflict.recommendedTransferUnits} units
                          </span>
                        </div>
                      </div>

                      {lowOrder && (
                        <button
                          onClick={() => {
                            sound.playClick();
                            onSelectOrder(lowOrder);
                          }}
                          className="text-xs text-slate-400 hover:underline pt-1 block"
                        >
                          View Lower-Priority Order Details →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* AI Recommendation Box */}
                  <div
                    id={isDemoScenario ? 'demo-card-ai-recommendation' : undefined}
                    className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-2"
                  >
                    <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                      <span>🧠 FlowForge System Decision Engine Recommendation:</span>
                    </div>
                    <p className="text-slate-200 text-xs leading-relaxed font-mono">
                      “Reallocate {conflict.recommendedTransferUnits} units from {conflict.lowerOrderId} to {conflict.criticalOrderId}. This protects the critical SLA. Notify the affected low-priority order and schedule automatic replenishment.”
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                    <div className="text-[11px] text-slate-400">
                      Reallocation Safety: <strong className="text-emerald-400 font-mono">100% compliant with zero dispatch disruption</strong>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Button 3: Create Reorder Request */}
                      <button
                        onClick={() => {
                          sound.playClick();
                          onCreateReorderRequest(conflict.sku);
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      >
                        📦 Create Reorder Request
                      </button>

                      {/* Button 2: Allocate Partial Stock */}
                      <button
                        onClick={() => {
                          sound.playClick();
                          onAllocatePartial(conflict.id);
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition"
                      >
                        ⚡ Allocate Partial Stock ({conflict.unitsAvailableOnShelf} units)
                      </button>

                      {/* Button 1: Approve Reallocation (Recommended) */}
                      <button
                        id={isDemoScenario ? 'demo-btn-approve-reallocation' : undefined}
                        onClick={() => {
                          sound.playSuccess();
                          onApproveReallocation(conflict.id);
                        }}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition flex items-center space-x-2 animate-pulse"
                      >
                        <span>✅ Approve Reallocation (+{conflict.recommendedTransferUnits} units)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
