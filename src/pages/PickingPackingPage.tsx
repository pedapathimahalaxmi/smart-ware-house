import React, { useState } from 'react';
import { PickingTask, Picker, WarehouseZone } from '../types';
import { getPriorityBadge } from '../utils/formatters';
import { formatSlaCountdown } from '../engine/priorityEngine';
import { sound } from '../utils/audio';

interface PickingPackingPageProps {
  tasks: PickingTask[];
  pickers: Picker[];
  onOpenReassignModal: (task: PickingTask) => void;
  onAdvanceTaskStatus: (taskId: string) => void;
}

export const PickingPackingPage: React.FC<PickingPackingPageProps> = ({
  tasks,
  pickers,
  onOpenReassignModal,
  onAdvanceTaskStatus
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('ALL');

  const filteredTasks = tasks.filter(t => selectedZone === 'ALL' || t.zone === selectedZone);

  const columns: Array<{ status: PickingTask['status']; title: string; icon: string; border: string; bg: string; badge: string }> = [
    { status: 'Ready', title: 'Ready to Pick', icon: '📥', border: 'border-slate-800', bg: 'bg-slate-950/40', badge: 'bg-slate-800 text-slate-300' },
    { status: 'In Progress', title: 'Active Picking', icon: '🛒', border: 'border-amber-800/40', bg: 'bg-amber-950/20', badge: 'bg-amber-950 text-amber-300' },
    { status: 'Delayed', title: 'Delayed / Bottleneck', icon: '🛑', border: 'border-rose-800/60', bg: 'bg-rose-950/20', badge: 'bg-rose-950 text-rose-300 animate-pulse' },
    { status: 'Packed', title: 'Packed in Bay', icon: '📦', border: 'border-indigo-800/40', bg: 'bg-indigo-950/20', badge: 'bg-indigo-950 text-indigo-300' },
    { status: 'Quality Check', title: 'QC Barcode Scan', icon: '🔍', border: 'border-purple-800/40', bg: 'bg-purple-950/20', badge: 'bg-purple-950 text-purple-300' },
  ];

  const delayedInB2 = tasks.filter(t => t.zone === 'B2' && t.status === 'Delayed');

  return (
    <div className="space-y-6 pb-12">
      {/* Zone B2 Bottleneck Critical Alert Banner */}
      {delayedInB2.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/40 border border-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.25)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl animate-bounce">🚨</span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-rose-200 font-mono">
                  Zone B2 Throughput Bottleneck Detected ({delayedInB2.length} Delayed Tasks)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-900 text-rose-200">
                  Avg Latency: 18m
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Pickers Marcus Vance and Kenji Takahashi are overloaded at &gt;100% capacity. Reassign pending tasks to idle pickers in adjacent zones.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onOpenReassignModal(delayedInB2[0]);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 shadow-md transition flex items-center space-x-1.5 whitespace-nowrap"
          >
            <span>🔄 1-Click Reassign Zone B2 Load</span>
          </button>
        </div>
      )}

      {/* Control Bar: Zone Filters & Picker Status Overview */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Zone Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 font-mono">Filter Zone:</span>
          {['ALL', 'A1', 'A2', 'B1', 'B2', 'C1'].map(z => (
            <button
              key={z}
              onClick={() => {
                sound.playClick();
                setSelectedZone(z);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedZone === z
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {z === 'ALL' ? 'All Zones' : `Zone ${z}`}
            </button>
          ))}
        </div>

        {/* Picker Fleet Health Pill */}
        <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
          <span>Active Pickers: <strong className="text-slate-200">{pickers.length}</strong></span>
          <span>•</span>
          <span>Overloaded: <strong className="text-rose-400">{pickers.filter(p => p.currentStatus === 'Overloaded').length}</strong></span>
          <span>•</span>
          <span>Available: <strong className="text-emerald-400">{pickers.filter(p => p.currentStatus === 'Available').length}</strong></span>
        </div>
      </div>

      {/* 5-Column Kanban Task Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.status);

          return (
            <div
              key={col.status}
              className={`rounded-2xl border ${col.border} ${col.bg} p-3.5 flex flex-col h-[700px] shadow-lg`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span>{col.icon}</span>
                  <h4 className="font-bold text-xs text-slate-100 uppercase tracking-wide">{col.title}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border border-slate-700 ${col.badge}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
                {colTasks.map(task => {
                  const priBadge = getPriorityBadge(task.priority);
                  const slaInfo = formatSlaCountdown(task.minutesRemaining);

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border transition-all duration-200 space-y-2.5 ${
                        task.isBottleneck
                          ? 'bg-rose-950/40 border-rose-700/80 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      {/* Top row: Order ID + Priority */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-cyan-400 font-bold text-xs">{task.orderId}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${priBadge.bg} ${priBadge.text} ${priBadge.border}`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Customer & Item count */}
                      <div>
                        <div className="text-xs text-slate-200 font-semibold truncate">{task.customerName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                          <span>Items: <strong className="text-slate-200 font-mono">{task.itemCount} units</strong></span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Zone {task.zone}</span>
                        </div>
                      </div>

                      {/* Picker + SLA */}
                      <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Picker:</span>
                          <span className="text-slate-200 font-semibold font-mono">{task.pickerName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Due:</span>
                          <span className={`font-mono font-bold ${slaInfo.isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
                            {task.dueTime} ({slaInfo.text})
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => {
                            sound.playClick();
                            onOpenReassignModal(task);
                          }}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center space-x-1"
                          title="Reassign to another picker"
                        >
                          <span>🔄 Reassign</span>
                        </button>

                        {col.status !== 'Quality Check' && (
                          <button
                            onClick={() => {
                              sound.playSuccess();
                              onAdvanceTaskStatus(task.id);
                            }}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 transition"
                          >
                            Advance →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-600 border border-dashed border-slate-800/80 rounded-xl">
                    No tasks in stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
