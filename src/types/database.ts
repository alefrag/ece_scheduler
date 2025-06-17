export interface User {
  id: string;
  name: string;
  email: string;
  role: "administrator" | "schedule_manager" | "educator";
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  theory_hours: number;
  practice_hours: number;
  lab_hours: number;
  theory_repetition: number;
  practice_repetition: number;
  lab_repetition: number;
  required_equipment: string[];
  study_programs: string[];
  semesters: number[];
  course_group: string;
  enrolled_students: number;
  lab_groups: number;
  lab_group_size: number;
  created_at: string;
  updated_at: string;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  equipment: Equipment[];
  created_at: string;
  updated_at: string;
}

export interface Laboratory {
  id: string;
  name: string;
  capacity: number;
  equipment: Equipment[];
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  name: string;
}

export interface AvailabilityPreference {
  id: string;
  user_id: string;
  day: string;
  time_slot: string;
  preference: "No" | "Preferably No" | "Neutral" | "Preferably Yes" | "Yes";
  created_at: string;
  updated_at: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  type: "theory" | "practice" | "lab";
  instructor: string;
  room: string;
  start_time: string;
  end_time: string;
  day: string;
  program: string;
  semester: string;
  course_id: string;
  created_at: string;
  updated_at: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  status: "draft" | "published";
  created_by: string;
  courses: string[];
  instructor_assignments: InstructorAssignment[];
  created_at: string;
  updated_at: string;
}

export interface InstructorAssignment {
  id: string;
  scenario_id: string;
  course_id: string;
  instructor_id: string;
  component_type: "theory" | "practice" | "lab";
  hours_per_week: number;
  created_at: string;
  updated_at: string;
}
