import { Order, InventoryItem, AllocationConflict } from '../types';

export function evaluateAllocationConflicts(
  orders: Order[],
  inventory: InventoryItem[]
): AllocationConflict[] {
  const conflicts: AllocationConflict[] = [];

  // Find critical or high priority orders with unallocated or conflict items
  const criticalOrders = orders.filter(
    o => (o.priority === 'Critical' || o.priority === 'High') &&
         o.fulfillmentStatus !== 'Dispatched' &&
         o.fulfillmentStatus !== 'Cancelled' &&
         o.items.some(it => it.quantityAllocated < it.quantityRequested)
  );

  for (const critOrder of criticalOrders) {
    for (const item of critOrder.items) {
      const deficit = item.quantityRequested - item.quantityAllocated;
      if (deficit <= 0) continue;

      const inv = inventory.find(i => i.sku === item.sku);
      if (!inv) continue;

      // Look for lower priority orders holding reserved units of this SKU
      const lowerOrders = orders.filter(
        o => o.id !== critOrder.id &&
             o.priorityScore < critOrder.priorityScore &&
             o.fulfillmentStatus !== 'Dispatched' &&
             o.fulfillmentStatus !== 'Cancelled' &&
             o.items.some(it => it.sku === item.sku && it.quantityAllocated > 0)
      );

      for (const lowOrder of lowerOrders) {
        const lowItem = lowOrder.items.find(it => it.sku === item.sku);
        if (!lowItem) continue;

        const reservedInLow = lowItem.quantityAllocated;
        const transferUnits = Math.min(deficit, reservedInLow);

        if (transferUnits > 0) {
          conflicts.push({
            id: `CONF-${critOrder.id}-${lowOrder.id}-${item.sku}`,
            criticalOrderId: critOrder.id,
            criticalCustomer: critOrder.customerName,
            criticalTier: critOrder.customerTier,
            criticalSlaMinutes: critOrder.minutesRemaining,
            lowerOrderId: lowOrder.id,
            lowerCustomer: lowOrder.customerName,
            lowerTier: lowOrder.customerTier,
            sku: item.sku,
            skuName: item.name,
            unitsNeededByCritical: item.quantityRequested,
            unitsAvailableOnShelf: inv.available,
            unitsReservedByLower: reservedInLow,
            recommendedTransferUnits: transferUnits,
            explanation: `Reallocate ${transferUnits} units of ${item.sku} from lower-priority ${lowOrder.id} (${lowOrder.customerName}) to protect critical SLA for ${critOrder.id} (${critOrder.customerName}).`,
            resolved: false,
          });
        }
      }
    }
  }

  return conflicts;
}

