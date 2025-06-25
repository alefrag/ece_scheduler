import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { User } from "../types/database";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  School,
  LayoutGrid,
  Settings,
  UserCheck,
  LogOut,
  Activity,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const Dashboard = () => {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(currentUser);
  const [dashboardData, setDashboardData] = useState({
    courses: [],
    classrooms: [],
    laboratories: [],
    scheduleEvents: [],
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalClassrooms: 0,
    totalLaboratories: 0,
    scheduledEvents: 0,
    utilizationRate: 0,
  });

  // Load users from database
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data: users, error } = await supabase
          .from("users")
          .select("*")
          .order("name");

        if (error) throw error;

        setAvailableUsers(users || []);
        if (!selectedUser && users && users.length > 0) {
          setSelectedUser(users[0]);
        }
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };

    loadUsers();
  }, []);

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

        // Calculate stats
        const utilizationRate = Math.round(
          ((scheduleEvents.length * 2) /
            (classrooms.length + laboratories.length)) *
            100,
        );

        setStats({
          totalCourses: courses.length,
          totalClassrooms: classrooms.length,
          totalLaboratories: laboratories.length,
          scheduledEvents: scheduleEvents.length,
          utilizationRate: Math.min(utilizationRate, 100),
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleUserChange = (userId: string) => {
    const user = availableUsers.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navigateToPage = (page: string) => {
    navigate(`/${page}`);
  };

  if (!currentUser || !selectedUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <School className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Course Timetable System</h1>
                <p className="text-sm text-muted-foreground">
                  University Scheduling Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* User Selection */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">
                  View as:
                </label>
                <Select
                  value={selectedUser?.id || ""}
                  onValueChange={handleUserChange}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {user.role
                                .replace("_", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Current User Info */}
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={currentUser.avatar_url} />
                  <AvatarFallback>
                    {currentUser.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentUser.role
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {selectedUser.name}!
          </h2>
          <p className="text-muted-foreground">
            Here's an overview of your timetabling system status and quick
            access to all features.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                Active courses in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classrooms</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClassrooms}</div>
              <p className="text-xs text-muted-foreground">
                Available classrooms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Laboratories
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalLaboratories}
              </div>
              <p className="text-xs text-muted-foreground">
                Lab facilities available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilization</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.utilizationRate}%</div>
              <p className="text-xs text-muted-foreground">
                Resource utilization rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigateToPage("schedule")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Schedule Calendar
              </CardTitle>
              <CardDescription>
                View and manage course schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Schedule</Button>
            </CardContent>
          </Card>

          {(selectedUser.role === "administrator" ||
            selectedUser.role === "schedule_manager") && (
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigateToPage("courses")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Course Management
                </CardTitle>
                <CardDescription>Create and edit courses</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage Courses</Button>
              </CardContent>
            </Card>
          )}

          {selectedUser.role === "educator" && (
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigateToPage("availability")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Availability
                </CardTitle>
                <CardDescription>
                  Set your weekly availability preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Set Availability</Button>
              </CardContent>
            </Card>
          )}

          {(selectedUser.role === "administrator" ||
            selectedUser.role === "schedule_manager") && (
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigateToPage("resources")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5 text-primary" />
                  Resources
                </CardTitle>
                <CardDescription>
                  Manage classrooms and laboratories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage Resources</Button>
              </CardContent>
            </Card>
          )}

          {selectedUser.role === "administrator" && (
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigateToPage("users")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage system users and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage Users</Button>
              </CardContent>
            </Card>
          )}

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigateToPage("timeline")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-primary" />
                Timeline View
              </CardTitle>
              <CardDescription>Interactive Gantt chart view</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Timeline</Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest system updates and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-md bg-muted/50">
                  <div className="bg-green-100 p-2 rounded-md">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Schedule Generated</p>
                    <p className="text-xs text-muted-foreground">
                      New timetable created for Fall 2024
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">2h ago</span>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-md bg-muted/50">
                  <div className="bg-blue-100 p-2 rounded-md">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Course Added</p>
                    <p className="text-xs text-muted-foreground">
                      Advanced Database Systems course created
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">1d ago</span>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-md bg-muted/50">
                  <div className="bg-orange-100 p-2 rounded-md">
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">User Registered</p>
                    <p className="text-xs text-muted-foreground">
                      New educator account pending approval
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">2d ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current system health and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Schedule Generation</p>
                    <p className="text-xs text-muted-foreground">Operational</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Database Connection</p>
                    <p className="text-xs text-muted-foreground">Healthy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Resource Utilization</p>
                    <p className="text-xs text-muted-foreground">
                      Moderate load
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">User Authentication</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
