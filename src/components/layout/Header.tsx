import React from 'react';
import { PageId } from './Sidebar';
import { sound } from '../../utils/audio';

interface HeaderProps {
  activePage: PageId;
  simulatedTime: string;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onStepTime: () => void;
  onSpawnUrgentOrder: () => void;
  onLaunchGuidedDemo: () => void;
  onExportCSV: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  simulatedTime,
  isSimulating,
  onToggleSimulate,
  onStepTime,
  onSpawnUrgentOrder,
  onLaunchGuidedDemo,
  onExportCSV
}) => {
  const getPageTitle = (page: PageId): { title: string; subtitle: string } => {
    switch (page) {
      case 'dashboard':
        return { title: 'Executive Operations Dashboard', subtitle: 'Live warehouse control tower, real-time KPI metrics & AI decision center' };
      case 'orders':
        return { title: 'Order Fulfillment & SLA Queue', subtitle: 'Priority-driven order dispatch, multi-tier SLAs, and line-item allocations' };
      case 'inventory':
        return { title: 'Warehouse Inventory & Stock Ledger', subtitle: 'Physical bin locations across Zones A1–C1 with automated replenishment' };
      case 'allocation':
        return { title: 'Stock Allocation & Conflict Resolver', subtitle: 'Priority arbitration engine: critical SLA preservation and reservation rebalancing' };
      case 'picking':
        return { title: 'Picking, Packing & QC Task Board', subtitle: 'Active picker assignments, zone latency tracking, and bottleneck resolution' };
      case 'exceptions':
        return { title: 'Operational Incident & Exceptions Center', subtitle: 'Real-time exception mitigation: damaged items, barcode mismatch & SKU substitution' };
      case 'analytics':
        return { title: 'Fulfillment Analytics & Zone Performance', subtitle: 'Throughput trends, SLA adherence distributions, and latency bottlenecks' };
    }
  };

  const pageInfo = getPageTitle(activePage);

  return (
    <header className="h-20 bg-slate-950/80 border-b border-slate-800/80 px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-20">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-0.5">
          <span>WAREHOUSE_OS</span>
          <span>/</span>
          <span className="uppercase text-slate-400">{activePage}</span>
        </div>
        <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <span>{pageInfo.title}</span>
        </h1>
      </div>

      {/* Simulation Controls & Action Bar */}
      <div className="flex items-center space-x-3">
        {/* Simulation Clock Card */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
          <span className="text-slate-400">SIM TIME:</span>
          <span className="font-bold text-cyan-300">{simulatedTime}</span>
          <button
            onClick={() => {
              sound.playClick();
              onStepTime();
            }}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-semibold border border-slate-700"
            title="Advance simulation by 15 minutes"
          >
            +15m
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onToggleSimulate();
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
              isSimulating
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle Live Clock Ticking"
          >
            {isSimulating ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>

        {/* Spawn Urgent Order Button */}
        <button
          onClick={() => {
            sound.playAlert();
            onSpawnUrgentOrder();
          }}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 shadow-[0_0_12px_rgba(244,63,94,0.2)] transition"
          title="Simulate sudden urgent Enterprise order"
        >
          <span>🚨 +Simulate Influx</span>
        </button>

        {/* Export CSV Button */}
        <button
          onClick={() => {
            sound.playClick();
            onExportCSV();
          }}
          className="hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
          title="Export CSV audit dataset"
        >
          <span>📥 Export Data</span>
        </button>

        {/* Highlighted Guided Demo Trigger */}
        <button
          onClick={() => {
            sound.playSuccess();
            onLaunchGuidedDemo();
          }}
          className="px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition flex items-center space-x-1.5 animate-pulse"
        >
          <span>🎯 Guided Demo</span>
        </button>
      </div>
    </header>
  );
};
