import React from 'react';
import { sound } from '../../utils/audio';

export type PageId = 'dashboard' | 'orders' | 'inventory' | 'allocation' | 'picking' | 'exceptions' | 'analytics';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  conflictCount: number;
  lowStockCount: number;
  exceptionCount: number;
  delayedTaskCount: number;
  totalOrdersCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetDemo: () => void;
  onLaunchGuidedDemo: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  conflictCount,
  lowStockCount,
  exceptionCount,
  delayedTaskCount,
  totalOrdersCount,
  soundEnabled,
  onToggleSound,
  onResetDemo,
  onLaunchGuidedDemo
}) => {
  const navItems = [
    { id: 'dashboard' as PageId, label: 'Dashboard', icon: '📊', badge: null, badgeColor: '' },
    { id: 'orders' as PageId, label: 'Orders Control', icon: '📦', badge: totalOrdersCount, badgeColor: 'bg-blue-950 text-blue-300 border-blue-800' },
    { id: 'inventory' as PageId, label: 'Inventory & SKUs', icon: '🏭', badge: lowStockCount > 0 ? `${lowStockCount} Low` : null, badgeColor: 'bg-amber-950 text-amber-300 border-amber-800' },
    { id: 'allocation' as PageId, label: 'Allocation Center', icon: '⚡', badge: conflictCount > 0 ? `${conflictCount} Conflict` : null, badgeColor: 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse' },
    { id: 'picking' as PageId, label: 'Picking & Packing', icon: '📋', badge: delayedTaskCount > 0 ? `${delayedTaskCount} Delayed` : null, badgeColor: 'bg-rose-950 text-rose-300 border-rose-800' },
    { id: 'exceptions' as PageId, label: 'Exceptions Center', icon: '⚠️', badge: exceptionCount > 0 ? `${exceptionCount} Active` : null, badgeColor: 'bg-amber-950 text-amber-300 border-amber-800' },
    { id: 'analytics' as PageId, label: 'Analytics & SLA', icon: '📈', badge: null, badgeColor: '' },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-cyan-500/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-100 font-mono">FlowForge</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-mono text-[10px] font-bold">AI</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Smart Warehouse Ops</p>
            </div>
          </div>

          {/* Engine Status Tag */}
          <div className="mt-4 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-mono text-slate-300">Decision Engine</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">ACTIVE</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  onNavigate(item.id);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/70 to-blue-950/40 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-base group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Controls */}
      <div className="p-4 border-t border-slate-800 space-y-2.5 bg-slate-950/80">
        {/* Guided Demo Launch Banner */}
        <button
          onClick={() => {
            sound.playSuccess();
            onLaunchGuidedDemo();
          }}
          className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 font-mono"
        >
          <span>🎯 Launch Guided Demo</span>
        </button>

        <div className="flex items-center justify-between pt-1 text-slate-400 text-xs">
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            className="flex items-center space-x-1.5 hover:text-slate-200 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
            title="Toggle Audio Feedback"
          >
            <span>{soundEnabled ? '🔊 Audio ON' : '🔇 Muted'}</span>
          </button>

          <button
            onClick={() => {
              sound.playAlert();
              onResetDemo();
            }}
            className="flex items-center space-x-1.5 hover:text-rose-300 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 transition text-[11px]"
            title="Reset to Initial Scenario"
          >
            <span>🔄 Reset Data</span>
          </button>
        </div>

        <div className="text-[10px] text-slate-500 text-center font-mono pt-1">
          FlowForge v2.4 • Mission Control
        </div>
      </div>
    </aside>
  );
};
