import React, { useState, useEffect, useCallback } from 'react';
import { PageId, Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { GuidedDemoTour, DEMO_TOUR_STEPS } from './components/guided-demo/GuidedDemoTour';
import { OrderDetailModal } from './components/modals/OrderDetailModal';
import { ReorderModal } from './components/modals/ReorderModal';
import { ReassignPickerModal } from './components/modals/ReassignPickerModal';
import { ResolveExceptionModal } from './components/modals/ResolveExceptionModal';

import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { InventoryPage } from './pages/InventoryPage';
import { AllocationPage } from './pages/AllocationPage';
import { PickingPackingPage } from './pages/PickingPackingPage';
import { ExceptionsPage } from './pages/ExceptionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

import {
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_PICKERS,
  INITIAL_PICKING_TASKS,
  INITIAL_CONFLICTS,
  INITIAL_EXCEPTIONS
} from './mock/warehouseData';

import { Order, InventoryItem, Picker, PickingTask, AllocationConflict, OperationalException, ToastMessage, OperationalDecision } from './types';
import { applyReallocation, applyPartialAllocation, applyRestock } from './engine/allocationEngine';
import { reassignPickerForTask } from './engine/bottleneckEngine';
import { generateOperationalDecisions } from './engine/decisionEngine';
import { exportOrdersToCSV, exportInventoryToCSV } from './utils/exportUtils';
import { sound } from './utils/audio';

export const App: React.FC = () => {
  // Navigation & UI State
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Domain State
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [pickers, setPickers] = useState<Picker[]>(INITIAL_PICKERS);
  const [tasks, setTasks] = useState<PickingTask[]>(INITIAL_PICKING_TASKS);
  const [conflicts, setConflicts] = useState<AllocationConflict[]>(INITIAL_CONFLICTS);
  const [exceptions, setExceptions] = useState<OperationalException[]>(INITIAL_EXCEPTIONS);

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reorderItem, setReorderItem] = useState<InventoryItem | null>(null);
  const [reassignTask, setReassignTask] = useState<PickingTask | null>(null);
  const [resolveException, setResolveException] = useState<OperationalException | null>(null);

  // Guided Tour State
  const [tourActive, setTourActive] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);

  // Simulation Clock
  const [simMinutes, setSimMinutes] = useState<number>(614); // 10:14 AM
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Format Sim Time
  const getFormattedSimTime = useCallback((totalMins: number): string => {
    const hours = Math.floor(totalMins / 60) % 24;
    const mins = totalMins % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
  }, []);

  // Toast Helper
  const showToast = useCallback((title: string, message: string, type: ToastMessage['type'] = 'success') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setToasts(prev => [newToast, ...prev].slice(0, 5));

    // Auto dismiss after 5s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 5000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sound toggle
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
  };

  // Clock Tick Simulation
  useEffect(() => {
    if (!isSimulating) return;
    const timer = setInterval(() => {
      setSimMinutes(prev => prev + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, [isSimulating]);

  // Operational Decisions
  const decisions = generateOperationalDecisions(orders, inventory, tasks, exceptions, pickers);

  // 1. Approve Reallocation
  const handleApproveReallocation = (conflictId: string) => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    const { updatedOrders, updatedInventory } = applyReallocation(conflict, orders, inventory);

    setOrders(updatedOrders);
    setInventory(updatedInventory);
    setConflicts(prev => prev.map(c => c.id === conflictId ? { ...c, resolved: true } : c));

    // If target critical order was ORD-1042, create picking task
    if (conflict.criticalOrderId === 'ORD-1042') {
      const newTask: PickingTask = {
        id: 'TSK-209',
        orderId: 'ORD-1042',
        customerName: 'Apex Robotics International',
        pickerName: 'Elena Rostova',
        pickerId: 'PCK-02',
        zone: 'A1',
        itemCount: 14,
        dueTime: '11:00 AM',
        minutesRemaining: 45,
        status: 'Ready',
        isBottleneck: false,
        priority: 'Critical'
      };
      setTasks(prev => [newTask, ...prev]);
    }

    sound.playSuccess();
    showToast(
      'Critical Order Allocation Secured',
      `Reallocated ${conflict.recommendedTransferUnits} units of ${conflict.sku} to ${conflict.criticalOrderId}. Critical SLA risk removed!`,
      'success'
    );

    if (tourActive) {
      setTourActive(false);
    }
  };

  // 2. Allocate Partial Stock
  const handleAllocatePartial = (conflictId: string) => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    const { updatedOrders, updatedInventory, logMessage } = applyPartialAllocation(conflict, orders, inventory);
    setOrders(updatedOrders);
    setInventory(updatedInventory);
    setConflicts(prev => prev.map(c => c.id === conflictId ? { ...c, resolved: true } : c));

    sound.playSuccess();
    showToast('Partial Stock Allocated', logMessage, 'warning');
  };

  // 3. Trigger Restock
  const handleConfirmReorder = (sku: string, quantity: number) => {
    const { updatedInventory, restockedItem } = applyRestock(sku, quantity, inventory);
    setInventory(updatedInventory);

    sound.playSuccess();
    showToast(
      'Purchase Order Created & Stock Received',
      `Restocked +${quantity} units of ${sku} (${restockedItem?.name || ''}). Ledger updated to ${restockedItem?.onHand} on-hand.`,
      'success'
    );
  };

  // 4. Reassign Picker
  const handleConfirmReassign = (taskId: string, targetPickerId: string) => {
    const { updatedTasks, updatedPickers, reassignedTask, newPicker } = reassignPickerForTask(taskId, targetPickerId, tasks, pickers);
    setTasks(updatedTasks);
    setPickers(updatedPickers);

    sound.playSuccess();
    showToast(
      'Picker Workload Reassigned',
      `Task ${taskId} successfully reassigned to ${newPicker?.name} (Zone ${newPicker?.zone}). Zone B2 bottleneck cleared!`,
      'success'
    );
  };

  // 5. Resolve Exception
  const handleConfirmResolveException = (exceptionId: string, _resolutionChoice: string) => {
    const ex = exceptions.find(e => e.id === exceptionId);
    if (!ex) return;

    // If it's EX-901 (damaged SKU-1008), apply substitution with SKU-1010
    if (ex.id === 'EX-901' && ex.substituteSku) {
      setOrders(prev => prev.map(ord => {
        if (ord.id === ex.orderId) {
          const newItems = ord.items.map(item => {
            if (item.sku === ex.sku) {
              return {
                ...item,
                sku: ex.substituteSku!,
                name: ex.substituteName || 'Brushless DC Motor 48V (Rev B)',
              };
            }
            return item;
          });
          return {
            ...ord,
            items: newItems,
            fulfillmentStatus: 'Picking',
            notes: `Substituted ${ex.sku} with compatible ${ex.substituteSku}. Picking resumed.`,
            history: [
              ...ord.history,
              {
                timestamp: getFormattedSimTime(simMinutes),
                event: `Exception EX-901 resolved: Substituted ${ex.sku} with ${ex.substituteSku}`,
                actor: 'FlowForge Decision Engine'
              }
            ]
          };
        }
        return ord;
      }));
    }

    setExceptions(prev => prev.map(e => e.id === exceptionId ? { ...e, status: 'Resolved' } : e));

    sound.playSuccess();
    showToast(
      'Operational Exception Resolved',
      `Exception ${exceptionId} resolved successfully. Workflow resumed for ${ex.orderId}.`,
      'success'
    );
  };

  // 6. Advance Order Status
  const handleAdvanceOrderStatus = (orderId: string) => {
    const stages: Order['fulfillmentStatus'][] = ['Created', 'Allocated', 'Picking', 'Packed', 'Quality Check', 'Dispatched'];
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        const currentIdx = stages.indexOf(ord.fulfillmentStatus);
        const nextStage = currentIdx < stages.length - 1 ? stages[currentIdx + 1] : ord.fulfillmentStatus;
        return {
          ...ord,
          fulfillmentStatus: nextStage,
          history: [
            ...ord.history,
            {
              timestamp: getFormattedSimTime(simMinutes),
              event: `Stage advanced to ${nextStage}`,
              actor: 'Warehouse Supervisor'
            }
          ]
        };
      }
      return ord;
    }));

    showToast('Workflow Stage Advanced', `Order ${orderId} moved to next stage.`, 'info');
  };

  // 7. Advance Task Status
  const handleAdvanceTaskStatus = (taskId: string) => {
    const taskStages: PickingTask['status'][] = ['Ready', 'In Progress', 'Packed', 'Quality Check'];
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const curIdx = taskStages.indexOf(t.status);
        const next = curIdx >= 0 && curIdx < taskStages.length - 1 ? taskStages[curIdx + 1] : t.status;
        return { ...t, status: next, isBottleneck: false };
      }
      return t;
    }));
    showToast('Task Board Updated', `Task ${taskId} moved to next stage.`, 'info');
  };

  // 8. Execute Decision from Decision Center
  const handleExecuteDecision = (decision: OperationalDecision) => {
    switch (decision.actionType) {
      case 'approve_reallocation':
        handleApproveReallocation('CONF-01');
        break;
      case 'reassign_picker':
        handleConfirmReassign('TSK-201', 'PCK-02');
        break;
      case 'substitute_sku':
        handleConfirmResolveException('EX-901', 'recommended');
        break;
      case 'trigger_reorder':
        handleConfirmReorder(decision.targetId || 'SKU-1001', 25);
        break;
    }
  };

  // 9. Reset Demo Data
  const handleResetDemo = () => {
    setOrders(INITIAL_ORDERS);
    setInventory(INITIAL_INVENTORY);
    setPickers(INITIAL_PICKERS);
    setTasks(INITIAL_PICKING_TASKS);
    setConflicts(INITIAL_CONFLICTS);
    setExceptions(INITIAL_EXCEPTIONS);
    setSimMinutes(614);
    setTourActive(false);
    setTourStep(0);
    showToast('Demo State Reset', 'Restored initial warehouse operational datasets and pending conflicts.', 'info');
  };

  // 10. Spawn Urgent Order Simulation
  const handleSpawnUrgentOrder = () => {
    const newId = `ORD-${1050 + Math.floor(Math.random() * 50)}`;
    const newOrder: Order = {
      id: newId,
      customerName: 'Raytheon Intelligence & Space',
      customerTier: 'Enterprise',
      createdAt: getFormattedSimTime(simMinutes),
      slaDeadline: getFormattedSimTime(simMinutes + 45),
      minutesRemaining: 45,
      priority: 'Critical',
      priorityScore: 97,
      priorityFactors: {
        tierScore: 40,
        slaScore: 35,
        valueScore: 16,
        urgencyScore: 6,
      },
      items: [
        {
          sku: 'SKU-1006',
          name: 'Fiber Optic Transceiver 100G',
          quantityRequested: 10,
          quantityAllocated: 10,
          unitPrice: 140,
          zone: 'C1'
        }
      ],
      totalValue: 1400,
      allocationStatus: 'Fully Allocated',
      fulfillmentStatus: 'Created',
      zone: 'C1',
      notes: 'Urgent flight avionics optical unit.',
      history: [
        { timestamp: getFormattedSimTime(simMinutes), event: 'Order Ingested via Defense EDI', actor: 'System' }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    showToast('🚨 Critical Order Ingested', `New Enterprise Order ${newId} received (SLA 45m). Added to Priority Queue.`, 'danger');
  };

  // 11. Guided Demo Launcher
  const handleLaunchGuidedDemo = () => {
    setActivePage('allocation');
    setTourActive(true);
    setTourStep(0);
    sound.playNotification();
  };

  // 12. Dynamic Zone Rebalancing (Analytics Action)
  const handleTriggerZoneOptimization = () => {
    handleConfirmReassign('TSK-201', 'PCK-02');
    showToast('Dynamic Load Balancing Complete', 'Reassigned 2 delayed tasks from Zone B2 to Zone A1. Predicted throughput +42%.', 'success');
  };

  // Tour Step Handlers
  const handleNextTourStep = () => {
    if (tourStep < DEMO_TOUR_STEPS.length - 1) {
      setTourStep(prev => prev + 1);
    }
  };

  const handlePrevTourStep = () => {
    if (tourStep > 0) {
      setTourStep(prev => prev - 1);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Left Navigation Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        conflictCount={conflicts.filter(c => !c.resolved).length}
        lowStockCount={inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length}
        exceptionCount={exceptions.filter(e => e.status !== 'Resolved').length}
        delayedTaskCount={tasks.filter(t => t.status === 'Delayed').length}
        totalOrdersCount={orders.length}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onResetDemo={handleResetDemo}
        onLaunchGuidedDemo={handleLaunchGuidedDemo}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Sticky Control Header */}
        <Header
          activePage={activePage}
          simulatedTime={getFormattedSimTime(simMinutes)}
          isSimulating={isSimulating}
          onToggleSimulate={() => setIsSimulating(!isSimulating)}
          onStepTime={() => {
            setSimMinutes(prev => prev + 15);
            showToast('Simulation Advanced', '+15 minutes elapsed.', 'info');
          }}
          onSpawnUrgentOrder={handleSpawnUrgentOrder}
          onLaunchGuidedDemo={handleLaunchGuidedDemo}
          onExportCSV={() => {
            exportOrdersToCSV(orders);
            exportInventoryToCSV(inventory);
            showToast('Export Completed', 'Generated CSV reports for Orders and Inventory.', 'success');
          }}
        />

        {/* Page Container */}
        <main className="p-6 flex-1 overflow-y-auto">
          {activePage === 'dashboard' && (
            <DashboardPage
              orders={orders}
              inventory={inventory}
              tasks={tasks}
              exceptions={exceptions}
              decisions={decisions}
              onExecuteDecision={handleExecuteDecision}
              onOpenReorderModal={setReorderItem}
              onSelectOrder={setSelectedOrder}
              onNavigate={setActivePage}
              onLaunchGuidedDemo={handleLaunchGuidedDemo}
            />
          )}

          {activePage === 'orders' && (
            <OrdersPage
              orders={orders}
              onSelectOrder={setSelectedOrder}
              onAdvanceStatus={handleAdvanceOrderStatus}
            />
          )}

          {activePage === 'inventory' && (
            <InventoryPage
              inventory={inventory}
              onOpenReorderModal={setReorderItem}
              onQuickRestock={(sku, qty) => handleConfirmReorder(sku, qty)}
            />
          )}

          {activePage === 'allocation' && (
            <AllocationPage
              conflicts={conflicts}
              orders={orders}
              inventory={inventory}
              onApproveReallocation={handleApproveReallocation}
              onAllocatePartial={handleAllocatePartial}
              onCreateReorderRequest={(sku) => {
                const item = inventory.find(i => i.sku === sku);
                if (item) setReorderItem(item);
              }}
              onSelectOrder={setSelectedOrder}
            />
          )}

          {activePage === 'picking' && (
            <PickingPackingPage
              tasks={tasks}
              pickers={pickers}
              onOpenReassignModal={setReassignTask}
              onAdvanceTaskStatus={handleAdvanceTaskStatus}
            />
          )}

          {activePage === 'exceptions' && (
            <ExceptionsPage
              exceptions={exceptions}
              onOpenResolveModal={setResolveException}
              onQuickResolve={(id) => handleConfirmResolveException(id, 'recommended')}
            />
          )}

          {activePage === 'analytics' && (
            <AnalyticsPage
              orders={orders}
              inventory={inventory}
              tasks={tasks}
              onTriggerZoneOptimization={handleTriggerZoneOptimization}
            />
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onAdvanceStatus={(id) => {
          handleAdvanceOrderStatus(id);
          // refresh selected order reference
          const updated = orders.find(o => o.id === id);
          if (updated) setSelectedOrder(updated);
        }}
      />

      <ReorderModal
        item={reorderItem}
        isOpen={!!reorderItem}
        onClose={() => setReorderItem(null)}
        onConfirmReorder={handleConfirmReorder}
      />

      <ReassignPickerModal
        task={reassignTask}
        pickers={pickers}
        isOpen={!!reassignTask}
        onClose={() => setReassignTask(null)}
        onConfirmReassign={handleConfirmReassign}
      />

      <ResolveExceptionModal
        exception={resolveException}
        isOpen={!!resolveException}
        onClose={() => setResolveException(null)}
        onConfirmResolve={handleConfirmResolveException}
      />

      {/* Guided Interactive Demo Tour Controller */}
      <GuidedDemoTour
        currentStepIndex={tourStep}
        isActive={tourActive}
        onNextStep={handleNextTourStep}
        onPrevStep={handlePrevTourStep}
        onCloseTour={() => setTourActive(false)}
        onExecuteDemoAction={() => handleApproveReallocation('CONF-01')}
      />
    </div>
  );
};
export default App;