export function applyReallocation(
  conflict: AllocationConflict,
  orders: Order[],
  inventory: InventoryItem[]
): {
  updatedOrders: Order[];
  updatedInventory: InventoryItem[];
  logMessage: string;
} {
  const transferQty = conflict.recommendedTransferUnits;

  // 1. Update Orders
  const updatedOrders = orders.map(ord => {
    if (ord.id === conflict.criticalOrderId) {
      const updatedItems = ord.items.map(item => {
        if (item.sku === conflict.sku) {
          return {
            ...item,
            quantityAllocated: Math.min(item.quantityRequested, item.quantityAllocated + transferQty)
          };
        }
        return item;
      });

      const allAllocated = updatedItems.every(it => it.quantityAllocated >= it.quantityRequested);

      return {
        ...ord,
        items: updatedItems,
        allocationStatus: (allAllocated ? 'Fully Allocated' : 'Partially Allocated') as any,
        fulfillmentStatus: (ord.fulfillmentStatus === 'Created' || ord.fulfillmentStatus === 'On Hold' ? 'Allocated' : ord.fulfillmentStatus) as any,
        notes: `AI Reallocation completed: +${transferQty} units of ${conflict.sku} transferred from ${conflict.lowerOrderId}.`,
        history: [
          ...ord.history,
          {
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            event: `Smart Allocation: +${transferQty} units ${conflict.sku} secured from ${conflict.lowerOrderId}`,
            actor: 'FlowForge Decision Engine'
          }
        ]
      };
    }

    if (ord.id === conflict.lowerOrderId) {
      const updatedItems = ord.items.map(item => {
        if (item.sku === conflict.sku) {
          return {
            ...item,
            quantityAllocated: Math.max(0, item.quantityAllocated - transferQty)
          };
        }
        return item;
      });

      const anyAllocated = updatedItems.some(it => it.quantityAllocated > 0);

      return {
        ...ord,
        items: updatedItems,
        allocationStatus: (anyAllocated ? 'Partially Allocated' : 'Unallocated') as any,
        notes: `Stock reallocated to critical order ${conflict.criticalOrderId}. Automated replenishment trigger scheduled.`,
        history: [
          ...ord.history,
          {
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            event: `Reallocated ${transferQty} units of ${conflict.sku} to priority order ${conflict.criticalOrderId}`,
            actor: 'FlowForge Decision Engine'
          }
        ]
      };
    }

    return ord;
  });

  // 2. Update Inventory
  const updatedInventory = inventory.map(inv => {
    if (inv.sku === conflict.sku) {
      return {
        ...inv,
        // Reservation transfers internally between orders, so total reserved stays consistent or adjusts
        reserved: inv.reserved,
        available: Math.max(0, inv.onHand - inv.reserved)
      };
    }
    return inv;
  });

  const logMessage = `Successfully transferred ${transferQty} units of ${conflict.sku} to ${conflict.criticalOrderId}. Critical SLA protected.`;

  return { updatedOrders, updatedInventory, logMessage };
}

export function applyPartialAllocation(
  conflict: AllocationConflict,
  orders: Order[],
  inventory: InventoryItem[]
): {
  updatedOrders: Order[];
  updatedInventory: InventoryItem[];
  logMessage: string;
} {
  const availableQty = conflict.unitsAvailableOnShelf;

  const updatedOrders = orders.map(ord => {
    if (ord.id === conflict.criticalOrderId) {
      const updatedItems = ord.items.map(item => {
        if (item.sku === conflict.sku) {
          return {
            ...item,
            quantityAllocated: item.quantityAllocated + availableQty
          };
        }
        return item;
      });

      return {
        ...ord,
        items: updatedItems,
        allocationStatus: 'Partially Allocated' as any,
        notes: `Partial allocation executed (${availableQty} units). Expedited restock requested for remainder.`,
        history: [
          ...ord.history,
          {
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            event: `Partial stock allocation (${availableQty} units) applied`,
            actor: 'Operations Manager'
          }
        ]
      };
    }
    return ord;
  });

  const updatedInventory = inventory.map(inv => {
    if (inv.sku === conflict.sku) {
      const newReserved = inv.reserved + availableQty;
      return {
        ...inv,
        reserved: newReserved,
        available: Math.max(0, inv.onHand - newReserved),
        status: (inv.onHand - newReserved <= 0 ? 'Out of Stock' : 'Low Stock') as any
      };
    }
    return inv;
  });

  return {
    updatedOrders,
    updatedInventory,
    logMessage: `Partial stock of ${availableQty} units allocated to ${conflict.criticalOrderId}. Backorder request queued.`
  };
}

export function applyRestock(
  sku: string,
  quantityToAdd: number,
  inventory: InventoryItem[]
): {
  updatedInventory: InventoryItem[];
  restockedItem?: InventoryItem;
} {
  let restockedItem: InventoryItem | undefined;

  const updatedInventory = inventory.map(item => {
    if (item.sku === sku) {
      const newOnHand = item.onHand + quantityToAdd;
      const newAvailable = Math.max(0, newOnHand - item.reserved);
      const newStatus = (newAvailable <= 0 ? 'Out of Stock' : (newAvailable <= item.reorderLevel ? 'Low Stock' : 'Healthy')) as any;
      
      const updated = {
        ...item,
        onHand: newOnHand,
        available: newAvailable,
        status: newStatus,
        lastRestocked: new Date().toISOString().split('T')[0]
      };
      restockedItem = updated;
      return updated;
    }
    return item;
  });

  return { updatedInventory, restockedItem };
}
