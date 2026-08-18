export type PriorityLevel = 'Critical' | 'High' | 'Normal' | 'Low';
export type CustomerTier = 'Enterprise' | 'Premium' | 'Standard';
export type FulfillmentStatus = 'Created' | 'Allocated' | 'Picking' | 'Packed' | 'Quality Check' | 'Dispatched' | 'On Hold' | 'Cancelled';
export type AllocationStatus = 'Fully Allocated' | 'Partially Allocated' | 'Unallocated' | 'Conflict Detected';
export type WarehouseZone = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type InventoryHealth = 'Healthy' | 'Low Stock' | 'Out of Stock' | 'Damaged';
export type ExceptionType = 'damaged_item' | 'missing_item' | 'stock_mismatch' | 'delayed_picking';
export type ExceptionStatus = 'Pending Review' | 'Resolution In Progress' | 'Resolved';

export interface OrderItem {
  sku: string;
  name: string;
  quantityRequested: number;
  quantityAllocated: number;
  unitPrice: number;
  zone: WarehouseZone;
}

export interface Order {
  id: string;
  customerName: string;
  customerTier: CustomerTier;
  createdAt: string;
  slaDeadline: string;
  minutesRemaining: number;
  priority: PriorityLevel;
  priorityScore: number;
  priorityFactors: {
    tierScore: number;
    slaScore: number;
    valueScore: number;
    urgencyScore: number;
  };
  items: OrderItem[];
  totalValue: number;
  allocationStatus: AllocationStatus;
  fulfillmentStatus: FulfillmentStatus;
  assignedPicker?: string;
  zone: WarehouseZone;
  notes?: string;
  history: Array<{
    timestamp: string;
    event: string;
    actor: string;
  }>;
}

export interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  zone: WarehouseZone;
  binLocation: string;
  onHand: number;
  reserved: number;
  available: number;
  reorderLevel: number;
  unitCost: number;
  leadTimeDays: number;
  status: InventoryHealth;
  lastRestocked: string;
}

export interface Picker {
  id: string;
  name: string;
  zone: WarehouseZone;
  activeTasks: number;
  maxCapacity: number;
  efficiencyRating: number;
  currentStatus: 'Available' | 'Picking' | 'Overloaded' | 'On Break';
}

export interface PickingTask {
  id: string;
  orderId: string;
  customerName: string;
  pickerName: string;
  pickerId: string;
  zone: WarehouseZone;
  itemCount: number;
  dueTime: string;
  minutesRemaining: number;
  status: 'Ready' | 'In Progress' | 'Delayed' | 'Packed' | 'Quality Check';
  isBottleneck: boolean;
  priority: PriorityLevel;
}

export interface AllocationConflict {
  id: string;
  criticalOrderId: string;
  criticalCustomer: string;
  criticalTier: CustomerTier;
  criticalSlaMinutes: number;
  lowerOrderId: string;
  lowerCustomer: string;
  lowerTier: CustomerTier;
  sku: string;
  skuName: string;
  unitsNeededByCritical: number;
  unitsAvailableOnShelf: number;
  unitsReservedByLower: number;
  recommendedTransferUnits: number;
  explanation: string;
  resolved: boolean;
}

export interface OperationalException {
  id: string;
  type: ExceptionType;
  orderId: string;
  sku: string;
  skuName: string;
  zone: WarehouseZone;
  pickerName: string;
  reportedAt: string;
  issueDescription: string;
  systemDecision: string;
  recommendedResolution: string;
  status: ExceptionStatus;
  impactLevel: 'Critical' | 'Moderate' | 'Minor';
  substituteSku?: string;
  substituteName?: string;
}

export interface OperationalDecision {
  id: string;
  category: 'Allocation' | 'Bottleneck' | 'Replenishment' | 'Priority Escalation';
  title: string;
  description: string;
  impact: string;
  actionLabel: string;
  confidence: number;
  urgency: 'Immediate' | 'Medium' | 'Scheduled';
  actionType: 'approve_reallocation' | 'reassign_picker' | 'trigger_reorder' | 'substitute_sku' | 'advance_workflow';
  targetId?: string;
  executed?: boolean;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  timestamp: string;
}
