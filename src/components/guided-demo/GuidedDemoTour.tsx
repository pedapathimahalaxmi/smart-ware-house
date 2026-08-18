import React from 'react';
import { sound } from '../../utils/audio';

export interface TourStep {
  targetPage: string;
  targetElementId?: string;
  title: string;
  description: string;
  badge: string;
  actionRequired?: 'click_approve' | 'navigate' | 'none';
}

export const DEMO_TOUR_STEPS: TourStep[] = [
  {
    targetPage: 'allocation',
    targetElementId: 'demo-card-critical-order',
    title: 'Step 1: Critical Order Ingestion (ORD-1042)',
    description: 'Enterprise client Apex Robotics has placed a mission-critical order (ORD-1042) with a 45-minute SLA deadline. It requires 10 units of SKU-1001 (Industrial Servo Motor).',
    badge: 'Critical Ingestion'
  },
  {
    targetPage: 'allocation',
    targetElementId: 'demo-card-stock-deficit',
    title: 'Step 2: Inventory Deficit Detected',
    description: 'FlowForge checks physical shelf availability: Only 7 units are unallocated. A 3-unit shortfall creates an immediate SLA breach risk.',
    badge: 'Inventory Deficit'
  },
  {
    targetPage: 'allocation',
    targetElementId: 'demo-card-lower-order',
    title: 'Step 3: Identification of Lower-Priority Reservation',
    description: 'The Decision Engine automatically identifies ORD-1037 (Standard Tier, SLA in 4h 30m) holding 5 reserved units of SKU-1001 on hold.',
    badge: 'Reservation Scan'
  },
  {
    targetPage: 'allocation',
    targetElementId: 'demo-card-ai-recommendation',
    title: 'Step 4: AI Reallocation Recommendation',
    description: '“Reallocate 3 units from ORD-1037 to ORD-1042. This protects the critical SLA while maintaining ORD-1037 delivery window with scheduled replenishment.”',
    badge: 'AI Decision Engine'
  },
  {
    targetPage: 'allocation',
    targetElementId: 'demo-btn-approve-reallocation',
    title: 'Step 5: Operational Authorization',
    description: 'Click "Approve Reallocation" below to execute the live stock transfer, reconcile inventory ledgers, and transition ORD-1042 to picking stage.',
    badge: 'Execute Action',
    actionRequired: 'click_approve'
  }
];

interface GuidedDemoTourProps {
  currentStepIndex: number;
  isActive: boolean;
  onNextStep: () => void;
  onPrevStep: () => void;
  onCloseTour: () => void;
  onExecuteDemoAction: () => void;
}

export const GuidedDemoTour: React.FC<GuidedDemoTourProps> = ({
  currentStepIndex,
  isActive,
  onNextStep,
  onPrevStep,
  onCloseTour,
  onExecuteDemoAction
}) => {
  if (!isActive) return null;

  const currentStep = DEMO_TOUR_STEPS[currentStepIndex] || DEMO_TOUR_STEPS[0];
  const isLastStep = currentStepIndex === DEMO_TOUR_STEPS.length - 1;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-lg w-full p-1 animate-slide-up">
      <div className="bg-slate-900/95 border-2 border-cyan-500/80 rounded-2xl shadow-[0_0_35px_rgba(6,182,212,0.4)] backdrop-blur-xl p-5 text-slate-100 relative overflow-hidden">
        {/* Glowing Top Ambient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 animate-pulse"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-bold">
              Guided Interactive Demo Tour
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              {currentStepIndex + 1} / {DEMO_TOUR_STEPS.length}
            </span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onCloseTour();
            }}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
          >
            Exit Tour ✕
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
              <span>{currentStep.title}</span>
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              {currentStep.badge}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Tour Navigation Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
          <button
            onClick={() => {
              sound.playClick();
              onPrevStep();
            }}
            disabled={currentStepIndex === 0}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 text-slate-300 transition"
          >
            ← Previous
          </button>

          <div className="flex items-center space-x-2">
            {isLastStep ? (
              <button
                onClick={() => {
                  sound.playSuccess();
                  onExecuteDemoAction();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/30 transition flex items-center space-x-1.5 animate-pulse"
              >
                <span>⚡ 1-Click Approve Reallocation</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  onNextStep();
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex items-center space-x-1"
              >
                <span>Next Step →</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
