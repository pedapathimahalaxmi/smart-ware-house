import React, { useState } from 'react';
import { PickingTask, Picker } from '../../types';
import { sound } from '../../utils/audio';

interface ReassignPickerModalProps {
  task: PickingTask | null;
  pickers: Picker[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmReassign: (taskId: string, targetPickerId: string) => void;
}

export const ReassignPickerModal: React.FC<ReassignPickerModalProps> = ({
  task,
  pickers,
  isOpen,
  onClose,
  onConfirmReassign
}) => {
  if (!isOpen || !task) return null;

  // Preselect highest efficiency available picker or first eligible picker
  const eligiblePickers = pickers.filter(p => p.id !== task.pickerId);
  const bestPicker = eligiblePickers.find(p => p.currentStatus === 'Available') || eligiblePickers[0];
  const [selectedPickerId, setSelectedPickerId] = useState<string>(bestPicker ? bestPicker.id : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPickerId) return;
    sound.playSuccess();
    onConfirmReassign(task.id, selectedPickerId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg">
              🔄
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-mono">Reassign Warehouse Picker</h2>
              <p className="text-xs text-slate-400">Dynamic Task Dispatch & Bottleneck Mitigation</p>
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
          {/* Current task context */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-cyan-400 font-bold">{task.id} • {task.orderId}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${task.status === 'Delayed' ? 'bg-rose-950/80 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300'}`}>
                {task.status}
              </span>
            </div>
            <div className="text-xs text-slate-300">
              Customer: <strong className="text-slate-100">{task.customerName}</strong> • Items: <strong className="text-cyan-300 font-mono">{task.itemCount} units</strong>
            </div>
            <div className="text-xs text-slate-400 pt-1 flex items-center justify-between border-t border-slate-800">
              <span>Current Assigned: <strong className="text-amber-300 font-mono">{task.pickerName}</strong> ({task.zone})</span>
              <span className="text-rose-400 font-mono font-bold">Zone B2 Congested</span>
            </div>
          </div>

          {/* Picker selection cards */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Select Available Picker for Immediate Hand-off:
            </label>

            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {eligiblePickers.map(picker => {
                const isSelected = selectedPickerId === picker.id;
                const isAvailable = picker.currentStatus === 'Available';

                return (
                  <div
                    key={picker.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedPickerId(picker.id);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'}`}>
                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-slate-950"></div>}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-100 text-xs flex items-center space-x-2">
                          <span>{picker.name}</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px]">
                            Zone {picker.zone}
                          </span>
                          {picker.id === 'PCK-02' && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-800 font-bold">
                              ★ Recommended
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Load: {picker.activeTasks}/{picker.maxCapacity} active tasks • Efficiency: <span className="text-emerald-400 font-mono font-bold">{picker.efficiencyRating}%</span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                      isAvailable
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                        : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                    }`}>
                      {picker.currentStatus}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
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
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition flex items-center space-x-1.5"
            >
              <span>⚡ Confirm Task Reassignment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
