import React, { useEffect, useRef, useState } from "react";
import { Timeline } from "vis-timeline/standalone";
import { DataSet } from "vis-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Download, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface Resource {
  id: string;
  name: string;
  type: "instructor" | "classroom" | "laboratory";
  selected: boolean;
}

interface Task {
  id: string;
  content: string;
  start: Date;
  end: Date;
  group: string;
  taskType: "theory" | "practice" | "lab";
  className: string;
  title: string;
}

const TimelineView = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstance = useRef<Timeline | null>(null);
  const [selectedView, setSelectedView] = useState<"day" | "week" | "month">(
    "week",
  );
  const [activeResourceType, setActiveResourceType] = useState<
    "instructor" | "classroom" | "laboratory"
  >("instructor");

  // Mock data for resources
  const [resources, setResources] = useState<Resource[]>([
    { id: "1", name: "Dr. Smith", type: "instructor", selected: true },
    { id: "2", name: "Prof. Johnson", type: "instructor", selected: true },
    { id: "3", name: "Dr. Williams", type: "instructor", selected: false },
    { id: "4", name: "Room A101", type: "classroom", selected: true },
    { id: "5", name: "Room B205", type: "classroom", selected: true },
    { id: "6", name: "Room C301", type: "classroom", selected: false },
    { id: "7", name: "Computer Lab 1", type: "laboratory", selected: true },
    { id: "8", name: "Physics Lab", type: "laboratory", selected: true },
    { id: "9", name: "Chemistry Lab", type: "laboratory", selected: false },
  ]);

  // Mock data for tasks
  const mockTasks: Task[] = [
    {
      id: "1",
      content: "Database Systems",
      start: new Date(2024, 0, 15, 10, 0),
      end: new Date(2024, 0, 15, 12, 0),
      group: "1",
      taskType: "theory",
      className: "theory-task",
      title: "Database Systems - Theory Lecture\nRoom: A101\nTime: 10:00-12:00",
    },
    {
      id: "2",
      content: "Algorithms",
      start: new Date(2024, 0, 15, 14, 0),
      end: new Date(2024, 0, 15, 16, 0),
      group: "2",
      taskType: "theory",
      className: "theory-task",
      title: "Algorithms - Theory Lecture\nRoom: B205\nTime: 14:00-16:00",
    },
    {
      id: "3",
      content: "Programming Lab",
      start: new Date(2024, 0, 16, 9, 0),
      end: new Date(2024, 0, 16, 11, 0),
      group: "7",
      taskType: "lab",
      className: "lab-task",
      title: "Programming Lab\nLab: Computer Lab 1\nTime: 09:00-11:00",
    },
    {
      id: "4",
      content: "Physics Practical",
      start: new Date(2024, 0, 16, 13, 0),
      end: new Date(2024, 0, 16, 15, 0),
      group: "8",
      taskType: "lab",
      className: "lab-task",
      title: "Physics Practical\nLab: Physics Lab\nTime: 13:00-15:00",
    },
    {
      id: "5",
      content: "Software Engineering",
      start: new Date(2024, 0, 17, 11, 0),
      end: new Date(2024, 0, 17, 13, 0),
      group: "1",
      taskType: "practice",
      className: "practice-task",
      title:
        "Software Engineering - Practice Session\nInstructor: Dr. Smith\nTime: 11:00-13:00",
    },
  ];

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "instructor":
        return "👨‍🏫";
      case "classroom":
        return "🏫";
      case "laboratory":
        return "🔬";
      default:
        return "📋";
    }
  };

  const getResourcesByType = (type: string) => {
    return resources.filter((resource) => resource.type === type);
  };

  const toggleResourceSelection = (resourceId: string) => {
    setResources((prev) =>
      prev.map((resource) =>
        resource.id === resourceId
          ? { ...resource, selected: !resource.selected }
          : resource,
      ),
    );
  };

  const selectAllResources = (type: string) => {
    setResources((prev) =>
      prev.map((resource) =>
        resource.type === type ? { ...resource, selected: true } : resource,
      ),
    );
  };

  const deselectAllResources = (type: string) => {
    setResources((prev) =>
      prev.map((resource) =>
        resource.type === type ? { ...resource, selected: false } : resource,
      ),
    );
  };

  const initializeTimeline = () => {
    if (!timelineRef.current) return;

    // Destroy existing timeline first
    if (timelineInstance.current) {
      try {
        timelineInstance.current.destroy();
      } catch (error) {
        console.warn("Error destroying timeline:", error);
      }
      timelineInstance.current = null;
    }

    // Filter selected resources
    const selectedResources = resources.filter((r) => r.selected);

    // Don't create timeline if no resources are selected
    if (selectedResources.length === 0) {
      return;
    }

    // Create groups (resources)
    const groups = new DataSet(
      selectedResources.map((resource) => ({
        id: resource.id,
        content: `${getResourceIcon(resource.type)} ${resource.name}`,
        className: `resource-${resource.type}`,
      })),
    );

    // Filter tasks for selected resources
    const filteredTasks = mockTasks.filter((task) =>
      selectedResources.some((resource) => resource.id === task.group),
    );

    // Create items (tasks) - remove the custom type property that causes issues
    const timelineItems = filteredTasks.map(({ taskType, ...task }) => task);
    const items = new DataSet(timelineItems);

    // Timeline options
    const options = {
      groupOrder: "content",
      editable: false,
      selectable: true,
      stack: false,
      showCurrentTime: true,
      zoomable: true,
      moveable: true,
      orientation: "top",
      height: "400px",
      margin: {
        item: 10,
        axis: 5,
      },
      format: {
        minorLabels: {
          hour: "HH:mm",
          day: "DD",
        },
        majorLabels: {
          hour: "ddd DD MMMM",
          day: "MMMM YYYY",
        },
      },
    };

    try {
      // Create new timeline
      timelineInstance.current = new Timeline(
        timelineRef.current,
        items,
        groups,
        options,
      );

      // Set initial view
      const now = new Date();
      const start = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
      const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      timelineInstance.current.setWindow(start, end);
    } catch (error) {
      console.error("Error creating timeline:", error);
    }
  };

  useEffect(() => {
    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      initializeTimeline();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (timelineInstance.current) {
        try {
          timelineInstance.current.destroy();
        } catch (error) {
          console.warn("Error destroying timeline in cleanup:", error);
        }
        timelineInstance.current = null;
      }
    };
  }, [resources]);

  const handleViewChange = (view: "day" | "week" | "month") => {
    setSelectedView(view);
    if (timelineInstance.current) {
      const now = new Date();
      let start: Date, end: Date;

      switch (view) {
        case "day":
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case "week":
          start = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
          end = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
      }

      timelineInstance.current.setWindow(start, end);
    }
  };

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
    if (timelineInstance.current) {
      const now = new Date();
      const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      timelineInstance.current.setWindow(start, end);
    }
  };

  const handleExport = (format: "pdf" | "png") => {
    // Mock export functionality
    alert(`Exporting timeline as ${format.toUpperCase()}...`);
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Resource Timeline</h1>
          <p className="text-gray-600">
            Interactive Gantt chart view of resource assignments and schedules
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Resource Selection Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📋 Resource Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={activeResourceType}
                  onValueChange={(value) => setActiveResourceType(value as any)}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="instructor" className="text-xs">
                      👨‍🏫
                    </TabsTrigger>
                    <TabsTrigger value="classroom" className="text-xs">
                      🏫
                    </TabsTrigger>
                    <TabsTrigger value="laboratory" className="text-xs">
                      🔬
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="instructor" className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => selectAllResources("instructor")}
                        className="flex-1"
                      >
                        Select All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deselectAllResources("instructor")}
                        className="flex-1"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {getResourcesByType("instructor").map((resource) => (
                        <div
                          key={resource.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={resource.id}
                            checked={resource.selected}
                            onCheckedChange={() =>
                              toggleResourceSelection(resource.id)
                            }
                          />
                          <label
                            htmlFor={resource.id}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {resource.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="classroom" className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => selectAllResources("classroom")}
                        className="flex-1"
                      >
                        Select All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deselectAllResources("classroom")}
                        className="flex-1"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {getResourcesByType("classroom").map((resource) => (
                        <div
                          key={resource.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={resource.id}
                            checked={resource.selected}
                            onCheckedChange={() =>
                              toggleResourceSelection(resource.id)
                            }
                          />
                          <label
                            htmlFor={resource.id}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {resource.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="laboratory" className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => selectAllResources("laboratory")}
                        className="flex-1"
                      >
                        Select All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deselectAllResources("laboratory")}
                        className="flex-1"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {getResourcesByType("laboratory").map((resource) => (
                        <div
                          key={resource.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={resource.id}
                            checked={resource.selected}
                            onCheckedChange={() =>
                              toggleResourceSelection(resource.id)
                            }
                          />
                          <label
                            htmlFor={resource.id}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {resource.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Legend</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-xs">Theory</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-xs">Practice</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span className="text-xs">Laboratory</span>
                    </div>
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
                  <CardTitle>📅 Resource Timeline</CardTitle>
                  <div className="flex gap-2">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={selectedView === "day" ? "default" : "outline"}
                        onClick={() => handleViewChange("day")}
                      >
                        Day
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          selectedView === "week" ? "default" : "outline"
                        }
                        onClick={() => handleViewChange("week")}
                      >
                        Week
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          selectedView === "month" ? "default" : "outline"
                        }
                        onClick={() => handleViewChange("month")}
                      >
                        Month
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleZoom("in")}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleZoom("out")}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleReset}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExport("pdf")}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExport("png")}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PNG
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">
                      Selected Resources:{" "}
                      {resources.filter((r) => r.selected).length}
                    </Badge>
                    <Badge variant="outline">
                      Active Tasks:{" "}
                      {
                        mockTasks.filter((task) =>
                          resources.some(
                            (resource) =>
                              resource.id === task.group && resource.selected,
                          ),
                        ).length
                      }
                    </Badge>
                  </div>
                </div>

                <div
                  ref={timelineRef}
                  className="border rounded-lg"
                  style={{ minHeight: "400px" }}
                />

                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    💡 <strong>Tips:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Click and drag to move around the timeline</li>
                    <li>Use mouse wheel to zoom in/out</li>
                    <li>Click on tasks to select them</li>
                    <li>Use the view buttons to change time scale</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .theory-task {
          background-color: #3b82f6 !important;
          border-color: #2563eb !important;
          color: white !important;
        }

        .practice-task {
          background-color: #10b981 !important;
          border-color: #059669 !important;
          color: white !important;
        }

        .lab-task {
          background-color: #f97316 !important;
          border-color: #ea580c !important;
          color: white !important;
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

        .vis-panel.vis-center {
          border-left: none !important;
        }

        .vis-current-time {
          background-color: #ef4444 !important;
        }
      `}</style>
    </div>
  );
};

export default TimelineView;
