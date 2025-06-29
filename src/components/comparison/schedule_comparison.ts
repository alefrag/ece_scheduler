// types.ts - Type definitions for schedule comparison
export interface Resource {
  id: string;
  name: string;
  type: "instructor" | "classroom" | "laboratory";
}

export interface Task {
  id: string;
  content: string;
  start: Date;
  end: Date;
  group: string; // Resource ID
  taskType: "theory" | "practice" | "lab";
  className?: string;
  title?: string;
  courseId?: string;
  courseName?: string;
  priority?: number;
}

export interface Schedule {
  id: string;
  name: string;
  version: string;
  createdAt: Date;
  resources: Resource[];
  tasks: Task[];
  metadata?: {
    semester?: string;
    academicYear?: string;
    department?: string;
  };
}

export interface TaskComparison {
  taskId: string;
  status: "added" | "removed" | "modified" | "unchanged";
  oldTask?: Task;
  newTask?: Task;
  changes?: TaskChange[];
}

export interface TaskChange {
  field: keyof Task;
  oldValue: any;
  newValue: any;
}

export interface ResourceComparison {
  resourceId: string;
  status: "added" | "removed" | "modified" | "unchanged";
  oldResource?: Resource;
  newResource?: Resource;
  changes?: ResourceChange[];
}

export interface ResourceChange {
  field: keyof Resource;
  oldValue: any;
  newValue: any;
}

export interface TimeConflict {
  type: "overlap" | "double_booking";
  resourceId: string;
  resourceName: string;
  conflictingTasks: Task[];
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface ScheduleComparisonResult {
  summary: {
    totalTasksOld: number;
    totalTasksNew: number;
    tasksAdded: number;
    tasksRemoved: number;
    tasksModified: number;
    tasksUnchanged: number;
    resourcesAdded: number;
    resourcesRemoved: number;
    resourcesModified: number;
    conflictsFound: number;
  };
  tasks: TaskComparison[];
  resources: ResourceComparison[];
  conflicts: TimeConflict[];
  statistics: {
    utilizationChangesByResource: Map<string, {
      oldUtilization: number;
      newUtilization: number;
      change: number;
    }>;
    taskTypeDistribution: {
      old: Map<string, number>;
      new: Map<string, number>;
    };
  };
}

export interface ComparisonOptions {
  ignoreFields?: (keyof Task)[];
  timeToleranceMinutes?: number;
  detectConflicts?: boolean;
  includeStatistics?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// scheduleComparison.ts - Main comparison utility
export class ScheduleComparator {
  private options: ComparisonOptions;

  constructor(options: ComparisonOptions = {}) {
    this.options = {
      ignoreFields: [],
      timeToleranceMinutes: 0,
      detectConflicts: true,
      includeStatistics: true,
      ...options,
    };
  }

  /**
   * Compare two schedules and return detailed comparison results
   */
  public compareSchedules(
    oldSchedule: Schedule,
    newSchedule: Schedule
  ): ScheduleComparisonResult {
    const taskComparisons = this.compareTasks(oldSchedule.tasks, newSchedule.tasks);
    const resourceComparisons = this.compareResources(
      oldSchedule.resources,
      newSchedule.resources
    );
    
    let conflicts: TimeConflict[] = [];
    if (this.options.detectConflicts) {
      conflicts = this.detectConflicts(newSchedule);
    }

    const summary = this.generateSummary(taskComparisons, resourceComparisons, conflicts);
    
    let statistics: any = {};
    if (this.options.includeStatistics) {
      statistics = this.generateStatistics(oldSchedule, newSchedule);
    }

    return {
      summary,
      tasks: taskComparisons,
      resources: resourceComparisons,
      conflicts,
      statistics,
    };
  }

