import React, { useState, useEffect } from "react";
import { schedulesApi } from "../api/schedules";
import { scenariosApi } from "../api/scenarios";
import { useAuth } from "../hooks/useAuth";
import { AuthProvider } from "./AuthProvider";
import { Scenario } from "../types/database";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Printer,
  Plus,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScenarioForm from "./ScenarioForm";

interface ScheduleEvent {
  id: string;
  title: string;
  type: "theory" | "practice" | "lab";
  instructor: string;
  room: string;
  startTime: string;
  endTime: string;
  day: string;
  program: string;
  semester: string;
}

interface ScheduleCalendarProps {
  events?: ScheduleEvent[];
  onExport?: (format: "pdf" | "excel") => void;
  onFilter?: (filters: any) => void;
}

const ScheduleCalendarContent = ({
  events: propEvents,
  onExport = () => {},
  onFilter = () => {},
}: ScheduleCalendarProps) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<ScheduleEvent[]>(propEvents || []);
  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [showScenarioForm, setShowScenarioForm] = useState(false);

  // Load events and scenarios from database
  useEffect(() => {
    const loadData = async () => {
      try {
        const [scheduleEvents, userScenarios] = await Promise.all([
          propEvents ? Promise.resolve(propEvents) : schedulesApi.getAll(),
          user ? scenariosApi.getByUser(user.id) : Promise.resolve([]),
        ]);

        setEvents(scheduleEvents.length > 0 ? scheduleEvents : defaultEvents);
        setScenarios(userScenarios);
      } catch (error) {
        console.error("Error loading data:", error);
        setEvents(defaultEvents);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [propEvents, user]);
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState({
    programs: [],
    semesters: [],
    instructors: [],
    rooms: [],
    types: ["theory", "practice", "lab"],
  });

  // Extract unique values for filters
  const programs = [...new Set(events.map((event) => event.program))];
  const semesters = [...new Set(events.map((event) => event.semester))];
  const instructors = [...new Set(events.map((event) => event.instructor))];
  const rooms = [...new Set(events.map((event) => event.room))];

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleFilterChange = (
    type: string,
    value: string,
    checked: boolean,
  ) => {
    const newFilters = { ...filters };
    if (checked) {
      newFilters[type] = [...newFilters[type], value];
    } else {
      newFilters[type] = newFilters[type].filter((item) => item !== value);
    }
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleScenarioSave = (scenario: Scenario) => {
    setScenarios((prev) => {
      const existing = prev.find((s) => s.id === scenario.id);
      if (existing) {
        return prev.map((s) => (s.id === scenario.id ? scenario : s));
      } else {
        return [...prev, scenario];
      }
    });
    setShowScenarioForm(false);
  };

  const formatDateRange = () => {
    if (view === "day") {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else if (view === "week") {
      const startOfWeek = new Date(currentDate);
      const day = currentDate.getDay();
      const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
      startOfWeek.setDate(diff);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    } else {
      return currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
  };

  // Generate time slots from 8:00 to 20:00
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return `${hour}:00`;
  });

  // Generate days of the week
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Filter events based on current filters
  const filteredEvents = events.filter((event) => {
    return (
      (filters.programs.length === 0 ||
        filters.programs.includes(event.program)) &&
      (filters.semesters.length === 0 ||
        filters.semesters.includes(event.semester)) &&
      (filters.instructors.length === 0 ||
        filters.instructors.includes(event.instructor)) &&
      (filters.rooms.length === 0 || filters.rooms.includes(event.room)) &&
      (filters.types.length === 0 || filters.types.includes(event.type))
    );
  });

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Course Schedule</CardTitle>
        <div className="flex items-center space-x-2">
          {/* Scenario Management */}
          {user && (
            <div className="flex items-center space-x-2 mr-4">
              <Select
                value={selectedScenario || ""}
                onValueChange={setSelectedScenario}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select scenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Published Schedule</SelectItem>
                  {scenarios.map((scenario) => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      <div className="flex items-center gap-2">
                        <Layers className="h-3 w-3" />
                        {scenario.name}
                        <Badge
                          variant={
                            scenario.status === "published"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {scenario.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog
                open={showScenarioForm}
                onOpenChange={setShowScenarioForm}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    New Scenario
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Scenario</DialogTitle>
                  </DialogHeader>
                  <ScenarioForm
                    onSave={handleScenarioSave}
                    onCancel={() => setShowScenarioForm(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}

          <Tabs
            value={view}
            onValueChange={(v) => setView(v as "day" | "week" | "month")}
            className="mr-4"
          >
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">{formatDateRange()}</div>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="ml-2">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Programs</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {programs.map((program) => (
                      <div
                        key={program}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`program-${program}`}
                          checked={filters.programs.includes(program)}
                          onCheckedChange={(checked) =>
                            handleFilterChange("programs", program, !!checked)
                          }
                        />
                        <label
                          htmlFor={`program-${program}`}
                          className="text-sm"
                        >
                          {program}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Semesters</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {semesters.map((semester) => (
                      <div
                        key={semester}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`semester-${semester}`}
                          checked={filters.semesters.includes(semester)}
                          onCheckedChange={(checked) =>
                            handleFilterChange("semesters", semester, !!checked)
                          }
                        />
                        <label
                          htmlFor={`semester-${semester}`}
                          className="text-sm"
                        >
                          {semester}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Instructors</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {instructors.map((instructor) => (
                      <div
                        key={instructor}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`instructor-${instructor}`}
                          checked={filters.instructors.includes(instructor)}
                          onCheckedChange={(checked) =>
                            handleFilterChange(
                              "instructors",
                              instructor,
                              !!checked,
                            )
                          }
                        />
                        <label
                          htmlFor={`instructor-${instructor}`}
                          className="text-sm"
                        >
                          {instructor}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Rooms</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {rooms.map((room) => (
                      <div key={room} className="flex items-center space-x-2">
                        <Checkbox
                          id={`room-${room}`}
                          checked={filters.rooms.includes(room)}
                          onCheckedChange={(checked) =>
                            handleFilterChange("rooms", room, !!checked)
                          }
                        />
                        <label htmlFor={`room-${room}`} className="text-sm">
                          {room}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Types</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type-theory"
                        checked={filters.types.includes("theory")}
                        onCheckedChange={(checked) =>
                          handleFilterChange("types", "theory", !!checked)
                        }
                      />
                      <label htmlFor="type-theory" className="text-sm">
                        Theory
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type-practice"
                        checked={filters.types.includes("practice")}
                        onCheckedChange={(checked) =>
                          handleFilterChange("types", "practice", !!checked)
                        }
                      />
                      <label htmlFor="type-practice" className="text-sm">
                        Practice
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type-lab"
                        checked={filters.types.includes("lab")}
                        onCheckedChange={(checked) =>
                          handleFilterChange("types", "lab", !!checked)
                        }
                      />
                      <label htmlFor="type-lab" className="text-sm">
                        Lab
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Select onValueChange={(value) => onExport(value as "pdf" | "excel")}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">
                <div className="flex items-center">
                  <Download className="mr-2 h-4 w-4" />
                  <span>Export PDF</span>
                </div>
              </SelectItem>
              <SelectItem value="excel">
                <div className="flex items-center">
                  <Download className="mr-2 h-4 w-4" />
                  <span>Export Excel</span>
                </div>
              </SelectItem>
              <SelectItem value="print">
                <div className="flex items-center">
                  <Printer className="mr-2 h-4 w-4" />
                  <span>Print</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {view === "week" && (
          <div className="border rounded-md">
            <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr_1fr] border-b">
              <div className="p-2 font-medium text-center border-r">Time</div>
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="p-2 font-medium text-center border-r last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr_1fr]">
              {timeSlots.map((time) => (
                <React.Fragment key={time}>
                  <div className="p-2 border-r border-b text-center text-sm">
                    {time}
                  </div>
                  {daysOfWeek.map((day) => {
                    const eventsInSlot = filteredEvents.filter(
                      (event) =>
                        event.day === day &&
                        event.startTime <= time &&
                        event.endTime > time,
                    );

                    return (
                      <div
                        key={`${day}-${time}`}
                        className="p-1 border-r border-b last:border-r-0 min-h-[80px]"
                      >
                        {eventsInSlot.map((event) => (
                          <div
                            key={event.id}
                            className={`mb-1 p-1 rounded text-xs ${getEventColorClass(event.type)}`}
                          >
                            <div className="font-medium">{event.title}</div>
                            <div className="text-xs">{event.instructor}</div>
                            <div className="text-xs">{event.room}</div>
                            <div className="flex items-center mt-1">
                              <Badge
                                variant="outline"
                                className="text-[10px] h-4"
                              >
                                {event.type}
                              </Badge>
                              <span className="ml-1 text-[10px]">
                                {event.program} - {event.semester}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {view === "day" && (
          <div className="border rounded-md">
            <div className="grid grid-cols-[100px_1fr] border-b">
              <div className="p-2 font-medium text-center border-r">Time</div>
              <div className="p-2 font-medium text-center">
                {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
              </div>
            </div>

            <div className="grid grid-cols-[100px_1fr]">
              {timeSlots.map((time) => {
                const currentDay = currentDate.toLocaleDateString("en-US", {
                  weekday: "long",
                });
                const eventsInSlot = filteredEvents.filter(
                  (event) =>
                    event.day === currentDay &&
                    event.startTime <= time &&
                    event.endTime > time,
                );

                return (
                  <React.Fragment key={time}>
                    <div className="p-2 border-r border-b text-center text-sm">
                      {time}
                    </div>
                    <div className="p-1 border-b min-h-[80px]">
                      {eventsInSlot.map((event) => (
                        <div
                          key={event.id}
                          className={`mb-1 p-1 rounded text-xs ${getEventColorClass(event.type)}`}
                        >
                          <div className="font-medium">{event.title}</div>
                          <div className="text-xs">{event.instructor}</div>
                          <div className="text-xs">{event.room}</div>
                          <div className="flex items-center mt-1">
                            <Badge
                              variant="outline"
                              className="text-[10px] h-4"
                            >
                              {event.type}
                            </Badge>
                            <span className="ml-1 text-[10px]">
                              {event.program} - {event.semester}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {view === "month" && (
          <div className="border rounded-md p-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium">
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="text-center font-medium p-2">
                  {day}
                </div>
              ))}
              {generateMonthDays(currentDate).map((day, index) => (
                <div
                  key={index}
                  className={`border rounded-md p-2 min-h-[100px] ${day.currentMonth ? "" : "bg-gray-50 text-gray-400"}`}
                >
                  <div className="text-right mb-1">{day.date}</div>
                  <div className="space-y-1">
                    {day.events.slice(0, 3).map((event, idx) => (
                      <div
                        key={idx}
                        className={`text-xs p-1 rounded truncate ${getEventColorClass(event.type)}`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {day.events.length > 3 && (
                      <div className="text-xs text-center text-gray-500">
                        +{day.events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to get color class based on event type
const getEventColorClass = (type: string) => {
  switch (type) {
    case "theory":
      return "bg-blue-100 border-l-4 border-blue-500";
    case "practice":
      return "bg-green-100 border-l-4 border-green-500";
    case "lab":
      return "bg-amber-100 border-l-4 border-amber-500";
    default:
      return "bg-gray-100 border-l-4 border-gray-500";
  }
};

// Helper function to generate days for month view
const generateMonthDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Adjust first day to be Monday (1) instead of Sunday (0)
  let dayOfWeek = firstDay.getDay() || 7;
  dayOfWeek = dayOfWeek - 1; // Convert to 0-6 where 0 is Monday

  const daysInMonth = lastDay.getDate();
  const days = [];

  // Add days from previous month
  const prevMonth = new Date(year, month, 0);
  const prevMonthDays = prevMonth.getDate();

  for (let i = dayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: prevMonthDays - i,
      currentMonth: false,
      events: [], // No events for previous month in this example
    });
  }

  // Add days from current month
  for (let i = 1; i <= daysInMonth; i++) {
    // Mock events for demonstration
    const dayEvents = defaultEvents.filter((event) => {
      const eventDate = new Date(year, month, i);
      const eventDay = eventDate.toLocaleDateString("en-US", {
        weekday: "long",
      });
      return event.day === eventDay;
    });

    days.push({
      date: i,
      currentMonth: true,
      events: dayEvents,
    });
  }

  // Add days from next month to complete the grid (6 rows x 7 days = 42 cells)
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: i,
      currentMonth: false,
      events: [], // No events for next month in this example
    });
  }

  return days;
};

// Mock data for demonstration
const defaultEvents: ScheduleEvent[] = [
  {
    id: "1",
    title: "Database Systems",
    type: "theory",
    instructor: "Dr. Smith",
    room: "Room A101",
    startTime: "9:00",
    endTime: "11:00",
    day: "Monday",
    program: "Computer Science",
    semester: "3rd",
  },
  {
    id: "2",
    title: "Database Systems Lab",
    type: "lab",
    instructor: "Dr. Smith",
    room: "Lab B201",
    startTime: "13:00",
    endTime: "15:00",
    day: "Monday",
    program: "Computer Science",
    semester: "3rd",
  },
  {
    id: "3",
    title: "Algorithms",
    type: "theory",
    instructor: "Dr. Johnson",
    room: "Room A102",
    startTime: "11:00",
    endTime: "13:00",
    day: "Tuesday",
    program: "Computer Science",
    semester: "3rd",
  },
  {
    id: "4",
    title: "Algorithms Practice",
    type: "practice",
    instructor: "Dr. Johnson",
    room: "Room A102",
    startTime: "14:00",
    endTime: "16:00",
    day: "Tuesday",
    program: "Computer Science",
    semester: "3rd",
  },
  {
    id: "5",
    title: "Software Engineering",
    type: "theory",
    instructor: "Dr. Williams",
    room: "Room A103",
    startTime: "9:00",
    endTime: "11:00",
    day: "Wednesday",
    program: "Computer Science",
    semester: "5th",
  },
  {
    id: "6",
    title: "Software Engineering Lab",
    type: "lab",
    instructor: "Dr. Williams",
    room: "Lab B202",
    startTime: "13:00",
    endTime: "15:00",
    day: "Wednesday",
    program: "Computer Science",
    semester: "5th",
  },
  {
    id: "7",
    title: "Computer Networks",
    type: "theory",
    instructor: "Dr. Brown",
    room: "Room A104",
    startTime: "11:00",
    endTime: "13:00",
    day: "Thursday",
    program: "Computer Science",
    semester: "5th",
  },
  {
    id: "8",
    title: "Computer Networks Lab",
    type: "lab",
    instructor: "Dr. Brown",
    room: "Lab B203",
    startTime: "14:00",
    endTime: "16:00",
    day: "Thursday",
    program: "Computer Science",
    semester: "5th",
  },
  {
    id: "9",
    title: "Operating Systems",
    type: "theory",
    instructor: "Dr. Davis",
    room: "Room A105",
    startTime: "9:00",
    endTime: "11:00",
    day: "Friday",
    program: "Computer Science",
    semester: "4th",
  },
  {
    id: "10",
    title: "Operating Systems Practice",
    type: "practice",
    instructor: "Dr. Davis",
    room: "Room A105",
    startTime: "13:00",
    endTime: "15:00",
    day: "Friday",
    program: "Computer Science",
    semester: "4th",
  },
  {
    id: "11",
    title: "Data Structures",
    type: "theory",
    instructor: "Dr. Wilson",
    room: "Room A106",
    startTime: "11:00",
    endTime: "13:00",
    day: "Monday",
    program: "Computer Science",
    semester: "2nd",
  },
  {
    id: "12",
    title: "Data Structures Lab",
    type: "lab",
    instructor: "Dr. Wilson",
    room: "Lab B204",
    startTime: "15:00",
    endTime: "17:00",
    day: "Monday",
    program: "Computer Science",
    semester: "2nd",
  },
];

const ScheduleCalendar = (props: ScheduleCalendarProps) => {
  return (
    <AuthProvider>
      <ScheduleCalendarContent {...props} />
    </AuthProvider>
  );
};

export default ScheduleCalendar;
