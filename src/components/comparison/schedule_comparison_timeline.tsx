import React, { useEffect, useRef, useState, useCallback } from "react";
import { Timeline } from "vis-timeline/standalone";
import { DataSet } from "vis-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, ZoomIn, ZoomOut, RotateCcw, GitCompare, AlertTriangle, Plus, Minus, Edit } from "lucide-react";

// Import types from the existing schedule comparison utility
import {
  Schedule,
  Task,
  Resource,
  ScheduleComparisonResult,
  TaskComparison,
  TimeConflict,
  ScheduleComparator,
  ComparisonOptions
} from "./schedule_comparison";

// Assuming schedule data will be imported from separate files
// import { oldScheduleData } from "./data/old-schedule";
// import { newScheduleData } from "./data/new-schedule";

interface TimelineTask extends Task {
  comparisonStatus?: "added" | "removed" | "modified" | "unchanged";
  conflicted?: boolean;
  changes?: string[];
}

interface ComparisonTimelineProps {
  oldSchedule: Schedule;
  newSchedule: Schedule;
  comparisonOptions?: ComparisonOptions;
}

const ScheduleComparisonTimeline: React.FC<ComparisonTimelineProps> = ({
  oldSchedule,
  newSchedule,
  comparisonOptions = {}
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstance = useRef<Timeline | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ScheduleComparisonResult | null>(null);
  const [selectedView, setSelectedView] = useState<"comparison" | "old" | "new">("comparison");
  const [activeResourceType, setActiveResourceType] = useState<"instructor" | "classroom" | "laboratory" | "all">("all");
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());
  const [showConflicts, setShowConflicts] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Initialize comparison
  useEffect(() => {
    const comparator = new ScheduleComparator(comparisonOptions);
    const result = comparator.compareSchedules(oldSchedule, newSchedule);
    setComparisonResult(result);
    
    // Initialize selected resources with all resources from both schedules
    const allResourceIds = new Set([
      ...oldSchedule.resources.map(r => r.id),
      ...newSchedule.resources.map(r => r.id)
    ]);
    setSelectedResources(allResourceIds);
  }, [oldSchedule, newSchedule, comparisonOptions]);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "instructor": return "👨‍🏫";
      case "classroom": return "🏫";
      case "laboratory": return "🔬";
      default: return "📋";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "added": return <Plus className="h-3 w-3 text-green-600" />;
      case "removed": return <Minus className="h-3 w-3 text-red-600" />;
      case "modified": return <Edit className="h-3 w-3 text-orange-600" />;
      case "unchanged": return null;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "added": return "#10b981";
      case "removed": return "#ef4444";
      case "modified": return "#f97316";
      case "unchanged": return "#6b7280";
      default: return "#6b7280";
    }
  };

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case "theory": return "#3b82f6";
      case "practice": return "#10b981";
      case "lab": return "#f97316";
      default: return "#6b7280";
    }
  };

  const getAllResources = () => {
    const resourceMap = new Map<string, Resource>();
    
    oldSchedule.resources.forEach(r => resourceMap.set(r.id, r));
    newSchedule.resources.forEach(r => resourceMap.set(r.id, r));
    
    return Array.from(resourceMap.values());
  };

  const getFilteredResources = () => {
    const allResources = getAllResources();
    return activeResourceType === "all" 
      ? allResources 
      : allResources.filter(r => r.type === activeResourceType);
  };

  const toggleResourceSelection = (resourceId: string) => {
    const newSelection = new Set(selectedResources);
    if (newSelection.has(resourceId)) {
      newSelection.delete(resourceId);
    } else {
      newSelection.add(resourceId);
    }
    setSelectedResources(newSelection);
  };

  const selectAllResources = () => {
    const filtered = getFilteredResources();
    const newSelection = new Set(selectedResources);
    filtered.forEach(r => newSelection.add(r.id));
    setSelectedResources(newSelection);
  };

  const clearResourceSelection = () => {
    const filtered = getFilteredResources();
    const newSelection = new Set(selectedResources);
    filtered.forEach(r => newSelection.delete(r.id));
    setSelectedResources(newSelection);
  };

  const getTimelineData = () => {
    if (!comparisonResult) return { items: [], groups: [] };

    const selectedResourcesArray = getFilteredResources().filter(r => selectedResources.has(r.id));
    
    // Create groups
    const groups = selectedResourcesArray.map(resource => ({
      id: resource.id,
      content: `${getResourceIcon(resource.type)} ${resource.name}`,
      className: `resource-${resource.type}`
    }));

    // Create timeline items based on selected view
    let timelineTasks: TimelineTask[] = [];
    
    switch (selectedView) {
      case "old":
        timelineTasks = oldSchedule.tasks
          .filter(task => selectedResources.has(task.group))
          .map(task => ({ ...task, comparisonStatus: "unchanged" }));
        break;
        
      case "new":
        timelineTasks = newSchedule.tasks
          .filter(task => selectedResources.has(task.group))
          .map(task => ({ ...task, comparisonStatus: "unchanged" }));
        break;
        
      case "comparison":
      default:
        // Combine tasks from comparison result
        const taskMap = new Map<string, TimelineTask>();
        
        comparisonResult.tasks.forEach(comparison => {
          if (comparison.newTask && selectedResources.has(comparison.newTask.group)) {
            const changes = comparison.changes?.map(c => `${c.field}: ${c.oldValue} → ${c.newValue}`) || [];
            taskMap.set(comparison.taskId, {
              ...comparison.newTask,
              comparisonStatus: comparison.status,
              changes
            });
          } else if (comparison.oldTask && selectedResources.has(comparison.oldTask.group)) {
            taskMap.set(comparison.taskId, {
              ...comparison.oldTask,
              comparisonStatus: comparison.status,
              changes: []
            });
          }
        });
        
        timelineTasks = Array.from(taskMap.values());
        break;
    }

    // Filter by status if specified
    if (filterStatus !== "all") {
      timelineTasks = timelineTasks.filter(task => task.comparisonStatus === filterStatus);
    }

    // Mark conflicted tasks
    if (showConflicts && comparisonResult.conflicts.length > 0) {
      const conflictedTaskIds = new Set<string>();
      comparisonResult.conflicts.forEach(conflict => {
        conflict.conflictingTasks.forEach(task => {
          conflictedTaskIds.add(task.id);
        });
      });
      
      timelineTasks = timelineTasks.map(task => ({
        ...task,
        conflicted: conflictedTaskIds.has(task.id)
      }));
    }

    // Convert to vis.js items format
    const items = timelineTasks.map(task => {
      const statusColor = getStatusColor(task.comparisonStatus || "unchanged");
      const taskTypeColor = getTaskTypeColor(task.taskType);
      
      let className = `task-${task.taskType}`;
      if (task.comparisonStatus) {
        className += ` status-${task.comparisonStatus}`;
      }
      if (task.conflicted) {
        className += " conflicted";
      }

      const title = [
        `${task.content}`,
        `Type: ${task.taskType}`,
        `Time: ${task.start.toLocaleString()} - ${task.end.toLocaleString()}`,
        task.comparisonStatus ? `Status: ${task.comparisonStatus}` : "",
        task.conflicted ? "⚠️ Time Conflict Detected" : "",
        ...(task.changes || [])
      ].filter(Boolean).join('\n');

      return {
        id: task.id,
        content: task.content,
        start: task.start,
        end: task.end,
        group: task.group,
        className,
        title,
        style: `background-color: ${task.conflicted ? '#fee2e2' : 'transparent'}; border-left: 4px solid ${statusColor};`
      };
    });

    return { items, groups };
  };

  const destroyTimeline = useCallback(() => {
    if (timelineInstance.current) {
      try {
        timelineInstance.current.destroy();
      } catch (error) {
        console.warn("Error destroying timeline:", error);
      } finally {
        timelineInstance.current = null;
      }
    }
  }, []);

  const initializeTimeline = useCallback(() => {
    if (!timelineRef.current || !comparisonResult) return;

    destroyTimeline();

    const { items, groups } = getTimelineData();

    if (groups.length === 0) {
      console.log("No resources selected for timeline");
      return;
    }

    try {
      const itemsDataSet = new DataSet(items);
      const groupsDataSet = new DataSet(groups);

      const options = {
        groupOrder: "content",
        editable: false,
        selectable: true,
        stack: false,
        showCurrentTime: true,
        zoomable: true,
        moveable: true,
        orientation: "top" as const,
        height: "500px",
        margin: {
          item: 10,
          axis: 5,
        },
        format: {
          minorLabels: {
            hour: "HH:mm",
            day: "DD MMM",
          },
          majorLabels: {
            hour: "ddd DD MMMM",
            day: "MMMM YYYY",
          },
        },
        tooltip: {
          followMouse: true,
          overflowMethod: 'cap'
        }
      };

      timelineInstance.current = new Timeline(timelineRef.current, itemsDataSet, groupsDataSet, options);

      // Set initial view based on data range
      if (items.length > 0) {
        const dates = items.flatMap(item => [new Date(item.start), new Date(item.end)]);
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
        
        // Add some padding
        const padding = (maxDate.getTime() - minDate.getTime()) * 0.1;
        const start = new Date(minDate.getTime() - padding);
        const end = new Date(maxDate.getTime() + padding);
        
        timelineInstance.current.setWindow(start, end);
      }

    } catch (error) {
      console.error("Error creating timeline:", error);
      destroyTimeline();
    }
  }, [comparisonResult, selectedView, selectedResources, activeResourceType, showConflicts, filterStatus]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      initializeTimeline();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      destroyTimeline();
    };
  }, [initializeTimeline]);

  const handleZoom = (direction: "in" | "out") => {
    if (timelineInstance.current) {
      if (direction === "in") {
        timelineInstance.current.zoomIn(0.5);
      } else {
        timelineInstance.current.zoomOut(0.5);
      }
    }
  };

  const handleReset = () => {
    initializeTimeline();
  };

  const handleExport = (format: "json" | "csv" | "summary") => {
    if (!comparisonResult) return;
    
    const comparator = new ScheduleComparator();
    const exportData = comparator.exportComparison(comparisonResult, format);
    
    const blob = new Blob([exportData], { 
      type: format === "json" ? "application/json" : "text/plain" 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schedule-comparison.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!comparisonResult) {
    return <div className="p-6">Loading comparison...</div>;
  }

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <GitCompare className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Schedule Comparison Timeline</h1>
              <p className="text-gray-600">
                Compare {oldSchedule.name} v{oldSchedule.version} with {newSchedule.name} v{newSchedule.version}
              </p>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{comparisonResult.summary.tasksAdded}</div>
                <div className="text-sm text-gray-600">Added</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{comparisonResult.summary.tasksRemoved}</div>
                <div className="text-sm text-gray-600">Removed</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{comparisonResult.summary.tasksModified}</div>
                <div className="text-sm text-gray-600">Modified</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{comparisonResult.summary.tasksUnchanged}</div>
                <div className="text-sm text-gray-600">Unchanged</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{comparisonResult.summary.conflictsFound}</div>
                <div className="text-sm text-gray-600">Conflicts</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{comparisonResult.summary.totalTasksNew}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* View Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">View Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="comparison" className="text-xs">Compare</TabsTrigger>
                    <TabsTrigger value="old" className="text-xs">Old</TabsTrigger>
                    <TabsTrigger value="new" className="text-xs">New</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Resource Type</label>
                  <Select value={activeResourceType} onValueChange={(value) => setActiveResourceType(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="instructor">👨‍🏫 Instructors</SelectItem>
                      <SelectItem value="classroom">🏫 Classrooms</SelectItem>
                      <SelectItem value="laboratory">🔬 Laboratories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Status Filter</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Changes</SelectItem>
                      <SelectItem value="added">Added Only</SelectItem>
                      <SelectItem value="removed">Removed Only</SelectItem>
                      <SelectItem value="modified">Modified Only</SelectItem>
                      <SelectItem value="unchanged">Unchanged Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showConflicts"
                    checked={showConflicts}
                    onChange={(e) => setShowConflicts(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="showConflicts" className="text-sm font-medium">
                    Highlight Conflicts
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Resource Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resources</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={selectAllResources} className="flex-1">
                    Select All
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearResourceSelection} className="flex-1">
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getFilteredResources().map((resource) => (
                    <div key={resource.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={resource.id}
                        checked={selectedResources.has(resource.id)}
                        onChange={() => toggleResourceSelection(resource.id)}
                        className="rounded"
                      />
                      <label htmlFor={resource.id} className="text-sm font-medium cursor-pointer flex-1">
                        {getResourceIcon(resource.type)} {resource.name}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Plus className="h-3 w-3 text-green-600" />
                    <span className="text-sm">Added</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Minus className="h-3 w-3 text-red-600" />
                    <span className="text-sm">Removed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Edit className="h-3 w-3 text-orange-600" />
                    <span className="text-sm">Modified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    <span className="text-sm">Conflict</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Panel */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    📅 Comparison Timeline
                    <Badge variant="outline">
                      {selectedResources.size} resources selected
                    </Badge>
                  </CardTitle>
                  <div className="flex gap-2">
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleZoom("in")}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleZoom("out")}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleReset}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleExport("json")}>
                        <Download className="h-4 w-4 mr-1" />
                        JSON
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleExport("csv")}>
                        <Download className="h-4 w-4 mr-1" />
                        CSV
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleExport("summary")}>
                        <Download className="h-4 w-4 mr-1" />
                        Summary
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div ref={timelineRef} className="border rounded-lg" style={{ minHeight: "500px" }} />
                
                {comparisonResult.conflicts.length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-800">Time Conflicts Detected</span>
                    </div>
                    <div className="space-y-2">
                      {comparisonResult.conflicts.slice(0, 5).map((conflict, index) => (
                        <div key={index} className="text-sm text-red-700">
                          <strong>{conflict.resourceName}:</strong> {" "}
                          {conflict.conflictingTasks.map(t => t.content).join(" & ")} {" "}
                          ({conflict.timeRange.start.toLocaleString()} - {conflict.timeRange.end.toLocaleString()})
                        </div>
                      ))}
                      {comparisonResult.conflicts.length > 5 && (
                        <div className="text-sm text-red-600">
                          ... and {comparisonResult.conflicts.length - 5} more conflicts
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .status-added {
          border-left: 4px solid #10b981 !important;
          background-color: #f0fdf4 !important;
        }

        .status-removed {
          border-left: 4px solid #ef4444 !important;
          background-color: #fef2f2 !important;
          opacity: 0.7;
        }

        .status-modified {
          border-left: 4px solid #f97316 !important;
          background-color: #fff7ed !important;
        }

        .status-unchanged {
          border-left: 4px solid #6b7280 !important;
          background-color: #f9fafb !important;
        }

        .conflicted {
          border: 2px dashed #ef4444 !important;
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
        }

        .task-theory {
          color: #1e40af !important;
        }

        .task-practice {
          color: #065f46 !important;
        }

        .task-lab {
          color: #9a3412 !important;
        }

        .resource-instructor {
          background-color: #eff6ff !important;
          border-left: 4px solid #3b82f6 !important;
        }

        .resource-classroom {
          background-color: #f0fdf4 !important;
          border-left: 4px solid #10b981 !important;
        }

        .resource-laboratory {
          background-color: #fff7ed !important;
          border-left: 4px solid #f97316 !important;
        }

        .vis-timeline {
          border: none !important;
        }

        .vis-panel.vis-left {
          border-right: 1px solid #e5e7eb !important;
        }

        .vis-current-time {
          background-color: #ef4444 !important;
        }

        .vis-item {
          border-radius: 4px !important;
        }

        .vis-item.vis-selected {
          box-shadow: 0 0 0 2px #3b82f6 !important;
        }
      `}</style>
    </div>
  );
};

export default ScheduleComparisonTimeline;