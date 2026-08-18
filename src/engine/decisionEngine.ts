import { Order, InventoryItem, PickingTask, OperationalException, OperationalDecision, Picker } from '../types';

export function generateOperationalDecisions(
  orders: Order[],
  inventory: InventoryItem[],
  tasks: PickingTask[],
  exceptions: OperationalException[],
  _pickers: Picker[]
): OperationalDecision[] {
  const decisions: OperationalDecision[] = [];

  // 1. Critical Allocation Conflict Decision (e.g. ORD-1042 / SKU-1001)
  const criticalConflictOrder = orders.find(
    o => o.priority === 'Critical' &&
         o.allocationStatus === 'Conflict Detected' &&
         o.items.some(i => i.sku === 'SKU-1001')
  );

  if (criticalConflictOrder) {
    decisions.push({
      id: 'DEC-01',
      category: 'Allocation',
      title: 'Priority Stock Reallocation: ORD-1042 (Apex Robotics)',
      description: 'ORD-1042 needs 10 units of SKU-1001 (only 7 available). Reallocate 3 reserved units from low-priority ORD-1037 (Standard) to secure critical $14,500 Enterprise delivery.',
      impact: 'Protects 45-min SLA deadline & prevents $2,500/hr line-down penalty',
      actionLabel: 'Approve Reallocation',
      confidence: 99.4,
      urgency: 'Immediate',
      actionType: 'approve_reallocation',
      targetId: 'CONF-01'
    });
  }

  // 2. Zone B2 Picking Bottleneck Decision
  const delayedB2Tasks = tasks.filter(t => t.zone === 'B2' && t.status === 'Delayed');
  if (delayedB2Tasks.length > 0) {
    decisions.push({
      id: 'DEC-02',
      category: 'Bottleneck',
      title: 'Zone B2 Throughput Bottleneck (18m Avg Delay)',
      description: 'Zone B2 pickers (Marcus Vance & Kenji Takahashi) are overloaded with 9 active tasks. Reassign pending task TSK-201 to idle picker Elena Rostova (Zone A1, 99% efficiency).',
      impact: 'Reduces Zone B2 latency by 64% and clears downstream packing stall',
      actionLabel: 'Reassign to Elena Rostova',
      confidence: 96.8,
      urgency: 'Immediate',
      actionType: 'reassign_picker',
      targetId: 'TSK-201'
    });
  }

  // 3. Exception Resolution Decision (Damaged SKU-1008 in ORD-1033)
  const damagedException = exceptions.find(e => e.id === 'EX-901' && e.status !== 'Resolved');
  if (damagedException) {
    decisions.push({
      id: 'DEC-03',
      category: 'Priority Escalation',
      title: 'Substitute Damaged SKU-1008 with Rev B (SKU-1010)',
      description: 'Order ORD-1033 is on hold due to casing damage on SKU-1008. Pin-compatible alternative SKU-1010 has 22 units available in Zone A2-R05-B05.',
      impact: 'Unblocks Tesla Tier-1 order without customer revision delay',
      actionLabel: 'Apply SKU-1010 Substitution',
      confidence: 98.2,
      urgency: 'Immediate',
      actionType: 'substitute_sku',
      targetId: 'EX-901'
    });
  }

  // 4. Low-Stock Automated Reorder Decision
  const lowStockItems = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock');
  if (lowStockItems.length > 0) {
    const mostCritical = lowStockItems[0];
    decisions.push({
      id: 'DEC-04',
      category: 'Replenishment',
      title: `Automated PO Reorder: ${mostCritical.sku} (${mostCritical.name})`,
      description: `Available inventory (${mostCritical.available} units) has dropped below safety reorder threshold (${mostCritical.reorderLevel} units). Trigger automated replenishment batch of +25 units.`,
      impact: 'Prevents stock-out for next 7 days of projected order volume',
      actionLabel: 'Trigger Restock PO',
      confidence: 94.5,
      urgency: 'Medium',
      actionType: 'trigger_reorder',
      targetId: mostCritical.sku
    });
  }

  return decisions;
}

export function computeWarehouseKPIs(
  orders: Order[],
  inventory: InventoryItem[],
  tasks: PickingTask[]
) {
  const totalOrders = orders.length;
  const dispatchedOrders = orders.filter(o => o.fulfillmentStatus === 'Dispatched').length;
  const inFlightOrders = orders.filter(o => o.fulfillmentStatus !== 'Dispatched' && o.fulfillmentStatus !== 'Cancelled').length;
  
  const onTimeOrders = orders.filter(o => o.fulfillmentStatus === 'Dispatched' || o.minutesRemaining > 0).length;
  const fulfillmentRate = totalOrders > 0 ? Math.round((onTimeOrders / totalOrders) * 100) : 94;

  const lowStockCount = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;
  
  const delayedTasks = tasks.filter(t => t.status === 'Delayed');
  const b2Delayed = delayedTasks.filter(t => t.zone === 'B2').length;
  const bottleneckStatus = b2Delayed > 0 ? `Zone B2 (${b2Delayed} Delayed)` : 'Nominal';

  return {
    ordersToday: totalOrders,
    dispatchedOrders,
    inFlightOrders,
    fulfillmentRate,
    lowStockCount,
    bottleneckStatus,
    delayedTaskCount: delayedTasks.length
  };
}
