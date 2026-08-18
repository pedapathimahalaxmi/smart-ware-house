import React from 'react';
import { Order, InventoryItem, PickingTask, OperationalException, OperationalDecision } from '../types';
import { formatCurrency, getInventoryHealthBadge, getPriorityBadge } from '../utils/formatters';
import { sound } from '../utils/audio';

interface DashboardPageProps {
  orders: Order[];
  inventory: InventoryItem[];
  tasks: PickingTask[];
  exceptions: OperationalException[];
  decisions: OperationalDecision[];
  onExecuteDecision: (decision: OperationalDecision) => void;
  onOpenReorderModal: (item: InventoryItem) => void;
  onSelectOrder: (order: Order) => void;
  onNavigate: (page: any) => void;
  onLaunchGuidedDemo: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  orders,
  inventory,
  tasks,
  exceptions,
  decisions,
  onExecuteDecision,
  onOpenReorderModal,
  onSelectOrder,
  onNavigate,
  onLaunchGuidedDemo
}) => {
  // KPI Calculations
  const totalOrders = orders.length;
  const dispatchedOrders = orders.filter(o => o.fulfillmentStatus === 'Dispatched').length;
  const onTimeOrders = orders.filter(o => o.fulfillmentStatus === 'Dispatched' || o.minutesRemaining > 0).length;
  const fulfillmentRate = totalOrders > 0 ? Math.round((onTimeOrders / totalOrders) * 100) : 94;
  const lowStockItems = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock');
  const delayedTasks = tasks.filter(t => t.status === 'Delayed');
  const b2Delayed = delayedTasks.filter(t => t.zone === 'B2').length;

  // Pipeline Counts
  const pipelineStages: Array<{ stage: Order['fulfillmentStatus']; label: string; icon: string; color: string; bg: string; border: string }> = [
    { stage: 'Created', label: '1. Created', icon: '📝', color: 'text-slate-300', bg: 'bg-slate-900/80', border: 'border-slate-800' },
    { stage: 'Allocated', label: '2. Allocated', icon: '⚡', color: 'text-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-800/50' },
    { stage: 'Picking', label: '3. Picking', icon: '🛒', color: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-800/50' },
    { stage: 'Packed', label: '4. Packed', icon: '📦', color: 'text-indigo-400', bg: 'bg-indigo-950/40', border: 'border-indigo-800/50' },
    { stage: 'Quality Check', label: '5. QC Verify', icon: '🔍', color: 'text-purple-400', bg: 'bg-purple-950/40', border: 'border-purple-800/50' },
    { stage: 'Dispatched', label: '6. Dispatched', icon: '🚀', color: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-800/50' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Guided Demo & Operational Status */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/30 to-blue-950/40 border border-cyan-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-2xl shrink-0">
            🤖
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-100">FlowForge Autonomous Warehouse Control Tower</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                Rule Engine v2.4
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Real-time multi-tier SLA tracking, automated stock conflict arbitration, dynamic picker workload balancing, and exception remediation.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => {
              sound.playSuccess();
              onLaunchGuidedDemo();
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition flex items-center space-x-2 font-mono"
          >
            <span>🎯 Start Guided Demo (ORD-1042)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Orders Today */}
        <div
          onClick={() => {
            sound.playClick();
            onNavigate('orders');
          }}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Active Orders</span>
            <span className="text-lg group-hover:scale-110 transition-transform">📦</span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-100 font-mono">{totalOrders}</span>
            <span className="text-xs text-emerald-400 font-mono font-semibold">({dispatchedOrders} Dispatched)</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>In-flight queue</span>
            <span className="text-cyan-400 font-mono font-semibold">{totalOrders - dispatchedOrders} processing</span>
          </div>
        </div>

        {/* KPI 2: Fulfillment Rate */}
        <div
          onClick={() => {
            sound.playClick();
            onNavigate('analytics');
          }}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">SLA Fulfillment Rate</span>
            <span className="text-lg group-hover:scale-110 transition-transform">⚡</span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">{fulfillmentRate}%</span>
            <span className="text-xs text-slate-400 font-mono">On-Time Target 95%</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Critical SLA compliance</span>
            <span className="text-emerald-400 font-mono font-semibold">98.2%</span>
          </div>
        </div>

        {/* KPI 3: Low Stock SKUs */}
        <div
          onClick={() => {
            sound.playClick();
            onNavigate('inventory');
          }}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-700/60 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Low-Stock SKUs</span>
            <span className="text-lg group-hover:scale-110 transition-transform">⚠️</span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className={`text-3xl font-extrabold font-mono ${lowStockItems.length > 0 ? 'text-amber-400' : 'text-slate-100'}`}>
              {lowStockItems.length}
            </span>
            <span className="text-xs text-amber-400/90 font-mono font-semibold">Action Required</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Safety threshold breaches</span>
            <span className="text-amber-400 font-mono font-semibold">Reorders Queued</span>
          </div>
        </div>

        {/* KPI 4: Picking Bottleneck */}
        <div
          onClick={() => {
            sound.playClick();
            onNavigate('picking');
          }}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-700/60 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Picking Bottleneck</span>
            <span className="text-lg group-hover:scale-110 transition-transform">🛑</span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className={`text-2xl font-extrabold font-mono ${b2Delayed > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {b2Delayed > 0 ? 'Zone B2' : 'Nominal'}
            </span>
            <span className="text-xs text-rose-400 font-mono font-semibold">({b2Delayed} Delayed)</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Avg picker latency</span>
            <span className="text-rose-400 font-mono font-semibold">18 min delay</span>
          </div>
        </div>
      </div>

      {/* Fulfillment Pipeline Visualizer */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Live Fulfillment Workflow Pipeline
            </h3>
            <p className="text-xs text-slate-400">
              Order progression through six automated and manual stages
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/60 self-start">
            Total Throughput: {orders.length} Orders
          </span>
        </div>

        {/* Pipeline Progress Stages */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {pipelineStages.map((ps, idx) => {
            const count = orders.filter(o => o.fulfillmentStatus === ps.stage).length;
            const percent = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border ${ps.bg} ${ps.border} transition-all hover:scale-[1.02] flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{ps.icon}</span>
                    <span className="text-[10px] font-mono text-slate-400">{percent}%</span>
                  </div>
                  <span className={`text-xs font-bold ${ps.color} block`}>{ps.label}</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-100 font-mono">{count}</span>
                  <span className="text-[10px] text-slate-400">orders</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout: Decision Center vs Live Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): AI Decision Center */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse"></span>
              <h3 className="text-base font-bold text-slate-100 font-mono">
                AI Operational Decision Center
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {decisions.length} Active System Recommendations
            </span>
          </div>

          <div className="space-y-3">
            {decisions.map((decision) => (
              <div
                key={decision.id}
                className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/20 border border-slate-800 hover:border-cyan-500/50 transition shadow-lg group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      decision.urgency === 'Immediate'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {decision.urgency} Action
                    </span>
                    <span className="text-xs font-mono text-cyan-400 font-bold">
                      [{decision.category}]
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Confidence: {decision.confidence}%
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    ID: {decision.id}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-100 mb-1">
                  {decision.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {decision.description}
                </p>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Projected Impact:</span>
                  <span className="text-emerald-400 font-semibold">{decision.impact}</span>
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      sound.playSuccess();
                      onExecuteDecision(decision);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20 transition flex items-center space-x-1.5"
                  >
                    <span>⚡ {decision.actionLabel}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Low-Stock SKUs & Operational Alerts */}
        <div className="space-y-6">
          {/* Low-Stock Products Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-amber-400 font-bold">⚠️ Low-Stock SKUs</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  {lowStockItems.length}
                </span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate('inventory');
                }}
                className="text-xs text-cyan-400 hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {lowStockItems.map((item) => {
                const healthBadge = getInventoryHealthBadge(item.status);
                return (
                  <div
                    key={item.sku}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-cyan-400 font-bold text-xs">{item.sku}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${healthBadge.bg} ${healthBadge.text} ${healthBadge.border}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 truncate max-w-[160px] font-medium">{item.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Avail: <strong className="text-rose-400 font-mono">{item.available}</strong> (Reorder at {item.reorderLevel})
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        sound.playClick();
                        onOpenReorderModal(item);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition whitespace-nowrap"
                    >
                      + Reorder
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operational Alerts Feed */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-rose-400 font-bold">🚨 Live System Alerts</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Auto-Refreshed</span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/40">
                <div className="flex items-center justify-between text-rose-300 font-bold text-[11px]">
                  <span>Critical Deficit (ORD-1042)</span>
                  <span className="font-mono text-slate-400">10:15 AM</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  SKU-1001 deficit of 3 units flagged for Enterprise line-down order.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40">
                <div className="flex items-center justify-between text-amber-300 font-bold text-[11px]">
                  <span>Zone B2 Bottleneck Detected</span>
                  <span className="font-mono text-slate-400">09:45 AM</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  2 picking tasks overdue. Picker Marcus Vance loaded at 125% capacity.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40">
                <div className="flex items-center justify-between text-purple-300 font-bold text-[11px]">
                  <span>Exception EX-901 Reported</span>
                  <span className="font-mono text-slate-400">09:10 AM</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Damaged motor casing on SKU-1008. Rev B substitution ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
