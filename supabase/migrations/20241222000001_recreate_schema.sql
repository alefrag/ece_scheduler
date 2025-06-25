-- Drop existing tables and policies
DROP TABLE IF EXISTS schedule_events CASCADE;
DROP TABLE IF EXISTS availability_preferences CASCADE;
DROP TABLE IF EXISTS laboratories CASCADE;
DROP TABLE IF EXISTS classrooms CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (public schema)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('administrator', 'schedule_manager', 'educator')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_email UNIQUE (email)
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_code UNIQUE (code)
);

-- Classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  equipment JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Laboratories table
CREATE TABLE IF NOT EXISTS laboratories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  equipment JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Availability preferences table
CREATE TABLE IF NOT EXISTS availability_preferences (
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
CREATE TABLE IF NOT EXISTS schedule_events (
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
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_availability_user_id ON availability_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_events_course_id ON schedule_events(course_id);
CREATE INDEX IF NOT EXISTS idx_schedule_events_day ON schedule_events(day);
CREATE INDEX IF NOT EXISTS idx_schedule_events_instructor ON schedule_events(instructor);

-- Enable realtime for all tables
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table courses;
alter publication supabase_realtime add table classrooms;
alter publication supabase_realtime add table laboratories;
alter publication supabase_realtime add table availability_preferences;
alter publication supabase_realtime add table schedule_events;

-- Insert sample data
INSERT INTO users (id, name, email, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'John Doe', 'john.doe@uop.gr', 'administrator'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Jane Smith', 'jane.smith@uop.gr', 'schedule_manager'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Robert Brown', 'robert.brown@uop.gr', 'educator'),
  ('550e8400-e29b-41d4-a716-446655440003', 'CAS User', 'cas.user@uop.gr', 'educator'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Alex Fragkiadakis', 'alefrag@gmail.com', 'administrator')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Insert sample courses
INSERT INTO courses (name, code, description, theory_hours, practice_hours, lab_hours, study_programs, semesters, course_group, enrolled_students) VALUES
  ('Database Systems', 'CS301', 'Introduction to database design and management', 3, 1, 2, '{"Computer Science"}', '{3}', 'Core Courses', 45),
  ('Algorithms', 'CS302', 'Design and analysis of algorithms', 3, 2, 0, '{"Computer Science"}', '{3}', 'Core Courses', 50),
  ('Software Engineering', 'CS401', 'Software development methodologies', 3, 0, 2, '{"Computer Science"}', '{5}', 'Core Courses', 40),
  ('Computer Networks', 'CS402', 'Network protocols and architectures', 3, 1, 2, '{"Computer Science"}', '{5}', 'Core Courses', 35),
  ('Operating Systems', 'CS303', 'Operating system concepts and design', 3, 2, 0, '{"Computer Science"}', '{4}', 'Core Courses', 42)
ON CONFLICT (code) DO NOTHING;

-- Add unique constraint for classrooms name
ALTER TABLE classrooms ADD CONSTRAINT unique_classroom_name UNIQUE (name);

-- Insert sample classrooms
INSERT INTO classrooms (name, capacity, equipment) VALUES
  ('Room A101', 120, '[{"id": "1", "name": "Projector"}, {"id": "2", "name": "Computer"}]'),
  ('Room B202', 80, '[{"id": "1", "name": "Projector"}, {"id": "3", "name": "Whiteboard"}]'),
  ('Room C303', 60, '[{"id": "3", "name": "Whiteboard"}]')
ON CONFLICT (name) DO NOTHING;

-- Add unique constraint for laboratories name
ALTER TABLE laboratories ADD CONSTRAINT unique_laboratory_name UNIQUE (name);

-- Insert sample laboratories
INSERT INTO laboratories (name, capacity, equipment) VALUES
  ('Lab CS1', 30, '[{"id": "4", "name": "Computers"}, {"id": "5", "name": "Network Equipment"}]'),
  ('Lab CS2', 25, '[{"id": "4", "name": "Computers"}, {"id": "6", "name": "Electronics Kit"}]'),
  ('Lab Physics', 20, '[{"id": "7", "name": "Physics Equipment"}]')
ON CONFLICT (name) DO NOTHING;