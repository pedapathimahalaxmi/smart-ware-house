import React, { useState } from 'react';
import { OperationalException } from '../../types';
import { sound } from '../../utils/audio';

interface ResolveExceptionModalProps {
  exception: OperationalException | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmResolve: (exceptionId: string, resolutionType: string) => void;
}

export const ResolveExceptionModal: React.FC<ResolveExceptionModalProps> = ({
  exception,
  isOpen,
  onClose,
  onConfirmResolve
}) => {
  if (!isOpen || !exception) return null;

  const [resolutionChoice, setResolutionChoice] = useState<'recommended' | 'alternative'>('recommended');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    onConfirmResolve(exception.id, resolutionChoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-lg">
              ⚠️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-100 font-mono">{exception.id}</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800">
                  {exception.impactLevel} Impact
                </span>
              </div>
              <p className="text-xs text-slate-400">Warehouse Incident Decision & Resolution Center</p>
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
          {/* Incident Details Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Target Order: <strong className="text-cyan-300 font-mono">{exception.orderId}</strong></span>
              <span className="text-slate-400">Zone: <strong className="text-slate-200 font-mono">{exception.zone}</strong> • Reporter: <strong className="text-slate-200">{exception.pickerName}</strong></span>
            </div>
            <div className="font-semibold text-slate-100 text-sm">
              {exception.sku} — {exception.skuName}
            </div>
            <p className="text-xs text-rose-300 bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/40">
              {exception.issueDescription}
            </p>
          </div>

          {/* AI Decision Analysis */}
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-1 text-xs">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <span>🧠 FlowForge System Decision:</span>
            </div>
            <p className="text-slate-300">{exception.systemDecision}</p>
          </div>

          {/* Resolution Options */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              Select Actionable Resolution Protocol:
            </label>

            {/* Option 1: AI Recommended */}
            <div
              onClick={() => {
                sound.playClick();
                setResolutionChoice('recommended');
              }}
              className={`p-3.5 rounded-xl border transition cursor-pointer ${
                resolutionChoice === 'recommended'
                  ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  checked={resolutionChoice === 'recommended'}
                  onChange={() => setResolutionChoice('recommended')}
                  className="mt-1 accent-cyan-400"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-100">Option A: FlowForge Recommended (Fastest)</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-800 font-bold">
                      98% Confidence
                    </span>
                  </div>
                  <p className="text-xs text-cyan-200/90 mt-1">
                    {exception.recommendedResolution}
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: Manual Hold & Supervisor Review */}
            <div
              onClick={() => {
                sound.playClick();
                setResolutionChoice('alternative');
              }}
              className={`p-3.5 rounded-xl border transition cursor-pointer ${
                resolutionChoice === 'alternative'
                  ? 'bg-cyan-950/40 border-cyan-500'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  checked={resolutionChoice === 'alternative'}
                  onChange={() => setResolutionChoice('alternative')}
                  className="mt-1 accent-cyan-400"
                />
                <div>
                  <span className="font-bold text-xs text-slate-100">Option B: Hold Order for Physical QA Inspection</span>
                  <p className="text-xs text-slate-400 mt-1">
                    Quarantine line item and flag for Level 2 Supervisor inspection. Expected delay: 4 hours.
                  </p>
                </div>
              </div>
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
              <span>✅ Execute Resolution & Clear Exception</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
