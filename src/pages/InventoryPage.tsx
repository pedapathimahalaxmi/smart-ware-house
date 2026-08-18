import React, { useState } from 'react';
import { InventoryItem, WarehouseZone } from '../types';
import { formatCurrency, getInventoryHealthBadge } from '../utils/formatters';
import { sound } from '../utils/audio';

interface InventoryPageProps {
  inventory: InventoryItem[];
  onOpenReorderModal: (item: InventoryItem) => void;
  onQuickRestock: (sku: string, qty: number) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  inventory,
  onOpenReorderModal,
  onQuickRestock
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.binLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesZone = zoneFilter === 'ALL' || item.zone === zoneFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesZone && matchesStatus;
  });

  const zones: WarehouseZone[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

  return (
    <div className="space-y-6 pb-12">
      {/* Zone Overview Mini-Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {zones.map((zone) => {
          const zoneItems = inventory.filter(i => i.zone === zone);
          const totalUnits = zoneItems.reduce((s, i) => s + i.onHand, 0);
          const lowInZone = zoneItems.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;

          return (
            <div
              key={zone}
              onClick={() => {
                sound.playClick();
                setZoneFilter(zoneFilter === zone ? 'ALL' : zone);
              }}
              className={`p-3.5 rounded-xl border transition cursor-pointer ${
                zoneFilter === zone
                  ? 'bg-cyan-950/60 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-slate-100">Zone {zone}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                  lowInZone > 0 ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-800 text-slate-400'
                }`}>
                  {lowInZone > 0 ? `${lowInZone} Low` : 'Normal'}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-400">
                <strong className="text-slate-100 font-mono">{zoneItems.length}</strong> SKUs • <span className="font-mono text-cyan-300">{totalUnits}</span> on-hand
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3.5 top-3 text-slate-400 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search SKU (SKU-1001), Product, Bin Location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {['ALL', 'Healthy', 'Low Stock', 'Out of Stock', 'Damaged'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  sound.playClick();
                  setStatusFilter(st);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  statusFilter === st
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {st === 'ALL' ? 'All Statuses' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">SKU & Description</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold text-center">Zone & Bin</th>
                <th className="py-3 px-4 font-semibold text-center">On Hand</th>
                <th className="py-3 px-4 font-semibold text-center">Reserved</th>
                <th className="py-3 px-4 font-semibold text-center">Available</th>
                <th className="py-3 px-4 font-semibold text-center">Reorder Point</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Replenishment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-mono">
              {filteredInventory.map((item) => {
                const healthBadge = getInventoryHealthBadge(item.status);
                const isLowStock = item.status === 'Low Stock' || item.status === 'Out of Stock';

                return (
                  <tr key={item.sku} className="hover:bg-slate-800/40 transition">
                    {/* SKU & Name */}
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-mono font-bold text-slate-100 text-xs">{item.sku}</div>
                      <div className="text-slate-300 text-xs font-medium">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Cost: {formatCurrency(item.unitCost)} • Lead: {item.leadTimeDays}d</div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 font-sans text-slate-400 text-xs">
                      {item.category}
                    </td>

                    {/* Zone & Bin */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[11px] font-bold">
                        {item.zone}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.binLocation}</div>
                    </td>

                    {/* On Hand */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-100">
                      {item.onHand}
                    </td>

                    {/* Reserved */}
                    <td className="py-3.5 px-4 text-center text-amber-400 font-semibold">
                      {item.reserved}
                    </td>

                    {/* Available */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-bold ${item.available <= 0 ? 'text-rose-400' : item.available <= item.reorderLevel ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {item.available}
                      </span>
                    </td>

                    {/* Reorder Level */}
                    <td className="py-3.5 px-4 text-center text-slate-400">
                      {item.reorderLevel}
                    </td>

                    {/* Health Status */}
                    <td className="py-3.5 px-4 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${healthBadge.bg} ${healthBadge.text} ${healthBadge.border}`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right font-sans">
                      <div className="flex items-center justify-end space-x-2">
                        {isLowStock ? (
                          <button
                            onClick={() => {
                              sound.playClick();
                              onOpenReorderModal(item);
                            }}
                            className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-sm transition"
                          >
                            ⚡ Reorder (+{item.reorderLevel * 2})
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              sound.playSuccess();
                              onQuickRestock(item.sku, 10);
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
                            title="Quick add +10 units buffer"
                          >
                            +10 Buffer
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
