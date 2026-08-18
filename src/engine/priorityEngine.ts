import { Order, CustomerTier, PriorityLevel } from '../types';

export function calculatePriorityScore(order: Partial<Order>): {
  score: number;
  level: PriorityLevel;
  factors: {
    tierScore: number;
    slaScore: number;
    valueScore: number;
    urgencyScore: number;
  };
} {
  // 1. Customer Tier Weight (0 - 40 pts)
  let tierScore = 10;
  if (order.customerTier === 'Enterprise') tierScore = 40;
  else if (order.customerTier === 'Premium') tierScore = 25;
  else if (order.customerTier === 'Standard') tierScore = 10;

  // 2. SLA Urgency Weight (0 - 35 pts)
  let slaScore = 5;
  const mins = order.minutesRemaining ?? 120;
  if (mins <= 0) slaScore = 35; // overdue
  else if (mins <= 45) slaScore = 35;
  else if (mins <= 90) slaScore = 25;
  else if (mins <= 180) slaScore = 15;
  else if (mins <= 300) slaScore = 10;
  else slaScore = 5;

  // 3. Order Value Weight (0 - 20 pts)
  let valueScore = 5;
  const val = order.totalValue ?? 0;
  if (val >= 10000) valueScore = 20;
  else if (val >= 5000) valueScore = 15;
  else if (val >= 2000) valueScore = 10;
  else valueScore = 5;

  // 4. Urgency Flag / Assembly Line Criticality (0 - 10 pts)
  const isLineDown = (order.notes || '').toLowerCase().includes('critical') || (order.notes || '').toLowerCase().includes('line-down');
  const urgencyScore = isLineDown ? 10 : 5;

  const totalScore = Math.min(100, tierScore + slaScore + valueScore + urgencyScore);

  let level: PriorityLevel = 'Normal';
  if (totalScore >= 90) level = 'Critical';
  else if (totalScore >= 75) level = 'High';
  else if (totalScore >= 35) level = 'Normal';
  else level = 'Low';

  return {
    score: totalScore,
    level,
    factors: {
      tierScore,
      slaScore,
      valueScore,
      urgencyScore
    }
  };
}

export function formatSlaCountdown(minutesRemaining: number): { text: string; isOverdue: boolean; isWarning: boolean } {
  if (minutesRemaining < 0) {
    const overdueMins = Math.abs(minutesRemaining);
    const hours = Math.floor(overdueMins / 60);
    const mins = overdueMins % 60;
    const text = hours > 0 ? `-${hours}h ${mins}m OVERDUE` : `-${mins}m OVERDUE`;
    return { text, isOverdue: true, isWarning: true };
  }
  
  const hours = Math.floor(minutesRemaining / 60);
  const mins = minutesRemaining % 60;
  const text = hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
  const isWarning = minutesRemaining <= 60;
  
  return { text, isOverdue: false, isWarning };
}
