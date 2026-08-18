import React from 'react';
import { OperationalException } from '../types';
import { sound } from '../utils/audio';

interface ExceptionsPageProps {
  exceptions: OperationalException[];
  onOpenResolveModal: (exception: OperationalException) => void;
  onQuickResolve: (exceptionId: string) => void;
}

export const ExceptionsPage: React.FC<ExceptionsPageProps> = ({
  exceptions,
  onOpenResolveModal,
  onQuickResolve
}) => {
  const getExceptionTypeLabel = (type: OperationalException['type']): { label: string; icon: string; badgeColor: string } => {
    switch (type) {
      case 'damaged_item':
        return { label: 'Damaged Item', icon: '💥', badgeColor: 'bg-rose-950 text-rose-300 border-rose-800' };
      case 'missing_item':
        return { label: 'Missing Item / Bin Discrepancy', icon: '❓', badgeColor: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'stock_mismatch':
        return { label: 'Stock Count Mismatch', icon: '📊', badgeColor: 'bg-purple-950 text-purple-300 border-purple-800' };
      case 'delayed_picking':
        return { label: 'Picker Overdue SLA', icon: '⏱️', badgeColor: 'bg-orange-950 text-orange-300 border-orange-800' };
    }
  };

  const pendingExceptions = exceptions.filter(e => e.status !== 'Resolved');
  const resolvedExceptions = exceptions.filter(e => e.status === 'Resolved');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/30 to-amber-950/30 border border-rose-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 text-2xl shrink-0">
            ⚠️
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-100">Operational Exceptions & Incident Resolution</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                {pendingExceptions.length} Unresolved Incidents
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Real-time exception mitigation pipeline: intelligent SKU substitution, physical count adjustments, order splitting, and picker dynamic re-routing.
            </p>
          </div>
        </div>
      </div>

      {/* Exception Cards List */}
      <div className="space-y-4">
        {pendingExceptions.map((ex) => {
          const typeInfo = getExceptionTypeLabel(ex.type);

          return (
            <div
              key={ex.id}
              className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-4"
            >
              {/* Header: ID, Type, Reported At, Impact */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-bold text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-lg border border-rose-800">
                    {ex.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeInfo.badgeColor} flex items-center space-x-1`}>
                    <span>{typeInfo.icon}</span>
                    <span>{typeInfo.label}</span>
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Reported: {ex.reportedAt}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-400">
                    Target Order: <strong className="text-cyan-300 font-mono">{ex.orderId}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                    {ex.impactLevel} Impact
                  </span>
                </div>
              </div>

              {/* 3-Step Systematic Breakdown: Issue -> Decision -> Recommended Resolution */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 1. Issue Description */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <span>1. Issue Detected</span>
                    <span className="font-mono text-[10px] text-cyan-400">{ex.zone}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200">{ex.sku} — {ex.skuName}</div>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {ex.issueDescription}
                  </p>
                  <div className="text-[10px] text-slate-500 pt-1">
                    Reported by picker: <strong className="text-slate-300">{ex.pickerName}</strong>
                  </div>
                </div>

                {/* 2. System Decision */}
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-900/40 space-y-1.5">
                  <div className="flex items-center justify-between text-cyan-400 text-xs font-bold uppercase tracking-wider">
                    <span>2. AI System Decision</span>
                    <span className="text-[10px] font-mono text-cyan-300">Rule Match</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed pt-1">
                    {ex.systemDecision}
                  </p>
                </div>

                {/* 3. Recommended Resolution */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-1.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      <span>3. Recommended Resolution</span>
                      <span className="text-[10px] font-mono text-emerald-300">Fast Action</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed pt-1">
                      {ex.recommendedResolution}
                    </p>
                  </div>

                  <div className="pt-3 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => {
                        sound.playClick();
                        onOpenResolveModal(ex);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    >
                      Options
                    </button>
                    <button
                      onClick={() => {
                        sound.playSuccess();
                        onQuickResolve(ex.id);
                      }}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 shadow-md shadow-emerald-500/20 transition flex items-center space-x-1"
                    >
                      <span>⚡ 1-Click Resolve</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {pendingExceptions.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-3xl">✨</div>
            <h3 className="text-base font-bold text-slate-100 font-mono">Zero Active Exceptions</h3>
            <p className="text-xs text-slate-400">All reported physical discrepancies and picking obstacles have been resolved.</p>
          </div>
        )}

        {/* Resolved Exceptions History Section */}
        {resolvedExceptions.length > 0 && (
          <div className="pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
              Resolved Exceptions History ({resolvedExceptions.length})
            </h3>
            <div className="space-y-2">
              {resolvedExceptions.map((ex) => (
                <div
                  key={ex.id}
                  className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between text-xs opacity-75"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-emerald-400 font-bold">{ex.id}</span>
                    <span className="text-slate-300 font-medium">{ex.sku} ({ex.issueDescription})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    ✓ Resolved
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
