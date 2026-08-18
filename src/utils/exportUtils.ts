import { Order, InventoryItem } from '../types';

export function exportOrdersToCSV(orders: Order[]) {
  const headers = ['Order ID', 'Customer', 'Tier', 'Priority', 'SLA Deadline', 'Minutes Left', 'Items Qty', 'Total Value ($)', 'Allocation Status', 'Fulfillment Status', 'Zone'];
  
  const rows = orders.map(o => {
    const totalQty = o.items.reduce((sum, i) => sum + i.quantityRequested, 0);
    return [
      `"${o.id}"`,
      `"${o.customerName}"`,
      `"${o.customerTier}"`,
      `"${o.priority}"`,
      `"${o.slaDeadline}"`,
      o.minutesRemaining,
      totalQty,
      o.totalValue,
      `"${o.allocationStatus}"`,
      `"${o.fulfillmentStatus}"`,
      `"${o.zone}"`
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadBlob(csvContent, `flowforge-orders-report-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}

export function exportInventoryToCSV(inventory: InventoryItem[]) {
  const headers = ['SKU', 'Product Name', 'Category', 'Zone', 'Bin', 'On Hand', 'Reserved', 'Available', 'Reorder Level', 'Unit Cost ($)', 'Status'];
  
  const rows = inventory.map(i => [
    `"${i.sku}"`,
    `"${i.name}"`,
    `"${i.category}"`,
    `"${i.zone}"`,
    `"${i.binLocation}"`,
    i.onHand,
    i.reserved,
    i.available,
    i.reorderLevel,
    i.unitCost,
    `"${i.status}"`
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadBlob(csvContent, `flowforge-inventory-status-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
