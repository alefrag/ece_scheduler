import React, { useState, useEffect } from "react";
import { coursesApi } from "../api/courses";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, MinusCircle, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CourseFormProps {
  onSubmit?: (data: CourseData) => void;
  onCancel?: () => void;
  initialData?: CourseData;
}

interface CourseData {
  id?: string;
  name: string;
  code: string;
  description: string;
  theoryHours: number;
  practiceHours: number;
  labHours: number;
  theoryRepetition: number;
  practiceRepetition: number;
  labRepetition: number;
  requiredEquipment: string[];
  studyPrograms: string[];
  semesters: number[];
  courseGroup: string;
  enrolledStudents: number;
  labGroups: number;
  labGroupSize: number;
}

const CourseForm: React.FC<CourseFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {
    name: "",
    code: "",
    description: "",
    theoryHours: 0,
    practiceHours: 0,
    labHours: 0,
    theoryRepetition: 1,
    practiceRepetition: 1,
    labRepetition: 1,
    requiredEquipment: [],
    studyPrograms: [],
    semesters: [],
    courseGroup: "",
    enrolledStudents: 0,
    labGroups: 1,
    labGroupSize: 20,
  },
}) => {
  const [courseData, setCourseData] = useState<CourseData>(initialData);
  const [activeTab, setActiveTab] = useState("basic");
  const [newEquipment, setNewEquipment] = useState("");

  // Mock data for dropdowns
  const studyPrograms = [
    { id: "prog1", name: "Computer Science" },
    { id: "prog2", name: "Electrical Engineering" },
    { id: "prog3", name: "Mathematics" },
  ];

  const courseGroups = [
    { id: "group1", name: "Core Courses" },
    { id: "group2", name: "Electives" },
    { id: "group3", name: "Labs" },
  ];

  const equipmentOptions = [
    "Projector",
    "Whiteboard",
    "Computer Lab",
    "Electronics Lab",
    "Physics Lab",
    "Chemistry Lab",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudyProgramToggle = (programId: string) => {
    setCourseData((prev) => {
      const programs = [...prev.studyPrograms];
      if (programs.includes(programId)) {
        return {
          ...prev,
          studyPrograms: programs.filter((id) => id !== programId),
        };
      } else {
        return { ...prev, studyPrograms: [...programs, programId] };
      }
    });
  };

  const handleSemesterToggle = (semester: number) => {
    setCourseData((prev) => {
      const semesters = [...prev.semesters];
      if (semesters.includes(semester)) {
        return { ...prev, semesters: semesters.filter((s) => s !== semester) };
      } else {
        return { ...prev, semesters: [...semesters, semester] };
      }
    });
  };

  const addEquipment = () => {
    if (newEquipment && !courseData.requiredEquipment.includes(newEquipment)) {
      setCourseData((prev) => ({
        ...prev,
        requiredEquipment: [...prev.requiredEquipment, newEquipment],
      }));
      setNewEquipment("");
    }
  };

  const removeEquipment = (equipment: string) => {
    setCourseData((prev) => ({
      ...prev,
      requiredEquipment: prev.requiredEquipment.filter((e) => e !== equipment),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData.id) {
        // Update existing course
        const updatedCourse = await coursesApi.update(initialData.id, {
          name: courseData.name,
          code: courseData.code,
          description: courseData.description,
          theory_hours: courseData.theoryHours,
          practice_hours: courseData.practiceHours,
          lab_hours: courseData.labHours,
          theory_repetition: courseData.theoryRepetition,
          practice_repetition: courseData.practiceRepetition,
          lab_repetition: courseData.labRepetition,
          required_equipment: courseData.requiredEquipment,
          study_programs: courseData.studyPrograms,
          semesters: courseData.semesters,
          course_group: courseData.courseGroup,
          enrolled_students: courseData.enrolledStudents,
          lab_groups: courseData.labGroups,
          lab_group_size: courseData.labGroupSize,
        });
        if (onSubmit) onSubmit(updatedCourse);
      } else {
        // Create new course
        const newCourse = await coursesApi.create({
          name: courseData.name,
          code: courseData.code,
          description: courseData.description,
          theory_hours: courseData.theoryHours,
          practice_hours: courseData.practiceHours,
          lab_hours: courseData.labHours,
          theory_repetition: courseData.theoryRepetition,
          practice_repetition: courseData.practiceRepetition,
          lab_repetition: courseData.labRepetition,
          required_equipment: courseData.requiredEquipment,
          study_programs: courseData.studyPrograms,
          semesters: courseData.semesters,
          course_group: courseData.courseGroup,
          enrolled_students: courseData.enrolledStudents,
          lab_groups: courseData.labGroups,
          lab_group_size: courseData.labGroupSize,
        });
        if (onSubmit) onSubmit(newCourse);
      }
    } catch (error) {
      console.error("Error saving course:", error);
      // Handle error (show toast, etc.)
    }
  };

  return (
    <div className="bg-background p-6 rounded-lg max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>
              {initialData.id ? "Edit Course" : "Create New Course"}
            </CardTitle>
            <CardDescription>
              Fill in the details to {initialData.id ? "update" : "create"} a
              course in the curriculum.
            </CardDescription>
          </CardHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="px-6">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="hours">Course Hours</TabsTrigger>
                <TabsTrigger value="programs">Study Programs</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="pt-6">
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Course Code</Label>
                    <Input
                      id="code"
                      name="code"
                      value={courseData.code}
                      onChange={handleInputChange}
                      placeholder="CS101"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Course Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={courseData.name}
                      onChange={handleInputChange}
                      placeholder="Introduction to Computer Science"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={courseData.description}
                    onChange={handleInputChange}
                    placeholder="Course description and objectives"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="courseGroup">Course Group</Label>
                    <Select
                      value={courseData.courseGroup}
                      onValueChange={(value) =>
                        handleSelectChange("courseGroup", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course group" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enrolledStudents">
                      Expected Enrolled Students
                    </Label>
                    <Input
                      id="enrolledStudents"
                      name="enrolledStudents"
                      type="number"
                      min="0"
                      value={courseData.enrolledStudents}
                      onChange={handleNumberChange}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="hours" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Theory Lectures</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="theoryHours">Hours per Week</Label>
                      <Input
                        id="theoryHours"
                        name="theoryHours"
                        type="number"
                        min="0"
                        value={courseData.theoryHours}
                        onChange={handleNumberChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="theoryRepetition">
                        Repetition Pattern (weeks)
                      </Label>
                      <Input
                        id="theoryRepetition"
                        name="theoryRepetition"
                        type="number"
                        min="1"
                        value={courseData.theoryRepetition}
                        onChange={handleNumberChange}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Practice Sessions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="practiceHours">Hours per Week</Label>
                      <Input
                        id="practiceHours"
                        name="practiceHours"
                        type="number"
                        min="0"
                        value={courseData.practiceHours}
                        onChange={handleNumberChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="practiceRepetition">
                        Repetition Pattern (weeks)
                      </Label>
                      <Input
                        id="practiceRepetition"
                        name="practiceRepetition"
                        type="number"
                        min="1"
                        value={courseData.practiceRepetition}
                        onChange={handleNumberChange}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Laboratory Exercises</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="labHours">Hours per Week</Label>
                      <Input
                        id="labHours"
                        name="labHours"
                        type="number"
                        min="0"
                        value={courseData.labHours}
                        onChange={handleNumberChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="labRepetition">
                        Repetition Pattern (weeks)
                      </Label>
                      <Input
                        id="labRepetition"
                        name="labRepetition"
                        type="number"
                        min="1"
                        value={courseData.labRepetition}
                        onChange={handleNumberChange}
                      />
                    </div>
                  </div>

                  {courseData.labHours > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="labGroups">Number of Lab Groups</Label>
                        <Input
                          id="labGroups"
                          name="labGroups"
                          type="number"
                          min="1"
                          value={courseData.labGroups}
                          onChange={handleNumberChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="labGroupSize">
                          Students per Lab Group
                        </Label>
                        <Input
                          id="labGroupSize"
                          name="labGroupSize"
                          type="number"
                          min="1"
                          value={courseData.labGroupSize}
                          onChange={handleNumberChange}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="programs" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Study Programs</h3>
                  <p className="text-sm text-muted-foreground">
                    Select the study programs this course belongs to:
                  </p>

                  <div className="space-y-2">
                    {studyPrograms.map((program) => (
                      <div
                        key={program.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`program-${program.id}`}
                          checked={courseData.studyPrograms.includes(
                            program.id,
                          )}
                          onCheckedChange={() =>
                            handleStudyProgramToggle(program.id)
                          }
                        />
                        <Label htmlFor={`program-${program.id}`}>
                          {program.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Academic Semesters</h3>
                  <p className="text-sm text-muted-foreground">
                    Select the semesters this course is offered in:
                  </p>

                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                      <div
                        key={semester}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`semester-${semester}`}
                          checked={courseData.semesters.includes(semester)}
                          onCheckedChange={() => handleSemesterToggle(semester)}
                        />
                        <Label htmlFor={`semester-${semester}`}>
                          Semester {semester}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="resources" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Required Equipment</h3>
                  <p className="text-sm text-muted-foreground">
                    Select or add equipment required for this course:
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {equipmentOptions.map((equipment) => (
                      <div
                        key={equipment}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`equipment-${equipment}`}
                          checked={courseData.requiredEquipment.includes(
                            equipment,
                          )}
                          onCheckedChange={() => {
                            if (
                              courseData.requiredEquipment.includes(equipment)
                            ) {
                              removeEquipment(equipment);
                            } else {
                              setCourseData((prev) => ({
                                ...prev,
                                requiredEquipment: [
                                  ...prev.requiredEquipment,
                                  equipment,
                                ],
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={`equipment-${equipment}`}>
                          {equipment}
                        </Label>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Input
                      placeholder="Other equipment"
                      value={newEquipment}
                      onChange={(e) => setNewEquipment(e.target.value)}
                    />
                    <Button type="button" onClick={addEquipment} size="sm">
                      <PlusCircle className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>

                  {courseData.requiredEquipment.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {courseData.requiredEquipment.map((equipment) => (
                        <Badge
                          key={equipment}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {equipment}
                          <button
                            type="button"
                            onClick={() => removeEquipment(equipment)}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>

          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {initialData.id ? "Update Course" : "Create Course"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default CourseForm;
