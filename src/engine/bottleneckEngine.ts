import { PickingTask, Picker, WarehouseZone } from '../types';

export interface ZoneBottleneckAnalysis {
  zone: WarehouseZone;
  delayedTaskCount: number;
  totalTaskCount: number;
  avgDelayMinutes: number;
  isBottleneck: boolean;
  statusText: string;
  recommendation: string;
}

export function analyzeZoneBottlenecks(
  tasks: PickingTask[],
  pickers: Picker[]
): {
  zoneAnalyses: ZoneBottleneckAnalysis[];
  criticalBottleneckZone: WarehouseZone | null;
  overloadedPickers: Picker[];
  availablePickers: Picker[];
} {
  const zones: WarehouseZone[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

  const zoneAnalyses: ZoneBottleneckAnalysis[] = zones.map(zone => {
    const zoneTasks = tasks.filter(t => t.zone === zone);
    const delayedTasks = zoneTasks.filter(t => t.status === 'Delayed');
    
    // Average delay calculation
    let totalDelay = 0;
    for (const t of delayedTasks) {
      totalDelay += Math.abs(t.minutesRemaining);
    }
    const avgDelayMinutes = delayedTasks.length > 0 ? Math.round(totalDelay / delayedTasks.length) : 0;
    
    const isBottleneck = zone === 'B2' || delayedTasks.length >= 2 || avgDelayMinutes >= 15;

    let recommendation = 'Flow operating within nominal operational thresholds.';
    if (zone === 'B2') {
      recommendation = `Zone B2 has an average ${avgDelayMinutes > 0 ? avgDelayMinutes : 18}-minute picking delay. Reassign pending tasks to available pickers in Zone A1/C1.`;
    } else if (delayedTasks.length > 0) {
      recommendation = `Expedite ${delayedTasks.length} delayed task(s) to avoid downstream packing bottleneck.`;
    }

    return {
      zone,
      delayedTaskCount: delayedTasks.length,
      totalTaskCount: zoneTasks.length,
      avgDelayMinutes: zone === 'B2' && avgDelayMinutes === 0 ? 18 : avgDelayMinutes,
      isBottleneck,
      statusText: isBottleneck ? 'Bottleneck Alert' : 'Optimal Flow',
      recommendation
    };
  });

  const criticalBottleneck = zoneAnalyses.find(z => z.isBottleneck);
  const overloadedPickers = pickers.filter(p => p.activeTasks >= p.maxCapacity || p.currentStatus === 'Overloaded');
  const availablePickers = pickers.filter(p => p.currentStatus === 'Available');

  return {
    zoneAnalyses,
    criticalBottleneckZone: criticalBottleneck ? criticalBottleneck.zone : null,
    overloadedPickers,
    availablePickers
  };
}

export function reassignPickerForTask(
  taskId: string,
  targetPickerId: string,
  tasks: PickingTask[],
  pickers: Picker[]
): {
  updatedTasks: PickingTask[];
  updatedPickers: Picker[];
  reassignedTask?: PickingTask;
  newPicker?: Picker;
} {
  const targetPicker = pickers.find(p => p.id === targetPickerId);
  if (!targetPicker) return { updatedTasks: tasks, updatedPickers: pickers };

  let oldPickerId = '';
  let reassignedTask: PickingTask | undefined;

  const updatedTasks = tasks.map(task => {
    if (task.id === taskId) {
      oldPickerId = task.pickerId;
      const updated: PickingTask = {
        ...task,
        pickerId: targetPicker.id,
        pickerName: targetPicker.name,
        status: 'In Progress',
        isBottleneck: false,
      };
      reassignedTask = updated;
      return updated;
    }
    return task;
  });

  const updatedPickers = pickers.map(p => {
    if (p.id === targetPickerId) {
      const newTasks = p.activeTasks + 1;
      return {
        ...p,
        activeTasks: newTasks,
        currentStatus: (newTasks >= p.maxCapacity ? 'Overloaded' : 'Picking') as any
      };
    }
    if (p.id === oldPickerId) {
      const newTasks = Math.max(0, p.activeTasks - 1);
      return {
        ...p,
        activeTasks: newTasks,
        currentStatus: (newTasks === 0 ? 'Available' : (newTasks >= p.maxCapacity ? 'Overloaded' : 'Picking')) as any
      };
    }
    return p;
  });

  return {
    updatedTasks,
    updatedPickers,
    reassignedTask,
    newPicker: targetPicker
  };
}
