import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { coursesApi } from "../api/courses";
import { scenariosApi, instructorAssignmentsApi } from "../api/scenarios";
import {
  Course,
  Scenario,
  InstructorAssignment,
  User,
} from "../types/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Save, Send, BookOpen, Users, Clock } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface ScenarioFormProps {
  scenario?: Scenario;
  onSave?: (scenario: Scenario) => void;
  onCancel?: () => void;
}

const ScenarioForm = ({ scenario, onSave, onCancel }: ScenarioFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: scenario?.name || "",
    description: scenario?.description || "",
    courses: scenario?.courses || [],
  });

  // Available data
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [availableInstructors, setAvailableInstructors] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<InstructorAssignment[]>([]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [courses, instructors] = await Promise.all([
          coursesApi.getAll(),
          loadInstructors(),
        ]);

        setAvailableCourses(courses);
        setAvailableInstructors(instructors);

        if (scenario) {
          const scenarioAssignments =
            await instructorAssignmentsApi.getByScenario(scenario.id);
          setAssignments(scenarioAssignments);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load data");
      }
    };

    loadData();
  }, [scenario]);

  const loadInstructors = async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "educator")
        .order("name");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading instructors:", error);
      return [];
    }
  };

  const handleCourseToggle = (courseId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      courses: checked
        ? [...prev.courses, courseId]
        : prev.courses.filter((id) => id !== courseId),
    }));

    // Remove assignments for unchecked courses
    if (!checked) {
      setAssignments((prev) => prev.filter((a) => a.course_id !== courseId));
    }
  };

  const addAssignment = (
    courseId: string,
    componentType: "theory" | "practice" | "lab",
  ) => {
    const newAssignment: Omit<
      InstructorAssignment,
      "id" | "created_at" | "updated_at"
    > = {
      scenario_id: scenario?.id || "temp",
      course_id: courseId,
      instructor_id: "",
      component_type: componentType,
      hours_per_week: 1,
    };

    setAssignments((prev) => [
      ...prev,
      {
        ...newAssignment,
        id: `temp-${Date.now()}`,
        created_at: "",
        updated_at: "",
      },
    ]);
  };

  const updateAssignment = (
    index: number,
    field: keyof InstructorAssignment,
    value: any,
  ) => {
    setAssignments((prev) =>
      prev.map((assignment, i) =>
        i === index ? { ...assignment, [field]: value } : assignment,
      ),
    );
  };

  const removeAssignment = (index: number) => {
    setAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (publish = false) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Validate form
      if (!formData.name.trim()) {
        setError("Scenario name is required");
        return;
      }

      if (formData.courses.length === 0) {
        setError("Please select at least one course");
        return;
      }

      // Validate assignments
      const invalidAssignments = assignments.filter(
        (a) =>
          formData.courses.includes(a.course_id) &&
          (!a.instructor_id || a.hours_per_week <= 0),
      );

      if (invalidAssignments.length > 0) {
        setError("Please complete all instructor assignments");
        return;
      }

      let savedScenario: Scenario;

      if (scenario) {
        // Update existing scenario
        savedScenario = await scenariosApi.update(scenario.id, {
          name: formData.name,
          description: formData.description,
          courses: formData.courses,
          status: publish ? "published" : scenario.status,
        });
      } else {
        // Create new scenario
        savedScenario = await scenariosApi.create({
          name: formData.name,
          description: formData.description,
          courses: formData.courses,
          status: publish ? "published" : "draft",
          created_by: user.id,
          instructor_assignments: [],
        });
      }

      // Save assignments
      const validAssignments = assignments.filter(
        (a) =>
          formData.courses.includes(a.course_id) &&
          a.instructor_id &&
          a.hours_per_week > 0,
      );

      // Delete existing assignments if updating
      if (scenario) {
        const existingAssignments =
          await instructorAssignmentsApi.getByScenario(scenario.id);
        await Promise.all(
          existingAssignments.map((a) => instructorAssignmentsApi.delete(a.id)),
        );
      }

      // Create new assignments
      if (validAssignments.length > 0) {
        const assignmentsToCreate = validAssignments.map((a) => ({
          scenario_id: savedScenario.id,
          course_id: a.course_id,
          instructor_id: a.instructor_id,
          component_type: a.component_type,
          hours_per_week: a.hours_per_week,
        }));

        await instructorAssignmentsApi.createBulk(assignmentsToCreate);
      }

      setSuccess(
        publish
          ? "Scenario published successfully!"
          : "Scenario saved successfully!",
      );
      onSave?.(savedScenario);
    } catch (error: any) {
      setError(error.message || "Failed to save scenario");
    } finally {
      setLoading(false);
    }
  };

  const selectedCourses = availableCourses.filter((course) =>
    formData.courses.includes(course.id),
  );

  return (
    <div className="space-y-6 bg-white">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {scenario ? "Edit Scenario" : "Create New Scenario"}
          </CardTitle>
          <CardDescription>
            Create a schedule scenario by selecting courses and assigning
            instructors to each component.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Scenario Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter scenario name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe this scenario"
                rows={3}
              />
            </div>
          </div>

          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="courses">Course Selection</TabsTrigger>
              <TabsTrigger value="assignments">
                Instructor Assignments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-4">
              <div className="space-y-2">
                <Label>Select Courses *</Label>
                <div className="grid gap-3 max-h-96 overflow-y-auto border rounded-md p-4">
                  {availableCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-start space-x-3 p-3 border rounded-md"
                    >
                      <Checkbox
                        id={`course-${course.id}`}
                        checked={formData.courses.includes(course.id)}
                        onCheckedChange={(checked) =>
                          handleCourseToggle(course.id, !!checked)
                        }
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`course-${course.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {course.name} ({course.code})
                        </label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {course.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {course.theory_hours > 0 && (
                            <Badge variant="outline">
                              Theory: {course.theory_hours}h
                            </Badge>
                          )}
                          {course.practice_hours > 0 && (
                            <Badge variant="outline">
                              Practice: {course.practice_hours}h
                            </Badge>
                          )}
                          {course.lab_hours > 0 && (
                            <Badge variant="outline">
                              Lab: {course.lab_hours}h
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Instructor Assignments</Label>
                  <div className="text-sm text-muted-foreground">
                    {selectedCourses.length} course(s) selected
                  </div>
                </div>

                {selectedCourses.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      Please select courses first to assign instructors.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-6">
                    {selectedCourses.map((course) => {
                      const courseAssignments = assignments.filter(
                        (a) => a.course_id === course.id,
                      );

                      return (
                        <Card key={course.id}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">
                              {course.name}
                            </CardTitle>
                            <CardDescription>{course.code}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Theory assignments */}
                            {course.theory_hours > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm font-medium">
                                    Theory ({course.theory_hours}h total)
                                  </Label>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      addAssignment(course.id, "theory")
                                    }
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Instructor
                                  </Button>
                                </div>
                                {courseAssignments
                                  .filter((a) => a.component_type === "theory")
                                  .map((assignment, index) => {
                                    const assignmentIndex =
                                      assignments.findIndex(
                                        (a) => a === assignment,
                                      );
                                    return (
                                      <div
                                        key={assignmentIndex}
                                        className="flex gap-2 items-center p-2 border rounded"
                                      >
                                        <Select
                                          value={assignment.instructor_id}
                                          onValueChange={(value) =>
                                            updateAssignment(
                                              assignmentIndex,
                                              "instructor_id",
                                              value,
                                            )
                                          }
                                        >
                                          <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Select instructor" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {availableInstructors.map(
                                              (instructor) => (
                                                <SelectItem
                                                  key={instructor.id}
                                                  value={instructor.id}
                                                >
                                                  {instructor.name}
                                                </SelectItem>
                                              ),
                                            )}
                                          </SelectContent>
                                        </Select>
                                        <Input
                                          type="number"
                                          min="1"
                                          max={course.theory_hours}
                                          value={assignment.hours_per_week}
                                          onChange={(e) =>
                                            updateAssignment(
                                              assignmentIndex,
                                              "hours_per_week",
                                              parseInt(e.target.value) || 1,
                                            )
                                          }
                                          className="w-20"
                                        />
                                        <span className="text-sm text-muted-foreground">
                                          h/week
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            removeAssignment(assignmentIndex)
                                          }
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}

                            {/* Practice assignments */}
                            {course.practice_hours > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm font-medium">
                                    Practice ({course.practice_hours}h total)
                                  </Label>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      addAssignment(course.id, "practice")
                                    }
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Instructor
                                  </Button>
                                </div>
                                {courseAssignments
                                  .filter(
                                    (a) => a.component_type === "practice",
                                  )
                                  .map((assignment, index) => {
                                    const assignmentIndex =
                                      assignments.findIndex(
                                        (a) => a === assignment,
                                      );
                                    return (
                                      <div
                                        key={assignmentIndex}
                                        className="flex gap-2 items-center p-2 border rounded"
                                      >
                                        <Select
                                          value={assignment.instructor_id}
                                          onValueChange={(value) =>
                                            updateAssignment(
                                              assignmentIndex,
                                              "instructor_id",
                                              value,
                                            )
                                          }
                                        >
                                          <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Select instructor" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {availableInstructors.map(
                                              (instructor) => (
                                                <SelectItem
                                                  key={instructor.id}
                                                  value={instructor.id}
                                                >
                                                  {instructor.name}
                                                </SelectItem>
                                              ),
                                            )}
                                          </SelectContent>
                                        </Select>
                                        <Input
                                          type="number"
                                          min="1"
                                          max={course.practice_hours}
                                          value={assignment.hours_per_week}
                                          onChange={(e) =>
                                            updateAssignment(
                                              assignmentIndex,
                                              "hours_per_week",
                                              parseInt(e.target.value) || 1,
                                            )
                                          }
                                          className="w-20"
                                        />
                                        <span className="text-sm text-muted-foreground">
                                          h/week
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            removeAssignment(assignmentIndex)
                                          }
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}

                            {/* Lab assignments */}
                            {course.lab_hours > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm font-medium">
                                    Lab ({course.lab_hours}h total)
                                  </Label>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      addAssignment(course.id, "lab")
                                    }
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Instructor
                                  </Button>
                                </div>
                                {courseAssignments
                                  .filter((a) => a.component_type === "lab")
                                  .map((assignment, index) => {
                                    const assignmentIndex =
                                      assignments.findIndex(
                                        (a) => a === assignment,
                                      );
                                    return (
                                      <div
                                        key={assignmentIndex}
                                        className="flex gap-2 items-center p-2 border rounded"
                                      >
                                        <Select
                                          value={assignment.instructor_id}
                                          onValueChange={(value) =>
                                            updateAssignment(
                                              assignmentIndex,
                                              "instructor_id",
                                              value,
                                            )
                                          }
                                        >
                                          <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Select instructor" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {availableInstructors.map(
                                              (instructor) => (
                                                <SelectItem
                                                  key={instructor.id}
                                                  value={instructor.id}
                                                >
                                                  {instructor.name}
                                                </SelectItem>
                                              ),
                                            )}
                                          </SelectContent>
                                        </Select>
                                        <Input
                                          type="number"
                                          min="1"
                                          max={course.lab_hours}
                                          value={assignment.hours_per_week}
                                          onChange={(e) =>
                                            updateAssignment(
                                              assignmentIndex,
                                              "hours_per_week",
                                              parseInt(e.target.value) || 1,
                                            )
                                          }
                                          className="w-20"
                                        />
                                        <span className="text-sm text-muted-foreground">
                                          h/week
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            removeAssignment(assignmentIndex)
                                          }
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => handleSave(false)}
              disabled={loading}
              variant="outline"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save Draft"}
            </Button>

            <Button onClick={() => handleSave(true)} disabled={loading}>
              <Send className="mr-2 h-4 w-4" />
              {loading ? "Publishing..." : "Publish Scenario"}
            </Button>

            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>

          {/* Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScenarioForm;