  /**
   * Compare tasks between two schedules
   */
  private compareTasks(oldTasks: Task[], newTasks: Task[]): TaskComparison[] {
    const comparisons: TaskComparison[] = [];
    const newTasksMap = new Map(newTasks.map(task => [task.id, task]));
    const processedNewTasks = new Set<string>();

    // Check existing tasks for modifications or removals
    for (const oldTask of oldTasks) {
      if (this.isTaskInDateRange(oldTask)) {
        const newTask = newTasksMap.get(oldTask.id);
        
        if (!newTask) {
          // Task was removed
          comparisons.push({
            taskId: oldTask.id,
            status: "removed",
            oldTask,
          });
        } else {
          // Task exists, check for modifications
          const changes = this.detectTaskChanges(oldTask, newTask);
          comparisons.push({
            taskId: oldTask.id,
            status: changes.length > 0 ? "modified" : "unchanged",
            oldTask,
            newTask,
            changes: changes.length > 0 ? changes : undefined,
          });
          processedNewTasks.add(newTask.id);
        }
      }
    }

    // Check for new tasks
    for (const newTask of newTasks) {
      if (!processedNewTasks.has(newTask.id) && this.isTaskInDateRange(newTask)) {
        comparisons.push({
          taskId: newTask.id,
          status: "added",
          newTask,
        });
      }
    }

    return comparisons;
  }

  /**
   * Compare resources between two schedules
   */
  private compareResources(oldResources: Resource[], newResources: Resource[]): ResourceComparison[] {
    const comparisons: ResourceComparison[] = [];
    const newResourcesMap = new Map(newResources.map(resource => [resource.id, resource]));
    const processedNewResources = new Set<string>();

    // Check existing resources for modifications or removals
    for (const oldResource of oldResources) {
      const newResource = newResourcesMap.get(oldResource.id);
      
      if (!newResource) {
        // Resource was removed
        comparisons.push({
          resourceId: oldResource.id,
          status: "removed",
          oldResource,
        });
      } else {
        // Resource exists, check for modifications
        const changes = this.detectResourceChanges(oldResource, newResource);
        comparisons.push({
          resourceId: oldResource.id,
          status: changes.length > 0 ? "modified" : "unchanged",
          oldResource,
          newResource,
          changes: changes.length > 0 ? changes : undefined,
        });
        processedNewResources.add(newResource.id);
      }
    }

    // Check for new resources
    for (const newResource of newResources) {
      if (!processedNewResources.has(newResource.id)) {
        comparisons.push({
          resourceId: newResource.id,
          status: "added",
          newResource,
        });
      }
    }

    return comparisons;
  }

  /**
   * Detect changes between two tasks
   */
  private detectTaskChanges(oldTask: Task, newTask: Task): TaskChange[] {
    const changes: TaskChange[] = [];
    const fieldsToCompare = Object.keys(oldTask) as (keyof Task)[];

    for (const field of fieldsToCompare) {
      if (this.options.ignoreFields?.includes(field)) {
        continue;
      }

      const oldValue = oldTask[field];
      const newValue = newTask[field];

      if (field === 'start' || field === 'end') {
        // Handle date comparison with tolerance
        if (this.areDatesSignificantlyDifferent(oldValue as Date, newValue as Date)) {
          changes.push({ field, oldValue, newValue });
        }
      } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({ field, oldValue, newValue });
      }
    }

    return changes;
  }

  /**
   * Detect changes between two resources
   */
  private detectResourceChanges(oldResource: Resource, newResource: Resource): ResourceChange[] {
    const changes: ResourceChange[] = [];
    const fieldsToCompare = Object.keys(oldResource) as (keyof Resource)[];

    for (const field of fieldsToCompare) {
      const oldValue = oldResource[field];
      const newValue = newResource[field];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({ field, oldValue, newValue });
      }
    }

    return changes;
  }

