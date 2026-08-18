import { PriorityLevel, CustomerTier, FulfillmentStatus, AllocationStatus, InventoryHealth } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

export function getPriorityBadge(priority: PriorityLevel): { bg: string; text: string; border: string; glow: string } {
  switch (priority) {
    case 'Critical':
      return {
        bg: 'bg-rose-950/70',
        text: 'text-rose-400',
        border: 'border-rose-800/80',
        glow: 'shadow-[0_0_12px_rgba(244,63,94,0.35)]'
      };
    case 'High':
      return {
        bg: 'bg-amber-950/70',
        text: 'text-amber-400',
        border: 'border-amber-800/80',
        glow: 'shadow-[0_0_8px_rgba(245,158,11,0.25)]'
      };
    case 'Normal':
      return {
        bg: 'bg-blue-950/60',
        text: 'text-blue-400',
        border: 'border-blue-800/60',
        glow: ''
      };
    case 'Low':
      return {
        bg: 'bg-slate-900/60',
        text: 'text-slate-400',
        border: 'border-slate-800',
        glow: ''
      };
  }
}

export function getCustomerTierBadge(tier: CustomerTier): { bg: string; text: string; border: string } {
  switch (tier) {
    case 'Enterprise':
      return {
        bg: 'bg-purple-950/60',
        text: 'text-purple-300',
        border: 'border-purple-800/70'
      };
    case 'Premium':
      return {
        bg: 'bg-cyan-950/60',
        text: 'text-cyan-300',
        border: 'border-cyan-800/70'
      };
    case 'Standard':
      return {
        bg: 'bg-slate-800/60',
        text: 'text-slate-300',
        border: 'border-slate-700'
      };
  }
}

export function getFulfillmentStatusBadge(status: FulfillmentStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case 'Created':
      return { bg: 'bg-slate-800/60', text: 'text-slate-300', border: 'border-slate-700' };
    case 'Allocated':
      return { bg: 'bg-blue-950/60', text: 'text-blue-300', border: 'border-blue-800/60' };
    case 'Picking':
      return { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-800/60' };
    case 'Packed':
      return { bg: 'bg-indigo-950/60', text: 'text-indigo-300', border: 'border-indigo-800/60' };
    case 'Quality Check':
      return { bg: 'bg-purple-950/60', text: 'text-purple-300', border: 'border-purple-800/60' };
    case 'Dispatched':
      return { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-800/60' };
    case 'On Hold':
      return { bg: 'bg-rose-950/70', text: 'text-rose-300', border: 'border-rose-800/70' };
    case 'Cancelled':
      return { bg: 'bg-gray-900', text: 'text-gray-400', border: 'border-gray-800' };
  }
}

export function getAllocationStatusBadge(status: AllocationStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case 'Fully Allocated':
      return { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-800/70' };
    case 'Partially Allocated':
      return { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-800/70' };
    case 'Unallocated':
      return { bg: 'bg-slate-800/60', text: 'text-slate-300', border: 'border-slate-700' };
    case 'Conflict Detected':
      return { bg: 'bg-rose-950/70', text: 'text-rose-300', border: 'border-rose-800/80' };
  }
}

export function getInventoryHealthBadge(health: InventoryHealth): { bg: string; text: string; border: string } {
  switch (health) {
    case 'Healthy':
      return { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-800/60' };
    case 'Low Stock':
      return { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-800/60' };
    case 'Out of Stock':
      return { bg: 'bg-rose-950/70', text: 'text-rose-300', border: 'border-rose-800/70' };
    case 'Damaged':
      return { bg: 'bg-orange-950/70', text: 'text-orange-300', border: 'border-orange-800/70' };
  }
}
