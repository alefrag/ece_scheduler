-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('administrator', 'schedule_manager', 'educator')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  theory_hours INTEGER DEFAULT 0,
  practice_hours INTEGER DEFAULT 0,
  lab_hours INTEGER DEFAULT 0,
  theory_repetition INTEGER DEFAULT 1,
  practice_repetition INTEGER DEFAULT 1,
  lab_repetition INTEGER DEFAULT 1,
  required_equipment TEXT[] DEFAULT '{}',
  study_programs TEXT[] DEFAULT '{}',
  semesters INTEGER[] DEFAULT '{}',
  course_group TEXT,
  enrolled_students INTEGER DEFAULT 0,
  lab_groups INTEGER DEFAULT 1,
  lab_group_size INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classrooms table
CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  equipment JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Laboratories table
CREATE TABLE laboratories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  equipment JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Availability preferences table
CREATE TABLE availability_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  preference TEXT NOT NULL CHECK (preference IN ('No', 'Preferably No', 'Neutral', 'Preferably Yes', 'Yes')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day, time_slot)
);

-- Schedule events table
CREATE TABLE schedule_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('theory', 'practice', 'lab')),
  instructor TEXT NOT NULL,
  room TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  day TEXT NOT NULL,
  program TEXT NOT NULL,
  semester TEXT NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_availability_user_id ON availability_preferences(user_id);
CREATE INDEX idx_schedule_events_course_id ON schedule_events(course_id);
CREATE INDEX idx_schedule_events_day ON schedule_events(day);
CREATE INDEX idx_schedule_events_instructor ON schedule_events(instructor);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_events ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Administrators can manage users" ON users FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'administrator'
  )
);

-- Policies for courses table
CREATE POLICY "Everyone can view courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Administrators and managers can manage courses" ON courses FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('administrator', 'schedule_manager')
  )
);

-- Policies for classrooms table
CREATE POLICY "Everyone can view classrooms" ON classrooms FOR SELECT USING (true);
CREATE POLICY "Administrators and managers can manage classrooms" ON classrooms FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('administrator', 'schedule_manager')
  )
);

-- Policies for laboratories table
CREATE POLICY "Everyone can view laboratories" ON laboratories FOR SELECT USING (true);
CREATE POLICY "Administrators and managers can manage laboratories" ON laboratories FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('administrator', 'schedule_manager')
  )
);

-- Policies for availability_preferences table
CREATE POLICY "Users can view all availability" ON availability_preferences FOR SELECT USING (true);
CREATE POLICY "Users can manage their own availability" ON availability_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Administrators and managers can view all availability" ON availability_preferences FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('administrator', 'schedule_manager')
  )
);

-- Policies for schedule_events table
CREATE POLICY "Everyone can view schedule events" ON schedule_events FOR SELECT USING (true);
CREATE POLICY "Administrators and managers can manage schedule events" ON schedule_events FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('administrator', 'schedule_manager')
  )
);

-- Insert some sample data
INSERT INTO users (id, name, email, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'John Doe', 'john.doe@uop.gr', 'administrator'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Jane Smith', 'jane.smith@uop.gr', 'schedule_manager'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Robert Brown', 'robert.brown@uop.gr', 'educator'),
  ('550e8400-e29b-41d4-a716-446655440003', 'CAS User', 'cas.user@uop.gr', 'educator');

-- Insert sample courses
INSERT INTO courses (name, code, description, theory_hours, practice_hours, lab_hours, study_programs, semesters, course_group, enrolled_students) VALUES
  ('Database Systems', 'CS301', 'Introduction to database design and management', 3, 1, 2, '{"Computer Science"}', '{3}', 'Core Courses', 45),
  ('Algorithms', 'CS302', 'Design and analysis of algorithms', 3, 2, 0, '{"Computer Science"}', '{3}', 'Core Courses', 50),
  ('Software Engineering', 'CS401', 'Software development methodologies', 3, 0, 2, '{"Computer Science"}', '{5}', 'Core Courses', 40),
  ('Computer Networks', 'CS402', 'Network protocols and architectures', 3, 1, 2, '{"Computer Science"}', '{5}', 'Core Courses', 35),
  ('Operating Systems', 'CS303', 'Operating system concepts and design', 3, 2, 0, '{"Computer Science"}', '{4}', 'Core Courses', 42);

-- Insert sample classrooms
INSERT INTO classrooms (name, capacity, equipment) VALUES
  ('Room A101', 120, '[{"id": "1", "name": "Projector"}, {"id": "2", "name": "Computer"}]'),
  ('Room B202', 80, '[{"id": "1", "name": "Projector"}, {"id": "3", "name": "Whiteboard"}]'),
  ('Room C303', 60, '[{"id": "3", "name": "Whiteboard"}]');

-- Insert sample laboratories
INSERT INTO laboratories (name, capacity, equipment) VALUES
  ('Lab CS1', 30, '[{"id": "4", "name": "Computers"}, {"id": "5", "name": "Network Equipment"}]'),
  ('Lab CS2', 25, '[{"id": "4", "name": "Computers"}, {"id": "6", "name": "Electronics Kit"}]'),
  ('Lab Physics', 20, '[{"id": "7", "name": "Physics Equipment"}]');
