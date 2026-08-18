import React from 'react';
import { HOURLY_FULFILLMENT_DATA, ZONE_PERFORMANCE_DATA } from '../mock/warehouseData';
import { Order, InventoryItem, PickingTask } from '../types';
import { sound } from '../utils/audio';

interface AnalyticsPageProps {
  orders: Order[];
  inventory: InventoryItem[];
  tasks: PickingTask[];
  onTriggerZoneOptimization: () => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  orders,
  inventory,
  tasks,
  onTriggerZoneOptimization
}) => {
  // Calculate priority distribution
  const critCount = orders.filter(o => o.priority === 'Critical').length;
  const highCount = orders.filter(o => o.priority === 'High').length;
  const normCount = orders.filter(o => o.priority === 'Normal').length;
  const lowCount = orders.filter(o => o.priority === 'Low').length;
  const total = orders.length || 1;

  const lowStockItems = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock');
  const delayedB2 = tasks.filter(t => t.zone === 'B2' && t.status === 'Delayed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Bottleneck AI Optimization Insight */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/30 to-cyan-950/30 border border-rose-700/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 text-2xl shrink-0">
            📊
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-100 font-mono">
                Bottleneck Insight: Zone B2 Throughput Deficit
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                18-min avg delay
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Zone B2 has an average 18-minute picking delay due to heavy conveyor batching and picker load imbalance. Reassigning 2 pending tasks to Zone A1 will restore nominal throughput.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playSuccess();
            onTriggerZoneOptimization();
          }}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition flex items-center space-x-1.5 shrink-0"
        >
          <span>⚡ Execute Dynamic Zone Rebalancing</span>
        </button>
      </div>

      {/* Grid: Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Hourly Fulfillment & Throughput */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
                Hourly Fulfillment & Throughput Rate
              </h3>
              <p className="text-xs text-slate-400">Orders Created vs Successfully Dispatched</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800">
              Avg SLA: 94.8%
            </span>
          </div>

          {/* SVG Bar / Trend Chart */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono">
              {HOURLY_FULFILLMENT_DATA.map((d, i) => (
                <div key={i} className="flex flex-col items-center justify-end h-44 space-y-1">
                  <span className="text-[10px] text-cyan-300 font-bold">{d.ordersDispatched}</span>
                  <div className="w-full flex items-end justify-center space-x-1 h-32 bg-slate-950/80 rounded-lg p-1">
                    {/* Created Bar */}
                    <div
                      style={{ height: `${(d.ordersCreated / 30) * 100}%` }}
                      className="w-1/2 bg-slate-700/80 rounded-t transition-all hover:bg-slate-600"
                      title={`Created: ${d.ordersCreated}`}
                    ></div>
                    {/* Dispatched Bar */}
                    <div
                      style={{ height: `${(d.ordersDispatched / 30) * 100}%` }}
                      className="w-1/2 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t transition-all hover:from-cyan-500 hover:to-cyan-300"
                      title={`Dispatched: ${d.ordersDispatched}`}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-400">{d.time}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center space-x-6 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded bg-slate-700"></div>
                <span>Orders Created</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded bg-cyan-400"></div>
                <span>Orders Dispatched</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Order Priority Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
                Order Priority Distribution
              </h3>
              <p className="text-xs text-slate-400">Current Queue Split by AI Urgency Score</p>
            </div>
            <span className="text-xs font-mono text-cyan-400">Total: {orders.length}</span>
          </div>

          <div className="space-y-4 pt-2">
            {/* Priority Progress Bars */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-rose-400 font-bold flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                    <span>Critical Priority (Score &ge; 90)</span>
                  </span>
                  <span className="font-mono text-slate-200 font-bold">{critCount} orders ({Math.round((critCount / total) * 100)}%)</span>
                </div>
                <div className="h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div style={{ width: `${(critCount / total) * 100}%` }} className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-amber-400 font-bold flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    <span>High Priority (Score 75–89)</span>
                  </span>
                  <span className="font-mono text-slate-200 font-bold">{highCount} orders ({Math.round((highCount / total) * 100)}%)</span>
                </div>
                <div className="h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div style={{ width: `${(highCount / total) * 100}%` }} className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-blue-400 font-bold flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    <span>Normal Priority (Score 35–74)</span>
                  </span>
                  <span className="font-mono text-slate-200 font-bold">{normCount} orders ({Math.round((normCount / total) * 100)}%)</span>
                </div>
                <div className="h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div style={{ width: `${(normCount / total) * 100}%` }} className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400 font-bold flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-600"></span>
                    <span>Low Priority (Score &lt; 35)</span>
                  </span>
                  <span className="font-mono text-slate-200 font-bold">{lowCount} orders ({Math.round((lowCount / total) * 100)}%)</span>
                </div>
                <div className="h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div style={{ width: `${(lowCount / total) * 100}%` }} className="h-full bg-slate-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Warehouse-Zone Picking Performance */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
                Warehouse Zone Picking Performance
              </h3>
              <p className="text-xs text-slate-400">Picks per Hour & Average Retrieval Latency</p>
            </div>
          </div>

          <div className="space-y-3">
            {ZONE_PERFORMANCE_DATA.map((z) => {
              const isB2 = z.zone === 'Zone B2';

              return (
                <div
                  key={z.zone}
                  className={`p-3.5 rounded-xl border transition ${
                    isB2
                      ? 'bg-rose-950/30 border-rose-800/80 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-100 font-mono">{z.zone}</span>
                      <span className="text-slate-400 font-sans text-[11px] truncate max-w-[150px]">({z.name})</span>
                    </div>
                    <span className={`font-mono font-bold ${isB2 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {z.slaCompliance}% SLA Adherence
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <div>
                      <span>Picks/Hr:</span> <strong className="text-cyan-300 font-mono">{z.pickRatePerHour}</strong>
                    </div>
                    <div>
                      <span>Avg Latency:</span> <strong className={isB2 ? 'text-rose-400 font-mono' : 'text-slate-200 font-mono'}>{z.avgLatencyMinutes}m</strong>
                    </div>
                    <div className="text-right">
                      <span>Pickers:</span> <strong className="text-slate-200 font-mono">{z.activePickers}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Low-Stock Risk & Buffer Matrix */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
                Inventory Stockout Risk Matrix
              </h3>
              <p className="text-xs text-slate-400">Available Shelf Stock vs Safety Reorder Points</p>
            </div>
            <span className="text-xs text-amber-400 font-mono bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800">
              {lowStockItems.length} SKUs at Risk
            </span>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
            {lowStockItems.map((item) => {
              const bufferRatio = Math.round((item.available / item.reorderLevel) * 100);

              return (
                <div key={item.sku} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-cyan-400 font-bold">{item.sku}</span>
                      <span className="text-slate-300 ml-2 font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono text-rose-400 font-bold">{item.available} / {item.reorderLevel} units</span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${Math.min(100, bufferRatio)}%` }}
                      className={`h-full rounded-full ${bufferRatio <= 20 ? 'bg-rose-500' : 'bg-amber-500'}`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
