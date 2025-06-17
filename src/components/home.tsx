import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { coursesApi } from "../api/courses";
import { classroomsApi, laboratoriesApi } from "../api/resources";
import { schedulesApi } from "../api/schedules";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  School,
  LayoutGrid,
  Settings,
  LogOut,
} from "lucide-react";
import ScheduleCalendar from "./ScheduleCalendar";
import CourseForm from "./CourseForm";
import AvailabilitySelector from "./AvailabilitySelector";
import ResourceManager from "./ResourceManager";
import ScenarioForm from "./ScenarioForm";

type UserRole = "administrator" | "schedule_manager" | "educator";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

const Home = () => {
  const { user: currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState({
    courses: [],
    classrooms: [],
    laboratories: [],
    scheduleEvents: [],
  });
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [courses, classrooms, laboratories, scheduleEvents] =
          await Promise.all([
            coursesApi.getAll(),
            classroomsApi.getAll(),
            laboratoriesApi.getAll(),
            schedulesApi.getAll(),
          ]);

        setDashboardData({
          courses,
          classrooms,
          laboratories,
          scheduleEvents,
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!currentUser) {
    return null; // This should not happen due to ProtectedRoute, but just in case
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <School className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">Course Timetable</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <Button
            variant={activeTab === "dashboard" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            Dashboard
          </Button>

          <Button
            variant={activeTab === "schedule" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("schedule")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>

          {(currentUser.role === "administrator" ||
            currentUser.role === "schedule_manager") && (
            <Button
              variant={activeTab === "courses" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("courses")}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Courses
            </Button>
          )}

          {currentUser.role === "educator" && (
            <Button
              variant={activeTab === "scenarios" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("scenarios")}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Scenarios
            </Button>
          )}

          {currentUser.role === "educator" && (
            <Button
              variant={activeTab === "availability" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("availability")}
            >
              <Clock className="mr-2 h-4 w-4" />
              Availability
            </Button>
          )}

          {(currentUser.role === "administrator" ||
            currentUser.role === "schedule_manager") && (
            <Button
              variant={activeTab === "resources" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("resources")}
            >
              <School className="mr-2 h-4 w-4" />
              Resources
            </Button>
          )}

          {currentUser.role === "administrator" && (
            <Button
              variant={activeTab === "users" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("users")}
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
          )}

          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </nav>

        <div className="mt-auto pt-4 border-t">
          {/* User role display */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">
              Role:{" "}
              {currentUser.role
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={currentUser.avatar_url} />
              <AvatarFallback>
                {currentUser.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {currentUser.email}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold">
            {activeTab === "dashboard" && "Dashboard"}
            {activeTab === "schedule" && "Schedule Calendar"}
            {activeTab === "courses" && "Course Management"}
            {activeTab === "scenarios" && "Scenario Management"}
            {activeTab === "availability" && "Availability Preferences"}
            {activeTab === "resources" && "Resource Management"}
            {activeTab === "users" && "User Management"}
            {activeTab === "settings" && "Settings"}
          </h1>
          <p className="text-muted-foreground">
            {activeTab === "dashboard" && "Overview of your timetabling system"}
            {activeTab === "schedule" && "View and manage course schedules"}
            {activeTab === "courses" && "Create and edit courses"}
            {activeTab === "scenarios" &&
              "Create and manage schedule scenarios"}
            {activeTab === "availability" &&
              "Set your weekly availability preferences"}
            {activeTab === "resources" && "Manage classrooms and laboratories"}
            {activeTab === "users" && "Manage system users and permissions"}
            {activeTab === "settings" && "Configure system settings"}
          </p>
        </header>

        {/* Content based on active tab */}
        {activeTab === "dashboard" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Classes</CardTitle>
                <CardDescription>
                  Your scheduled classes for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 rounded-md bg-muted/50">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Database Systems</p>
                      <p className="text-sm text-muted-foreground">
                        10:00 - 12:00, Room A101
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-md bg-muted/50">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Algorithms</p>
                      <p className="text-sm text-muted-foreground">
                        14:00 - 16:00, Room B205
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule Status</CardTitle>
                <CardDescription>
                  Current timetable generation status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <p>Schedule generated successfully</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Last updated: Today, 08:30 AM</p>
                  <p>Conflicts resolved: 3</p>
                  <p>Courses scheduled: 42</p>
                </div>
                <Button className="w-full mt-4">View Details</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>
                  Classroom and lab usage statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Classrooms</span>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div
                        className="h-2 bg-primary rounded-full"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Laboratories</span>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div
                        className="h-2 bg-primary rounded-full"
                        style={{ width: "60%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="bg-card rounded-lg border shadow-sm">
            <ScheduleCalendar />
          </div>
        )}

        {activeTab === "courses" && (
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <CourseForm />
          </div>
        )}

        {activeTab === "scenarios" && (
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <ScenarioForm />
          </div>
        )}

        {activeTab === "availability" && (
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <AvailabilitySelector />
          </div>
        )}

        {activeTab === "resources" && (
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <ResourceManager />
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                <TabsTrigger value="roles">Role Management</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">System Users</h3>
                  <Button size="sm">Add User</Button>
                </div>

                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Role</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=john" />
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          John Doe
                        </td>
                        <td className="p-3">john.doe@university.edu</td>
                        <td className="p-3">Administrator</td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=jane" />
                            <AvatarFallback>JS</AvatarFallback>
                          </Avatar>
                          Jane Smith
                        </td>
                        <td className="p-3">jane.smith@university.edu</td>
                        <td className="p-3">Schedule Manager</td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=robert" />
                            <AvatarFallback>RB</AvatarFallback>
                          </Avatar>
                          Robert Brown
                        </td>
                        <td className="p-3">robert.brown@university.edu</td>
                        <td className="p-3">Educator</td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="pending">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">
                    Pending Approval Requests
                  </h3>
                </div>

                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Requested Role</th>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3">Michael Johnson</td>
                        <td className="p-3">michael.johnson@university.edu</td>
                        <td className="p-3">Educator</td>
                        <td className="p-3">2023-06-15</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="default">
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive">
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3">Sarah Williams</td>
                        <td className="p-3">sarah.williams@university.edu</td>
                        <td className="p-3">Schedule Manager</td>
                        <td className="p-3">2023-06-14</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="default">
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive">
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="roles">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Role Management</h3>
                  <Button size="sm">Create Role</Button>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Administrator</CardTitle>
                      <CardDescription>
                        Full system access and control
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm">Permissions:</p>
                        <ul className="text-sm list-disc pl-5 space-y-1">
                          <li>User management</li>
                          <li>Role assignment</li>
                          <li>System configuration</li>
                          <li>All schedule manager permissions</li>
                          <li>All educator permissions</li>
                        </ul>
                      </div>
                      <Button variant="outline" size="sm" className="mt-4">
                        Edit Role
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Schedule Manager</CardTitle>
                      <CardDescription>
                        Manage courses and generate schedules
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm">Permissions:</p>
                        <ul className="text-sm list-disc pl-5 space-y-1">
                          <li>Course management</li>
                          <li>Resource management</li>
                          <li>Schedule generation</li>
                          <li>View all schedules</li>
                        </ul>
                      </div>
                      <Button variant="outline" size="sm" className="mt-4">
                        Edit Role
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Educator</CardTitle>
                      <CardDescription>
                        Set availability and view assigned courses
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm">Permissions:</p>
                        <ul className="text-sm list-disc pl-5 space-y-1">
                          <li>Set availability preferences</li>
                          <li>View personal schedule</li>
                          <li>View assigned courses</li>
                        </ul>
                      </div>
                      <Button variant="outline" size="sm" className="mt-4">
                        Edit Role
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <Tabs defaultValue="general">
              <TabsList className="mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <h3 className="text-lg font-medium">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Academic Year
                    </label>
                    <select className="w-full p-2 border rounded-md">
                      <option>2023-2024</option>
                      <option>2024-2025</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Time Format
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="timeFormat" checked />
                        <span>24-hour</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="timeFormat" />
                        <span>12-hour (AM/PM)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1">
                      First Day of Week
                    </label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Monday</option>
                      <option>Sunday</option>
                    </select>
                  </div>

                  <Button>Save Changes</Button>
                </div>
              </TabsContent>

              <TabsContent value="account" className="space-y-4">
                <h3 className="text-lg font-medium">Account Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      value={currentUser.name}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full p-2 border rounded-md"
                      value={currentUser.email}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      className="w-full p-2 border rounded-md"
                      value="********"
                    />
                  </div>

                  <Button>Update Account</Button>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <h3 className="text-lg font-medium">Notification Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Schedule Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when schedules are updated
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Course Assignments</p>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when assigned to new courses
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">System Announcements</p>
                      <p className="text-sm text-muted-foreground">
                        Receive important system announcements
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <Button>Save Preferences</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
