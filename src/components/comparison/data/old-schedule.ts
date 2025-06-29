import { Schedule } from "../schedule_comparison";

// Mock comparison data - in real implementation, this would come from your ScheduleComparator
  const mockOldSchedule: Schedule = {
    id: "schedule-1",
    name: "Fall 2024 - Version 1",
    version: "1.0",
    createdAt: new Date(2024, 8, 1),
    resources: [
      { id: "1", name: "Dr. Smith", type: "instructor" },
      { id: "2", name: "Prof. Johnson", type: "instructor" },
      { id: "4", name: "Room A101", type: "classroom" },
      { id: "7", name: "Computer Lab 1", type: "laboratory" }
    ],
    tasks: [
      {
        id: "1",
        content: "Database Systems",
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 12, 0),
        group: "1",
        taskType: "theory",
        courseName: "CS Database Systems"
      },
      {
        id: "2",
        content: "Programming Lab",
        start: new Date(2024, 0, 16, 9, 0),
        end: new Date(2024, 0, 16, 11, 0),
        group: "7",
        taskType: "lab",
        courseName: "CS Programming"
      },
      {
        id: "3",
        content: "Algorithms",
        start: new Date(2024, 0, 17, 14, 0),
        end: new Date(2024, 0, 17, 16, 0),
        group: "2",
        taskType: "theory",
        courseName: "CS Algorithms"
      }
    ]
  };

  const mockNewSchedule: Schedule = {
    id: "schedule-2",
    name: "Fall 2024 - Version 2",
    version: "2.0",
    createdAt: new Date(2024, 8, 15),
    resources: [
      { id: "1", name: "Dr. Smith", type: "instructor" },
      { id: "2", name: "Prof. Johnson", type: "instructor" },
      { id: "4", name: "Room A101", type: "classroom" },
      { id: "7", name: "Computer Lab 1", type: "laboratory" },
      { id: "8", name: "Room B205", type: "classroom" } // Added resource
    ],
    tasks: [
      {
        id: "1",
        content: "Database Systems",
        start: new Date(2024, 0, 15, 11, 0), // Time changed
        end: new Date(2024, 0, 15, 13, 0),
        group: "1",
        taskType: "theory",
        courseName: "CS Database Systems"
      },
      {
        id: "2",
        content: "Programming Lab",
        start: new Date(2024, 0, 16, 9, 0),
        end: new Date(2024, 0, 16, 11, 0),
        group: "7",
        taskType: "lab",
        courseName: "CS Programming"
      },
      // Task "3" (Algorithms) was removed
      {
        id: "4", // New task
        content: "Software Engineering",
        start: new Date(2024, 0, 18, 10, 0),
        end: new Date(2024, 0, 18, 12, 0),
        group: "8",
        taskType: "practice",
        courseName: "CS Software Engineering"
      },
      {
        id: "5", // Another new task creating conflict
        content: "Data Structures",
        start: new Date(2024, 0, 15, 11, 30), // Overlaps with modified Database Systems
        end: new Date(2024, 0, 15, 13, 30),
        group: "2",
        taskType: "theory",
        courseName: "CS Data Structures"
      }
    ]
  };

  export { mockOldSchedule, mockNewSchedule };