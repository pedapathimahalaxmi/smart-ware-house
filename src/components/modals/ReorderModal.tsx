import React, { useState } from 'react';
import { InventoryItem } from '../../types';
import { formatCurrency, getInventoryHealthBadge } from '../../utils/formatters';
import { sound } from '../../utils/audio';

interface ReorderModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReorder: (sku: string, quantity: number) => void;
}

export const ReorderModal: React.FC<ReorderModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirmReorder
}) => {
  if (!isOpen || !item) return null;

  const [quantity, setQuantity] = useState<number>(Math.max(20, item.reorderLevel * 2));
  const healthBadge = getInventoryHealthBadge(item.status);
  const totalCost = quantity * item.unitCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    onConfirmReorder(item.sku, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
              🚚
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-mono">Create Purchase Order Reorder</h2>
              <p className="text-xs text-slate-400">Automated Replenishment Dispatch System</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm text-slate-200">
          {/* Item details card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-cyan-400 font-bold text-sm block">{item.sku}</span>
                <span className="text-slate-100 font-semibold">{item.name}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${healthBadge.bg} ${healthBadge.text} ${healthBadge.border}`}>
                {item.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-800/80">
              <div>
                <span className="text-slate-400 block">On Hand</span>
                <span className="font-mono font-bold text-slate-100">{item.onHand} units</span>
              </div>
              <div>
                <span className="text-slate-400 block">Reserved</span>
                <span className="font-mono font-bold text-amber-400">{item.reserved} units</span>
              </div>
              <div>
                <span className="text-slate-400 block">Available</span>
                <span className={`font-mono font-bold ${item.available <= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {item.available} units
                </span>
              </div>
            </div>
          </div>

          {/* Reorder settings */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">
                Replenishment Batch Quantity:
              </label>
              <span className="text-xs text-slate-400 font-mono">
                Min Recommended: {item.reorderLevel} units
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="5"
                max="500"
                step="5"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={() => setQuantity(item.reorderLevel * 2)}
                className="px-3 py-2.5 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium whitespace-nowrap"
              >
                Reset 2x
              </button>
            </div>
          </div>

          {/* Supplier lead time & financial summary */}
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Supplier Lead Time:</span>
              <span className="font-semibold text-cyan-300 font-mono">⚡ {item.leadTimeDays} Business Days</span>
            </div>
            <div>
              <span className="text-slate-400 block">Est. PO Total Cost:</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">{formatCurrency(totalCost)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1.5"
            >
              <span>🚀 Authorize & Restock (+{quantity} units)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