  /**
   * Detect time conflicts in a schedule
   */
  private detectConflicts(schedule: Schedule): TimeConflict[] {
    const conflicts: TimeConflict[] = [];
    const resourceTasksMap = new Map<string, Task[]>();

    // Group tasks by resource
    for (const task of schedule.tasks) {
      if (!resourceTasksMap.has(task.group)) {
        resourceTasksMap.set(task.group, []);
      }
      resourceTasksMap.get(task.group)!.push(task);
    }

    // Check for conflicts within each resource
    for (const [resourceId, tasks] of resourceTasksMap) {
      const resource = schedule.resources.find(r => r.id === resourceId);
      if (!resource) continue;

      // Sort tasks by start time
      const sortedTasks = tasks.sort((a, b) => a.start.getTime() - b.start.getTime());

      for (let i = 0; i < sortedTasks.length - 1; i++) {
        for (let j = i + 1; j < sortedTasks.length; j++) {
          const task1 = sortedTasks[i];
          const task2 = sortedTasks[j];

          if (this.doTasksOverlap(task1, task2)) {
            const conflict: TimeConflict = {
              type: "overlap",
              resourceId,
              resourceName: resource.name,
              conflictingTasks: [task1, task2],
              timeRange: {
                start: new Date(Math.max(task1.start.getTime(), task2.start.getTime())),
                end: new Date(Math.min(task1.end.getTime(), task2.end.getTime())),
              },
            };
            conflicts.push(conflict);
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Check if two tasks overlap in time
   */
  private doTasksOverlap(task1: Task, task2: Task): boolean {
    return task1.start < task2.end && task2.start < task1.end;
  }

  /**
   * Check if two dates are significantly different based on tolerance
   */
  private areDatesSignificantlyDifferent(date1: Date, date2: Date): boolean {
    const toleranceMs = (this.options.timeToleranceMinutes || 0) * 60 * 1000;
    return Math.abs(date1.getTime() - date2.getTime()) > toleranceMs;
  }

  /**
   * Check if a task falls within the specified date range
   */
  private isTaskInDateRange(task: Task): boolean {
    if (!this.options.dateRange) return true;
    
    return task.start >= this.options.dateRange.start && 
           task.end <= this.options.dateRange.end;
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(
    taskComparisons: TaskComparison[],
    resourceComparisons: ResourceComparison[],
    conflicts: TimeConflict[]
  ) {
    return {
      totalTasksOld: taskComparisons.filter(t => t.oldTask).length,
      totalTasksNew: taskComparisons.filter(t => t.newTask).length,
      tasksAdded: taskComparisons.filter(t => t.status === "added").length,
      tasksRemoved: taskComparisons.filter(t => t.status === "removed").length,
      tasksModified: taskComparisons.filter(t => t.status === "modified").length,
      tasksUnchanged: taskComparisons.filter(t => t.status === "unchanged").length,
      resourcesAdded: resourceComparisons.filter(r => r.status === "added").length,
      resourcesRemoved: resourceComparisons.filter(r => r.status === "removed").length,
      resourcesModified: resourceComparisons.filter(r => r.status === "modified").length,
      conflictsFound: conflicts.length,
    };
  }

  /**
   * Generate detailed statistics
   */
  private generateStatistics(oldSchedule: Schedule, newSchedule: Schedule) {
    const utilizationChangesByResource = this.calculateUtilizationChanges(
      oldSchedule,
      newSchedule
    );
    
    const taskTypeDistribution = {
      old: this.getTaskTypeDistribution(oldSchedule.tasks),
      new: this.getTaskTypeDistribution(newSchedule.tasks),
    };

    return {
      utilizationChangesByResource,
      taskTypeDistribution,
    };
  }

  /**
   * Calculate utilization changes by resource
   */
  private calculateUtilizationChanges(oldSchedule: Schedule, newSchedule: Schedule) {
    const changes = new Map<string, {
      oldUtilization: number;
      newUtilization: number;
      change: number;
    }>();

    const calculateUtilization = (tasks: Task[], resourceId: string): number => {
      const resourceTasks = tasks.filter(t => t.group === resourceId);
      return resourceTasks.reduce((total, task) => {
        return total + (task.end.getTime() - task.start.getTime());
      }, 0) / (1000 * 60 * 60); // Convert to hours
    };

    // Get all unique resource IDs
    const allResourceIds = new Set([
      ...oldSchedule.resources.map(r => r.id),
      ...newSchedule.resources.map(r => r.id),
    ]);

    for (const resourceId of allResourceIds) {
      const oldUtilization = calculateUtilization(oldSchedule.tasks, resourceId);
      const newUtilization = calculateUtilization(newSchedule.tasks, resourceId);
      const change = newUtilization - oldUtilization;

      changes.set(resourceId, {
        oldUtilization,
        newUtilization,
        change,
      });
    }

    return changes;
  }

  /**
   * Get task type distribution
   */
  private getTaskTypeDistribution(tasks: Task[]): Map<string, number> {
    const distribution = new Map<string, number>();
    
    for (const task of tasks) {
      const type = task.taskType;
      distribution.set(type, (distribution.get(type) || 0) + 1);
    }

    return distribution;
  }

  /**
   * Export comparison results to different formats
   */
  public exportComparison(
    result: ScheduleComparisonResult,
    format: "json" | "csv" | "summary"
  ): string {
    switch (format) {
      case "json":
        return JSON.stringify(result, null, 2);
      
      case "csv":
        return this.exportToCsv(result);
      
      case "summary":
        return this.exportToSummary(result);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private exportToCsv(result: ScheduleComparisonResult): string {
    const headers = ["Task ID", "Status", "Field Changed", "Old Value", "New Value"];
    const rows = [headers.join(",")];

    for (const taskComparison of result.tasks) {
      if (taskComparison.changes) {
        for (const change of taskComparison.changes) {
          rows.push([
            taskComparison.taskId,
            taskComparison.status,
            change.field,
            JSON.stringify(change.oldValue),
            JSON.stringify(change.newValue),
          ].join(","));
        }
      } else {
        rows.push([
          taskComparison.taskId,
          taskComparison.status,
          "",
          "",
          "",
        ].join(","));
      }
    }

    return rows.join("\n");
  }

  private exportToSummary(result: ScheduleComparisonResult): string {
    const { summary } = result;
    
    return `
Schedule Comparison Summary
==========================

Tasks:
- Total tasks (old): ${summary.totalTasksOld}
- Total tasks (new): ${summary.totalTasksNew}
- Tasks added: ${summary.tasksAdded}
- Tasks removed: ${summary.tasksRemoved}
- Tasks modified: ${summary.tasksModified}
- Tasks unchanged: ${summary.tasksUnchanged}

Resources:
- Resources added: ${summary.resourcesAdded}
- Resources removed: ${summary.resourcesRemoved}
- Resources modified: ${summary.resourcesModified}

Conflicts:
- Total conflicts found: ${summary.conflictsFound}

${result.conflicts.length > 0 ? `
Conflict Details:
${result.conflicts.map((conflict, index) => `
${index + 1}. ${conflict.type} for ${conflict.resourceName}
   Time: ${conflict.timeRange.start.toLocaleString()} - ${conflict.timeRange.end.toLocaleString()}
   Conflicting tasks: ${conflict.conflictingTasks.map(t => t.content).join(", ")}
`).join("")}
` : ""}
`.trim();
  }
}

// Example usage and utility functions
export class ScheduleComparisonUtils {
  /**
   * Create a sample schedule for testing
   */
  public static createSampleSchedule(name: string, version: string): Schedule {
    const resources: Resource[] = [
      { id: "1", name: "Dr. Smith", type: "instructor" },
      { id: "2", name: "Prof. Johnson", type: "instructor" },
      { id: "4", name: "Room A101", type: "classroom" },
      { id: "7", name: "Computer Lab 1", type: "laboratory" },
    ];

    const tasks: Task[] = [
      {
        id: "1",
        content: "Database Systems",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 12, 0),
        group: "1",
        taskType: "theory",
        courseName: "CS Database Systems",
      },
      {
        id: "2",
        content: "Programming Lab",
        start: new Date(2024, 0, 16, 9, 0),
        end: new Date(2024, 0, 16, 11, 0),
        group: "7",
        taskType: "lab",
        courseName: "CS Programming",
      },
    ];

    return {
      id: `schedule-${Date.now()}`,
      name,
      version,
      createdAt: new Date(),
      resources,
      tasks,
      metadata: {
        semester: "Spring",
        academicYear: "2024",
        department: "Computer Science",
      },
    };
  }

  /**
   * Quick comparison with default options
   */
  public static quickCompare(oldSchedule: Schedule, newSchedule: Schedule): ScheduleComparisonResult {
    const comparator = new ScheduleComparator();
    return comparator.compareSchedules(oldSchedule, newSchedule);
  }

  /**
   * Find tasks that have been rescheduled (time changes only)
   */
  public static findRescheduledTasks(result: ScheduleComparisonResult): TaskComparison[] {
    return result.tasks.filter(comparison => 
      comparison.status === "modified" &&
      comparison.changes?.some(change => 
        change.field === "start" || change.field === "end"
      )
    );
  }

  /**
   * Get resource utilization summary
   */
  public static getUtilizationSummary(result: ScheduleComparisonResult): string {
    const { utilizationChangesByResource } = result.statistics;
    let summary = "Resource Utilization Changes:\n";
    
    for (const [resourceId, data] of utilizationChangesByResource) {
      const changeText = data.change > 0 ? `+${data.change.toFixed(1)}` : data.change.toFixed(1);
      summary += `- Resource ${resourceId}: ${data.oldUtilization.toFixed(1)}h → ${data.newUtilization.toFixed(1)}h (${changeText}h)\n`;
    }
    
    return summary;
  }
}